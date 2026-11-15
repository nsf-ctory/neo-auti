import assert from 'node:assert/strict';
import test from 'node:test';
import { SafetyOrchestrator } from '../server/safety/orchestrator';
import { screenRisk } from '../server/safety/risk-signals';
import { decideSafety } from '../server/safety/policy-engine';
import { guidanceFor } from '../server/safety/escalation';
import type { SafetyEvidence } from '../server/safety/types';

const evidence = (text: string): SafetyEvidence => ({ text, source: 'verified_user_text', capturedAt: 0 });

test('no transcript is unknown, not cleared', async () => {
  assert.equal((await new SafetyOrchestrator().assess(null)).action, 'unavailable');
});
test('explicit imminent-risk language cannot be downgraded by verifier outage', async () => {
  const result = await new SafetyOrchestrator().assess(evidence('Estou com uma corda e vou me matar'));
  assert.equal(result.action, 'urgent_guidance');
  assert.equal(result.notifyThirdParty, false);
  assert.equal(guidanceFor(result)?.externalActionTaken, false);
});
test('possible risk requests clarification without automatic notification', async () => {
  const result = await new SafetyOrchestrator().assess(evidence('Não quero mais viver'));
  assert.equal(result.action, 'check_safety');
  assert.equal(result.notifyThirdParty, false);
});
test('absence of keywords is not an independently verified clearance', async () => {
  const result = await new SafetyOrchestrator().assess(evidence('Oi'));
  assert.equal(result.action, 'unavailable');
});
test('verification failure cannot downgrade screen', () => {
  const result = decideSafety(screenRisk(evidence('Quero tirar minha vida')), { level: 'none_observed', verified: true, reason: 'Incorrect clearance' });
  assert.equal(result.action, 'urgent_guidance');
});
test('historical mention is a potential false positive requiring context', () => {
  assert.equal(screenRisk(evidence('No passado pensei em suicídio')).level, 'possible');
});
