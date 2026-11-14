# Skills e identidade do Auti.

Este diretório é a fonte canônica de comportamento conversacional do Auti.

- [`instructions/SKILL.md`](./instructions/SKILL.md): instrução operacional.
- [`AUTI_IDENTITY_BEHAVIOR_HUMANIZATION_SPEC_v0.8.1.md`](./AUTI_IDENTITY_BEHAVIOR_HUMANIZATION_SPEC_v0.8.1.md): identidade e testes de aceitação.
- [`instructions/references/adaptive-support-engine.md`](./instructions/references/adaptive-support-engine.md): adaptação, memória e consentimento.
- [`instructions/references/acesso-e-distribuicao.md`](./instructions/references/acesso-e-distribuicao.md): propostas ainda não configuradas.
- [`instructions/lookup/knowledge-index.json`](./instructions/lookup/knowledge-index.json): materiais de apoio do criador.

O runtime não carrega estes arquivos dinamicamente. `auti-policy.ts` mantém uma
projeção server-owned necessária à execução. Mudanças de identidade devem ser
aplicadas primeiro aqui e depois reconciliadas com essa projeção e os testes.

Materiais em `references` não constituem validação clínica nem autorização para
publicação integral.
