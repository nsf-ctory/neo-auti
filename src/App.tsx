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
        className="auti-orb group relative flex h-72 w-72 items-center justify-center rounded-full outline-none sm:h-96 sm:w-96"
      >
        <span className="auti-orb__halo" aria-hidden="true" />
        <img
          src="/ball_auti.webp"
          alt=""
          width={1065}
          height={1065}
          loading="eager"
          fetchPriority="high"
          decoding="async"
          className="auti-orb__image"
        />
      </button>

      <LiveVoiceModal
        isOpen={isLiveOpen}
        onClose={() => setIsLiveOpen(false)}
      />
    </main>
  );
}
