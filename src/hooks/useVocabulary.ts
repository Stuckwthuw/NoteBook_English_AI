'use client';

import { useState, useEffect, useCallback } from 'react';
import type { VocabularyEntry, VocabStats, WordData } from '@/lib/types';
import * as db from '@/lib/db';

export function useVocabulary() {
  const [words, setWords] = useState<VocabularyEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadWords = useCallback(async () => {
    try {
      setLoading(true);
      const data = await db.getAllWords();
      setWords(data);
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWords();
  }, [loadWords]);

  const addWord = useCallback(
    async (wordData: WordData) => {
      const entry: VocabularyEntry = {
        ...wordData,
        id: `${wordData.word.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        isMastered: false,
        reviewCount: 0,
        lastReviewedAt: null,
      };
      await db.addWord(entry);
      await loadWords();
      return entry;
    },
    [loadWords]
  );

  const removeWord = useCallback(
    async (id: string) => {
      await db.deleteWord(id);
      await loadWords();
    },
    [loadWords]
  );

  const updateWord = useCallback(
    async (updatedEntry: VocabularyEntry) => {
      await db.updateWord({
        ...updatedEntry,
        updatedAt: Date.now(),
      });
      await loadWords();
    },
    [loadWords]
  );

  const toggleMastered = useCallback(
    async (id: string) => {
      const word = words.find((w) => w.id === id);
      if (word) {
        await db.updateWord({
          ...word,
          isMastered: !word.isMastered,
          reviewCount: word.reviewCount + 1,
          lastReviewedAt: Date.now(),
        });
        await loadWords();
      }
    },
    [words, loadWords]
  );

  const markReviewed = useCallback(
    async (id: string, mastered: boolean) => {
      const word = words.find((w) => w.id === id);
      if (word) {
        await db.updateWord({
          ...word,
          isMastered: mastered,
          reviewCount: word.reviewCount + 1,
          lastReviewedAt: Date.now(),
        });
        await loadWords();
      }
    },
    [words, loadWords]
  );

  const stats: VocabStats = {
    total: words.length,
    mastered: words.filter((w) => w.isMastered).length,
    needReview: words.filter((w) => !w.isMastered).length,
    todayAdded: words.filter((w) => {
      const today = new Date();
      const created = new Date(w.createdAt);
      return (
        created.getDate() === today.getDate() &&
        created.getMonth() === today.getMonth() &&
        created.getFullYear() === today.getFullYear()
      );
    }).length,
    byCEFR: words.reduce(
      (acc, w) => {
        acc[w.cefrLevel] = (acc[w.cefrLevel] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    ),
    byPOS: words.reduce(
      (acc, w) => {
        acc[w.partOfSpeech] = (acc[w.partOfSpeech] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    ),
  };

  return {
    words,
    loading,
    error,
    stats,
    addWord,
    removeWord,
    updateWord,
    toggleMastered,
    markReviewed,
    refresh: loadWords,
  };
}
