import { Persona } from '../types';
import { Trash2, Phone, Moon, Sun } from 'lucide-react';

interface HeaderProps {
  activePersona: Persona;
  onClearChat: () => void;
  onStartLiveCall: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  isEditorOpen?: boolean;
  onToggleEditor?: () => void;
}

export function Header({
  activePersona,
  onClearChat,
  onStartLiveCall,
  theme,
  onToggleTheme,
}: HeaderProps) {
  return (
    <header className="h-14 sm:h-16 border-b border-stone-200/80 dark:border-stone-800 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md px-3 sm:px-5 flex items-center justify-between gap-2 shrink-0 z-20 sticky top-0 shadow-2xs transition-colors">
      {/* Active Persona Info */}
      <div className="flex items-center gap-2.5 min-w-0">
        <div
          className="relative shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 overflow-hidden select-none"
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
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-stone-900 z-10" />
        </div>

        <div className="min-w-0 flex flex-col justify-center">
          <div className="flex items-center gap-1.5">
            <h1 className="text-sm font-semibold text-stone-900 dark:text-stone-100 truncate leading-tight">
              {activePersona.name}
            </h1>
            {activePersona.archetype && (
              <span className="hidden sm:inline-block text-[10px] px-1.5 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 font-medium">
                {activePersona.archetype}
              </span>
            )}
          </div>
          <span className="text-[11px] text-stone-600 dark:text-stone-400 truncate leading-tight mt-0.5">
            {activePersona.tagline || 'Online'}
          </span>
        </div>
      </div>

      {/* Action Controls - Mobile Priority */}
      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
        {/* Dark / Light Mode Toggle */}
        <button
          id="theme-toggle-btn"
          type="button"
          onClick={onToggleTheme}
          className="min-h-[44px] min-w-[44px] p-2.5 rounded-full border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/80 hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 transition-all flex items-center justify-center active:scale-95"
          title={theme === 'dark' ? 'Mudar para Tema Claro' : 'Mudar para Tema Escuro (Dark Mode)'}
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-stone-600" />
          )}
        </button>

        {/* Call Live Voice Button - Prominent & 44px min touch target */}
        <button
          id="header-live-call-btn"
          type="button"
          onClick={onStartLiveCall}
          className="min-h-[44px] min-w-[44px] px-3.5 py-2 rounded-full bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white font-medium text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all active:scale-95"
          title="Iniciar chamada de voz em tempo real"
        >
          <Phone className="w-4 h-4" />
          <span className="hidden xs:inline">Voz ao Vivo</span>
        </button>

        {/* Clear Chat (Trash Can Icon) - Direct 44px touch target */}
        <button
          id="header-clear-chat-btn"
          type="button"
          onClick={onClearChat}
          className="min-h-[44px] min-w-[44px] p-2.5 rounded-full border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/80 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-stone-600 dark:text-stone-400 hover:text-rose-600 dark:hover:text-rose-400 transition-all flex items-center justify-center active:scale-95"
          title="Apagar conversa (Limpar histórico)"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
