import { Mic, MicOff, PhoneOff, Volume2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Persona } from '../types';
import {
  LiveAudioPlayer,
  floatTo16BitPCM,
  pcmToBase64,
} from '../utils/liveAudio';
import { synthesizeSystemInstruction } from '../utils/promptSynthesizer';

interface LiveVoiceModalProps {
  persona: Persona;
  isOpen: boolean;
  onClose: (transcripts?: { user: string; model: string }[]) => void;
}

export function LiveVoiceModal({
  persona,
  isOpen,
  onClose,
}: LiveVoiceModalProps) {
  const [status, setStatus] = useState<
    'connecting' | 'listening' | 'speaking' | 'interrupted' | 'error'
  >('connecting');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [assistantVolume, setAssistantVolume] = useState(0);
  const [userVolume, setUserVolume] = useState(0);
  const [conversationLog, setConversationLog] = useState<
    { role: 'user' | 'model'; text: string }[]
  >([]);

  const wsRef = useRef<WebSocket | null>(null);
  const audioPlayerRef = useRef<LiveAudioPlayer | null>(null);
  const inputAudioCtxRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const isMutedRef = useRef(false);

  isMutedRef.current = isMuted;

  useEffect(() => {
    if (!isOpen) return;

    let isComponentActive = true;
    const player = new LiveAudioPlayer();
    audioPlayerRef.current = player;
    player.init();

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/api/live`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      if (!isComponentActive) return;
      const synthesizedPrompt = synthesizeSystemInstruction(persona);
      ws.send(
        JSON.stringify({
          setup: {
            systemInstruction: synthesizedPrompt,
            voice: persona.humanization.speakingVoice || 'Kore',
          },
        })
      );
    };

    ws.onmessage = (event) => {
      if (!isComponentActive) return;
      try {
        const msg = JSON.parse(event.data);

        if (msg.ready) {
          setStatus('listening');
          startMicCapture(ws);
        }

        if (msg.interrupted) {
          player.interrupt();
          setStatus('listening');
        }

        if (msg.audio) {
          setStatus('speaking');
          player.playChunk(msg.audio);
        }

        if (msg.turnComplete) {
          setStatus('listening');
        }

        if (msg.outputTranscription) {
          setConversationLog((prev) => {
            const last = prev[prev.length - 1];
            if (last && last.role === 'model') {
              return [
                ...prev.slice(0, -1),
                { role: 'model', text: last.text + msg.outputTranscription },
              ];
            }
            return [...prev, { role: 'model', text: msg.outputTranscription }];
          });
        }

        if (msg.inputTranscription) {
          setConversationLog((prev) => {
            const last = prev[prev.length - 1];
            if (last && last.role === 'user') {
              return [
                ...prev.slice(0, -1),
                { role: 'user', text: last.text + msg.inputTranscription },
              ];
            }
            return [...prev, { role: 'user', text: msg.inputTranscription }];
          });
        }

        if (msg.error) {
          setStatus('error');
          setErrorMessage(msg.error);
        }
      } catch (err) {
        console.error('Error handling WebSocket message:', err);
      }
    };

    ws.onerror = (err) => {
      console.error('WebSocket Live error:', err);
      if (isComponentActive) {
        setStatus('error');
        setErrorMessage(
          'Não foi possível conectar à sessão Live em tempo real.'
        );
      }
    };

    ws.onclose = () => {
      if (isComponentActive && status !== 'error') {
        setStatus('connecting');
      }
    };

    // Volume monitoring loop
    const updateVolumes = () => {
      if (audioPlayerRef.current) {
        const vol = audioPlayerRef.current.getVolume();
        setAssistantVolume(vol);
        if (vol > 0.05 && status !== 'speaking') {
          setStatus('speaking');
        } else if (
          vol < 0.02 &&
          status === 'speaking' &&
          !audioPlayerRef.current.isPlaying
        ) {
          setStatus('listening');
        }
      }
      animationFrameRef.current = requestAnimationFrame(updateVolumes);
    };
    updateVolumes();

    return () => {
      isComponentActive = false;
      if (animationFrameRef.current)
        cancelAnimationFrame(animationFrameRef.current);
      stopMicCapture();
      if (
        ws.readyState === WebSocket.OPEN ||
        ws.readyState === WebSocket.CONNECTING
      ) {
        ws.close();
      }
      player.close();
    };
  }, [isOpen, persona]);

  const startMicCapture = async (activeWs: WebSocket) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      mediaStreamRef.current = stream;

      const AudioCtxClass =
        window.AudioContext || (window as any).webkitAudioContext;
      const inputCtx = new AudioCtxClass({ sampleRate: 16000 });
      inputAudioCtxRef.current = inputCtx;

      const source = inputCtx.createMediaStreamSource(stream);
      const processor = inputCtx.createScriptProcessor(2048, 1, 1);
      scriptProcessorRef.current = processor;

      source.connect(processor);
      processor.connect(inputCtx.destination);

      processor.onaudioprocess = (e) => {
        if (isMutedRef.current || activeWs.readyState !== WebSocket.OPEN)
          return;

        const inputData = e.inputBuffer.getChannelData(0);

        // Compute local mic volume for UI visualizer
        let sum = 0;
        for (let i = 0; i < inputData.length; i++) {
          sum += Math.abs(inputData[i]);
        }
        const avg = sum / inputData.length;
        setUserVolume(Math.min(1, avg * 5));

        const pcm16 = floatTo16BitPCM(inputData);
        const base64 = pcmToBase64(pcm16);
        activeWs.send(JSON.stringify({ audio: base64 }));
      };
    } catch (err: any) {
      console.error('Error starting mic capture for Live:', err);
      setStatus('error');
      setErrorMessage('Permissão de microfone negada ou indisponível.');
    }
  };

  const stopMicCapture = () => {
    if (scriptProcessorRef.current) {
      scriptProcessorRef.current.disconnect();
      scriptProcessorRef.current = null;
    }
    if (
      inputAudioCtxRef.current &&
      inputAudioCtxRef.current.state !== 'closed'
    ) {
      inputAudioCtxRef.current.close();
      inputAudioCtxRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
  };

  const handleEndCall = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      id="live-voice-modal-overlay"
      className="fixed inset-0 z-50 bg-[#0b0b0c]/95 backdrop-blur-md flex flex-col items-center justify-between p-4 sm:p-8 animate-in fade-in duration-200"
    >
      {/* Top bar with official neøflow partner logo */}
      <div className="w-full max-w-xl flex items-center justify-center pt-2 sm:pt-4 text-white">
        <img
          src="/logo_partners.svg"
          alt="neøflow //"
          className="h-9 sm:h-11 w-auto object-contain drop-shadow-md"
        />
      </div>

      {/* Central Visualizer Area */}
      <div className="flex flex-col items-center justify-center my-auto space-y-6 text-center">
        {/* Pulsing Avatar Sphere with Concentric Audio Rings */}
        <div className="relative flex items-center justify-center">
          {/* Ambient audio ripples (TikTok brand duo glow) */}
          <div
            className="absolute rounded-full bg-[#fe2c55]/20 blur-2xl transition-all duration-100 pointer-events-none"
            style={{
              width: `${180 + assistantVolume * 260}px`,
              height: `${180 + assistantVolume * 260}px`,
              opacity: status === 'speaking' ? 0.85 : 0.2,
            }}
          />
          {/* Outer concentric ring */}
          <div
            className="absolute rounded-full border border-white/10 transition-all duration-200 pointer-events-none"
            style={{
              width: `${240 + (status === 'speaking' ? assistantVolume * 140 : userVolume * 90)}px`,
              height: `${240 + (status === 'speaking' ? assistantVolume * 140 : userVolume * 90)}px`,
            }}
          />
          {/* Inner concentric ring */}
          <div
            className="absolute rounded-full border border-[#00f2fe]/20 transition-all duration-150 pointer-events-none"
            style={{
              width: `${170 + (status === 'speaking' ? assistantVolume * 100 : userVolume * 60)}px`,
              height: `${170 + (status === 'speaking' ? assistantVolume * 100 : userVolume * 60)}px`,
            }}
          />

          {/* Central Avatar */}
          <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-[#121214] border-2 border-white/15 shadow-2xl flex items-center justify-center select-none overflow-hidden p-2">
            {persona.avatar &&
            (persona.avatar.startsWith('/') ||
              persona.avatar.startsWith('http')) ? (
              <img
                src={persona.avatar}
                alt={persona.name}
                className="w-full h-full object-contain rounded-full select-none"
                referrerPolicy="no-referrer"
              />
            ) : (
              <span className="text-5xl">{persona.avatar || '◈'}</span>
            )}
          </div>
        </div>

        {/* Persona Identity & Live Status */}
        <div className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            {persona.name}
          </h2>

          <div className="pt-1">
            {status === 'connecting' && (
              <span className="inline-flex items-center gap-2 text-xs text-[#d7fe09] bg-[#d7fe09]/10 border border-[#d7fe09]/30 px-4 py-1.5 rounded-full">
                <span className="w-2 h-2 rounded-full bg-[#d7fe09] animate-ping" />
                Conectando...
              </span>
            )}
            {status === 'listening' && (
              <span className="inline-flex items-center gap-2 text-xs text-[#00f2fe] bg-[#00f2fe]/10 border border-[#00f2fe]/30 px-4 py-1.5 rounded-full">
                <span className="w-2 h-2 rounded-full bg-[#00f2fe] animate-pulse" />
                Ouvindo você...
              </span>
            )}
            {status === 'speaking' && (
              <span className="inline-flex items-center gap-2 text-xs text-[#fe2c55] bg-[#fe2c55]/10 border border-[#fe2c55]/30 px-4 py-1.5 rounded-full">
                <Volume2 className="w-3.5 h-3.5 animate-bounce" />
                {persona.name} está falando...
              </span>
            )}
            {status === 'error' && (
              <span className="inline-flex items-center gap-2 text-xs text-[#fe2c55] bg-[#fe2c55]/10 border border-[#fe2c55]/30 px-4 py-1.5 rounded-full">
                {errorMessage || 'Erro na chamada de voz'}
              </span>
            )}
          </div>
        </div>

        {/* Live Subtitles / Conversation preview */}
        {conversationLog.length > 0 && (
          <div className="max-w-md w-full max-h-24 overflow-y-auto px-4 py-2 rounded-xl bg-[#121214]/80 border border-white/10 text-xs text-zinc-300 text-left space-y-1.5 backdrop-blur-xs">
            {conversationLog.slice(-2).map((item, idx) => (
              <div key={idx} className="leading-relaxed">
                <strong
                  className={
                    item.role === 'user' ? 'text-white' : 'text-[#00f2fe]'
                  }
                >
                  {item.role === 'user' ? 'Você: ' : `${persona.name}: `}
                </strong>
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Call Controls */}
      <div className="w-full max-w-md flex items-center justify-center gap-6 pb-4">
        {/* Mute toggle button */}
        <button
          type="button"
          onClick={() => setIsMuted((prev) => !prev)}
          className={`p-4 rounded-full border transition-all ${
            isMuted
              ? 'bg-[#fe2c55]/20 border-[#fe2c55]/60 text-[#fe2c55] hover:bg-[#fe2c55]/30'
              : 'bg-zinc-900/90 border-white/10 text-zinc-300 hover:text-white hover:bg-zinc-800'
          }`}
          title={isMuted ? 'Desmutar microfone' : 'Mutar microfone'}
        >
          {isMuted ? (
            <MicOff className="w-6 h-6" />
          ) : (
            <Mic className="w-6 h-6" />
          )}
        </button>

        {/* End Call button */}
        <button
          id="end-live-call-btn"
          type="button"
          onClick={handleEndCall}
          className="p-5 rounded-full bg-[#fe2c55] hover:bg-[#e0264b] text-white shadow-xl shadow-[#fe2c55]/30 transition-transform hover:scale-105 active:scale-95"
          title="Encerrar conversa por voz"
        >
          <PhoneOff className="w-7 h-7" />
        </button>
      </div>
    </div>
  );
}
