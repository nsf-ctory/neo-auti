import { Mic, MicOff, PhoneOff } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import {
  LiveAudioPlayer,
  floatTo16BitPCM,
  pcmToBase64,
} from '../utils/liveAudio';

interface LiveVoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type CallStatus = 'connecting' | 'listening' | 'speaking' | 'error';

export function LiveVoiceModal({ isOpen, onClose }: LiveVoiceModalProps) {
  const [status, setStatus] = useState<CallStatus>('connecting');
  const [isMuted, setIsMuted] = useState(false);
  const [assistantVolume, setAssistantVolume] = useState(0);
  const [userVolume, setUserVolume] = useState(0);
  const wsRef = useRef<WebSocket | null>(null);
  const audioPlayerRef = useRef<LiveAudioPlayer | null>(null);
  const inputAudioCtxRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const isMutedRef = useRef(false);

  isMutedRef.current = isMuted;

  const stopMicCapture = () => {
    scriptProcessorRef.current?.disconnect();
    scriptProcessorRef.current = null;
    if (inputAudioCtxRef.current?.state !== 'closed') {
      void inputAudioCtxRef.current?.close();
    }
    inputAudioCtxRef.current = null;
    mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
    mediaStreamRef.current = null;
  };

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
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const inputCtx = new AudioCtx({ sampleRate: 16000 });
      inputAudioCtxRef.current = inputCtx;
      const source = inputCtx.createMediaStreamSource(stream);
      const processor = inputCtx.createScriptProcessor(2048, 1, 1);
      scriptProcessorRef.current = processor;
      source.connect(processor);
      processor.connect(inputCtx.destination);
      processor.onaudioprocess = (event) => {
        if (isMutedRef.current || activeWs.readyState !== WebSocket.OPEN) return;
        const input = event.inputBuffer.getChannelData(0);
        let total = 0;
        for (const sample of input) total += Math.abs(sample);
        setUserVolume(Math.min(1, (total / input.length) * 5));
        activeWs.send(JSON.stringify({ audio: pcmToBase64(floatTo16BitPCM(input)) }));
      };
    } catch {
      setStatus('error');
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    let active = true;
    setStatus('connecting');
    const player = new LiveAudioPlayer();
    audioPlayerRef.current = player;
    player.init();
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(`${protocol}//${window.location.host}/api/live`);
    wsRef.current = ws;

    ws.onopen = () => ws.send(JSON.stringify({ setup: { voice: 'Kore' } }));
    ws.onmessage = (event) => {
      if (!active) return;
      try {
        const message = JSON.parse(event.data);
        if (message.ready) {
          setStatus('listening');
          void startMicCapture(ws);
        }
        if (message.interrupted) {
          player.interrupt();
          setStatus('listening');
        }
        if (message.audio) {
          setStatus('speaking');
          player.playChunk(message.audio);
        }
        if (message.turnComplete) setStatus('listening');
        if (message.error) setStatus('error');
      } catch {
        setStatus('error');
      }
    };
    ws.onerror = () => active && setStatus('error');
    ws.onclose = () => active && setStatus('error');

    const updateVolume = () => {
      setAssistantVolume(player.getVolume());
      animationFrameRef.current = requestAnimationFrame(updateVolume);
    };
    updateVolume();

    return () => {
      active = false;
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      stopMicCapture();
      if (ws.readyState < WebSocket.CLOSING) ws.close();
      player.close();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const activity = Math.min(1, assistantVolume * 1.5 + userVolume * 0.35);
  const orbStyle = {
    '--auti-orb-scale': String(1 + activity * 0.085),
    '--auti-halo-scale': String(1 + activity * 0.35),
    '--auti-halo-opacity': String(0.4 + activity * 0.5),
  } as CSSProperties;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black">
      <div className={`auti-orb auti-orb--live ${status === 'error' ? 'auti-orb--error' : ''} relative flex h-80 w-80 items-center justify-center sm:h-112 sm:w-112`} style={orbStyle}>
        <div className="auti-orb__halo" aria-hidden="true" />
        <img src="/ball_auti.png" alt="" className="auti-orb__image" />
      </div>

      <div className="absolute bottom-10 flex items-center gap-6">
        <button
          type="button"
          onClick={() => setIsMuted((value) => !value)}
          aria-label={isMuted ? 'Ativar microfone' : 'Silenciar microfone'}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md"
        >
          {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
        </button>
        <button
          type="button"
          onClick={onClose}
          aria-label="Encerrar chamada"
          className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500 text-white"
        >
          <PhoneOff className="h-6 w-6" />
        </button>
      </div>

      <span className="sr-only" role="status" aria-live="polite">
        {status === 'error' ? 'Não foi possível iniciar a chamada.' : 'Chamada em andamento.'}
      </span>
    </div>
  );
}
