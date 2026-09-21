import { GoogleGenerativeAI } from '@google/generative-ai';
import { buildVocabularyPrompt } from './prompt-builder';
import { parseAIResponse } from './parser';
import type { WordData } from '../types';

export async function analyzeWithGemini(word: string, apiKey: string): Promise<WordData> {
  if (!apiKey) {
    throw new Error('Chưa cấu hình API key cho Google Gemini. Vào Cài đặt để thêm.');
  }

  const genAI = new GoogleGenerativeAI(apiKey.trim());
  const prompt = buildVocabularyPrompt(word);

  // Danh sách các model theo thứ tự ưu tiên (ưu tiên model mới nhất theo hướng dẫn của Google)
  const candidateModels = [
    'gemini-3.6-flash',
    'gemini-2.5-flash',
    'gemini-1.5-flash',
    'gemini-1.5-pro',
  ];

  let lastError: Error | null = null;

  for (const modelName of candidateModels) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      const text = result.response.text();

      if (text) {
        return parseAIResponse(text, word);
      }
    } catch (error) {
      const err = error as Error;
      lastError = err;

      // Nếu lỗi do sai API Key hoặc Rate Limit thì dừng và báo ngay
      if (err.message?.includes('API_KEY_INVALID') || err.message?.includes('401') || err.message?.includes('API key not valid')) {
        throw new Error('API key không hợp lệ. Hãy kiểm tra lại trong Cài đặt.');
      }
      if (err.message?.includes('RATE_LIMIT') || err.message?.includes('429')) {
        throw new Error('Đã vượt giới hạn request (Rate limit). Hãy thử lại sau vài giây.');
      }

      // Nếu là lỗi 404 model not found hoặc không khả dụng, thử tiếp model kế tiếp
      console.warn(`Model ${modelName} không khả dụng, thử model kế tiếp... Lỗi:`, err.message);
    }
  }

  throw new Error(`Lỗi từ Gemini API: ${lastError?.message || 'Không tìm thấy model phù hợp.'}`);
}
