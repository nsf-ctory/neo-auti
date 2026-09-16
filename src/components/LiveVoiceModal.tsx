import { useState, useEffect, useRef } from 'react';
import { Persona } from '../types';
import { synthesizeSystemInstruction } from '../utils/promptSynthesizer';
import { floatTo16BitPCM, pcmToBase64, LiveAudioPlayer } from '../utils/liveAudio';
import { PhoneOff, Mic, MicOff, Sparkles, Volume2, Radio } from 'lucide-react';

interface LiveVoiceModalProps {
  persona: Persona;
  isOpen: boolean;
  onClose: (transcripts?: { user: string; model: string }[]) => void;
}

export function LiveVoiceModal({ persona, isOpen, onClose }: LiveVoiceModalProps) {
  const [status, setStatus] = useState<'connecting' | 'listening' | 'speaking' | 'interrupted' | 'error'>('connecting');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [assistantVolume, setAssistantVolume] = useState(0);
  const [userVolume, setUserVolume] = useState(0);
  const [conversationLog, setConversationLog] = useState<{ role: 'user' | 'model'; text: string }[]>([]);

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
              return [...prev.slice(0, -1), { role: 'model', text: last.text + msg.outputTranscription }];
            }
            return [...prev, { role: 'model', text: msg.outputTranscription }];
          });
        }

        if (msg.inputTranscription) {
          setConversationLog((prev) => {
            const last = prev[prev.length - 1];
            if (last && last.role === 'user') {
              return [...prev.slice(0, -1), { role: 'user', text: last.text + msg.inputTranscription }];
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
        setErrorMessage('Não foi possível conectar à sessão Live em tempo real.');
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
        } else if (vol < 0.02 && status === 'speaking' && !audioPlayerRef.current.isPlaying) {
          setStatus('listening');
        }
      }
      animationFrameRef.current = requestAnimationFrame(updateVolumes);
    };
    updateVolumes();

    return () => {
      isComponentActive = false;
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      stopMicCapture();
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
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

      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      const inputCtx = new AudioCtxClass({ sampleRate: 16000 });
      inputAudioCtxRef.current = inputCtx;

      const source = inputCtx.createMediaStreamSource(stream);
      const processor = inputCtx.createScriptProcessor(2048, 1, 1);
      scriptProcessorRef.current = processor;

      source.connect(processor);
      processor.connect(inputCtx.destination);

      processor.onaudioprocess = (e) => {
        if (isMutedRef.current || activeWs.readyState !== WebSocket.OPEN) return;

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
    if (inputAudioCtxRef.current && inputAudioCtxRef.current.state !== 'closed') {
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
      className="fixed inset-0 z-50 bg-stone-950/90 backdrop-blur-md flex flex-col items-center justify-between p-4 sm:p-8 animate-in fade-in duration-200"
    >
      {/* Top bar info */}
      <div className="w-full max-w-xl flex items-center justify-between text-white/90">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-stone-900 border border-stone-800 text-xs text-stone-300">
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>Gemini 3.1 Live Preview</span>
          </div>
          <span className="text-xs text-stone-300">Voz: {persona.humanization.speakingVoice || 'Kore'}</span>
        </div>

        <button
          type="button"
          onClick={handleEndCall}
          className="text-stone-300 hover:text-white text-xs px-3 py-1.5 rounded-lg hover:bg-stone-800 transition-colors"
        >
          Minimizar / Sair
        </button>
      </div>

      {/* Central Visualizer Area */}
      <div className="flex flex-col items-center justify-center my-auto space-y-6 text-center">
        {/* Pulsing Avatar Sphere */}
        <div className="relative flex items-center justify-center">
          {/* Animated audio ripples */}
          <div
            className="absolute rounded-full bg-rose-500/20 blur-xl transition-all duration-100 pointer-events-none"
            style={{
              width: `${160 + assistantVolume * 240}px`,
              height: `${160 + assistantVolume * 240}px`,
              opacity: status === 'speaking' ? 0.8 : 0.2,
            }}
          />
          <div
            className="absolute rounded-full border border-stone-700/80 transition-all duration-150 pointer-events-none"
            style={{
              width: `${140 + (status === 'speaking' ? assistantVolume * 120 : userVolume * 80)}px`,
              height: `${140 + (status === 'speaking' ? assistantVolume * 120 : userVolume * 80)}px`,
            }}
          />

          <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-gradient-to-tr from-stone-900 via-stone-800 to-stone-700 border-2 border-stone-700/60 shadow-2xl flex items-center justify-center text-5xl select-none overflow-hidden p-3">
            {persona.avatar && (persona.avatar.startsWith('/') || persona.avatar.startsWith('http')) ? (
              <img
                src={persona.avatar}
                alt={persona.name}
                className="w-full h-full object-contain rounded-full"
                referrerPolicy="no-referrer"
              />
            ) : (
              persona.avatar || '◈'
            )}
          </div>
        </div>

        {/* Persona Identity & Live Status */}
        <div className="space-y-2">
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">{persona.name}</h2>
          <p className="text-xs text-stone-300 max-w-sm mx-auto">{persona.tagline || persona.role}</p>

          <div className="pt-2">
            {status === 'connecting' && (
              <span className="inline-flex items-center gap-1.5 text-xs text-amber-400 bg-amber-950/40 border border-amber-900/60 px-3 py-1 rounded-full">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                Conectando à chamada ao vivo...
              </span>
            )}
            {status === 'listening' && (
              <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-900/60 px-3 py-1 rounded-full">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Ouvindo você... Pode falar naturalmente
              </span>
            )}
            {status === 'speaking' && (
              <span className="inline-flex items-center gap-1.5 text-xs text-sky-400 bg-sky-950/40 border border-sky-900/60 px-3 py-1 rounded-full">
                <Volume2 className="w-3.5 h-3.5 animate-bounce" />
                {persona.name} está falando... (Você pode interromper a qualquer momento)
              </span>
            )}
            {status === 'error' && (
              <span className="inline-flex items-center gap-1.5 text-xs text-rose-400 bg-rose-950/40 border border-rose-900/60 px-3 py-1 rounded-full">
                {errorMessage || 'Erro na chamada de voz'}
              </span>
            )}
          </div>
        </div>

        {/* Live Subtitles / Conversation preview */}
        {conversationLog.length > 0 && (
          <div className="max-w-md w-full max-h-32 overflow-y-auto px-4 py-2 rounded-xl bg-stone-900/60 border border-stone-800/80 text-xs text-stone-300 text-left space-y-1.5 backdrop-blur-xs">
            {conversationLog.slice(-3).map((item, idx) => (
              <div key={idx} className="leading-relaxed">
                <strong className={item.role === 'user' ? 'text-stone-100' : 'text-rose-400'}>
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
              ? 'bg-rose-900/60 border-rose-700 text-rose-300 hover:bg-rose-900'
              : 'bg-stone-900 border-stone-800 text-stone-300 hover:text-white hover:bg-stone-800'
          }`}
          title={isMuted ? 'Desmutar microfone' : 'Mutar microfone'}
        >
          {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
        </button>

        {/* End Call button */}
        <button
          id="end-live-call-btn"
          type="button"
          onClick={handleEndCall}
          className="p-5 rounded-full bg-rose-600 hover:bg-rose-700 text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
          title="Encerrar conversa por voz"
        >
          <PhoneOff className="w-7 h-7" />
        </button>
      </div>
    </div>
  );
}
