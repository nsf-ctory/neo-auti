import assert from 'node:assert/strict';
import { test } from 'node:test';
import { AUTI_PUBLIC_INSTRUCTION } from '../auti-policy';

test('Live instruction keeps Auti. identity and safety boundaries', () => {
  assert.match(AUTI_PUBLIC_INSTRUCTION, /Você é Auti\./);
  assert.match(AUTI_PUBLIC_INSTRUCTION, /adultos autistas/);
  assert.match(AUTI_PUBLIC_INSTRUCTION, /memória entre conversas/);
  assert.match(AUTI_PUBLIC_INSTRUCTION, /perigo imediato/);
  assert.match(AUTI_PUBLIC_INSTRUCTION, /cadência serena/);
  assert.doesNotMatch(AUTI_PUBLIC_INSTRUCTION, /TikTok|Seller Center|neøtiko/);
  assert.doesNotMatch(AUTI_PUBLIC_INSTRUCTION, /lookup\/knowledge-index|references\/|---\\nname:/);
  assert.doesNotMatch(AUTI_PUBLIC_INSTRUCTION, /\\\\n/);
});
