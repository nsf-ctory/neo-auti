import { Phone, RotateCcw } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { ChatInput } from './components/ChatInput';
import { ChatMessage } from './components/ChatMessage';
import { Header } from './components/Header';
import { LiveVoiceModal } from './components/LiveVoiceModal';
import { PersonaEditor } from './components/PersonaEditor';
import { INITIAL_PERSONAS } from './data/presetPersonas';
import { ChatMessageAttachment, Message, Persona } from './types';

const LOCAL_STORAGE_KEY = 'persona_studio_saved_personas_v2';
const ACTIVE_PERSONA_KEY = 'persona_studio_active_id_v2';
const THEME_KEY = 'persona_studio_theme_v1';

declare global {
  interface Window {
    ttq?: {
      track: (event: string, params?: Record<string, unknown>) => void;
      page: () => void;
    };
  }
}

export default function App() {
  // Theme state: dark or light
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const savedTheme = localStorage.getItem(THEME_KEY);
      if (savedTheme === 'dark' || savedTheme === 'light') return savedTheme;
      if (
        window.matchMedia &&
        window.matchMedia('(prefers-color-scheme: dark)').matches
      ) {
        return 'dark';
      }
    } catch (e) {
      console.error('Error reading theme preference', e);
    }
    return 'dark'; // default to elegant dark mode
  });

  // Apply dark class to html document element
  useEffect(() => {
    try {
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      localStorage.setItem(THEME_KEY, theme);
    } catch (e) {
      console.error('Error saving theme', e);
    }
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme((prev: string) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Single sovereign persona: >_ neøtiko with full persistent knowledge base
  const [personas, setPersonas] = useState<Persona[]>(() => {
    return INITIAL_PERSONAS;
  });

  const activePersona = INITIAL_PERSONAS[0];
  const activePersonaId = activePersona.id;

  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isLiveModalOpen, setIsLiveModalOpen] = useState(false);
  const [isThinkingMode, setIsThinkingMode] = useState(false);
  const [isSearchGrounding, setIsSearchGrounding] = useState(false);
  const [selectedModel, setSelectedModel] =
    useState<string>('gemini-3.5-flash');

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Sync personas to local storage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(personas));
      localStorage.setItem(ACTIVE_PERSONA_KEY, activePersonaId);
    } catch (e) {
      console.error('Error saving to localStorage', e);
    }
  }, [personas, activePersonaId]);

  // Check if ?config=true or ?edit=true in URL to allow developer access without exposing UI button
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get('config') === 'true' || params.get('edit') === 'true') {
        setIsEditorOpen(true);
      }
      const ttclid = params.get('ttclid');
      if (ttclid) {
        sessionStorage.setItem('neo_ttclid', ttclid);
      }
    } catch (e) {
      // ignore
    }
  }, []);

  // Initial greeting message from active persona
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 'welcome',
          role: 'assistant',
          content: `Olá! Eu sou o **${activePersona.name}**, seu agente de atendimento inteligente e humanizado.\n\nComo posso te ajudar hoje? Você pode digitar sua dúvida, anexar imagens ou tocar em **"Converse por Voz"** no topo para falarmos em tempo real.`,
          timestamp: Date.now(),
        },
      ]);
    }
  }, [activePersona.id]);

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleUpdateActivePersona = (updated: Persona) => {
    setPersonas((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  };

  const handleClearChat = () => {
    setMessages([]);
  };

  const handleStartLiveCall = () => {
    try {
      window.ttq?.track('Contact', { content_name: 'live_voice_call' });
    } catch (e) {
      // ignore
    }
    setIsLiveModalOpen(true);
  };

  const handleSendMessage = async (
    text: string,
    image?: ChatMessageAttachment,
    options?: { isThinking?: boolean; searchGrounding?: boolean }
  ) => {
    if (!text && !image) return;

    try {
      window.ttq?.track('Contact', { content_name: 'chat_message_sent' });
    } catch (e) {
      // ignore
    }

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: Date.now(),
      image,
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setIsLoading(true);

    // Placeholder for assistant response
    const assistantMessageId = `assistant-${Date.now()}`;
    const assistantPlaceholder: Message = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      isThinking: options?.isThinking,
    };
    setMessages([...newMessages, assistantPlaceholder]);

    try {
      const historyPayload = newMessages
        .filter((m) => m.id !== 'welcome' && m.id !== assistantMessageId)
        .map((m) => ({
          role: m.role,
          content: m.content,
          image: m.image
            ? {
                mimeType: m.image.mimeType,
                data: m.image.data,
              }
            : undefined,
        }));

      const modelToUse = options?.isThinking
        ? 'gemini-3.1-pro-preview'
        : selectedModel;

      const res = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: historyPayload,
          model: modelToUse,
          searchGrounding: options?.searchGrounding,
          thinkingConfig: options?.isThinking
            ? {
                thinkingBudget: 2048,
              }
            : undefined,
        }),
      });

      if (!res.ok) {
        throw new Error('Falha ao comunicar com o servidor');
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let assistantText = '';
      let sources: any[] = [];

      if (reader) {
        let buffer = '';
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const dataStr = line.slice(6).trim();
              if (!dataStr) continue;

              try {
                const parsed = JSON.parse(dataStr);
                if (parsed.text) {
                  assistantText += parsed.text;
                  setMessages((prev) =>
                    prev.map((msg) =>
                      msg.id === assistantMessageId
                        ? { ...msg, content: assistantText }
                        : msg
                    )
                  );
                }
                if (parsed.error) {
                  assistantText = parsed.error;
                  setMessages((prev) =>
                    prev.map((msg) =>
                      msg.id === assistantMessageId
                        ? { ...msg, content: assistantText }
                        : msg
                    )
                  );
                }
                if (parsed.sources) {
                  sources = parsed.sources;
                  setMessages((prev) =>
                    prev.map((msg) =>
                      msg.id === assistantMessageId ? { ...msg, sources } : msg
                    )
                  );
                }
              } catch (e) {
                // Ignore parse errors on partial chunks
              }
            }
          }
        }
      }
    } catch (err) {
      console.error('Chat error:', err);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessageId
            ? {
                ...msg,
                content:
                  'Desculpe, ocorreu uma instabilidade momentânea no atendimento. Por favor, tente novamente em instantes.',
              }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-dvh w-full bg-zinc-50 dark:bg-[#0b0b0c] text-zinc-900 dark:text-zinc-100 font-sans antialiased select-auto overflow-hidden transition-colors">
      {/* Sleek Mobile-First Header */}
      <Header activePersona={activePersona} />

      {/* Main Content Area */}
      <div className="flex-1 flex relative overflow-hidden">
        {/* Clean, Focused Chat Stream */}
        <main className="flex flex-col flex-1 h-full w-full bg-zinc-50 dark:bg-[#0b0b0c] overflow-hidden transition-colors">
          {/* Messages list */}
          <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-3 sm:py-4 space-y-3">
            <div className="max-w-3xl mx-auto space-y-3 min-h-[50vh] flex flex-col justify-center">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center py-6 sm:py-10 px-4 text-center select-none my-auto animate-in fade-in zoom-in-95 duration-300">
                  {/* Halo Visualizer Rings (Siri / Gemini Live pulse) */}
                  <div className="relative flex items-center justify-center mb-6">
                    <div className="absolute w-36 h-36 sm:w-44 sm:h-44 rounded-full bg-[#fe2c55]/10 animate-ping opacity-25" />
                    <div className="absolute w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-linear-to-tr from-[#fe2c55]/25 via-[#00f2fe]/20 to-[#d7fe09]/15 blur-xl animate-pulse" />
                    <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-zinc-900 border-2 border-white/10 shadow-[0_0_30px_rgba(254,44,85,0.2)] p-2.5 overflow-hidden flex items-center justify-center ring-2 ring-[#00f2fe]/30">
                      <img
                        src={activePersona.avatar}
                        alt={activePersona.name}
                        className="w-full h-full object-contain rounded-full drop-shadow-[0_0_12px_rgba(0,242,254,0.3)]"
                      />
                    </div>
                  </div>

                  {/* Hero Identity & Description */}
                  <div className="space-y-2 max-w-sm">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/4 border border-white/10 text-[10px] font-mono tracking-widest text-[#00f2fe] uppercase">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00f2fe] animate-pulse" />
                      Voz Bidirecional Nativa
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
                      Atendimento &gt;_ neøtiko
                    </h2>
                    <p className="text-xs sm:text-sm text-zinc-600 dark:text-[#9bb7c3] leading-relaxed">
                      Triagem e assessoria oficial TikTok Shop & Creators.
                      Inicie uma chamada ao vivo agora ou envie mensagens
                      gravadas de áudio.
                    </p>
                  </div>

                  {/* Primary Call Action Button */}
                  <div className="pt-6 flex flex-col items-center gap-2.5">
                    <button
                      type="button"
                      onClick={handleStartLiveCall}
                      className="group relative flex items-center gap-3 px-6 py-3.5 rounded-2xl bg-[#fe2c55] hover:bg-[#ff3b5c] text-white font-medium text-sm sm:text-base shadow-[0_8px_30px_rgba(254,44,85,0.35)] hover:shadow-[0_10px_35px_rgba(254,44,85,0.5)] transition-all duration-200 active:scale-95 cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Phone className="w-4 h-4 fill-current text-white animate-pulse" />
                      </div>
                      <span className="tracking-tight">
                        Iniciar Chamada ao Vivo
                      </span>
                    </button>
                    <span className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400">
                      ou use o microfone abaixo para gravar áudio
                    </span>
                  </div>
                </div>
              )}

              {messages.map((msg: Message) => (
                <ChatMessage
                  key={msg.id}
                  message={msg}
                  persona={activePersona}
                />
              ))}

              {isLoading && (
                <div className="flex items-center gap-2 text-zinc-600 dark:text-[#9bb7c3] text-xs py-2 px-3">
                  <div className="w-2 h-2 rounded-full bg-[#d7fe09] animate-pulse" />
                  <span>{activePersona.name} está respondendo...</span>
                </div>
              )}

              {/* Discreet Conversation Reset Button */}
              {messages.length > 0 && !isLoading && (
                <div className="pt-3 pb-1 flex justify-center">
                  <button
                    type="button"
                    onClick={handleClearChat}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs text-zinc-500 hover:text-[#fe2c55] hover:bg-zinc-100 dark:hover:bg-white/5 transition-all cursor-pointer"
                    title="Reiniciar atendimento e limpar histórico"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reiniciar conversa</span>
                  </button>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Minimal Mobile Input */}
          <ChatInput
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            isThinkingMode={isThinkingMode}
            isSearchGrounding={isSearchGrounding}
            onStartLiveCall={handleStartLiveCall}
            personaName={activePersona.name}
          />
        </main>

        {/* Persona & System Prompt Editor - Mobile Drawer / Slide-Over */}
        {isEditorOpen && (
          <div className="fixed inset-0 z-50 md:static md:z-auto md:w-1/2 lg:w-2/5 md:border-l border-zinc-200 dark:border-white/10 bg-white dark:bg-[#121214] flex flex-col animate-in fade-in slide-in-from-right-10 duration-200">
            <PersonaEditor
              persona={activePersona}
              onUpdatePersona={handleUpdateActivePersona}
              onClose={() => setIsEditorOpen(false)}
              selectedModel={selectedModel}
              onSelectModel={setSelectedModel}
              isThinkingMode={isThinkingMode}
              onToggleThinking={() => setIsThinkingMode((prev: any) => !prev)}
              isSearchGrounding={isSearchGrounding}
              onToggleSearchGrounding={() =>
                setIsSearchGrounding((prev: any) => !prev)
              }
            />
          </div>
        )}
      </div>

      {/* Real-time Voice Call Modal (Gemini 3.1 Live) */}
      <LiveVoiceModal
        persona={activePersona}
        isOpen={isLiveModalOpen}
        onClose={() => setIsLiveModalOpen(false)}
      />
    </div>
  );
}
