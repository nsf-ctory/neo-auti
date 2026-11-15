export type RiskLevel = 'unknown' | 'none_observed' | 'possible' | 'immediate';
export type EvidenceSource = 'user_transcript' | 'verified_user_text';
export interface SafetyEvidence { text: string; source: EvidenceSource; capturedAt: number }
export interface SafetyAssessment { level: RiskLevel; reason: string; evidenceAvailable: boolean; requiresHumanReview: boolean }
export interface VerificationResult { level: RiskLevel; verified: boolean; reason: string }
export interface SafetyDecision { level: RiskLevel; action: 'continue' | 'check_safety' | 'urgent_guidance' | 'unavailable'; notifyThirdParty: false; reason: string }
