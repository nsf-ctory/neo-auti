# Documentação do `neo-auti`

Este diretório reúne o contrato técnico e a identidade do Auti. dentro do
workspace **Chat-as-a-Protocol**.

## Fontes canônicas

1. [`skills/instructions/SKILL.md`](./skills/instructions/SKILL.md) — instrução
   operacional principal.
2. [`skills/AUTI_IDENTITY_BEHAVIOR_HUMANIZATION_SPEC_v0.8.1.md`](./skills/AUTI_IDENTITY_BEHAVIOR_HUMANIZATION_SPEC_v0.8.1.md)
   — identidade, comportamento e critérios de aceitação.
3. [`skills/instructions/references/adaptive-support-engine.md`](./skills/instructions/references/adaptive-support-engine.md)
   — adaptação contextual, memória e consentimento.
4. [`SETUP.md`](./SETUP.md) — execução local, variáveis e validação.

Os materiais em `skills/instructions/references` são referências do criador.
Eles não devem ser promovidos automaticamente a validação clínica, política
pública ou configuração ativa.

## Contrato do runtime

- `auti-policy.ts` contém a projeção curta, pública e server-owned usada na voz.
- A interface possui uma única ação: tocar em `ball_auti.png` para falar.
- O frontend é não soberano: não define identidade, system prompt, modelo ou
  provedor.
- `GEMINI_API_KEY` é uma variável técnica do adaptador atual e nunca pode ir ao
  navegador, logs, documentação preenchida ou Git.
- Não há domínio, storage, deploy ou memória persistente confirmados para este
  nó nesta migração.
