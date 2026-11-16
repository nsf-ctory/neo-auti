import assert from 'node:assert/strict';
import { once } from 'node:events';
import { createServer } from 'node:http';
import { test } from 'node:test';
import { WebSocket } from 'ws';
import { aiLimits, AiBudget } from '../ai-guard';
import { installLiveServer } from '../live-server';

const origin = 'https://auti.example.test';
function limits(extra = {}) {
  return { ...aiLimits({ NODE_ENV: 'production', AUTI_ALLOWED_ORIGINS: origin }), ...extra };
}
async function fixture(t: any, config: ReturnType<typeof limits>, connect: (...args: any[]) => Promise<any>) {
  const server = createServer();
  const wsServer = installLiveServer(server, config, new AiBudget(config), () => ({ live: { connect } }) as any, 'test');
  await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve));
  t.after(async () => {
    for (const client of wsServer.clients) client.terminate();
    await new Promise<void>(resolve => wsServer.close(() => resolve()));
    await new Promise<void>(resolve => server.close(() => resolve()));
  });
  const address = server.address() as { port: number };
  return `ws://127.0.0.1:${address.port}/api/live`;
}
function setup(ws: WebSocket) { ws.send(JSON.stringify({ setup: { systemInstruction: 'test' } })); }

test('budget caps starts and concurrency; release is idempotent and window expires', () => {
  let now = 0;
  const budget = new AiBudget(limits({ concurrency: 1, startsPerMinute: 2 }), () => now);
  const first = budget.acquire()!;
  assert.ok(first); assert.equal(budget.acquire(), undefined);
  first(); first();
  const second = budget.acquire()!; assert.ok(second); second();
  assert.equal(budget.acquire(), undefined);
  now = 60001; assert.ok(budget.acquire());
  assert.equal(new AiBudget(limits({ enabled: false })).acquire(), undefined);
});

test('WebSocket rejects foreign origin without starting a provider session', async t => {
  let calls = 0;
  const url = await fixture(t, limits(), async () => { calls++; return { close() {} }; });
  const ws = new WebSocket(url, { origin: 'https://evil.invalid' });
  ws.on('error', () => {});
  const [response] = await once(ws, 'unexpected-response');
  // ws emits (request, response).
  response.destroy(); ws.terminate();
  assert.equal(calls, 0);
});

test('duplicate setup while connection is pending opens only one session and closes late provider', async t => {
  let calls = 0, closed = 0;
  let complete!: (session: any) => void;
  const url = await fixture(t, limits(), () => { calls++; return new Promise(resolve => { complete = resolve; }); });
  const ws = new WebSocket(url, { origin }); await once(ws, 'open');
  setup(ws);
  while (!complete) await new Promise(resolve => setTimeout(resolve, 5));
  setup(ws); await once(ws, 'close');
  complete({ close() { closed++; } });
  await new Promise(resolve => setTimeout(resolve, 10));
  assert.equal(calls, 1); assert.equal(closed, 1);
});

test('session duration closes both client and provider', async t => {
  let closed = 0;
  let onProviderClose!: () => void;
  const providerClosed = new Promise<void>(resolve => { onProviderClose = resolve; });
  const url = await fixture(t, limits({ liveDurationMs: 100 }), async () => ({ close() { closed++; onProviderClose(); } }));
  const ws = new WebSocket(url, { origin }); await once(ws, 'open');
  setup(ws); await once(ws, 'message'); await once(ws, 'close');
  await providerClosed;
  assert.equal(closed, 1);
});

test('payload limit prevents oversized setup reaching provider', async t => {
  let calls = 0;
  const url = await fixture(t, limits({ maxPayload: 100 }), async () => { calls++; return { close() {} }; });
  const ws = new WebSocket(url, { origin }); await once(ws, 'open');
  ws.send('x'.repeat(101)); await once(ws, 'close');
  assert.equal(calls, 0);
});

test('provider policy and voice are owned by the server', async t => {
  let connectOptions: any;
  const config = limits();
  const server = createServer();
  const wsServer = installLiveServer(
    server,
    config,
    new AiBudget(config),
    () => ({
      live: {
        connect: async (options: any) => {
          connectOptions = options;
          return { close() {} };
        },
      },
    }) as any,
    'server-only-policy',
    'Charon'
  );
  await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve));
  t.after(async () => {
    for (const client of wsServer.clients) client.terminate();
    await new Promise<void>(resolve => wsServer.close(() => resolve()));
    await new Promise<void>(resolve => server.close(() => resolve()));
  });
  const address = server.address() as { port: number };
  const ws = new WebSocket(`ws://127.0.0.1:${address.port}/api/live`, { origin });
  await once(ws, 'open');
  ws.send(JSON.stringify({
    setup: { voice: 'Puck', systemInstruction: 'client override' },
  }));
  await once(ws, 'message');

  assert.equal(
    connectOptions.config.systemInstruction,
    'server-only-policy'
  );
  assert.equal(
    connectOptions.config.speechConfig.voiceConfig.prebuiltVoiceConfig.voiceName,
    'Charon'
  );
  ws.close();
});

test('live concurrency, message burst, idle setup and kill switch block provider use', async t => {
  let calls = 0;
  const url = await fixture(t, limits({ concurrency: 1, messagesPerSecond: 2, setupTimeoutMs: 100 }), async () => { calls++; return { close() {} }; });
  const first = new WebSocket(url, { origin }); await once(first, 'open');
  const second = new WebSocket(url, { origin }); await once(second, 'open');
  const [code] = await once(second, 'close'); assert.equal(code, 1013);
  first.send('{}'); first.send('{}'); first.send('{}'); await once(first, 'close');
  const idle = new WebSocket(url, { origin }); await once(idle, 'open'); await once(idle, 'close');
  assert.equal(calls, 0);
  const disabled = await fixture(t, limits({ enabled: false }), async () => { calls++; return { close() {} }; });
  const blocked = new WebSocket(disabled, { origin }); blocked.on('error', () => {});
  const [request, response] = await once(blocked, 'unexpected-response');
  assert.equal(response.statusCode, 401);
  request.destroy(); blocked.terminate();
  assert.equal(calls, 0);
});
