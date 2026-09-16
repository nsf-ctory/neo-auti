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
          ? 'bg-white dark:bg-stone-900/80 border border-stone-200/70 dark:border-stone-800/80 shadow-2xs'
          : 'bg-stone-100/80 dark:bg-stone-900/40 border border-stone-200/40 dark:border-stone-800/40'
      }`}
    >
      {/* Avatar */}
      <div className="shrink-0">
        {isAssistant ? (
          <div className="w-8 h-8 rounded-xl bg-stone-900 dark:bg-stone-800 text-white dark:text-stone-100 flex items-center justify-center text-sm shadow-xs select-none border border-stone-800 dark:border-stone-700 overflow-hidden">
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
          <div className="w-8 h-8 rounded-xl bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 flex items-center justify-center text-xs font-semibold select-none border border-stone-300 dark:border-stone-700">
            Você
          </div>
        )}
      </div>

      {/* Message Body */}
      <div className="flex-1 min-w-0 space-y-2">
        {/* Name / Role Header */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-stone-900 dark:text-stone-100">
              {isAssistant ? persona.name : 'Você'}
            </span>
            {isAssistant && (
              <span className="text-[11px] text-stone-600 dark:text-stone-400 font-medium hidden sm:inline">
                • {persona.role}
              </span>
            )}
            {message.isThinking && (
              <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 font-medium">
                <Brain className="w-3 h-3" />
                Raciocínio Profundo
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 text-stone-600 dark:text-stone-400">
            {isAssistant && message.content && (
              <button
                type="button"
                onClick={handlePlayTTS}
                disabled={isLoadingAudio}
                title={
                  isPlayingAudio ? 'Pausar áudio' : 'Ouvir resposta por voz'
                }
                className="min-h-9 min-w-9 flex items-center justify-center hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-200/60 dark:hover:bg-stone-800 active:scale-95 rounded-lg transition-all"
              >
                {isLoadingAudio ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : isPlayingAudio ? (
                  <VolumeX className="w-4 h-4 text-stone-900 dark:text-stone-100" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </button>
            )}

            <button
              type="button"
              onClick={handleCopy}
              title="Copiar mensagem"
              className="min-h-[36px] min-w-[36px] flex items-center justify-center hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-200/60 dark:hover:bg-stone-800 active:scale-95 rounded-lg transition-all"
            >
              {copied ? (
                <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
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
              className="max-h-60 rounded-xl border border-stone-200 dark:border-stone-800 object-cover shadow-xs"
              referrerPolicy="no-referrer"
            />
          </div>
        )}

        {/* Text Content with high readability in dark mode */}
        <div className="text-sm text-stone-800 dark:text-stone-200 leading-relaxed wrap-break-word">
          {isAssistant ? (
            <div className="prose prose-stone dark:prose-invert max-w-none text-sm leading-relaxed prose-p:my-2 prose-headings:my-3 prose-pre:bg-stone-900 dark:prose-pre:bg-stone-950 prose-pre:text-stone-100 prose-pre:p-3 prose-pre:rounded-xl prose-pre:border prose-pre:border-stone-800 prose-code:font-mono prose-code:text-xs">
              <Markdown>{message.content}</Markdown>
            </div>
          ) : (
            <p className="whitespace-pre-wrap">{message.content}</p>
          )}
        </div>

        {/* Grounding Sources (if Google Search Grounding was active) */}
        {message.sources && message.sources.length > 0 && (
          <div className="pt-2 border-t border-stone-200/60 dark:border-stone-800/60">
            <div className="text-[11px] font-semibold text-stone-600 dark:text-stone-400 mb-1.5 flex items-center gap-1">
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
                    className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100 border border-stone-200 dark:border-stone-700 transition-colors"
                  >
                    <ExternalLink className="w-2.5 h-2.5" />
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
