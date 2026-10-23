import {
  Brain,
  Check,
  Copy,
  Cpu,
  FileText,
  Plus,
  Search,
  Sliders,
  Trash2,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { HumanizationConfig, Persona } from '../types';
import { synthesizeSystemInstruction } from '../utils/promptSynthesizer';

interface PersonaEditorProps {
  persona: Persona;
  onUpdatePersona: (updated: Persona) => void;
  onClose?: () => void;
  selectedModel?: string;
  onSelectModel?: (m: string) => void;
  isThinkingMode?: boolean;
  onToggleThinking?: () => void;
  isSearchGrounding?: boolean;
  onToggleSearchGrounding?: () => void;
}

export function PersonaEditor({
  persona,
  onUpdatePersona,
  onClose,
  selectedModel = 'gemini-3.5-flash',
  onSelectModel,
  isThinkingMode = false,
  onToggleThinking,
  isSearchGrounding = false,
  onToggleSearchGrounding,
}: PersonaEditorProps) {
  const [activeTab, setActiveTab] = useState<
    'prompt' | 'humanization' | 'settings'
  >('prompt');
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [newQuirk, setNewQuirk] = useState('');

  const synthesized = synthesizeSystemInstruction(persona);

  const handleCopySynthesized = () => {
    navigator.clipboard.writeText(synthesized);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  const updateField = <K extends keyof Persona>(key: K, value: Persona[K]) => {
    onUpdatePersona({ ...persona, [key]: value });
  };

  const updateHumanization = <K extends keyof HumanizationConfig>(
    key: K,
    value: HumanizationConfig[K]
  ) => {
    onUpdatePersona({
      ...persona,
      humanization: {
        ...persona.humanization,
        [key]: value,
      },
    });
  };

  const addQuirk = () => {
    if (!newQuirk.trim()) return;
    const current = persona.humanization.quirks || [];
    if (!current.includes(newQuirk.trim())) {
      updateHumanization('quirks', [...current, newQuirk.trim()]);
    }
    setNewQuirk('');
  };

  const removeQuirk = (quirkToRemove: string) => {
    const current = persona.humanization.quirks || [];
    updateHumanization(
      'quirks',
      current.filter((q) => q !== quirkToRemove)
    );
  };

  return (
    <div
      id="persona-editor-container"
      className="flex flex-col h-full bg-white dark:bg-[#121214] text-zinc-900 dark:text-zinc-100 overflow-hidden shadow-2xl transition-colors"
    >
      {/* Clean Mobile Header */}
      <div className="px-4 py-3 border-b border-zinc-200 dark:border-white/10 flex items-center justify-between gap-3 bg-zinc-50/70 dark:bg-[#0b0b0c]/90 shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center overflow-hidden shrink-0 border border-zinc-200 dark:border-white/10">
            {persona.avatar &&
            (persona.avatar.startsWith('/') ||
              persona.avatar.startsWith('http')) ? (
              <img
                src={persona.avatar}
                alt={persona.name}
                className="w-full h-full object-contain p-0.5 rounded-full"
                referrerPolicy="no-referrer"
              />
            ) : (
              <span className="text-xl select-none">
                {persona.avatar || '◈'}
              </span>
            )}
          </div>
          <div className="min-w-0">
            <input
              type="text"
              value={persona.name}
              onChange={(e) => updateField('name', e.target.value)}
              className="text-sm font-semibold text-zinc-900 dark:text-white bg-transparent border-0 p-0 focus:outline-none focus:ring-0 truncate"
              placeholder="Nome da Persona"
            />
            <p className="text-[11px] text-zinc-600 dark:text-[#9bb7c3] truncate">
              {persona.archetype || 'Personalizada'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="min-h-11 min-w-11 flex items-center justify-center text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white active:scale-95 rounded-full transition-transform"
          title="Fechar"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-zinc-200 dark:border-white/10 px-3 bg-white dark:bg-[#121214] gap-1 shrink-0 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('prompt')}
          className={`min-h-11 px-3 py-2 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'prompt'
              ? 'border-zinc-900 dark:border-[#fe2c55] text-zinc-950 dark:text-white'
              : 'border-transparent text-zinc-600 dark:text-[#9bb7c3] hover:text-zinc-900 dark:hover:text-zinc-200'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>System Prompt</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('humanization')}
          className={`min-h-11 px-3 py-2 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'humanization'
              ? 'border-zinc-900 dark:border-[#00f2fe] text-zinc-950 dark:text-white'
              : 'border-transparent text-zinc-600 dark:text-[#9bb7c3] hover:text-zinc-900 dark:hover:text-zinc-200'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Personalidade</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('settings')}
          className={`min-h-11 px-3 py-2 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'settings'
              ? 'border-zinc-900 dark:border-[#d7fe09] text-zinc-950 dark:text-white'
              : 'border-transparent text-zinc-600 dark:text-[#9bb7c3] hover:text-zinc-900 dark:hover:text-zinc-200'
          }`}
        >
          <Cpu className="w-3.5 h-3.5" />
          <span>Recursos & IA</span>
        </button>
      </div>

      {/* Scrollable Tab Content */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
        {/* TAB 1: SYSTEM PROMPT */}
        {activeTab === 'prompt' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-900 dark:text-white mb-1">
                Seu System Prompt Autoral
              </label>
              <p className="text-[11px] text-zinc-600 dark:text-[#9bb7c3] mb-2 leading-relaxed">
                Cole aqui as instruções originais da sua persona. Suas regras
                fundamentais são rigorosamente preservadas.
              </p>
              <textarea
                rows={8}
                value={persona.systemPrompt}
                onChange={(e) => updateField('systemPrompt', e.target.value)}
                className="w-full text-xs sm:text-sm font-mono p-3 bg-zinc-50 dark:bg-[#050505] border border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-zinc-100 rounded-xl focus:bg-white focus:dark:bg-[#050505] focus:border-zinc-400 dark:focus:border-[#fe2c55]/40 focus:outline-none leading-relaxed transition-all shadow-2xs"
                placeholder="Ex: Você é um assistente de negociação focado em clareza..."
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-900 dark:text-white mb-1">
                Frase de Apresentação / Tagline
              </label>
              <input
                type="text"
                value={persona.tagline}
                onChange={(e) => updateField('tagline', e.target.value)}
                className="w-full text-xs p-2.5 bg-zinc-50 dark:bg-[#050505] border border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-zinc-100 rounded-xl focus:bg-white focus:dark:bg-[#050505] focus:border-zinc-400 dark:focus:border-[#fe2c55]/40 focus:outline-none transition-all shadow-2xs"
                placeholder="Ex: Especialista em escuta empática e acolhimento"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-900 dark:text-white mb-1">
                História de Fundo / Memórias
              </label>
              <textarea
                rows={3}
                value={persona.humanizationNotes || ''}
                onChange={(e) =>
                  updateField('humanizationNotes', e.target.value)
                }
                className="w-full text-xs p-2.5 bg-zinc-50 dark:bg-[#050505] border border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-zinc-100 rounded-xl focus:bg-white focus:dark:bg-[#050505] focus:border-zinc-400 dark:focus:border-[#fe2c55]/40 focus:outline-none leading-relaxed transition-all shadow-2xs"
                placeholder="Ex: Vive em São Paulo, adora café coado, tem interesse em música e literatura brasileira..."
              />
            </div>

            {/* Live Prompt Preview / Copy */}
            <div className="p-3 bg-zinc-50 dark:bg-[#050505] border border-zinc-200 dark:border-white/10 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  Prompt Sintetizado Final
                </span>
                <button
                  type="button"
                  onClick={handleCopySynthesized}
                  className="text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white font-medium flex items-center gap-1"
                >
                  {copiedPrompt ? (
                    <Check className="w-3.5 h-3.5 text-[#00f2fe]" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>{copiedPrompt ? 'Copiado!' : 'Copiar'}</span>
                </button>
              </div>
              <p className="text-[11px] text-zinc-600 dark:text-[#9bb7c3] line-clamp-3 font-mono">
                {synthesized}
              </p>
            </div>
          </div>
        )}

        {/* TAB 2: PERSONALIDADE & HUMANIZAÇÃO */}
        {activeTab === 'humanization' && (
          <div className="space-y-5">
            {/* Voz Falada (TTS / Live) */}
            <div>
              <label className="block text-xs font-semibold text-zinc-900 dark:text-white mb-1">
                Voz da Persona (Gemini Live & TTS)
              </label>
              <div className="grid grid-cols-2 gap-2 pt-1">
                {[
                  { name: 'Kore', label: 'Kore (Calma, Serena)' },
                  { name: 'Puck', label: 'Puck (Jovem, Vivaz)' },
                  { name: 'Zephyr', label: 'Zephyr (Grave, Confiante)' },
                  { name: 'Fenrir', label: 'Fenrir (Firme, Dinâmico)' },
                ].map((v) => (
                  <button
                    key={v.name}
                    type="button"
                    onClick={() =>
                      updateHumanization('speakingVoice', v.name as any)
                    }
                    className={`p-2.5 rounded-xl border text-xs text-left transition-all min-h-11 ${
                      persona.humanization.speakingVoice === v.name
                        ? 'border-zinc-900 dark:border-[#00f2fe] bg-zinc-900 dark:bg-[#00f2fe]/10 text-white dark:text-[#00f2fe] font-medium'
                        : 'border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-[#050505] text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900'
                    }`}
                  >
                    {v.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Sliders: Warmth */}
            <div className="space-y-1.5 bg-zinc-50 dark:bg-[#0b0b0c] p-3 rounded-xl border border-zinc-200/80 dark:border-white/10">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-zinc-900 dark:text-white">
                  Calidez & Empatia
                </span>
                <span className="font-mono text-zinc-600 dark:text-[#9bb7c3]">
                  {persona.humanization.warmth}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={persona.humanization.warmth}
                onChange={(e) =>
                  updateHumanization('warmth', Number(e.target.value))
                }
                className="w-full accent-[#fe2c55]"
              />
              <div className="flex justify-between text-[10px] text-zinc-600 dark:text-[#9bb7c3]">
                <span>Neutro / Objetivo</span>
                <span>Caloroso / Afetivo</span>
              </div>
            </div>

            {/* Sliders: Humor */}
            <div className="space-y-1.5 bg-zinc-50 dark:bg-[#0b0b0c] p-3 rounded-xl border border-zinc-200/80 dark:border-white/10">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-zinc-900 dark:text-white">
                  Humor & Sagacidade
                </span>
                <span className="font-mono text-zinc-600 dark:text-[#9bb7c3]">
                  {persona.humanization.humor}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={persona.humanization.humor}
                onChange={(e) =>
                  updateHumanization('humor', Number(e.target.value))
                }
                className="w-full accent-[#fe2c55]"
              />
              <div className="flex justify-between text-[10px] text-zinc-600 dark:text-[#9bb7c3]">
                <span>Literal / Sério</span>
                <span>Espirituoso / Irônico</span>
              </div>
            </div>

            {/* Pacing */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-zinc-900 dark:text-white">
                Cadência da Fala (Pacing)
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'concise', label: 'Conciso e Direto' },
                  { id: 'conversational', label: 'Conversacional Fluido' },
                  { id: 'balanced', label: 'Equilibrado' },
                  { id: 'reflective', label: 'Reflexivo / Lento' },
                ].map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => updateHumanization('pacing', p.id as any)}
                    className={`p-2.5 rounded-xl border text-xs text-left transition-all min-h-11 ${
                      persona.humanization.pacing === p.id
                        ? 'border-zinc-900 dark:border-[#00f2fe] bg-zinc-900 dark:bg-[#00f2fe]/10 text-white dark:text-[#00f2fe] font-medium'
                        : 'border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-[#050505] text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Formality */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-zinc-900 dark:text-white">
                Registro de Linguagem
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'colloquial_slang', label: 'Coloquial com Gírias' },
                  { id: 'informal_friendly', label: 'Informal Amigável' },
                  { id: 'semi_formal', label: 'Semiforma / Polido' },
                  { id: 'formal', label: 'Formal / Corporativo' },
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => updateHumanization('formality', f.id as any)}
                    className={`p-2.5 rounded-xl border text-xs text-left transition-all min-h-11 ${
                      persona.humanization.formality === f.id
                        ? 'border-zinc-900 dark:border-[#00f2fe] bg-zinc-900 dark:bg-[#00f2fe]/10 text-white dark:text-[#00f2fe] font-medium'
                        : 'border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-[#050505] text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Quirks Manager */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-zinc-900 dark:text-white">
                Expressões e Cacoetes Verbais
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newQuirk}
                  onChange={(e) => setNewQuirk(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === 'Enter' && (e.preventDefault(), addQuirk())
                  }
                  placeholder="Ex: 'veja bem', 'saca só'..."
                  className="flex-1 text-xs p-2 bg-zinc-50 dark:bg-[#050505] border border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-zinc-100 rounded-xl focus:bg-white dark:focus:bg-[#050505] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={addQuirk}
                  className="min-h-10 px-3 bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-white text-white dark:text-zinc-900 text-xs font-medium rounded-xl transition-colors flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Adicionar</span>
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {(persona.humanization.quirks || []).map((quirk) => (
                  <span
                    key={quirk}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-800 dark:text-zinc-200"
                  >
                    <span>"{quirk}"</span>
                    <button
                      type="button"
                      onClick={() => removeQuirk(quirk)}
                      className="text-zinc-600 dark:text-zinc-400 hover:text-[#fe2c55] dark:hover:text-[#fe2c55] transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: RECURSOS & IA */}
        {activeTab === 'settings' && (
          <div className="space-y-4">
            {/* Model Selector */}
            {onSelectModel && (
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-zinc-900 dark:text-white">
                  Modelo Gemini Principal
                </label>
                <select
                  value={selectedModel}
                  onChange={(e) => onSelectModel(e.target.value)}
                  className="w-full text-xs font-medium bg-zinc-50 dark:bg-[#050505] border border-zinc-200 dark:border-white/10 text-zinc-800 dark:text-zinc-200 rounded-xl p-2.5 focus:bg-white dark:focus:bg-[#050505] focus:outline-none"
                >
                  <option value="gemini-3.8-flash">
                    Gemini 3.8 Flash (Padrão e Eficiente)
                  </option>
                  <option value="gemini-3.5-flash">
                    Gemini 3.5 Flash (Rápido)
                  </option>
                  <option value="gemini-3.1-pro-preview">
                    Gemini 3.1 Pro (Raciocínio Avançado)
                  </option>
                  <option value="gemini-3.1-flash-lite">
                    Gemini 3.1 Flash Lite (Ultraleve)
                  </option>
                </select>
              </div>
            )}

            {/* Thinking Mode Toggle */}
            {onToggleThinking && (
              <div className="flex items-center justify-between p-3.5 bg-zinc-50 dark:bg-[#050505] border border-zinc-200 dark:border-white/10 rounded-xl">
                <div className="space-y-0.5 pr-2">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-900 dark:text-white">
                    <Brain className="w-4 h-4 text-[#d7fe09]" />
                    <span>Raciocínio Profundo (Thinking Mode)</span>
                  </div>
                  <p className="text-[11px] text-zinc-600 dark:text-[#9bb7c3]">
                    Usa Gemini 3.1 Pro com nível alto de reflexão antes de
                    emitir a resposta.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={isThinkingMode}
                  onChange={onToggleThinking}
                  className="w-5 h-5 accent-[#d7fe09] rounded cursor-pointer"
                />
              </div>
            )}

            {/* Google Search Grounding */}
            {onToggleSearchGrounding && (
              <div className="flex items-center justify-between p-3.5 bg-zinc-50 dark:bg-[#050505] border border-zinc-200 dark:border-white/10 rounded-xl">
                <div className="space-y-0.5 pr-2">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-900 dark:text-white">
                    <Search className="w-4 h-4 text-[#00f2fe]" />
                    <span>Pesquisa Google (Google Search)</span>
                  </div>
                  <p className="text-[11px] text-zinc-600 dark:text-[#9bb7c3]">
                    Conecta respostas a fatos em tempo real e citações da web.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={isSearchGrounding}
                  onChange={onToggleSearchGrounding}
                  className="w-5 h-5 accent-[#00f2fe] rounded cursor-pointer"
                />
              </div>
            )}

            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={onClose}
                className="w-full py-3 bg-zinc-900 dark:bg-[#fe2c55] hover:bg-zinc-800 dark:hover:bg-[#e0264b] active:scale-95 text-white font-medium text-xs rounded-xl shadow-xs shadow-[#fe2c55]/20 transition-all"
              >
                Concluir e Voltar ao Chat
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
