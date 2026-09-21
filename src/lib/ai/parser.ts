import type { WordData } from '../types';

/**
 * Kiểm tra xem chuỗi có phải JSON hay không
 */
export function detectResponseType(raw: string): 'json' | 'natural' {
  const trimmed = raw.trim();
  if (!trimmed) return 'natural';

  // Check markdown code block containing json
  if (/```(?:json)?\s*\{[\s\S]*\}\s*```/.test(trimmed)) {
    return 'json';
  }

  // Check direct JSON
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
    try {
      JSON.parse(trimmed);
      return 'json';
    } catch {
      // ignore
    }
  }

  // Check embedded JSON
  const jsonMatch = trimmed.match(/\{[\s\S]*"word"[\s\S]*\}/);
  if (jsonMatch) {
    try {
      JSON.parse(jsonMatch[0]);
      return 'json';
    } catch {
      // ignore
    }
  }

  return 'natural';
}

/**
 * Parse AI response (hỗ trợ cả JSON chuẩn và văn bản hội thoại tự nhiên từ AI)
 */
export function parseAIResponse(raw: string, fallbackWord?: string): WordData {
  const text = raw.trim();
  if (!text) {
    throw new Error('Vui lòng dán nội dung kết quả từ AI.');
  }

  // Bước 1: Thử parse theo định dạng JSON
  let jsonStr = text;
  const codeBlockMatch = jsonStr.match(/```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/);
  if (codeBlockMatch) {
    jsonStr = codeBlockMatch[1].trim();
  }

  const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[0]);
      if (parsed && typeof parsed === 'object') {
        return sanitizeParsedJSON(parsed, fallbackWord);
      }
    } catch {
      // Không phải JSON hợp lệ, tiếp tục chuyển sang bóc tách văn bản tự nhiên
    }
  }

  // Bước 2: Tự động trích xuất từ văn bản tự nhiên (Gemini, ChatGPT, Claude)
  return parseNaturalLanguageResponse(raw, fallbackWord);
}

/**
 * Xử lý dữ liệu JSON đã parse được
 */
function sanitizeParsedJSON(data: Record<string, unknown>, fallbackWord?: string): WordData {
  const word = String(data.word || fallbackWord || '').trim();
  const vietnameseMeaning = String(data.vietnameseMeaning || data.meaning || '').trim();

  return {
    word: word || 'New Word',
    ipa: String(data.ipa || ''),
    partOfSpeech: normalizePartOfSpeech(String(data.partOfSpeech || 'noun')),
    vietnameseMeaning: vietnameseMeaning || 'Nghĩa từ vựng',
    cefrLevel: normalizeCEFR(String(data.cefrLevel || 'B1')),
    register: String(data.register || 'Neutral'),
    collocations: Array.isArray(data.collocations) ? data.collocations.map(String) : [],
    contexts: Array.isArray(data.contexts)
      ? data.contexts.map((ctx: Record<string, unknown>) => ({
          domain: String(ctx.domain || 'General'),
          exampleSentence: String(ctx.exampleSentence || ctx.sentence || ''),
          sentenceMeaning: String(ctx.sentenceMeaning || ctx.meaning || ''),
        }))
      : [],
    commonPitfalls: String(data.commonPitfalls || data.notes || ''),
  };
}

/**
 * Trích xuất cấu trúc WordData từ văn bản tự do của AI
 * Ví dụ: Chatbot trả về "Indomitable là tính từ mang nghĩa là bất khuất... Ví dụ sử dụng: - An indomitable spirit (Một tinh thần bất khuất)..."
 */
export function parseNaturalLanguageResponse(raw: string, fallbackWord?: string): WordData {
  const text = raw.trim();
  const lowerText = text.toLowerCase();

  // 1. Trích xuất từ vựng (Word)
  let word = (fallbackWord || '').trim();
  if (!word) {
    // Thử trích xuất từ **word**
    const boldMatch = text.match(/\*\*([A-Za-z\s\-']+)\*\*/);
    if (boldMatch) {
      word = boldMatch[1].trim();
    } else {
      // Thử "word là..."
      const leadingMatch = text.match(/^([A-Za-z\s\-']+?)\s+(?:là|nghĩa là|có nghĩa là|mang nghĩa là)/i);
      if (leadingMatch) {
        word = leadingMatch[1].trim();
      } else {
        const quoteMatch = text.match(/["“]([A-Za-z\s\-']+)["”]/);
        if (quoteMatch) {
          word = quoteMatch[1].trim();
        }
      }
    }
  }

  // 2. Trích xuất phiên âm IPA (VD: /.../ hoặc [...])
  let ipa = '';
  const ipaMatch = text.match(/(?:\/|\[)([\u0250-\u02AFa-zA-Zˈˌːˑ. -]+)(?:\/|\])/);
  if (ipaMatch) {
    ipa = `/${ipaMatch[1].trim()}/`;
  }

  // 3. Trích xuất Loại từ (Part of Speech)
  const partOfSpeech = normalizePartOfSpeech(lowerText);

  // 4. Trích xuất Nghĩa tiếng Việt
  let vietnameseMeaning = '';
  const meaningRegexes = [
    /(?:mang nghĩa là|nghĩa là|có nghĩa là|được hiểu là)\s*[:]?\s*([^.\n]+)/i,
    /(?:nghĩa tiếng việt|định nghĩa|ý nghĩa)[:\s]+([^.\n]+)/i,
  ];
  for (const regex of meaningRegexes) {
    const match = text.match(regex);
    if (match) {
      vietnameseMeaning = match[1].replace(/\*\*/g, '').trim();
      break;
    }
  }

  // 5. Trích xuất Từ đồng nghĩa & Cụm từ đi kèm (Collocations / Synonyms)
  const collocations: string[] = [];
  const synMatch = text.match(
    /(?:từ đồng nghĩa|đồng nghĩa|synonyms?|collocations?|cụm từ đi kèm|cụm từ liên quan)[:\s]+([^\n]+)/i
  );
  if (synMatch) {
    const items = synMatch[1].split(/[,;]/);
    for (const item of items) {
      const cleaned = item.replace(/\*\*/g, '').replace(/^[-*•o]\s*/, '').trim();
      if (cleaned) collocations.push(cleaned);
    }
  }

  // 6. Trích xuất Câu ví dụ & Dịch nghĩa (Contexts)
  const contexts: { domain: string; exampleSentence: string; sentenceMeaning: string }[] = [];
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
  let inExampleSection = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/^(?:ví dụ|ví dụ sử dụng|examples?|câu ví dụ)/i.test(line)) {
      inExampleSection = true;
      continue;
    }

    // Mẫu 1: Câu tiếng Anh (Bản dịch tiếng Việt)
    // VD: "o  An indomitable spirit (Một tinh thần bất khuất)."
    // VD: "The team showed indomitable courage in the final match. (Đội bóng đã thể hiện...)"
    const exampleWithParens = line.match(/^[-*•o\d.\s]*([A-Za-z0-9\s,'".!?;:\-–—]+?)\s*[\(（](.+?)[\)）]\.?$/);
    if (exampleWithParens) {
      let eng = exampleWithParens[1].trim();
      if (eng.endsWith('.')) eng = eng.slice(0, -1).trim();
      const vie = exampleWithParens[2].trim();

      if (eng.split(/\s+/).length >= 2 || (word && eng.toLowerCase().includes(word.toLowerCase()))) {
        contexts.push({
          domain: 'General',
          exampleSentence: eng,
          sentenceMeaning: vie,
        });
        continue;
      }
    }

    // Mẫu 2: Câu tiếng Anh: Bản dịch tiếng Việt hoặc Dấu gạch ngang
    if (inExampleSection) {
      const exampleWithSep = line.match(/^[-*•o\d.\s]*([A-Za-z0-9\s,'".!?;:\-–—]+?)\s*[:\-–—]\s*(.+)$/);
      if (exampleWithSep) {
        const eng = exampleWithSep[1].trim();
        const vie = exampleWithSep[2].trim();
        if (eng.split(/\s+/).length >= 2) {
          contexts.push({
            domain: 'General',
            exampleSentence: eng,
            sentenceMeaning: vie,
          });
          continue;
        }
      }
    }
  }

  // Nếu chưa tìm thấy nghĩa nhưng có câu ví dụ, lấy nghĩa từ ví dụ đầu tiên
  if (!vietnameseMeaning && contexts.length > 0) {
    vietnameseMeaning = contexts[0].sentenceMeaning;
  }
  if (!vietnameseMeaning) {
    const firstLine = lines[0] || '';
    vietnameseMeaning = firstLine.replace(/\*\*/g, '').trim();
  }

  // 7. Lưu ý / Ngữ cảnh sử dụng (Common Pitfalls)
  let commonPitfalls = '';
  const noteMatch = text.match(/(?:lưu ý|chú ý|cách dùng|lỗi thường gặp|ngữ cảnh)[:\s]+([^\n]+)/i);
  if (noteMatch) {
    commonPitfalls = noteMatch[1].trim();
  } else {
    const usageMatch = text.match(/((?:Từ này|Từ vựng này|Nó)\s+thường\s+được\s+dùng[^.\n]+\.?)/i);
    if (usageMatch) {
      commonPitfalls = usageMatch[1].trim();
    }
  }

  // 8. Ước lượng CEFR
  let cefrLevel = 'B2';
  const cefrMatch = text.match(/\b(A1|A2|B1|B2|C1|C2)\b/i);
  if (cefrMatch) {
    cefrLevel = cefrMatch[1].toUpperCase();
  } else if ((word || '').length > 8) {
    cefrLevel = 'C1';
  }

  return {
    word: word || fallbackWord || 'New Word',
    ipa: ipa || '',
    partOfSpeech,
    vietnameseMeaning: vietnameseMeaning || 'Nghĩa từ vựng',
    cefrLevel,
    register: 'Neutral',
    collocations,
    contexts,
    commonPitfalls: commonPitfalls || 'Chú ý ngữ cảnh sử dụng phù hợp.',
  };
}

function normalizePartOfSpeech(text: string): string {
  const lower = text.toLowerCase();
  if (lower.includes('tính từ') || lower.includes('adjective') || lower.includes('adj')) return 'adjective';
  if (lower.includes('danh từ') || lower.includes('noun') || lower.includes('n.')) return 'noun';
  if (lower.includes('động từ') || lower.includes('verb') || lower.includes('v.')) return 'verb';
  if (lower.includes('trạng từ') || lower.includes('phó từ') || lower.includes('adverb') || lower.includes('adv')) return 'adverb';
  if (lower.includes('thành ngữ') || lower.includes('idiom')) return 'idiom';
  if (lower.includes('cụm từ') || lower.includes('phrase')) return 'phrase';
  if (lower.includes('giới từ') || lower.includes('preposition')) return 'preposition';
  if (lower.includes('liên từ') || lower.includes('conjunction')) return 'conjunction';
  return 'adjective';
}

function normalizeCEFR(level: string): string {
  const upper = level.toUpperCase().trim();
  const valid = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'B2/C1'];
  return valid.includes(upper) ? upper : 'B1';
}
