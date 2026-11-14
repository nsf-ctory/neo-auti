# Auti. — Security module (implementation contract)

Status: **design only**. No authentication or quota enforcement is enabled by this document.

## Deployment boundaries
- One Railway web service, PostgreSQL on Railway private networking.
- Cloudflare DNS-only does **not** provide a WAF.
- Do not add Nginx or Redis for the private beta.

## Required before public beta
1. Create opaque, random access tokens server-side; store only SHA-256 hashes in PostgreSQL. Use expiry, revocation and user binding.
2. Deliver tokens via a short-lived, HttpOnly, Secure, SameSite cookie established over HTTPS. Never put long-lived tokens in WebSocket URLs or browser localStorage.
3. Validate the cookie and allowed Origin **before** accepting the `/api/live` WebSocket upgrade. Origin alone is not authentication.
4. Enforce atomic PostgreSQL per-user quotas (concurrent sessions, starts per minute, and daily/monthly budget), with explicit fail-closed behaviour if the database is unavailable.
5. Reserve quota before `ai.live.connect`, and release concurrency on every close, timeout or provider error. Preserve per-process limits as a second guard.
6. Rate-limit token issuance and access attempts. Do not log credentials, microphone audio or transcripts.
7. Add tests for unauthenticated upgrades (401), revoked/expired tokens (403), quota exceeded (429), DB outage (503), concurrent upgrades, reconnects and resource cleanup.
8. Document database migrations, Railway `DATABASE_URL`, beta invitation/revocation flow and a manual rollback.

## Current repository observations
- `live-server.ts` currently uses `verifyClient` with an Origin allowlist only.
- `AiBudget` is per-process and does not persist quotas.
- `src/main.tsx` previously omitted the stylesheet import (fixed in this branch).

**Do not merge or deploy until the implementation and tests above are complete.**
