import type { SafetyAssessment, SafetyEvidence } from './types';

/** Screening is a triage signal, never a diagnosis or a clearance decision. */
export function screenRisk(evidence: SafetyEvidence | null): SafetyAssessment {
  if (!evidence || !evidence.text.trim()) return { level: 'unknown', reason: 'No verified text evidence', evidenceAvailable: false, requiresHumanReview: false };
  const text = evidence.text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const immediate = /(?:vou|quero|pretendo)\s+(?:me matar|tirar minha vida|acabar com minha vida)|(?:estou|to)\s+(?:com uma corda|prestes a me matar)|(?:ja tomei|acabei de tomar)\s+(?:comprimidos|remedios)\s+(?:para morrer|pra morrer)/.test(text);
  const possible = /suicid|me matar|tirar minha vida|nao quero mais viver|nao aguento mais viver|automutil|me machucar/.test(text);
  return immediate
    ? { level: 'immediate', reason: 'Explicit imminent-risk wording; context must still be checked', evidenceAvailable: true, requiresHumanReview: true }
    : possible
      ? { level: 'possible', reason: 'Potential self-harm language; may be historical, quoted or negated', evidenceAvailable: true, requiresHumanReview: true }
      : { level: 'none_observed', reason: 'No rule-based signal detected; does not rule out risk', evidenceAvailable: true, requiresHumanReview: false };
}
