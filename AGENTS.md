# AGENTS.md // NEO-AUTI

> Contexto operacional do nó conversacional **Auti.** no ecossistema
> **Chat-as-a-Protocol**.

## Identidade e fonte canônica

- Nome do produto: **Auti.**
- Nome do projeto, pacote e serviço: **`neo-auti`**
- Missão: apoio cotidiano, acolhimento e autogestão cognitiva, especialmente
  para adultos autistas, sem exigir diagnóstico ou laudo.
- Antes de alterar comportamento conversacional, leia integralmente
  `docs/skills/instructions/SKILL.md` e as referências indicadas para o tema.
- `docs/skills/AUTI_IDENTITY_BEHAVIOR_HUMANIZATION_SPEC_v0.8.1.md` é a
  especificação portátil de identidade e critérios de aceitação.

Auti. não é triagem comercial, terapia, diagnóstico, serviço de emergência nem
motor de produtividade. Não restaurar conteúdo herdado de Shop, Creators,
Marketing, TikTok Partner, `>_ neøtiko` ou neøflow.

## Arquitetura

- O frontend é não soberano.
- Identidade e limites efetivos ficam no servidor em `auti-policy.ts`.
- O navegador nunca escolhe modelo, envia system prompt efetivo ou recebe
  credenciais e nomes de provedores subjacentes.
- A experiência pública é exclusivamente uma chamada de voz por WebSocket.
- O frontend mostra somente `ball_auti.png`; tocar inicia a chamada. Não
  adicionar chat, mensagem gravada, menus, descrições ou texto visível.
- Preferências locais não equivalem a memória persistente.
- Nós do workspace integram por contratos; não importar arquivos de outro nó.

## Runtime e segurança

- Node.js 22 e `pnpm@10.33.0`.
- `GEMINI_API_KEY` é segredo server-side do adaptador atual. Verificar somente
  existência e nome; nunca revelar valor.
- Variáveis públicas do nó usam prefixo `AUTI_`.
- Em produção, `AUTI_ALLOWED_ORIGINS` é obrigatório e exato.
- Toda automação deve ter desligamento por `AUTI_AI_ENABLED=false`.
- Não prometer memória, privacidade, plano, preço, domínio ou disponibilidade
  sem capacidade e evidência verificadas.

## Publicação

O diretório está sob a organização de workspace `Chat-as-a-Protocol`, mas isso
não comprova repositório remoto, domínio ou serviço implantado. Os remotos Git e
o histórico herdados de `neo-triage-agent` são legados até substituição
explícita. Não executar push ou deploy sem destino e autorização específicos.

## Validação

Após alterações técnicas:

```bash
pnpm lint
pnpm test
pnpm build
git diff --check
```

Revisar `git status`, diff e possíveis segredos antes de concluir.
