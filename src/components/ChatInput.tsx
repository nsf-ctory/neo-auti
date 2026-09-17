import { Loader2, Mic, Radio, Send } from 'lucide-react';
import { useRef, useState } from 'react';
import { ChatMessageAttachment } from '../types';

interface ChatInputProps {
  onSendMessage: (
    text: string,
    image?: ChatMessageAttachment,
    options?: { isThinking?: boolean; searchGrounding?: boolean }
  ) => void;
  isLoading: boolean;
  isThinkingMode?: boolean;
  isSearchGrounding?: boolean;
  onStartLiveCall: () => void;
  personaName: string;
}

export function ChatInput({
  onSendMessage,
  isLoading,
  isThinkingMode = false,
  isSearchGrounding = false,
  onStartLiveCall,
  personaName,
}: ChatInputProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<any>(null);

  // Microphone Recording and Gemini 3.5 Transcribe
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        const audioBlob = new Blob(audioChunksRef.current, {
          type: mediaRecorder.mimeType || 'audio/webm',
        });
        if (audioBlob.size > 0) {
          await sendAudioToTranscribe(
            audioBlob,
            mediaRecorder.mimeType || 'audio/webm'
          );
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);
      timerIntervalRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Failed to access microphone', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      audioChunksRef.current = [];
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
  };

  const sendAudioToTranscribe = async (audioBlob: Blob, mimeType: string) => {
    try {
      setIsTranscribing(true);
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Data = (reader.result as string).split(',')[1];
        const res = await fetch('/api/transcribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            audio: base64Data,
            mimeType: mimeType.split(';')[0],
          }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.text && data.text.trim()) {
            onSendMessage(data.text.trim(), undefined, {
              isThinking: isThinkingMode,
              searchGrounding: isSearchGrounding,
            });
          }
        }
      };
      reader.readAsDataURL(audioBlob);
    } catch (err) {
      console.error('Transcription failed:', err);
    } finally {
      setIsTranscribing(false);
    }
  };

  return (
    <div
      id="chat-input-container"
      className="p-3 sm:p-4 bg-white/95 dark:bg-[#0b0b0c]/95 backdrop-blur-md border-t border-zinc-200/90 dark:border-white/10 shrink-0 transition-colors"
    >
      <div className="max-w-xl mx-auto">
        {/* Active Recording State */}
        {isRecording ? (
          <div className="flex items-center justify-between px-4 py-3 bg-[#fe2c55]/10 border border-[#fe2c55]/40 rounded-2xl text-[#fe2c55] dark:text-[#fe2c55] text-sm shadow-md animate-in fade-in duration-150">
            <div className="flex items-center gap-2.5">
              <span className="w-3 h-3 rounded-full bg-[#fe2c55] animate-ping" />
              <span className="font-semibold text-xs sm:text-sm">
                Gravando sua voz...
              </span>
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-[#fe2c55]/20">
                {Math.floor(recordingSeconds / 60)}:
                {(recordingSeconds % 60).toString().padStart(2, '0')}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={cancelRecording}
                className="min-h-11 px-3 text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 font-medium active:scale-95 transition-all"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={stopRecording}
                className="min-h-11 px-4 bg-[#fe2c55] hover:bg-[#e0264b] active:bg-[#c91e41] text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-sm shadow-[#fe2c55]/30 active:scale-95 transition-all"
              >
                <Send className="w-3.5 h-3.5 fill-current" />
                <span>Enviar</span>
              </button>
            </div>
          </div>
        ) : isTranscribing ? (
          <div className="flex items-center justify-center gap-2.5 px-4 py-3.5 bg-zinc-100 dark:bg-zinc-900/90 border border-zinc-200 dark:border-white/10 rounded-2xl text-zinc-700 dark:text-zinc-300 text-xs shadow-2xs">
            <Loader2 className="w-4 h-4 animate-spin text-[#00f2fe]" />
            <span>Processando e enviando sua voz para {personaName}...</span>
          </div>
        ) : (
          /* Voice Actions Hub (Voice Only) */
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Primary Action: Record Voice Message */}
            <button
              id="voice-record-btn"
              type="button"
              onClick={startRecording}
              disabled={isLoading}
              className="flex-1 min-h-12.5 px-4 rounded-2xl bg-zinc-900 dark:bg-[#121214] hover:bg-zinc-800 dark:hover:bg-zinc-900 border border-zinc-300 dark:border-white/15 text-white dark:text-zinc-100 flex items-center justify-center gap-2.5 text-xs sm:text-sm font-medium shadow-sm active:scale-98 transition-all disabled:opacity-50"
            >
              <span className="w-8 h-8 rounded-full bg-[#00f2fe]/10 border border-[#00f2fe]/30 flex items-center justify-center text-[#00f2fe]">
                <Mic className="w-4 h-4" />
              </span>
              <span>Gravar Mensagem de Voz</span>
            </button>

            {/* Live Voice Call Button */}
            <button
              id="quick-live-call-btn"
              type="button"
              onClick={onStartLiveCall}
              disabled={isLoading}
              className="min-h-12.5 px-4 sm:px-5 rounded-2xl bg-[#fe2c55] hover:bg-[#e0264b] active:bg-[#c91e41] text-white flex items-center justify-center gap-2 text-xs sm:text-sm font-semibold shadow-md shadow-[#fe2c55]/25 active:scale-98 transition-all disabled:opacity-50 shrink-0"
              title="Iniciar chamada de voz ao vivo em tempo real"
            >
              <Radio className="w-4 h-4 animate-pulse" />
              <span>Voz ao Vivo</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
