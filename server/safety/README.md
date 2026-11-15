# Auti. Safety Orchestrator — foundation only

**NOT ACTIVE IN PRODUCTION.** This module is intentionally not wired to `live-server.ts`. Gemini Live currently forwards audio without a verified, independently available user transcript. Connecting a detector without that input would create false assurances.

## Design boundaries
- No form, login, new UI or automatic WhatsApp contact.
- No external calls, audio storage or persistent sensitive transcript in this foundation.
- Rules are imperfect and can miss indirect expressions or misread quotations, history and negation.
- The independent verifier is an explicit unavailable stub, **not** a second working agent.
- When verification fails, never clear risk. A risk signal is not downgraded by an outage.
- `guidanceFor` only returns text. It never sends a notification or calls emergency services.

## Gates before activation
1. Obtain and validate user speech transcription, including confidence, partial/final events, latency, interruption and consent/privacy handling.
2. Build an independent verifier with bounded latency, timeout, budget, and fail-safe behavior; evaluate contextual false positives and negatives.
3. Implement a safe way to deliver guidance in the Live audio turn without interrupting or duplicating speech; confirm fallback if provider is down.
4. Add Brazilian crisis-resource guidance and accessibility review with human approval.
5. Run scenario, integration, adversarial, and real audio tests, with explicit human review; do not claim guaranteed detection.
6. Define data minimization, retention, incident response and actual notification consent before any third-party alert.

Run `pnpm test` and `pnpm lint` in CI before merging.
