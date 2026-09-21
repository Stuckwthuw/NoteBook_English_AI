'use client';

import { useState, useCallback } from 'react';
import type { WordData, AIProvider, AIMode } from '@/lib/types';
import { AI_PROVIDERS } from '@/lib/types';
import { analyzeWord } from '@/lib/ai/router';
import { buildPromptForCopy } from '@/lib/ai/prompt-builder';
import { parseAIResponse } from '@/lib/ai/parser';
import { getSettings } from '@/lib/storage';

export function useAI() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<WordData | null>(null);

  // Mode 1: Free Web Chat — copy prompt + open tab
  const openFreeChat = useCallback(async (word: string, provider: AIProvider) => {
    const prompt = buildPromptForCopy(word);
    const config = AI_PROVIDERS[provider];

    try {
      await navigator.clipboard.writeText(prompt);
    } catch {
      // Fallback: create a temporary textarea
      const textarea = document.createElement('textarea');
      textarea.value = prompt;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }

    window.open(config.url, '_blank');

    return prompt;
  }, []);

  // Mode 2 & 3: API call (free tier or paid)
  const analyzeViaAPI = useCallback(async (word: string, provider?: AIProvider) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await analyzeWord(word, provider);
      setResult(data);
      return data;
    } catch (e) {
      const msg = (e as Error).message;
      setError(msg);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  // Parse pasted result from free chat
  const parsePastedResult = useCallback((text: string) => {
    try {
      const data = parseAIResponse(text);
      setResult(data);
      setError(null);
      return data;
    } catch (e) {
      const msg = (e as Error).message;
      setError(msg);
      throw e;
    }
  }, []);

  const getAIMode = useCallback((): AIMode => {
    return getSettings().aiMode;
  }, []);

  const clearResult = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return {
    loading,
    error,
    result,
    openFreeChat,
    analyzeViaAPI,
    parsePastedResult,
    getAIMode,
    clearResult,
  };
}
