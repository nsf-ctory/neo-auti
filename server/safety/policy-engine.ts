import type { SafetyAssessment, SafetyDecision, VerificationResult } from './types';

export function decideSafety(screen: SafetyAssessment, verification: VerificationResult): SafetyDecision {
  if (!screen.evidenceAvailable) return { level: 'unknown', action: 'unavailable', notifyThirdParty: false, reason: 'No reliable transcript' };
  // A failed verifier must never downgrade an explicit high-risk screening signal.
  if (screen.level === 'immediate' || verification.level === 'immediate')
    return { level: 'immediate', action: 'urgent_guidance', notifyThirdParty: false, reason: 'Immediate-risk signal; urgent human support guidance required' };
  if (screen.level === 'possible' || verification.level === 'possible')
    return { level: 'possible', action: 'check_safety', notifyThirdParty: false, reason: 'Risk needs careful conversational clarification' };
  if (!verification.verified)
    return { level: 'unknown', action: 'unavailable', notifyThirdParty: false, reason: 'Independent verification unavailable; risk not cleared' };
  return { level: 'none_observed', action: 'continue', notifyThirdParty: false, reason: 'No risk signal observed in available evidence; not a guarantee' };
}
