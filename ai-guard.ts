import type { RequestHandler } from 'express';

function positiveInteger(value: string | undefined, fallback: number): number {
  if (value === undefined) return fallback;
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed < 1) throw new Error('Invalid triage limit configuration.');
  return parsed;
}

export function aiLimits(env: NodeJS.ProcessEnv = process.env) {
  const origins = new Set((env.TRIAGE_ALLOWED_ORIGINS ??
    'https://triage.neotiktok.com,https://neotiktok.com').split(',').map(s => s.trim()).filter(Boolean));
  if (env.NODE_ENV !== 'production') {
    origins.add('http://localhost:3000');
    origins.add('http://127.0.0.1:3000');
  }
  return {
    enabled: env.TRIAGE_AI_ENABLED !== 'false', origins,
    concurrency: positiveInteger(env.TRIAGE_AI_CONCURRENCY, 8),
    startsPerMinute: positiveInteger(env.TRIAGE_AI_STARTS_PER_MINUTE, 30),
    httpTimeoutMs: positiveInteger(env.TRIAGE_HTTP_TIMEOUT_MS, 60_000),
    liveDurationMs: positiveInteger(env.TRIAGE_LIVE_DURATION_MS, 300_000),
    setupTimeoutMs: positiveInteger(env.TRIAGE_LIVE_SETUP_TIMEOUT_MS, 15_000),
    maxPayload: positiveInteger(env.TRIAGE_MAX_PAYLOAD_BYTES, 262_144),
    messagesPerSecond: positiveInteger(env.TRIAGE_LIVE_MESSAGES_PER_SECOND, 100),
  };
}

/** A shared per-process ceiling for HTTP and live AI use; no proxy/IP trust. */
export class AiBudget {
  private active = 0;
  private starts: number[] = [];
  constructor(private limits: ReturnType<typeof aiLimits>, private now = Date.now) {}
  acquire(): (() => void) | undefined {
    const cutoff = this.now() - 60_000;
    this.starts = this.starts.filter(at => at > cutoff);
    if (!this.limits.enabled || this.active >= this.limits.concurrency || this.starts.length >= this.limits.startsPerMinute) return;
    this.starts.push(this.now());
    this.active++;
    let released = false;
    return () => { if (!released) { released = true; this.active--; } };
  }
}

export function guardAiHttp(limits: ReturnType<typeof aiLimits>, budget: AiBudget): RequestHandler {
  return (req, res, next) => {
    if (req.method !== 'POST') return next();
    if (!limits.enabled) return void res.status(503).json({ error: 'Atendimento temporariamente indisponível.' });
    if (!req.headers.origin || !limits.origins.has(req.headers.origin)) {
      return void res.status(403).json({ error: 'Origem não permitida.' });
    }
    const release = budget.acquire();
    if (!release) {
      res.setHeader('Retry-After', '60');
      return void res.status(429).json({ error: 'Atendimento ocupado. Tente novamente em instantes.' });
    }
    const controller = new AbortController();
    res.locals.aiSignal = controller.signal;
    const timer = setTimeout(() => {
      controller.abort();
      if (!res.headersSent) res.status(504).json({ error: 'Tempo de atendimento excedido.' });
      else res.destroy();
    }, limits.httpTimeoutMs);
    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      clearTimeout(timer);
      controller.abort();
      release();
    };
    res.once('close', finish);
    res.once('finish', finish);
    next();
  };
}
