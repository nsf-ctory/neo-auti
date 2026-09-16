import { useState, useRef, useEffect } from 'react';
import {
  Send,
  Image as ImageIcon,
  Mic,
  Square,
  X,
  Loader2,
  Radio,
} from 'lucide-react';
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
  const [inputText, setInputText] = useState('');
  const [attachment, setAttachment] = useState<ChatMessageAttachment | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<any>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [inputText]);

  const handleSend = () => {
    if ((!inputText.trim() && !attachment) || isLoading || isRecording) return;
    onSendMessage(inputText.trim(), attachment || undefined, {
      isThinking: isThinkingMode,
      searchGrounding: isSearchGrounding,
    });
    setInputText('');
    setAttachment(null);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Image Upload Handling
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      const base64Data = result.split(',')[1];
      setAttachment({
        name: file.name,
        mimeType: file.type || 'image/jpeg',
        data: base64Data,
        previewUrl: result,
      });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

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
        const audioBlob = new Blob(audioChunksRef.current, { type: mediaRecorder.mimeType || 'audio/webm' });
        if (audioBlob.size > 0) {
          await sendAudioToTranscribe(audioBlob, mediaRecorder.mimeType || 'audio/webm');
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
          if (data.text) {
            setInputText((prev) => (prev ? `${prev} ${data.text}` : data.text));
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

  const hasContent = inputText.trim().length > 0 || attachment !== null;

  return (
    <div
      id="chat-input-container"
      className="p-2.5 sm:p-3.5 bg-white/95 dark:bg-[#0b0b0c]/95 backdrop-blur-md border-t border-zinc-200/90 dark:border-white/10 shrink-0 transition-colors"
    >
      <div className="max-w-3xl mx-auto space-y-2">
        {/* Attachment preview if an image was selected */}
        {attachment && (
          <div className="flex items-center gap-2 p-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-xl w-fit border border-zinc-200 dark:border-zinc-700 shadow-2xs">
            <img
              src={attachment.previewUrl}
              alt="Anexo"
              className="w-11 h-11 object-cover rounded-lg border border-zinc-300 dark:border-zinc-600"
            />
            <span className="text-xs text-zinc-700 dark:text-zinc-300 max-w-[180px] truncate">
              {attachment.name}
            </span>
            <button
              type="button"
              onClick={() => setAttachment(null)}
              className="min-h-[36px] min-w-[36px] flex items-center justify-center text-zinc-500 hover:text-[#fe2c55] dark:text-zinc-400 dark:hover:text-[#fe2c55] rounded-full transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Recording Status Bar */}
        {isRecording && (
          <div className="flex items-center justify-between px-3.5 py-2 bg-[#fe2c55]/10 border border-[#fe2c55]/30 rounded-2xl text-[#fe2c55] dark:text-[#fe2c55] text-xs shadow-2xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#fe2c55] animate-ping" />
              <span className="font-semibold">Gravando áudio...</span>
              <span className="font-mono">
                {Math.floor(recordingSeconds / 60)}:{(recordingSeconds % 60).toString().padStart(2, '0')}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={cancelRecording}
                className="min-h-[36px] px-2.5 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 font-medium"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={stopRecording}
                className="min-h-[36px] px-3 bg-[#fe2c55] hover:bg-[#e0264b] text-white font-medium rounded-xl flex items-center gap-1.5 shadow-xs"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                Pronto
              </button>
            </div>
          </div>
        )}

        {/* Transcribing loader */}
        {isTranscribing && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-700 dark:text-zinc-300 text-xs">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-900 dark:text-zinc-100" />
            <span>Transcrevendo áudio...</span>
          </div>
        )}

        {/* Streamlined Mobile Input Bar */}
        <div className="flex items-end gap-1.5 bg-zinc-100/90 dark:bg-zinc-900/80 border border-zinc-200 dark:border-white/10 rounded-2xl p-1.5 focus-within:border-zinc-400 focus-within:dark:border-[#fe2c55]/50 focus-within:bg-white focus-within:dark:bg-zinc-900 transition-all shadow-2xs">
          {/* File/Image Upload (44px touch target) */}
          <input
            type="file"
            ref={fileInputRef}
            accept="image/png,image/jpeg,image/webp,image/gif"
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            id="upload-image-btn"
            type="button"
            onClick={() => fileInputRef.current?.click()}
            title="Anexar imagem"
            disabled={isLoading || isRecording}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 active:scale-95 rounded-xl transition-all"
          >
            <ImageIcon className="w-5 h-5" />
          </button>

          {/* Text Area */}
          <textarea
            id="chat-textarea"
            ref={textareaRef}
            rows={1}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Conversar com ${personaName}...`}
            disabled={isLoading || isRecording}
            className="flex-1 min-h-[40px] max-h-32 bg-transparent border-0 resize-none py-2 px-1 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-500 dark:placeholder:text-zinc-500 focus:outline-none leading-relaxed"
          />

          {/* Right Action: Send when text exists, or Mic / Live Call when empty */}
          {hasContent ? (
            <button
              id="send-message-btn"
              type="button"
              onClick={handleSend}
              disabled={isLoading || isRecording}
              title="Enviar mensagem"
              className="min-h-[44px] min-w-[44px] flex items-center justify-center text-white dark:text-zinc-900 bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-white active:scale-95 rounded-xl shadow-xs transition-all shrink-0"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          ) : (
            <div className="flex items-center gap-0.5 shrink-0">
              {/* Mic Transcribe button */}
              <button
                id="mic-record-btn"
                type="button"
                onClick={startRecording}
                disabled={isLoading || isTranscribing}
                title="Gravar áudio para transcrever"
                className="min-h-[44px] min-w-[44px] flex items-center justify-center text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 active:scale-95 rounded-xl transition-all"
              >
                <Mic className="w-5 h-5" />
              </button>

              {/* Direct Live Call trigger on mobile */}
              <button
                id="quick-live-call-btn"
                type="button"
                onClick={onStartLiveCall}
                disabled={isLoading}
                title="Chamada de voz ao vivo"
                className="min-h-[44px] min-w-[44px] flex items-center justify-center text-[#fe2c55] hover:text-[#e0264b] dark:text-[#fe2c55] dark:hover:text-[#ff4e71] active:scale-95 rounded-xl transition-all"
              >
                <Radio className="w-5 h-5 animate-pulse" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
