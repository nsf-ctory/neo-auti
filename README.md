# Auti.

`neo-auti` é o nó conversacional do ecossistema **Chat-as-a-Protocol** dedicado
a apoio cotidiano, acolhimento e autogestão cognitiva, especialmente para
adultos autistas. A experiência é exclusivamente uma chamada de voz em tempo
real, iniciada ao tocar em `ball_auti.png`, sem exigir diagnóstico ou laudo.

Auti. não é triagem comercial, terapia, diagnóstico nem serviço de emergência.
A identidade e os limites canônicos estão em
[`docs/skills`](./docs/skills/README.md).

## Arquitetura

```text
navegador
  └─ voz WebSocket ──> servidor Express
                         ├─ política server-owned
                         └─ provedor de inferência server-side
```

- React + Vite + Tailwind CSS v4 no frontend.
- Express e WebSocket no servidor.
- `auti-policy.ts` é a projeção pública executável das instruções canônicas.
- O navegador não escolhe modelo nem envia system prompt efetivo.
- O frontend não oferece chat, mensagem gravada, menus ou texto visível.

## Desenvolvimento local

Requisitos: Node.js 22, `pnpm@10.33.0` e uma credencial server-side válida.

```bash
cp .env.example .env
pnpm install --frozen-lockfile
pnpm dev
```

A aplicação abre em `http://localhost:3000`.

## Validação

```bash
pnpm lint
pnpm test
pnpm build
git diff --check
```

## Estado de publicação

O repositório foi adaptado localmente para `neo-auti`. Domínio público, serviço
de deploy e publicação no GitHub da organização `Chat-as-a-Protocol` ainda não
são comprovados por esta migração. Os remotos Git herdados não são autoridade
para o novo nó e não devem receber push até serem substituídos explicitamente.

Veja [`docs/SETUP.md`](./docs/SETUP.md) para configuração e operação.
