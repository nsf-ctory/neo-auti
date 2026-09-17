# AGENTS.md // NEO TRIAGE AGENT

> Contexto operacional e fronteiras de execução para o agente de triagem `>_ neøtiko` no módulo `neo-triage-agent`.

---

## ⟠ Princípio Norteador (NEØ PROTOCOL)

1. **Provedor Invisível:**
   - O frontend nunca expõe chaves, tokens, nem nomes comerciais de modelos e provedores subjacentes.
   - Toda comunicação de inferência passa pelo servidor (`server.ts` Express / WebSocket).

2. **Propósito Canônico de Triagem:**
   - O papel do agente `>_ neøtiko` é qualificar e rotear visitantes para os 4 territórios oficiais:
     - `01 // SHOP`: Lojistas e marcas com CNPJ ativo e conta aprovada no TikTok Shop Seller Center.
     - `02 // CREATORS`: Criadores de conteúdo, afiliados e streamers.
     - `03 // MARKETING`: Gestão de tráfego, criativos oficiais (Symphony) e mídia paga.
     - `04 // TECH`: Desenvolvedores, APIs, webhooks e integradores de ERP/WMS.

3. **Qualificação Inegociável de Sellers:**
   - Todo lojista deve ser questionado sobre a posse de **CNPJ ativo** e **conta aprovada no TikTok Shop Seller Center** com estoque nacional e NF-e.
   - Quem já possui os requisitos é direcionado para `/sellers/conectar`.
   - Quem ainda não possui loja aprovada é orientado a abrir cadastro no portal oficial (`https://seller-br.tiktok.com`).

4. **Runtime & Gestão de Pacotes:**
   - Node.js gerenciado via `fnm`.
   - Gerenciador canônico do workspace: `pnpm` (baseline `pnpm@10.33.0` com `"engines": ">=10"`).
   - Segredos protegidos: `GEMINI_API_KEY` reside em ambiente seguro / `.env` protegido por `.gitignore`.

5. **Infraestrutura, Remotos e Storage Remoto:**
   - **Domínio Público Canônico:** `https://triage.neotiktok.com` (apontamento CNAME + verificação Cloudflare).
   - **Git Remoto Soberano:** O remote canônico é o **Gitea** via remotes SSH (`ssh://git@...`), garantindo soberania total contra bloqueios de terceiros.
   - **Deploy Autônomo:** Executado via `Dockerfile` com BuildKit no Railway (`railway up . --path-as-root --service neo-triage-agent -e production`).
   - **Object Storage & Mídia (Cloudflare R2):** Anexos, imagens e mídias de chat utilizam o bucket `neotiktok` via S3 API (`https://58d7464a80ebdab70f60846076efe203.r2.cloudflarestorage.com`) com CDN pública em `https://cdn.neotiktok.com`.

6. **Padrão Canônico de Estilização (Tailwind CSS v4):**
   - Obedecer integralmente a `_standards/TAILWIND_V4_STANDARDS.md`.
   - **Sintaxe v4 obrigatória:** Utilizar `bg-linear-to-*` em vez de `bg-gradient-to-*`.
   - **Escala métrica nativa vs. Colchetes:** Proibido o uso de classes arbitrárias `[Npx]` para valores existentes na escala do Tailwind (ex: usar `min-h-11` em vez de `min-h-[44px]`, `min-h-9` em vez de `min-h-[36px]`, `min-h-10` para `40px`, `min-h-12.5` para `50px`).
   - **Paleta Canônica:** `#0b0b0c`, `#050505`, `#121214`, `zinc-*`, `#fe2c55`, `#00f2fe`, `#d7fe09`, `#9bb7c3`. Zero tolerância para cores legadas (`stone-*`, `purple-*`, etc.).
