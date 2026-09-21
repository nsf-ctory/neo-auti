# Documentação do Módulo `neo-triage-agent` (`triage.neoflowoff.agency`)

Este diretório contém a documentação técnica, especificações de integração e orientações operacionais para o serviço **`neo-triage-agent`**, o agente de atendimento e triagem por voz do ecossistema **neøflow**.

---

## Índice de Documentos

1. **[Guia de Setup e Deploy (`SETUP.md`)](./SETUP.md):** Instruções de configuração local, variáveis de ambiente, integração com Google Gemini Live API e deploy no Railway.
2. **[Documentação Principal do Nó (`../README.md`)](../README.md):** Visão geral do produto `>_ neøtiko`, funcionalidades de voz bidirecional em tempo real, multimodalidade e interface mobile-first.

---

## Arquitetura & Endpoints Ativos em Produção

- **Subdomínio Canônico:** `https://triage.neoflowoff.agency`
- **WebSocket Live Voice:** `wss://triage.neoflowoff.agency`
- **Backend Runtime:** Express + WebSocket (Node.js v22)
- **Integração de IA:** Google Gemini Live API / Multimodal
- **Storage Remoto:** Cloudflare R2 (`https://cdn.neoflowoff.agency`)

---

## Diretivas para Dev Agents

1. **Contrato de Origem & CSP:** Todo o tráfego WebSocket e chamadas de API devem ser permitidos pelos cabeçalhos CSP definidos em `server.ts` sob a origem `https://*.neoflowoff.agency`.
2. **Defesa de Engenharia Social:** O prompt do agente em `src/data/presetPersonas.ts` e `src/utils/promptSynthesizer.ts` estabelece limites rígidos: chamadas de arquitetura ou engenharia devem ser direcionadas educadamente para `https://partners.neoflowoff.agency/tech`.
3. **Imutabilidade de Credenciais:** Nunca expor `GEMINI_API_KEY`, secrets do R2 ou credenciais de produção em arquivos submetidos ao Git.
