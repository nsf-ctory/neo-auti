import { useState } from 'react';
import { LiveVoiceModal } from './components/LiveVoiceModal';

export default function App() {
  const [isLiveOpen, setIsLiveOpen] = useState(false);

  return (
    <main className="flex min-h-dvh items-center justify-center overflow-hidden bg-black">
      <button
        type="button"
        onClick={() => setIsLiveOpen(true)}
        aria-label="Iniciar chamada com Auti."
        className="group relative flex h-72 w-72 items-center justify-center rounded-full outline-none sm:h-96 sm:w-96"
      >
        <span className="absolute inset-10 rounded-full bg-cyan-400/20 blur-3xl transition-transform duration-500 group-hover:scale-110 group-focus-visible:scale-110" />
        <img
          src="/ball_auti.png"
          alt=""
          className="relative h-full w-full object-contain transition-transform duration-300 group-active:scale-95"
        />
      </button>

      <LiveVoiceModal
        isOpen={isLiveOpen}
        onClose={() => setIsLiveOpen(false)}
      />
    </main>
  );
}
