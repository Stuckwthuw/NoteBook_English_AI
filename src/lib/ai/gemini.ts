import { GoogleGenerativeAI } from '@google/generative-ai';
import { buildVocabularyPrompt } from './prompt-builder';
import { parseAIResponse } from './parser';
import type { WordData } from '../types';

export async function analyzeWithGemini(word: string, apiKey: string): Promise<WordData> {
  if (!apiKey) {
    throw new Error('Chưa cấu hình API key cho Google Gemini. Vào Cài đặt để thêm.');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  const prompt = buildVocabularyPrompt(word);

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    return parseAIResponse(text);
  } catch (error) {
    const err = error as Error;
    if (err.message?.includes('API_KEY_INVALID') || err.message?.includes('401')) {
      throw new Error('API key không hợp lệ. Hãy kiểm tra lại trong Cài đặt.');
    }
    if (err.message?.includes('RATE_LIMIT') || err.message?.includes('429')) {
      throw new Error('Đã vượt giới hạn request. Hãy thử lại sau vài giây.');
    }
    throw new Error(`Lỗi từ Gemini API: ${err.message}`);
  }
}
