export interface HumanizationConfig {
  warmth: number; // 0 (formal/distant) to 100 (warm/deeply empathetic)
  humor: number; // 0 (serious/literal) to 100 (witty/playful)
  pacing: 'concise' | 'balanced' | 'conversational' | 'reflective'; // speech rhythm
  formality: 'slang_colloquial' | 'informal_friendly' | 'semi_formal' | 'formal';
  curiosity: number; // 0 (passive responder) to 100 (inquisitive, asks follow-ups)
  vulnerability: boolean; // shares doubts, human-like reflections, admits subjectivity
  useAnalogies: boolean; // enriches with everyday metaphors and personal examples
  naturalPauses: boolean; // uses realistic conversational cadence (reticências, parenthetical remarks)
  quirks: string[]; // specific speech habits or catchphrases (e.g. "veja bem", "se me permite...")
  speakingVoice: 'Kore' | 'Puck' | 'Fenrir' | 'Zephyr' | 'Charon';
}

export interface Persona {
  id: string;
  name: string;
  avatar: string;
  role: string;
  tagline: string;
  archetype: string;
  systemPrompt: string; // The core system prompt the user already has or customizes
  humanizationNotes: string; // Additional personality notes, worldview, or backstory
  humanization: HumanizationConfig;
  model: 'gemini-3.8-flash' | 'gemini-3.5-flash' | 'gemini-3.1-pro-preview' | 'gemini-3.1-flash-lite';
  isCustom?: boolean;
}

export interface ChatMessageAttachment {
  name: string;
  mimeType: string;
  data: string; // base64
  previewUrl?: string;
}

export interface GroundingSourceChunk {
  web?: {
    uri: string;
    title: string;
  };
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  image?: ChatMessageAttachment;
  sources?: GroundingSourceChunk[];
  isThinking?: boolean;
  audioUrl?: string;
  isPlayingAudio?: boolean;
}
