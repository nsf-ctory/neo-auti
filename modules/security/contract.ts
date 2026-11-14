/** Repository boundary; implement with PostgreSQL transactions before enabling auth. */
export interface AuthorizedUser {
  userId: string;
  disabled: boolean;
}

export interface SessionReservation {
  sessionId: string;
  userId: string;
  expiresAt: Date;
}

export type AccessFailure = 'missing' | 'invalid' | 'expired' | 'revoked' | 'disabled' | 'unavailable';
export type QuotaFailure = 'rate_limited' | 'concurrent_limit' | 'daily_limit' | 'unavailable';

export interface SecurityStore {
  authenticateTokenHash(hash: string): Promise<AuthorizedUser | AccessFailure>;
  /** Atomically reserve a session after verifying rate, concurrency and daily limits. */
  reserveSession(userId: string): Promise<SessionReservation | QuotaFailure>;
  releaseSession(sessionId: string): Promise<void>;
}

/** No fallback to anonymous access when the store is unavailable. */
export function accessHttpStatus(failure: AccessFailure): number {
  return failure === 'unavailable' ? 503 : failure === 'missing' ? 401 : 403;
}

export function quotaHttpStatus(failure: QuotaFailure): number {
  return failure === 'unavailable' ? 503 : 429;
}
