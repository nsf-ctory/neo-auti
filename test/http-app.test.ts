import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { test } from 'node:test';
import express from 'express';
import { installHttpApiRoutes, installHttpSecurity } from '../http-app';

async function fixture(t: any) {
  const app = express();
  installHttpSecurity(app);
  installHttpApiRoutes(app);
  app.get('*', (_req, res) => res.type('html').send('<main>spa</main>'));

  const server = createServer(app);
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise<void>((resolve) => server.close(() => resolve())));

  const address = server.address();
  assert.ok(address && typeof address === 'object');
  return `http://127.0.0.1:${address.port}`;
}

test('health routes return JSON before the SPA fallback', async (t) => {
  const baseUrl = await fixture(t);
  for (const path of ['/health', '/api/health']) {
    const response = await fetch(`${baseUrl}${path}`);
    assert.equal(response.status, 200);
    assert.match(response.headers.get('content-type') || '', /application\/json/);
    assert.equal((await response.json()).status, 'ok');
  }
});

test('plain HTTP live and unknown API routes never return the SPA', async (t) => {
  const baseUrl = await fixture(t);
  const live = await fetch(`${baseUrl}/api/live`);
  assert.equal(live.status, 426);
  assert.deepEqual(await live.json(), { error: 'WebSocket upgrade required.' });

  const missing = await fetch(`${baseUrl}/api/missing`);
  assert.equal(missing.status, 404);
  assert.deepEqual(await missing.json(), { error: 'Endpoint not found.' });
});

test('security headers permit voice transport without exposing server details', async (t) => {
  const baseUrl = await fixture(t);
  const response = await fetch(`${baseUrl}/health`);
  const csp = response.headers.get('content-security-policy') || '';

  assert.match(csp, /connect-src 'self' https:\/\/generativelanguage\.googleapis\.com wss:\/\/generativelanguage\.googleapis\.com/);
  assert.match(csp, /script-src 'self' 'unsafe-inline' blob:/);
  assert.match(csp, /worker-src 'self' blob:/);
  assert.equal(response.headers.get('referrer-policy'), 'no-referrer');
  assert.equal(
    response.headers.get('permissions-policy'),
    'camera=(), microphone=(self), geolocation=(), payment=(), usb=()'
  );
  assert.equal(response.headers.get('x-powered-by'), null);
});
