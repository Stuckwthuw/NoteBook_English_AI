// ============================================
// Linguistic Schema Types
// ============================================

export interface WordContext {
  domain: string;
  exampleSentence: string;
  sentenceMeaning: string;
}

export interface WordFamilyMember {
  word: string;
  partOfSpeech: string;
  meaning: string;
}

export interface WordData {
  word: string;
  ipa: string;
  partOfSpeech: string;
  vietnameseMeaning: string;
  cefrLevel: string;
  register: string;
  collocations: string[];
  contexts: WordContext[];
  commonPitfalls: string;
  wordFamily?: WordFamilyMember[];
  synonyms?: string[];
  antonyms?: string[];
}

export interface VocabularyEntry extends WordData {
  id: string;
  createdAt: number;
  updatedAt: number;
  isMastered: boolean;
  reviewCount: number;
  lastReviewedAt: number | null;
  tags?: string[];
}

// ============================================
// AI Configuration Types
// ============================================

export type AIMode = 'free-web' | 'free-api' | 'paid-api';

export type AIProvider = 'gemini' | 'chatgpt' | 'claude';

export interface AIProviderConfig {
  id: AIProvider;
  name: string;
  url: string;
  color: string;
  gradient: string;
  icon: string;
  description: string;
}

export const AI_PROVIDERS: Record<AIProvider, AIProviderConfig> = {
  gemini: {
    id: 'gemini',
    name: 'Google Gemini',
    url: 'https://gemini.google.com/app',
    color: '#4285F4',
    gradient: 'linear-gradient(135deg, #4285F4, #34A853, #FBBC04, #EA4335)',
    icon: '✦',
    description: 'AI của Google, nhanh và miễn phí',
  },
  chatgpt: {
    id: 'chatgpt',
    name: 'ChatGPT',
    url: 'https://chatgpt.com/',
    color: '#10A37F',
    gradient: 'linear-gradient(135deg, #10A37F, #1A7F5A)',
    icon: '◆',
    description: 'AI của OpenAI, phổ biến nhất',
  },
  claude: {
    id: 'claude',
    name: 'Claude',
    url: 'https://claude.ai/new',
    color: '#D97757',
    gradient: 'linear-gradient(135deg, #D97757, #C4642A)',
    icon: '◈',
    description: 'AI của Anthropic, chất lượng cao',
  },
};

// ============================================
// App Settings Types
// ============================================

export interface AppSettings {
  aiMode: AIMode;
  preferredProvider: AIProvider;
  geminiApiKey: string;
  openaiApiKey: string;
  anthropicApiKey: string;
  accentPreference: 'US' | 'UK';
  theme: 'light' | 'dark' | 'system';
}

export const DEFAULT_SETTINGS: AppSettings = {
  aiMode: 'free-web',
  preferredProvider: 'gemini',
  geminiApiKey: '',
  openaiApiKey: '',
  anthropicApiKey: '',
  accentPreference: 'US',
  theme: 'system',
};

// ============================================
// CEFR Level Config
// ============================================

export interface CEFRConfig {
  level: string;
  color: string;
  bgColor: string;
  label: string;
}

export const CEFR_LEVELS: Record<string, CEFRConfig> = {
  A1: { level: 'A1', color: '#22c55e', bgColor: '#dcfce7', label: 'Beginner' },
  A2: { level: 'A2', color: '#14b8a6', bgColor: '#ccfbf1', label: 'Elementary' },
  B1: { level: 'B1', color: '#3b82f6', bgColor: '#dbeafe', label: 'Intermediate' },
  B2: { level: 'B2', color: '#8b5cf6', bgColor: '#ede9fe', label: 'Upper-Intermediate' },
  C1: { level: 'C1', color: '#f97316', bgColor: '#ffedd5', label: 'Advanced' },
  C2: { level: 'C2', color: '#ef4444', bgColor: '#fee2e2', label: 'Proficient' },
  'B2/C1': { level: 'B2/C1', color: '#a855f7', bgColor: '#f3e8ff', label: 'Upper-Adv' },
};

// ============================================
// Stats Types
// ============================================

export interface VocabStats {
  total: number;
  mastered: number;
  needReview: number;
  todayAdded: number;
  byCEFR: Record<string, number>;
  byPOS: Record<string, number>;
}
