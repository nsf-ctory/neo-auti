# Guia Técnico de Setup: Frontend Astro + Backend API Separados

Este documento detalha como estruturar, desenvolver e colocar em produção a arquitetura **Opção B: Frontend Astro + Backend API Separados**, utilizando **pnpm workspaces** e deploy no **Railway**.

---

## 1. Visão Geral da Arquitetura

```text
               ┌────────────────────────────────────────┐
               │         Frontend (Astro + React)       │
               │  - Páginas estáticas / SSR no Astro    │
               │  - Ilhas interativas (Chat, Sliders)   │
               │  - Audio visualizer & WebSocket client │
               └───────────────────┬────────────────────┘
                                   │
              HTTP REST + SSE      │   WebSocket Bidirecional (Live)
              (/api/chat/stream, /api/tts)│   (/api/live - PCM 16/24kHz)
                                   ▼
               ┌────────────────────────────────────────┐
               │          Backend API (Node.js)         │
               │  - Express + WebSocketServer (ws)      │
               │  - SDK @google/genai (server-side)     │
               │  - Sessões Live (gemini-3.1-flash-live)│
               │  - TTS & Transcrição de áudio          │
               └───────────────────┬────────────────────┘
                                   │
                                   ▼
               ┌────────────────────────────────────────┐
               │           Google Gemini API            │
               │  - Live API (Audio I/O)                │
               │  - Gemini 3.8 Flash / 3.1 Pro          │
               └────────────────────────────────────────┘
```

---

## 2. Estrutura do Repositório (Monorepo pnpm)

```text
meu-projeto/
├── pnpm-workspace.yaml
├── package.json
├── docs/
│   └── SETUP.md
├── README.md
├── apps/
│   ├── api/                    # Backend API & WebSocket
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── src/
│   │       ├── server.ts       # Express + WSS + @google/genai
│   │       └── routes/
│   └── web/                    # Frontend Astro
│       ├── package.json
│       ├── astro.config.mjs
│       ├── tsconfig.json
│       ├── src/
│       │   ├── layouts/
│       │   │   └── BaseLayout.astro
│       │   ├── pages/
│       │   │   └── index.astro
│       │   └── components/     # Ilhas React
│       │       ├── ChatApp.tsx
│       │       ├── LiveVoiceModal.tsx
│       │       └── PersonaEditor.tsx
```

---

## 3. Configuração do Monorepo (`pnpm`)

`pnpm-workspace.yaml` (na raiz)

```yaml
packages:
  - 'apps/*'
```

### `package.json` (raiz)

```json
{
  "name": "persona-studio-monorepo",
  "private": true,
  "scripts": {
    "dev:api": "pnpm --filter api dev",
    "dev:web": "pnpm --filter web dev",
    "dev": "pnpm --parallel dev",
    "build": "pnpm --recursive run build"
  }
}
```

---

## 4. Backend API (`apps/api`)

### `apps/api/package.json`

```json
{
  "name": "api",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "esbuild src/server.ts --bundle --platform=node --format=esm --packages=external --outfile=dist/server.js",
    "start": "node dist/server.js"
  },
  "dependencies": {
    "@google/genai": "^2.4.0",
    "cors": "^2.8.5",
    "dotenv": "^17.2.3",
    "express": "^4.21.2",
    "ws": "^8.18.0"
  },
  "devDependencies": {
    "@types/cors": "^2.8.17",
    "@types/express": "^4.17.21",
    "@types/node": "^22.14.0",
    "@types/ws": "^8.5.14",
    "esbuild": "^0.25.0",
    "tsx": "^4.21.0",
    "typescript": "^5.8.2"
  }
}
```

### Destaques do Servidor (`apps/api/src/server.ts`)

- Servidor HTTP nativo acoplado ao `WebSocketServer` na rota `/api/live`.
- Suporte a CORS para permitir conexões do domínio do Astro em produção e desenvolvimento.
- Conexão com `@google/genai` usando `ai.live.connect` para streaming de áudio bidirecional em tempo real (16kHz PCM input, 24kHz PCM output).

---

## 5. Frontend Astro (`apps/web`)

### `apps/web/package.json`

```json
{
  "name": "web",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview"
  },
  "dependencies": {
    "@astrojs/react": "^4.2.0",
    "@astrojs/tailwind": "^5.1.0",
    "astro": "^5.0.0",
    "lucide-react": "^0.546.0",
    "motion": "^12.23.24",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "tailwindcss": "^3.4.1"
  }
}
```

### `apps/web/astro.config.mjs`

```javascript
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  integrations: [react(), tailwind()],
  server: {
    port: 4321
  }
});
```

### `apps/web/src/pages/index.astro`

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import App from '../components/App.tsx';
---

<BaseLayout title="Persona Studio">
  <!-- A ilha interativa é hidratada no cliente para áudio e WebSockets -->
  <App client:load />
</BaseLayout>
```

---

## 6. Variáveis de Ambiente

### `apps/api/.env`

```env
PORT=3000
GEMINI_API_KEY=sua_chave_aqui
ALLOWED_ORIGIN=http://localhost:4321
```

### `apps/web/.env`

```env
PUBLIC_API_URL=http://localhost:3000
PUBLIC_WS_URL=ws://localhost:3000
```

---

## 7. Deploy no Railway

O Railway possui suporte nativo a monorepos e containers Node.js persistentes com WebSockets:

### Serviço 1: Backend (`apps/api`)

1. Crie um novo serviço no Railway a partir do seu repositório GitHub.
2. Nas configurações do serviço (**Settings**):
   - **Root Directory**: `apps/api`
   - **Build Command**: `pnpm install && pnpm run build`
   - **Start Command**: `pnpm run start`
3. Em **Variables**:
   - `GEMINI_API_KEY`: sua chave de API do Gemini.
   - `PORT`: `3000` (ou deixe o Railway definir automaticamente via `$PORT`).
   - `ALLOWED_ORIGIN`: URL do seu frontend Astro gerada no Railway.
4. Em **Networking**, clique em **Generate Domain** (ex: `api-production.up.railway.app`).

### Serviço 2: Frontend (`apps/web`)

1. Adicione um segundo serviço no mesmo projeto do Railway a partir do mesmo repositório.
2. Nas configurações (**Settings**):
   - **Root Directory**: `apps/web`
   - **Build Command**: `pnpm install && pnpm run build`
   - **Start Command**: `pnpm run preview --host 0.0.0.0 --port $PORT` (ou use `@astrojs/node` para SSR).
3. Em **Variables**:
   - `PUBLIC_API_URL`: `https://api-production.up.railway.app`
   - `PUBLIC_WS_URL`: `wss://api-production.up.railway.app`
4. Em **Networking**, gere o domínio público para seu frontend Astro.

---

## 8. Persistência de Dados no Railway (Opcional)

Se desejar persistir histórico de conversas e personas além do `localStorage` do navegador:

1. No painel do projeto no Railway, clique em **New > Database > PostgreSQL**.
2. Conecte sua `apps/api` ao banco usando a variável `DATABASE_URL` injetada automaticamente pelo Railway.
3. Utilize um ORM leve como **Drizzle ORM** ou **Prisma** para salvar as mensagens e personas dos usuários.

## Controles de consumo da triagem — 2026-09-17

O atendimento permanece público. A aplicação valida Origin nos POSTs `/api/*`
e no WebSocket `/api/live`, antes de chamar o provedor. Origin não autentica
clientes fora do navegador; o limite global de consumo é uma proteção adicional.
Não confiar em `X-Forwarded-For` ou `CF-Connecting-IP` enviados pelo cliente.

| Variável | Padrão | Efeito |
| --- | --- | --- |
| `TRIAGE_AI_ENABLED` | habilitado | `false` bloqueia novos atendimentos sem afetar health/static. Sessões existentes terminam pelo limite de duração. |
| `TRIAGE_ALLOWED_ORIGINS` | `https://triage.neotiktok.com,https://neotiktok.com` | Lista exata de origens, separada por vírgula. Ausência de Origin é rejeitada. |
| `TRIAGE_AI_CONCURRENCY` | 8 | Teto compartilhado HTTP/live por processo. |
| `TRIAGE_AI_STARTS_PER_MINUTE` | 30 | Novos atendimentos por janela móvel de 60 segundos, por processo. |
| `TRIAGE_HTTP_TIMEOUT_MS` | 60000 | Deadline HTTP com AbortSignal enviado ao SDK. |
| `TRIAGE_LIVE_DURATION_MS` | 300000 | Duração máxima da conexão live. |
| `TRIAGE_LIVE_SETUP_TIMEOUT_MS` | 15000 | Prazo para abrir a sessão do provedor. |
| `TRIAGE_MAX_PAYLOAD_BYTES` | 262144 | Limite de cada mensagem WebSocket. |
| `TRIAGE_LIVE_MESSAGES_PER_SECOND` | 100 | Limite de mensagens por conexão. |
| `TRIAGE_CHAT_MODEL` | modelo já utilizado pelo servidor | Modelo de chat sob controle do servidor; parâmetros públicos de modelo, thinking e grounding não selecionam recursos adicionais. |

JSON HTTP limitado a 2 MB. Chat limitado a 2048 tokens de saída. Erros do
provedor não são devolvidos nem registrados integralmente. Setup live é aceito
uma única vez; conexões tardias são encerradas se o visitante já saiu. Uma
conexão pendente mantém sua vaga até resolver, evitando liberar concorrência
antes de encerrar a abertura do recurso externo.

Limites são locais ao processo e reiniciam com ele. Réplicas multiplicam o teto;
esta entrega não modifica WAF, quotas da conta ou autenticação. Não é um teto
financeiro global. Em desenvolvimento são aceitos também localhost/127.0.0.1
na porta 3000. Para outras portas, configurar `TRIAGE_ALLOWED_ORIGINS`.

Validação local: `pnpm test`, `pnpm lint`, `pnpm build`. Os testes usam HTTP e
WebSocket reais locais com provedor simulado, sem consumo de IA ou credenciais.
