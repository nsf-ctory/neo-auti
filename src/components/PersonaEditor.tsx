import { useState } from 'react';
import { Persona, HumanizationConfig } from '../types';
import { synthesizeSystemInstruction } from '../utils/promptSynthesizer';
import {
  Sparkles,
  Sliders,
  FileText,
  Copy,
  Check,
  X,
  Plus,
  Trash2,
  Brain,
  Search,
  Cpu,
} from 'lucide-react';

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
  selectedModel = 'gemini-3.8-flash',
  onSelectModel,
  isThinkingMode = false,
  onToggleThinking,
  isSearchGrounding = false,
  onToggleSearchGrounding,
}: PersonaEditorProps) {
  const [activeTab, setActiveTab] = useState<'prompt' | 'humanization' | 'settings'>('prompt');
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
      className="flex flex-col h-full bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 overflow-hidden shadow-2xl transition-colors"
    >
      {/* Clean Mobile Header */}
      <div className="px-4 py-3 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between gap-3 bg-stone-50/70 dark:bg-stone-900/90 shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center overflow-hidden shrink-0 border border-stone-200 dark:border-stone-700">
            {persona.avatar && (persona.avatar.startsWith('/') || persona.avatar.startsWith('http')) ? (
              <img
                src={persona.avatar}
                alt={persona.name}
                className="w-full h-full object-contain p-0.5 rounded-full"
                referrerPolicy="no-referrer"
              />
            ) : (
              <span className="text-xl select-none">{persona.avatar || '◈'}</span>
            )}
          </div>
          <div className="min-w-0">
            <input
              type="text"
              value={persona.name}
              onChange={(e) => updateField('name', e.target.value)}
              className="text-sm font-semibold text-stone-900 dark:text-stone-100 bg-transparent border-0 p-0 focus:outline-none focus:ring-0 truncate"
              placeholder="Nome da Persona"
            />
            <p className="text-[11px] text-stone-600 dark:text-stone-400 truncate">
              {persona.archetype || 'Personalizada'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="min-h-[44px] min-w-[44px] flex items-center justify-center text-stone-600 dark:text-stone-400 hover:text-stone-950 dark:hover:text-stone-100 active:scale-95 rounded-full transition-transform"
          title="Fechar"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-stone-200 dark:border-stone-800 px-3 bg-white dark:bg-stone-900 gap-1 shrink-0 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('prompt')}
          className={`min-h-[44px] px-3 py-2 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'prompt'
              ? 'border-stone-900 dark:border-stone-100 text-stone-950 dark:text-stone-100'
              : 'border-transparent text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>System Prompt</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('humanization')}
          className={`min-h-[44px] px-3 py-2 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'humanization'
              ? 'border-stone-900 dark:border-stone-100 text-stone-950 dark:text-stone-100'
              : 'border-transparent text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Personalidade</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('settings')}
          className={`min-h-[44px] px-3 py-2 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'settings'
              ? 'border-stone-900 dark:border-stone-100 text-stone-950 dark:text-stone-100'
              : 'border-transparent text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
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
              <label className="block text-xs font-semibold text-stone-900 dark:text-stone-100 mb-1">
                Seu System Prompt Autoral
              </label>
              <p className="text-[11px] text-stone-600 dark:text-stone-400 mb-2 leading-relaxed">
                Cole aqui as instruções originais da sua persona. Suas regras fundamentais são rigorosamente preservadas.
              </p>
              <textarea
                rows={8}
                value={persona.systemPrompt}
                onChange={(e) => updateField('systemPrompt', e.target.value)}
                className="w-full text-xs sm:text-sm font-mono p-3 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 rounded-xl focus:bg-white focus:dark:bg-stone-950 focus:border-stone-400 dark:focus:border-stone-600 focus:outline-none leading-relaxed transition-all shadow-2xs"
                placeholder="Ex: Você é um assistente de negociação focado em clareza..."
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-900 dark:text-stone-100 mb-1">
                Frase de Apresentação / Tagline
              </label>
              <input
                type="text"
                value={persona.tagline}
                onChange={(e) => updateField('tagline', e.target.value)}
                className="w-full text-xs p-2.5 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 rounded-xl focus:bg-white focus:dark:bg-stone-950 focus:border-stone-400 dark:focus:border-stone-600 focus:outline-none transition-all shadow-2xs"
                placeholder="Ex: Especialista em escuta empática e acolhimento"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-900 dark:text-stone-100 mb-1">
                História de Fundo / Memórias
              </label>
              <textarea
                rows={3}
                value={persona.humanizationNotes || ''}
                onChange={(e) => updateField('humanizationNotes', e.target.value)}
                className="w-full text-xs p-2.5 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 rounded-xl focus:bg-white focus:dark:bg-stone-950 focus:border-stone-400 dark:focus:border-stone-600 focus:outline-none leading-relaxed transition-all shadow-2xs"
                placeholder="Ex: Vive em São Paulo, adora café coado, tem interesse em música e literatura brasileira..."
              />
            </div>

            {/* Live Prompt Preview / Copy */}
            <div className="p-3 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-stone-700 dark:text-stone-300">Prompt Sintetizado Final</span>
                <button
                  type="button"
                  onClick={handleCopySynthesized}
                  className="text-xs text-stone-600 dark:text-stone-400 hover:text-stone-950 dark:hover:text-stone-100 font-medium flex items-center gap-1"
                >
                  {copiedPrompt ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedPrompt ? 'Copiado!' : 'Copiar'}</span>
                </button>
              </div>
              <p className="text-[11px] text-stone-600 dark:text-stone-400 line-clamp-3 font-mono">
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
              <label className="block text-xs font-semibold text-stone-900 dark:text-stone-100 mb-1">
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
                    onClick={() => updateHumanization('speakingVoice', v.name as any)}
                    className={`p-2.5 rounded-xl border text-xs text-left transition-all min-h-[44px] ${
                      persona.humanization.speakingVoice === v.name
                        ? 'border-stone-900 dark:border-stone-100 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 font-medium'
                        : 'border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-850'
                    }`}
                  >
                    {v.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Sliders: Warmth */}
            <div className="space-y-1.5 bg-stone-50 dark:bg-stone-950 p-3 rounded-xl border border-stone-200/80 dark:border-stone-800/80">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-stone-900 dark:text-stone-100">Calidez & Empatia</span>
                <span className="font-mono text-stone-600 dark:text-stone-400">{persona.humanization.warmth}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={persona.humanization.warmth}
                onChange={(e) => updateHumanization('warmth', Number(e.target.value))}
                className="w-full accent-stone-900 dark:accent-stone-100"
              />
              <div className="flex justify-between text-[10px] text-stone-600 dark:text-stone-400">
                <span>Neutro / Objetivo</span>
                <span>Caloroso / Afetivo</span>
              </div>
            </div>

            {/* Sliders: Humor */}
            <div className="space-y-1.5 bg-stone-50 dark:bg-stone-950 p-3 rounded-xl border border-stone-200/80 dark:border-stone-800/80">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-stone-900 dark:text-stone-100">Humor & Sagacidade</span>
                <span className="font-mono text-stone-600 dark:text-stone-400">{persona.humanization.humor}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={persona.humanization.humor}
                onChange={(e) => updateHumanization('humor', Number(e.target.value))}
                className="w-full accent-stone-900 dark:accent-stone-100"
              />
              <div className="flex justify-between text-[10px] text-stone-600 dark:text-stone-400">
                <span>Literal / Sério</span>
                <span>Espirituoso / Irônico</span>
              </div>
            </div>

            {/* Pacing */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-stone-900 dark:text-stone-100">
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
                    className={`p-2.5 rounded-xl border text-xs text-left transition-all min-h-[44px] ${
                      persona.humanization.pacing === p.id
                        ? 'border-stone-900 dark:border-stone-100 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 font-medium'
                        : 'border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-850'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Formality */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-stone-900 dark:text-stone-100">
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
                    className={`p-2.5 rounded-xl border text-xs text-left transition-all min-h-[44px] ${
                      persona.humanization.formality === f.id
                        ? 'border-stone-900 dark:border-stone-100 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 font-medium'
                        : 'border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-850'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Quirks Manager */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-stone-900 dark:text-stone-100">
                Expressões e Cacoetes Verbais
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newQuirk}
                  onChange={(e) => setNewQuirk(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addQuirk())}
                  placeholder="Ex: 'veja bem', 'saca só'..."
                  className="flex-1 text-xs p-2 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 rounded-xl focus:bg-white dark:focus:bg-stone-900 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={addQuirk}
                  className="min-h-[40px] px-3 bg-stone-900 dark:bg-stone-100 hover:bg-stone-800 dark:hover:bg-white text-white dark:text-stone-900 text-xs font-medium rounded-xl transition-colors flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Adicionar</span>
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {(persona.humanization.quirks || []).map((quirk) => (
                  <span
                    key={quirk}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs text-stone-800 dark:text-stone-200"
                  >
                    <span>"{quirk}"</span>
                    <button
                      type="button"
                      onClick={() => removeQuirk(quirk)}
                      className="text-stone-600 dark:text-stone-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
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
                <label className="block text-xs font-semibold text-stone-900 dark:text-stone-100">
                  Modelo Gemini Principal
                </label>
                <select
                  value={selectedModel}
                  onChange={(e) => onSelectModel(e.target.value)}
                  className="w-full text-xs font-medium bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-stone-800 dark:text-stone-200 rounded-xl p-2.5 focus:bg-white dark:focus:bg-stone-900 focus:outline-none"
                >
                  <option value="gemini-3.8-flash">Gemini 3.8 Flash (Padrão e Eficiente)</option>
                  <option value="gemini-3.5-flash">Gemini 3.5 Flash (Rápido)</option>
                  <option value="gemini-3.1-pro-preview">Gemini 3.1 Pro (Raciocínio Avançado)</option>
                  <option value="gemini-3.1-flash-lite">Gemini 3.1 Flash Lite (Ultraleve)</option>
                </select>
              </div>
            )}

            {/* Thinking Mode Toggle */}
            {onToggleThinking && (
              <div className="flex items-center justify-between p-3.5 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl">
                <div className="space-y-0.5 pr-2">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-900 dark:text-stone-100">
                    <Brain className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    <span>Raciocínio Profundo (Thinking Mode)</span>
                  </div>
                  <p className="text-[11px] text-stone-600 dark:text-stone-400">
                    Usa Gemini 3.1 Pro com nível alto de reflexão antes de emitir a resposta.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={isThinkingMode}
                  onChange={onToggleThinking}
                  className="w-5 h-5 accent-stone-900 dark:accent-stone-100 rounded cursor-pointer"
                />
              </div>
            )}

            {/* Google Search Grounding */}
            {onToggleSearchGrounding && (
              <div className="flex items-center justify-between p-3.5 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl">
                <div className="space-y-0.5 pr-2">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-900 dark:text-stone-100">
                    <Search className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span>Pesquisa Google (Google Search)</span>
                  </div>
                  <p className="text-[11px] text-stone-600 dark:text-stone-400">
                    Conecta respostas a fatos em tempo real e citações da web.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={isSearchGrounding}
                  onChange={onToggleSearchGrounding}
                  className="w-5 h-5 accent-stone-900 dark:accent-stone-100 rounded cursor-pointer"
                />
              </div>
            )}

            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={onClose}
                className="w-full py-3 bg-stone-900 dark:bg-stone-100 hover:bg-stone-800 dark:hover:bg-white active:scale-95 text-white dark:text-stone-900 font-medium text-xs rounded-xl shadow-xs transition-all"
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
