import { buildVocabularyPrompt } from './prompt-builder';
import { parseAIResponse } from './parser';
import type { WordData } from '../types';

export async function analyzeWithAnthropic(word: string, apiKey: string): Promise<WordData> {
  if (!apiKey) {
    throw new Error('Chưa cấu hình API key cho Anthropic. Vào Cài đặt để thêm.');
  }

  const prompt = buildVocabularyPrompt(word);

  // Note: Anthropic API requires CORS proxy in browser context
  // For direct browser usage, this needs a backend proxy or CORS-enabled endpoint
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1500,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!response.ok) {
    if (response.status === 401) throw new Error('API key không hợp lệ.');
    if (response.status === 429) throw new Error('Đã vượt giới hạn. Thử lại sau.');
    throw new Error(`Anthropic API error: ${response.status}`);
  }

  const data = await response.json();
  const text = data.content?.[0]?.text || '';
  return parseAIResponse(text);
}
