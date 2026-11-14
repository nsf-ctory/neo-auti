import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';

export function issueAccessToken(): string {
  return randomBytes(32).toString('base64url');
}

export function hashAccessToken(token: string): string {
  return createHash('sha256').update(token, 'utf8').digest('hex');
}

export function parseAccessCookie(header: string | undefined, name = 'auti_access'): string | null {
  if (!header) return null;
  const values = header.split(';').map((part) => part.trim());
  const matching = values.filter((part) => part.startsWith(name + '='));
  if (matching.length !== 1) return null;
  const token = matching[0].slice(name.length + 1);
  if (!/^[A-Za-z0-9_-]{43}$/.test(token)) return null;
  return token;
}

export function tokenHashMatches(token: string, expectedHash: string): boolean {
  if (!/^[a-f0-9]{64}$/.test(expectedHash)) return false;
  const actual = Buffer.from(hashAccessToken(token), 'hex');
  const expected = Buffer.from(expectedHash, 'hex');
  return timingSafeEqual(actual, expected);
}

export function accessCookie(token: string, maxAgeSeconds: number): string {
  if (!/^[A-Za-z0-9_-]{43}$/.test(token)) throw new Error('Invalid token');
  if (!Number.isSafeInteger(maxAgeSeconds) || maxAgeSeconds < 1) throw new Error('Invalid expiry');
  return `auti_access=${token}; Path=/api; HttpOnly; Secure; SameSite=Strict; Max-Age=${maxAgeSeconds}`;
}

export function clearAccessCookie(): string {
  return 'auti_access=; Path=/api; HttpOnly; Secure; SameSite=Strict; Max-Age=0';
}
