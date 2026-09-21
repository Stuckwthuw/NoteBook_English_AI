import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { VocabularyEntry } from './types';

// ============================================
// IndexedDB Schema
// ============================================

interface LexiconDB extends DBSchema {
  vocabulary: {
    key: string;
    value: VocabularyEntry;
    indexes: {
      'by-word': string;
      'by-cefr': string;
      'by-pos': string;
      'by-date': number;
      'by-mastered': number;
    };
  };
}

// ============================================
// Database Connection
// ============================================

let dbInstance: IDBPDatabase<LexiconDB> | null = null;

async function getDB(): Promise<IDBPDatabase<LexiconDB>> {
  if (dbInstance) return dbInstance;

  dbInstance = await openDB<LexiconDB>('smart-lexicon-notebook', 1, {
    upgrade(db) {
      const store = db.createObjectStore('vocabulary', { keyPath: 'id' });
      store.createIndex('by-word', 'word');
      store.createIndex('by-cefr', 'cefrLevel');
      store.createIndex('by-pos', 'partOfSpeech');
      store.createIndex('by-date', 'createdAt');
      store.createIndex('by-mastered', 'reviewCount');
    },
  });

  return dbInstance;
}

// ============================================
// CRUD Operations
// ============================================

export async function addWord(entry: VocabularyEntry): Promise<void> {
  const db = await getDB();
  await db.put('vocabulary', entry);
}

export async function getWord(id: string): Promise<VocabularyEntry | undefined> {
  const db = await getDB();
  return db.get('vocabulary', id);
}

export async function getAllWords(): Promise<VocabularyEntry[]> {
  const db = await getDB();
  const words = await db.getAll('vocabulary');
  return words.sort((a, b) => b.createdAt - a.createdAt);
}

export async function deleteWord(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('vocabulary', id);
}

export async function updateWord(entry: VocabularyEntry): Promise<void> {
  const db = await getDB();
  await db.put('vocabulary', { ...entry, updatedAt: Date.now() });
}

export async function searchWords(query: string): Promise<VocabularyEntry[]> {
  const db = await getDB();
  const all = await db.getAll('vocabulary');
  const lower = query.toLowerCase();
  return all.filter(
    (w) =>
      w.word.toLowerCase().includes(lower) ||
      w.vietnameseMeaning.toLowerCase().includes(lower)
  );
}

export async function getWordsByFilter(
  filter: { cefrLevel?: string; partOfSpeech?: string; isMastered?: boolean }
): Promise<VocabularyEntry[]> {
  const db = await getDB();
  let words = await db.getAll('vocabulary');
  
  if (filter.cefrLevel) {
    words = words.filter((w) => w.cefrLevel === filter.cefrLevel);
  }
  if (filter.partOfSpeech) {
    words = words.filter((w) => w.partOfSpeech === filter.partOfSpeech);
  }
  if (filter.isMastered !== undefined) {
    words = words.filter((w) => w.isMastered === filter.isMastered);
  }
  
  return words.sort((a, b) => b.createdAt - a.createdAt);
}

export async function exportAllData(): Promise<VocabularyEntry[]> {
  return getAllWords();
}

export async function importData(entries: VocabularyEntry[]): Promise<number> {
  const db = await getDB();
  let count = 0;
  for (const entry of entries) {
    await db.put('vocabulary', entry);
    count++;
  }
  return count;
}

export async function clearAllData(): Promise<void> {
  const db = await getDB();
  await db.clear('vocabulary');
}
