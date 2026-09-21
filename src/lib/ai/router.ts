import type { WordData, AIProvider } from '../types';
import { getSettings } from '../storage';
import { analyzeWithGemini } from './gemini';
import { analyzeWithOpenAI } from './openai';
import { analyzeWithAnthropic } from './anthropic';

/**
 * Smart AI Router
 * Điều hướng request đến đúng AI provider dựa trên settings
 */
export async function analyzeWord(word: string, provider?: AIProvider): Promise<WordData> {
  const settings = getSettings();
  const activeProvider = provider || settings.preferredProvider;

  switch (activeProvider) {
    case 'gemini':
      return analyzeWithGemini(word, settings.geminiApiKey);
    case 'chatgpt':
      return analyzeWithOpenAI(word, settings.openaiApiKey);
    case 'claude':
      return analyzeWithAnthropic(word, settings.anthropicApiKey);
    default:
      return analyzeWithGemini(word, settings.geminiApiKey);
  }
}

/**
 * Check xem provider nào đã được cấu hình API key
 */
export function getAvailableProviders(): AIProvider[] {
  const settings = getSettings();
  const available: AIProvider[] = [];
  if (settings.geminiApiKey) available.push('gemini');
  if (settings.openaiApiKey) available.push('chatgpt');
  if (settings.anthropicApiKey) available.push('claude');
  return available;
}

export function hasAnyApiKey(): boolean {
  return getAvailableProviders().length > 0;
}
