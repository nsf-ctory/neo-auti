# Persona Studio • >_ neøtiko

Plataforma conversacional de inteligência artificial equipada com o agente de atendimento **`>_ neøtiko`**, combinando **voz bidirecional em tempo real**, calibração profunda de **humanização psicológica** e interface **mobile-first** com suporte completo a **Tema Escuro (Dark Mode)**.

---

## ◈ O Agente: `>_ neøtiko`

O **`>_ neøtiko`** é o agente de atendimento inteligente, consultivo e humanizado da plataforma:
- **Atendimento Resolutivo & Consultivo**: Comunicação clara, ágil e atenta, fornecendo soluções práticas e esclarecimento de dúvidas sem enrolação.
- **Identidade Visual Integrada**: Avatar oficial e favicon sincronizados com o ícone de marca da NeoProtocol (`/favicon.ico`).
- **Humanização Calibrada**: Tom polido, acolhedor e seguro, balanceando rigor técnico com empatia genuína.
- **Multimodal por Padrão**: Habilitado para conversar por texto, ouvir e falar por voz em tempo real e analisar imagens enviadas pelo usuário.

---

## Principais Recursos

### 1. Interface Mobile-First & Experiência de Uso
- **Design Focado e Despoluído**: Sem excesso de elementos ou barras redundantes; o frontend expõe diretamente o agente ativo em layout touch-friendly (mínimo de 44px por botão).
- **Tema Escuro (Dark Mode)**: Alternância dinâmica entre tema claro e escuro (`stone-950` / `stone-900`), garantindo contraste ideal (WCAG AA) e conforto visual para uso prolongado.
- **Limpeza Direta de Histórico**: Botão de lixeira integrado ao cabeçalho para reiniciar a conversa com um toque.
- **Backend Preservado**: Modelos adicionais de persona e o motor de síntese de prompt continuam ativos no backend (acesso ao painel de calibração via URL com `?config=true`).

### 2. Voz ao Vivo Bidirecional (Gemini Live API)
- **Chamada de Voz Contínua**: Conexão WebSocket de ultra-baixa latência com streaming de áudio PCM (16kHz entrada, 24kHz saída).
- **Interrupções Naturais**: Interrompa a fala do agente a qualquer momento com resposta instantânea.
- **Visualizador de Ondas Sonoras**: Feedback visual em tempo real das frequências de voz do usuário e do agente.

### 3. Recursos de Inteligência & Multimodalidade
- **Text-to-Speech (TTS)**: Síntese de áudio neural de alta fidelidade para as respostas do agente (vozes *Zephyr*, *Kore*, *Puck*, *Fenrir*).
- **Transcrição de Áudio (Speech-to-Text)**: Envie áudio gravado pelo microfone para transcrição automática direta no campo de mensagem.
- **Visão Computacional**: Envio e interpretação de imagens anexadas (JPG, PNG, WebP).
- **Raciocínio Profundo (Thinking Mode)**: Capacidade de reflexão estendida antes da geração da resposta.
- **Google Search Grounding**: Conexão com informações em tempo real e citação de fontes da web.

---

## Estrutura do Projeto

```text
├── server.ts                  # Servidor Express + WebSocket (Live API, TTS, Chat, Transcribe)
├── src/
│   ├── App.tsx                # Fluxo principal do aplicativo e controle de tema
│   ├── types.ts               # Tipagens TypeScript (Persona, Mensagens, Voz, Configurações)
│   ├── data/
│   │   └── presetPersonas.ts  # Definição do >_ neøtiko e presets salvos no backend
│   ├── utils/
│   │   └── promptSynthesizer.ts # Montagem e síntese do System Instruction
│   └── components/
│       ├── Header.tsx         # Cabeçalho limpo com Dark Mode, Voz e Lixeira
│       ├── ChatMessage.tsx    # Renderização de mensagens com Markdown, TTS e fontes
│       ├── ChatInput.tsx      # Barra de entrada mobile (Texto, Microfone, Imagem, Envio)
│       ├── LiveVoiceModal.tsx # Modal de chamada de voz em tempo real (Gemini Live)
│       └── PersonaEditor.tsx  # Editor de System Prompt e Humanização (acesso por ?config=true)
├── metadata.json              # Configurações e permissões da plataforma
└── package.json               # Dependências e scripts de execução
```

---

## Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto com a chave da API do Google Gemini:

```env
GEMINI_API_KEY=sua_chave_aqui
```

---

## Execução Local

1. Instale as dependências:
```bash
npm install
```

2. Inicie o ambiente de desenvolvimento:
```bash
npm run dev
```

3. Para gerar a build de produção:
```bash
npm run build
npm start
```

---

## Documentação Técnica Adicional

Para detalhes de arquitetura monorepo e deploy em produção, consulte:
- [docs/SETUP.md](./docs/SETUP.md)
