import { GoogleGenerativeAI } from '@google/generative-ai';
import { buildVocabularyPrompt } from './prompt-builder';
import { parseAIResponse } from './parser';
import type { WordData } from '../types';

let cachedModels: { key: string; models: string[]; timestamp: number } | null = null;

/**
 * Tự động truy vấn danh sách model hiện có và đang hoạt động cho API Key cụ thể
 */
async function getAvailableGeminiModels(apiKey: string): Promise<string[]> {
  const now = Date.now();
  if (cachedModels && cachedModels.key === apiKey && (now - cachedModels.timestamp < 1000 * 60 * 30)) {
    return cachedModels.models;
  }

  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(apiKey.trim())}`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.models)) {
        interface RawModel {
          name: string;
          supportedGenerationMethods?: string[];
        }

        const rawModels: string[] = data.models
          .filter((m: RawModel) =>
            Array.isArray(m.supportedGenerationMethods) &&
            m.supportedGenerationMethods.includes('generateContent')
          )
          .map((m: RawModel) => (m.name as string).replace(/^models\//, ''))
          // Loại bỏ các model chuyên biệt về hình ảnh/audio hoặc các thế hệ cũ đã ngưng hỗ trợ
          .filter((name: string) =>
            !name.includes('embedding') &&
            !name.includes('aqa') &&
            !name.includes('imagen') &&
            !name.includes('1.5') &&
            !name.includes('2.5')
          );

        // Chấm điểm ưu tiên các model Flash mới nhất
        const getPriority = (name: string): number => {
          if (name.includes('3.8-flash')) return 100;
          if (name.includes('3.7-flash')) return 95;
          if (name.includes('3.6-flash')) return 90;
          if (name.includes('3.5-flash-lite')) return 85;
          if (name.includes('3.5-flash')) return 80;
          if (name.includes('flash')) return 70;
          if (name.includes('pro')) return 60;
          return 40;
        };

        rawModels.sort((a, b) => getPriority(b) - getPriority(a));

        if (rawModels.length > 0) {
          cachedModels = { key: apiKey, models: rawModels, timestamp: now };
          return rawModels;
        }
      }
    }
  } catch (err) {
    console.warn('Không thể tải danh sách model động từ Gemini:', err);
  }

  // Danh sách model chuẩn mới nhất làm fallback an toàn
  return [
    'gemini-3.8-flash',
    'gemini-3.7-flash',
    'gemini-3.6-flash',
    'gemini-3.5-flash',
    'gemini-3.5-flash-lite',
  ];
}

export async function analyzeWithGemini(word: string, apiKey: string): Promise<WordData> {
  if (!apiKey || !apiKey.trim()) {
    throw new Error('Chưa cấu hình API key cho Google Gemini. Vào Cài đặt để thêm.');
  }

  const cleanKey = apiKey.trim();
  const genAI = new GoogleGenerativeAI(cleanKey);
  const prompt = buildVocabularyPrompt(word);

  const candidateModels = await getAvailableGeminiModels(cleanKey);

  let had503 = false;
  let lastError: Error | null = null;

  for (const modelName of candidateModels) {
    // Thử gọi tối đa 2 lần cho mỗi model nếu gặp quá tải tạm thời (503)
    for (let attempt = 0; attempt < 2; attempt++) {
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
        const msg = err.message || '';

        // 1. Kiểm tra lỗi sai API Key
        if (msg.includes('API_KEY_INVALID') || msg.includes('401') || msg.includes('API key not valid')) {
          throw new Error('API key Google Gemini không hợp lệ. Hãy kiểm tra lại trong mục Cài đặt.');
        }

        // 2. Kiểm tra lỗi Rate limit (429)
        if (msg.includes('RATE_LIMIT') || msg.includes('429') || msg.includes('quota') || msg.includes('RESOURCE_EXHAUSTED')) {
          throw new Error('Đã vượt quá giới hạn request miễn phí của Gemini (15 req/phút). Bạn hãy đợi khoảng 1 phút rồi thử lại nhé!');
        }

        // 3. Kiểm tra lỗi 503 quá tải tạm thời (High demand spike)
        if (msg.includes('503') || msg.includes('high demand') || msg.includes('overloaded')) {
          had503 = true;
          console.warn(`Model ${modelName} đang quá tải tạm thời (503), chờ 1 giây trước khi thử lại...`);
          await new Promise((resolve) => setTimeout(resolve, 1000));
          continue; // thử attempt tiếp theo trên model này
        }

        // Nếu là lỗi 404 (model deprecated hoặc không được cấp quyền), chuyển sang model tiếp theo
        console.warn(`Model ${modelName} không khả dụng, chuyển model khác:`, msg);
        break; // dừng attempt trên model này, sang model kế tiếp trong candidateModels
      }
    }
  }

  // Nếu tất cả model đều bị quá tải 503
  if (had503) {
    throw new Error('Máy chủ Google Gemini đang tạm thời quá tải (503 High demand). Google thường phục hồi rất nhanh sau vài giây, bạn hãy bấm "Phân tích AI" lại nhé!');
  }

  throw new Error(`Lỗi từ Gemini API: ${lastError?.message || 'Không tìm thấy model phù hợp trên Google AI Studio.'}`);
}
