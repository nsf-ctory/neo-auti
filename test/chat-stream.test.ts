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
