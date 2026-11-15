import type { SafetyAssessment, SafetyEvidence, VerificationResult } from './types';

/** Independent verifier contract. No external model or human reviewer is connected yet. */
export interface SafetyVerifier {
  verify(evidence: SafetyEvidence, screening: SafetyAssessment): Promise<VerificationResult>;
}

export class UnavailableVerifier implements SafetyVerifier {
  async verify(): Promise<VerificationResult> {
    return { level: 'unknown', verified: false, reason: 'Independent verifier not configured' };
  }
}
