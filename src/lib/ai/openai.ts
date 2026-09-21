import { buildVocabularyPrompt } from './prompt-builder';
import { parseAIResponse } from './parser';
import type { WordData } from '../types';

export async function analyzeWithOpenAI(word: string, apiKey: string): Promise<WordData> {
  if (!apiKey) {
    throw new Error('Chưa cấu hình API key cho OpenAI. Vào Cài đặt để thêm.');
  }

  const prompt = buildVocabularyPrompt(word);

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a linguistic expert. Always respond with valid JSON only, no markdown.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' },
    }),
  });

  if (!response.ok) {
    if (response.status === 401) throw new Error('API key không hợp lệ.');
    if (response.status === 429) throw new Error('Đã vượt giới hạn. Thử lại sau.');
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content || '';
  return parseAIResponse(text);
}
