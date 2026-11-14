import assert from 'node:assert/strict';
import { test } from 'node:test';
import { AUTI_PUBLIC_INSTRUCTION } from '../auti-policy';

test('public instruction exposes the Auti. identity and core safety boundaries', () => {
  assert.match(AUTI_PUBLIC_INSTRUCTION, /Você é Auti\./);
  assert.match(AUTI_PUBLIC_INSTRUCTION, /adultos autistas/);
  assert.match(AUTI_PUBLIC_INSTRUCTION, /não equivale a memória entre conversas/i);
  assert.match(AUTI_PUBLIC_INSTRUCTION, /perigo imediato/i);
  assert.doesNotMatch(AUTI_PUBLIC_INSTRUCTION, /TikTok|Seller Center|neøtiko/);
});
