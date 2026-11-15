# Auti.

**Um espaço para se sentir abraçado através de uma conversa.**

A **Auti.** é uma experiência de conversa por voz, pensada especialmente para adultos autistas. A pessoa toca na esfera e começa no próprio ritmo — sem cadastro, sem obrigação de fazer perguntas, sem interrogatório ou exigência de diagnóstico.

**Experiência web:** https://auti.neoprotocol.space/

A Auti. não é terapia, diagnóstico nem serviço de emergência. O objetivo é oferecer conversa respeitosa, sem infantilização e sem prometer capacidades que ainda não foram implementadas.

## Experiência e arquitetura

```text
Navegador (React, Vite, Tailwind)
  └─ esfera + voz via WebSocket
      └─ Express / live-server.ts
          ├─ auti-policy.ts — instruções efetivas da conversa
          ├─ ai-guard.ts — limites por processo
          └─ Gemini Live — inferência e áudio
```

- O frontend não escolhe o modelo nem envia instruções de sistema.
- A experiência principal é voz em tempo real, não um formulário.
- A identidade canônica e os materiais de apoio estão em [docs/skills](./docs/skills/README.md).
- A projeção efetiva usada no servidor está em [auti-policy.ts](./auti-policy.ts); mudanças canônicas precisam ser reconciliadas com ela.
- O comportamento de voz é influenciado por instruções, mas o timbre e a prosódia dependem também do provedor.

## Documentação

- [Links e referências para OpenAI Playground](./docs/OPENAI-PLAYGROUND.md)
- [Identidade verbal e marketing — decisões aprovadas](./docs/MARKETING-IDENTIDADE.md)
- [Skills e identidade canônica](./docs/skills/README.md)
- [Setup, variáveis e operação](./docs/SETUP.md)
- [Especificação de identidade e humanização](./docs/skills/AUTI_IDENTITY_BEHAVIOR_HUMANIZATION_SPEC_v0.8.1.md)

## Segurança — estado real

O [PR #6](https://github.com/nsf-ctory/neo-auti/pull/6) propõe a **fundação não ativa** do Safety Orchestrator. Ele não deve ser confundido com um mecanismo de proteção em produção. A integração de transcrição confiável, verificador independente, resposta de segurança no áudio e testes ainda precisa ser concluída.

O [PR #7](https://github.com/nsf-ctory/neo-auti/pull/7) propõe reforçar a conversa sem perguntas automáticas e a prosódia contida. Enquanto não houver merge e teste de áudio, não declarar o comportamento corrigido em produção.

Nenhum aviso automático a terceiros ou acionamento de emergência está implementado. A Auti. não deve afirmar que avisou alguém.

## Desenvolvimento local

Requisitos: Node.js 22, `pnpm@10.33.0`, chave server-side válida.

```bash
cp .env.example .env
pnpm install --frozen-lockfile
pnpm dev
```

A aplicação local usa `http://localhost:3000`.

## Validação

```bash
pnpm lint
pnpm test
pnpm build
git diff --check
```

## Produção e custos

O serviço é hospedado no Railway com domínio público configurado. Este README não comprova o estado do último deploy, nem substitui verificação de health check e teste de áudio.

Os limites de concorrência e duração atuais são **por processo**; não equivalem a orçamento global garantido em múltiplas réplicas. Consulte [SETUP](./docs/SETUP.md) antes de aumentar capacidade.

## Divulgação

A URL canônica é https://auti.neoprotocol.space/. Campanhas podem usar UTM, mas a medição de origem depende de analytics/logs configurados. Doações e campanhas de apoio financeiro ficam fora da interface principal, em canais de divulgação e landing própria da agência.
