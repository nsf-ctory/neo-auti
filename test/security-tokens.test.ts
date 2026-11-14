import assert from 'node:assert/strict';
import { test } from 'node:test';
import { accessCookie, clearAccessCookie, hashAccessToken, issueAccessToken, parseAccessCookie, tokenHashMatches } from '../modules/security/tokens';

test('tokens are random and hashes are stable', () => {
  const first = issueAccessToken();
  const second = issueAccessToken();
  assert.notEqual(first, second);
  assert.equal(first.length, 43);
  assert.equal(hashAccessToken(first).length, 64);
  assert.ok(tokenHashMatches(first, hashAccessToken(first)));
  assert.equal(tokenHashMatches(second, hashAccessToken(first)), false);
});

test('cookie parser rejects missing, malformed and duplicate credentials', () => {
  const token = issueAccessToken();
  assert.equal(parseAccessCookie(undefined), null);
  assert.equal(parseAccessCookie('auti_access=bad'), null);
  assert.equal(parseAccessCookie(`auti_access=${token}; auti_access=${token}`), null);
  assert.equal(parseAccessCookie(`foo=bar; auti_access=${token}`), token);
});

test('cookie attributes restrict browser exposure', () => {
  const token = issueAccessToken();
  assert.match(accessCookie(token, 120), /HttpOnly; Secure; SameSite=Strict/);
  assert.match(clearAccessCookie(), /Max-Age=0/);
});
