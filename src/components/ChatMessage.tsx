import {
  Brain,
  Check,
  Copy,
  ExternalLink,
  Loader2,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useRef, useState } from 'react';
import Markdown from 'react-markdown';
import { Message, Persona } from '../types';

interface ChatMessageProps {
  message: Message;
  persona: Persona;
}

export function ChatMessage({ message, persona }: ChatMessageProps) {
  const isAssistant = message.role === 'assistant';
  const [copied, setCopied] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePlayTTS = async () => {
    if (isPlayingAudio && audioRef.current) {
      audioRef.current.pause();
      setIsPlayingAudio(false);
      return;
    }

    if (message.audioUrl) {
      if (!audioRef.current) {
        audioRef.current = new Audio(message.audioUrl);
        audioRef.current.onended = () => setIsPlayingAudio(false);
        audioRef.current.onerror = () => setIsPlayingAudio(false);
      }
      audioRef.current.play();
      setIsPlayingAudio(true);
      return;
    }

    try {
      setIsLoadingAudio(true);
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: message.content,
          voice: persona.humanization.speakingVoice || 'Kore',
        }),
      });

      if (!res.ok) {
        throw new Error('Falha ao gerar áudio');
      }

      const data = await res.json();
      if (data.audio) {
        const audioUrl = `data:${data.mimeType || 'audio/wav'};base64,${data.audio}`;
        message.audioUrl = audioUrl;

        if (audioRef.current) {
          audioRef.current.pause();
        }
        const audio = new Audio(audioUrl);
        audioRef.current = audio;
        audio.onended = () => setIsPlayingAudio(false);
        audio.onerror = () => setIsPlayingAudio(false);
        await audio.play();
        setIsPlayingAudio(true);
      }
    } catch (err) {
      console.error('TTS error:', err);
    } finally {
      setIsLoadingAudio(false);
    }
  };

  return (
    <div
      id={`message-${message.id}`}
      className={`flex gap-3 py-3.5 px-3 sm:px-4 rounded-2xl transition-colors ${
        isAssistant
          ? 'bg-white dark:bg-[#121214]/90 border border-zinc-200/70 dark:border-white/10 shadow-2xs'
          : 'bg-zinc-100/80 dark:bg-zinc-900/60 border border-zinc-200/40 dark:border-white/5'
      }`}
    >
      {/* Avatar */}
      <div className="shrink-0">
        {isAssistant ? (
          <div className="w-8 h-8 rounded-xl bg-zinc-900 dark:bg-zinc-900 text-white dark:text-zinc-100 flex items-center justify-center text-sm shadow-xs select-none border border-zinc-800 dark:border-white/10 overflow-hidden">
            {persona.avatar &&
            (persona.avatar.startsWith('/') ||
              persona.avatar.startsWith('http')) ? (
              <img
                src={persona.avatar}
                alt={persona.name}
                className="w-full h-full object-contain p-0.5 rounded-xl"
                referrerPolicy="no-referrer"
              />
            ) : (
              persona.avatar || '◈'
            )}
          </div>
        ) : (
          <div className="w-8 h-8 rounded-xl bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center justify-center text-xs font-semibold select-none border border-zinc-300 dark:border-zinc-700">
            Você
          </div>
        )}
      </div>

      {/* Message Body */}
      <div className="flex-1 min-w-0 space-y-2">
        {/* Name / Role Header */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-zinc-900 dark:text-white">
              {isAssistant ? persona.name : 'Você'}
            </span>
            {isAssistant && (
              <span className="text-[11px] text-zinc-600 dark:text-[#9bb7c3] font-medium hidden sm:inline">
                • {persona.role}
              </span>
            )}
            {message.isThinking && (
              <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-[#d7fe09]/10 text-[#687f00] dark:text-[#d7fe09] border border-[#d7fe09]/30 font-medium">
                <Brain className="w-3 h-3 text-[#d7fe09]" />
                Raciocínio Profundo
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 text-zinc-600 dark:text-zinc-400">
            {isAssistant && message.content && (
              <button
                type="button"
                onClick={handlePlayTTS}
                disabled={isLoadingAudio}
                title={
                  isPlayingAudio ? 'Pausar áudio' : 'Ouvir resposta por voz'
                }
                className="min-h-9 min-w-9 flex items-center justify-center hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200/60 dark:hover:bg-zinc-800 active:scale-95 rounded-lg transition-all"
              >
                {isLoadingAudio ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : isPlayingAudio ? (
                  <VolumeX className="w-4 h-4 text-zinc-900 dark:text-white" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </button>
            )}

            <button
              type="button"
              onClick={handleCopy}
              title="Copiar mensagem"
              className="min-h-[36px] min-w-[36px] flex items-center justify-center hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200/60 dark:hover:bg-zinc-800 active:scale-95 rounded-lg transition-all"
            >
              {copied ? (
                <Check className="w-4 h-4 text-[#00f2fe]" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Image Attachment (if present) */}
        {message.image?.previewUrl && (
          <div className="pt-1">
            <img
              src={message.image.previewUrl}
              alt={message.image.name || 'Anexo'}
              className="max-h-60 rounded-xl border border-zinc-200 dark:border-zinc-800 object-cover shadow-xs"
              referrerPolicy="no-referrer"
            />
          </div>
        )}

        {/* Text Content with high readability in dark mode */}
        <div className="text-sm text-zinc-800 dark:text-zinc-200 leading-relaxed wrap-break-word">
          {isAssistant ? (
            <div className="prose prose-zinc dark:prose-invert max-w-none text-sm leading-relaxed prose-p:my-2 prose-headings:my-3 prose-pre:bg-zinc-900 dark:prose-pre:bg-[#050505] prose-pre:text-zinc-100 prose-pre:p-3 prose-pre:rounded-xl prose-pre:border prose-pre:border-zinc-800 prose-code:font-mono prose-code:text-xs">
              <Markdown>{message.content}</Markdown>
            </div>
          ) : (
            <p className="whitespace-pre-wrap">{message.content}</p>
          )}
        </div>

        {/* Grounding Sources (if Google Search Grounding was active) */}
        {message.sources && message.sources.length > 0 && (
          <div className="pt-2 border-t border-zinc-200/60 dark:border-zinc-800/60">
            <div className="text-[11px] font-semibold text-zinc-600 dark:text-[#9bb7c3] mb-1.5 flex items-center gap-1">
              <span>Fontes da Web Consultadas</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {message.sources.map((chunk, i) => {
                if (!chunk.web?.uri) return null;
                return (
                  <a
                    key={i}
                    href={chunk.web.uri}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-lg bg-zinc-100 dark:bg-zinc-900/80 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:text-[#00f2fe] dark:hover:text-[#00f2fe] border border-zinc-200 dark:border-zinc-800 hover:border-[#00f2fe]/40 transition-colors"
                  >
                    <ExternalLink className="w-2.5 h-2.5 text-[#00f2fe]" />
                    <span className="max-w-50 truncate">
                      {chunk.web.title || chunk.web.uri}
                    </span>
                  </a>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
