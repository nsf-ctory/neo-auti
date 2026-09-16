import { Persona } from '../types';

interface HeaderProps {
  activePersona: Persona;
}

export function Header({ activePersona }: HeaderProps) {
  return (
    <header className="h-14 sm:h-16 border-b border-zinc-200/80 dark:border-white/10 bg-white/95 dark:bg-[#0b0b0c]/95 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between gap-2 shrink-0 z-20 sticky top-0 shadow-2xs transition-colors">
      {/* Active Persona Info */}
      <div className="flex items-center gap-2.5 min-w-0">
        <div
          className="relative shrink-0 flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 overflow-hidden select-none"
        >
          {activePersona.avatar && (activePersona.avatar.startsWith('/') || activePersona.avatar.startsWith('http')) ? (
            <img
              src={activePersona.avatar}
              alt={activePersona.name}
              className="w-full h-full object-contain p-1 rounded-full"
              referrerPolicy="no-referrer"
            />
          ) : (
            <span className="text-xl">{activePersona.avatar || '◈'}</span>
          )}
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#00f2fe] ring-2 ring-white dark:ring-[#0b0b0c] z-10 shadow-[0_0_8px_rgba(0,242,254,0.6)]" />
        </div>

        <div className="min-w-0 flex flex-col justify-center">
          <div className="flex items-center gap-1.5">
            <h1 className="text-sm font-semibold text-zinc-900 dark:text-white truncate leading-tight">
              {activePersona.name}
            </h1>
            {activePersona.archetype && (
              <span className="hidden sm:inline-block text-[10px] px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400 font-medium">
                {activePersona.archetype}
              </span>
            )}
          </div>
          <span className="text-[11px] text-zinc-600 dark:text-[#9bb7c3] truncate leading-tight mt-0.5">
            {activePersona.tagline || 'Atendimento Oficial neøflow'}
          </span>
        </div>
      </div>

      {/* Official Channel Indicator */}
      <div className="flex items-center gap-2 shrink-0">
        <span className="inline-flex items-center gap-1.5 text-[10px] font-mono tracking-wider px-2.5 py-1 rounded-full bg-[#00f2fe]/10 border border-[#00f2fe]/30 text-[#00f2fe]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00f2fe] animate-pulse" />
          <span>VOZ NATIVA</span>
        </span>
      </div>
    </header>
  );
}
