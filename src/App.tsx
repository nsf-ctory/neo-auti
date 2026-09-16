import { useEffect, useRef, useState } from "react";
import { ChatInput } from "./components/ChatInput";
import { ChatMessage } from "./components/ChatMessage";
import { Header } from "./components/Header";
import { LiveVoiceModal } from "./components/LiveVoiceModal";
import { PersonaEditor } from "./components/PersonaEditor";
import { INITIAL_PERSONAS } from "./data/presetPersonas";
import { ChatMessageAttachment, Message, Persona } from "./types";
import { synthesizeSystemInstruction } from "./utils/promptSynthesizer";

const LOCAL_STORAGE_KEY = "persona_studio_saved_personas_v2";
const ACTIVE_PERSONA_KEY = "persona_studio_active_id_v2";
const THEME_KEY = "persona_studio_theme_v1";

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
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    try {
      const savedTheme = localStorage.getItem(THEME_KEY);
      if (savedTheme === "dark" || savedTheme === "light") return savedTheme;
      if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
        return "dark";
      }
    } catch (e) {
      console.error("Error reading theme preference", e);
    }
    return "dark"; // default to elegant dark mode
  });

  // Apply dark class to html document element
  useEffect(() => {
    try {
      if (theme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
      localStorage.setItem(THEME_KEY, theme);
    } catch (e) {
      console.error("Error saving theme", e);
    }
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme((prev: string) => (prev === "dark" ? "light" : "dark"));
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
  const [selectedModel, setSelectedModel] = useState<string>("gemini-3.8-flash");

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Sync personas to local storage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(personas));
      localStorage.setItem(ACTIVE_PERSONA_KEY, activePersonaId);
    } catch (e) {
      console.error("Error saving to localStorage", e);
    }
  }, [personas, activePersonaId]);

  // Check if ?config=true or ?edit=true in URL to allow developer access without exposing UI button
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get("config") === "true" || params.get("edit") === "true") {
        setIsEditorOpen(true);
      }
      const ttclid = params.get("ttclid");
      if (ttclid) {
        sessionStorage.setItem("neo_ttclid", ttclid);
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
          id: "welcome",
          role: "assistant",
          content: `Olá! Eu sou o **${activePersona.name}**, seu agente de atendimento inteligente e humanizado.\n\nComo posso te ajudar hoje? Você pode digitar sua dúvida, anexar imagens ou tocar em **"Voz ao Vivo"** no topo para falarmos em tempo real.`,
          timestamp: Date.now(),
        },
      ]);
    }
  }, [activePersona.id]);

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleUpdateActivePersona = (updated: Persona) => {
    setPersonas((prev) =>
      prev.map((p) => (p.id === updated.id ? updated : p)),
    );
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: "assistant",
        content: `Histórico reiniciado. O que gostaria de conversar agora?`,
        timestamp: Date.now(),
      },
    ]);
  };

  const handleStartLiveCall = () => {
    try {
      window.ttq?.track("Contact", { content_name: "live_voice_call" });
    } catch (e) {
      // ignore
    }
    setIsLiveModalOpen(true);
  };

  const handleSendMessage = async (
    text: string,
    image?: ChatMessageAttachment,
    options?: { isThinking?: boolean; searchGrounding?: boolean },
  ) => {
    if (!text && !image) return;

    try {
      window.ttq?.track("Contact", { content_name: "chat_message_sent" });
    } catch (e) {
      // ignore
    }

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
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
      role: "assistant",
      content: "",
      timestamp: Date.now(),
      isThinking: options?.isThinking,
    };
    setMessages([...newMessages, assistantPlaceholder]);

    try {
      const synthesizedSystemInstruction = synthesizeSystemInstruction(activePersona);

      const historyPayload = newMessages
        .filter((m) => m.id !== "welcome" && m.id !== assistantMessageId)
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

      const modelToUse = options?.isThinking ? "gemini-3.1-pro-preview" : selectedModel;

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: historyPayload,
          systemInstruction: synthesizedSystemInstruction,
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
        throw new Error("Falha ao comunicar com o servidor");
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let assistantText = "";
      let sources: any[] = [];

      if (reader) {
        let buffer = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const dataStr = line.slice(6).trim();
              if (!dataStr) continue;

              try {
                const parsed = JSON.parse(dataStr);
                if (parsed.text) {
                  assistantText += parsed.text;
                  setMessages((prev) =>
                    prev.map((msg) =>
                      msg.id === assistantMessageId ? { ...msg, content: assistantText } : msg,
                    ),
                  );
                }
                if (parsed.sources) {
                  sources = parsed.sources;
                  setMessages((prev) =>
                    prev.map((msg) =>
                      msg.id === assistantMessageId ? { ...msg, sources } : msg,
                    ),
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
      console.error("Chat error:", err);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessageId
            ? {
                ...msg,
                content:
                  "Desculpe, ocorreu uma instabilidade momentânea no atendimento. Por favor, tente novamente em instantes.",
              }
            : msg,
        ),
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-dvh w-full bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 font-sans antialiased select-auto overflow-hidden transition-colors">
      {/* Sleek Mobile-First Header */}
      <Header
        activePersona={activePersona}
        isEditorOpen={isEditorOpen}
        onToggleEditor={() => setIsEditorOpen((prev: any) => !prev)}
        onClearChat={handleClearChat}
        onStartLiveCall={handleStartLiveCall}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex relative overflow-hidden">
        {/* Clean, Focused Chat Stream */}
        <main className="flex flex-col flex-1 h-full w-full bg-stone-50 dark:bg-stone-950 overflow-hidden transition-colors">
          {/* Messages list */}
          <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-3 sm:py-4 space-y-3">
            <div className="max-w-3xl mx-auto space-y-3">
              {messages.map((msg: Message) => (
                <ChatMessage key={msg.id} message={msg} persona={activePersona} />
              ))}

              {isLoading && (
                <div className="flex items-center gap-2 text-stone-600 dark:text-stone-400 text-xs py-2 px-3">
                  <div className="w-2 h-2 rounded-full bg-stone-700 dark:bg-stone-300 animate-pulse" />
                  <span>{activePersona.name} está digitando...</span>
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
          <div className="fixed inset-0 z-50 md:static md:z-auto md:w-1/2 lg:w-2/5 md:border-l border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 flex flex-col animate-in fade-in slide-in-from-right-10 duration-200">
            <PersonaEditor
              persona={activePersona}
              onUpdatePersona={handleUpdateActivePersona}
              onClose={() => setIsEditorOpen(false)}
              selectedModel={selectedModel}
              onSelectModel={setSelectedModel}
              isThinkingMode={isThinkingMode}
              onToggleThinking={() => setIsThinkingMode((prev: any) => !prev)}
              isSearchGrounding={isSearchGrounding}
              onToggleSearchGrounding={() => setIsSearchGrounding((prev: any) => !prev)}
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
