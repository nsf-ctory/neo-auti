import { screenRisk } from './risk-signals';
import { decideSafety } from './policy-engine';
import { UnavailableVerifier, type SafetyVerifier } from './verifier';
import type { SafetyDecision, SafetyEvidence } from './types';

/** Not wired into live audio until verified input transcription and response control exist. */
export class SafetyOrchestrator {
  constructor(private readonly verifier: SafetyVerifier = new UnavailableVerifier()) {}

  async assess(evidence: SafetyEvidence | null): Promise<SafetyDecision> {
    const screening = screenRisk(evidence);
    if (!evidence || !screening.evidenceAvailable) {
      return decideSafety(screening, { level: 'unknown', verified: false, reason: 'No transcript' });
    }
    try {
      const verified = await this.verifier.verify(evidence, screening);
      return decideSafety(screening, verified);
    } catch {
      return decideSafety(screening, { level: 'unknown', verified: false, reason: 'Verifier failed' });
    }
  }
}
