function positiveInteger(value: string | undefined, fallback: number): number {
  if (value === undefined) return fallback;
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed < 1) throw new Error('Invalid Auti. limit configuration.');
  return parsed;
}

export function aiLimits(env: NodeJS.ProcessEnv = process.env) {
  const origins = new Set((env.AUTI_ALLOWED_ORIGINS ?? '').split(',').map(s => s.trim()).filter(Boolean));
  if (env.NODE_ENV !== 'production') {
    origins.add('http://localhost:3000');
    origins.add('http://127.0.0.1:3000');
  }
  return {
    enabled: env.AUTI_AI_ENABLED !== 'false', origins,
    concurrency: positiveInteger(env.AUTI_AI_CONCURRENCY, 8),
    startsPerMinute: positiveInteger(env.AUTI_AI_STARTS_PER_MINUTE, 30),
    liveDurationMs: positiveInteger(env.AUTI_LIVE_DURATION_MS, 300_000),
    setupTimeoutMs: positiveInteger(env.AUTI_LIVE_SETUP_TIMEOUT_MS, 15_000),
    maxPayload: positiveInteger(env.AUTI_MAX_PAYLOAD_BYTES, 262_144),
    messagesPerSecond: positiveInteger(env.AUTI_LIVE_MESSAGES_PER_SECOND, 100),
  };
}

/** Teto por processo para sessões de voz em tempo real. */
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

export function isOriginAllowed(origin: string | undefined, origins: Set<string>): boolean {
  if (!origin) return false;
  if (origins.has(origin)) return true;
  return false;
}
