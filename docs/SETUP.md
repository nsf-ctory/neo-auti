# Setup e operação do `neo-auti`

## Requisitos

- Node.js `>=22.12.0` (o repositório fixa a linha 22 em `.node-version`).
- `pnpm@10.33.0` via Corepack, `fnm` ou gerenciador equivalente.
- Credencial server-side do adaptador de inferência atual.

## Configuração

```bash
cp .env.example .env
pnpm install --frozen-lockfile
pnpm dev
```

O servidor usa a porta `3000` por padrão. Em desenvolvimento, origens
`http://localhost:3000` e `http://127.0.0.1:3000` são aceitas automaticamente.

## Variáveis

| Variável | Padrão | Função |
| --- | --- | --- |
| `GEMINI_API_KEY` | obrigatório | Credencial server-side do adaptador atual. |
| `PORT` | `3000` | Porta HTTP e WebSocket. |
| `AUTI_AI_ENABLED` | habilitado | `false` impede novas sessões de inferência. |
| `AUTI_ALLOWED_ORIGINS` | vazio em produção | Origens públicas exatas, separadas por vírgula. |
| `AUTI_AI_CONCURRENCY` | `8` | Sessões de voz simultâneas por processo. |
| `AUTI_AI_STARTS_PER_MINUTE` | `30` | Novas sessões por minuto e por processo. |
| `AUTI_LIVE_DURATION_MS` | `300000` | Duração máxima de uma conversa de voz. |
| `AUTI_LIVE_SETUP_TIMEOUT_MS` | `15000` | Prazo para iniciar a sessão de voz. |
| `AUTI_MAX_PAYLOAD_BYTES` | `262144` | Limite de cada mensagem WebSocket. |
| `AUTI_LIVE_MESSAGES_PER_SECOND` | `100` | Limite de mensagens por conexão. |

Em produção, `AUTI_ALLOWED_ORIGINS` deve ser definido explicitamente. Uma lista
vazia rejeita chamadas de IA e evita publicar acidentalmente um endpoint aberto.

## Endpoints

| Rota | Método | Uso |
| --- | --- | --- |
| `/health` | `GET` | Alias público para o health check da Railway. |
| `/api/health` | `GET` | Saúde do processo; não prova inferência nem voz. |
| `/api/live` | WebSocket | Conversa de voz bidirecional. |

Uma requisição HTTP comum para `/api/live` recebe `426`; somente o upgrade
WebSocket abre a sessão. Rotas `/api/*` desconhecidas retornam JSON `404` e não
caem no fallback da SPA.

## Segurança e dados

- Não coloque segredos em variáveis `VITE_*` nem no bundle do frontend.
- O frontend público fica em `dist/client`; o bundle Node permanece fora da
  raiz estática.
- O navegador não envia modelo nem system prompt.
- Origin reduz abuso no navegador, mas não autentica clientes fora dele.
- Os limites são locais ao processo; múltiplas réplicas multiplicam o teto.
- A aplicação atual não implementa banco, conta, billing, storage remoto nem
  memória entre conversas.
- Conteúdo de conversa é enviado ao adaptador de inferência configurado; termos
  e política de privacidade devem refletir o tratamento real antes de publicar.

## Validação

```bash
pnpm lint
pnpm test
pnpm build
git diff --check
```

Os testes usam provedores simulados e não consomem credenciais reais.

## Deploy

O `Dockerfile` produz um único serviço Node com frontend estático, HTTP e
WebSocket. Esta cópia não possui destino de produção confirmado. Antes de
publicar, defina serviço, domínio, origem permitida, health check, rollback e
tratamento de dados; valide push, deploy, health e E2E como evidências separadas.
