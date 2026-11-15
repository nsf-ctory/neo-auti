import type { SafetyDecision } from './types';

export interface SafetyGuidance { message: string; externalActionTaken: false }
/** Informational only: never implies a message, call or alert has been sent. */
export function guidanceFor(decision: SafetyDecision): SafetyGuidance | null {
  if (decision.action === 'urgent_guidance') return {
    message: 'Se há perigo imediato, procure alguém de confiança que possa ficar com você e ligue para o SAMU 192. O CVV atende pelo 188. Eu não consigo chamar socorro por você.',
    externalActionTaken: false,
  };
  if (decision.action === 'check_safety') return {
    message: 'Você está em segurança neste momento?',
    externalActionTaken: false,
  };
  return null;
}
