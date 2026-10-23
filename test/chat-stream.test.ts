import assert from 'node:assert/strict';
import { once } from 'node:events';
import { test } from 'node:test';
import express from 'express';
import { createChatStreamHandler } from '../chat-stream';

test('POST /api/chat/stream returns an SSE stream from the configured handler', async (t) => {
  const app = express();
  app.use(express.json());
  app.post('/api/chat/stream', createChatStreamHandler(
    () => ({ models: { async *generateContentStream() { yield { text: 'resposta' }; } } }) as any,
    'test enforcement',
  ));
  const server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(() => server.close());
  const port = (server.address() as { port: number }).port;
  const response = await fetch(`http://127.0.0.1:${port}/api/chat/stream`, {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ messages: [{ role: 'user', content: 'teste' }] }),
  });
  assert.equal(response.status, 200);
  assert.match(response.headers.get('content-type') ?? '', /text\/event-stream/);
  assert.equal(await response.text(), 'data: {"text":"resposta","sources":[]}\n\ndata: [DONE]\n\n');
});

test('POST /api/chat/stream falls back before emitting when the primary model is temporarily unavailable', async (t) => {
  const requestedModels: string[] = [];
  const app = express();
  app.use(express.json());
  app.post('/api/chat/stream', createChatStreamHandler(
    () => ({ models: { async *generateContentStream({ model }: { model: string }) {
      requestedModels.push(model);
      if (model === 'gemini-3.8-flash') {
        const error = Object.assign(new Error('temporarily unavailable'), { status: 503 });
        throw error;
      }
      yield { text: 'resposta resiliente' };
    } } }) as any,
    'test enforcement',
  ));
  const server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(() => server.close());
  const port = (server.address() as { port: number }).port;
  const response = await fetch(`http://127.0.0.1:${port}/api/chat/stream`, {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ model: 'gemini-3.8-flash', messages: [{ role: 'user', content: 'teste' }] }),
  });
  assert.equal(response.status, 200);
  assert.deepEqual(requestedModels, ['gemini-3.8-flash', 'gemini-3.5-flash']);
  assert.equal(await response.text(), 'data: {"text":"resposta resiliente","sources":[]}\n\ndata: [DONE]\n\n');
});
