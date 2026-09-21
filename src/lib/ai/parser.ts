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
    const boldMatch = text.match(/\*\*([A-Za-z\s\-']+)\*\*/);
    if (boldMatch) {
      word = boldMatch[1].trim();
    } else {
      const leadingMatch = text.match(/^([A-Za-z\s\-']+?)\s+(?:là|nghĩa là|có nghĩa là|mang nghĩa|được hiểu là)/i);
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

  // 4. Phân tích các dòng văn bản để bóc tách ngữ cảnh nhiều tầng (Contexts) & Cụm từ (Collocations)
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
  const contextSections: {
    domain: string;
    subMeaning: string;
    description: string;
    exampleSentence: string;
    sentenceMeaning: string;
  }[] = [];

  let currentSection: {
    domain: string;
    subMeaning: string;
    description: string;
    exampleSentence: string;
    sentenceMeaning: string;
  } | null = null;

  const collocations: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Phát hiện tiêu đề mục ngữ cảnh dạng số:
    // VD: "1. Trong Kinh doanh và Pháp lý: Pháp nhân, tổ chức"
    // VD: "1. Công nghệ thông tin: Thực thể dữ liệu"
    const headerMatch = line.match(/^(\d+)[\.\)]\s*(?:(?:Trong|Về|Lĩnh vực)\s+)?([^:\-–—]+)[:\-–—]\s*(.+)$/i);
    if (headerMatch) {
      if (currentSection) {
        contextSections.push(currentSection);
      }
      currentSection = {
        domain: headerMatch[2].replace(/\*\*/g, '').trim(),
        subMeaning: headerMatch[3].replace(/\*\*/g, '').trim(),
        description: '',
        exampleSentence: '',
        sentenceMeaning: '',
      };
      continue;
    }

    // Phát hiện câu ví dụ:
    // VD: "o   Ví dụ: The business operates as a separate legal entity. (Doanh nghiệp hoạt động như một pháp nhân pháp lý độc lập.)"
    // VD: "o   Ví dụ: Trong một ứng dụng quản lý thư viện..."
    const exMatch = line.match(/^[-*•o\s]*(?:Ví dụ|Example|VD)[:\s]*(.*)$/i);
    if (exMatch && exMatch[1]) {
      const exContent = exMatch[1].trim();
      const lastParenMatch = exContent.match(/^(.*?)\s*[\(（]([^()]+)[\)）][.\s]*$/);
      let eng = exContent;
      let vie = currentSection ? currentSection.subMeaning : 'Ví dụ minh họa ngữ cảnh';

      if (lastParenMatch) {
        const p1 = lastParenMatch[1].trim();
        const p2 = lastParenMatch[2].trim();
        const hasVietnamese = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i.test(p1);
        if (!hasVietnamese && p1.length > 5) {
          eng = p1;
          vie = p2;
        }
      }

      if (currentSection) {
        currentSection.exampleSentence = eng;
        currentSection.sentenceMeaning = vie;
      } else {
        contextSections.push({
          domain: 'General',
          subMeaning: vie,
          description: '',
          exampleSentence: eng,
          sentenceMeaning: vie,
        });
      }
      continue;
    }

    // Phát hiện cụm từ thường gặp / liên quan:
    // VD: "o   Cụm từ thường gặp: Legal entity (Pháp nhân), Commercial entity (Tổ chức thương mại)."
    const colloqMatch = line.match(/^[-*•o\s]*(?:Cụm từ thường gặp|Cụm từ liên quan|Cụm từ đi kèm|Collocations?|Synonyms?|Từ đồng nghĩa)[:\s]+(.+)$/i);
    if (colloqMatch) {
      const items = colloqMatch[1].split(/[,;]/);
      for (const item of items) {
        const cleaned = item.replace(/\*\*/g, '').replace(/[.\s]+$/, '').trim();
        if (cleaned && cleaned !== '.') {
          collocations.push(cleaned);
        }
      }
      continue;
    }

    // Câu mô tả chi tiết của ngữ cảnh
    if (currentSection && !line.startsWith('o') && !line.startsWith('-') && !line.startsWith('*')) {
      if (!currentSection.description) {
        currentSection.description = line;
      }
    }
  }

  if (currentSection) {
    contextSections.push(currentSection);
  }

  // 5. Trích xuất Nghĩa cốt lõi & Tổng hợp Nghĩa tiếng Việt
  let coreMeaning = '';
  const coreMeaningRegexes = [
    /(?:mang nghĩa cốt lõi là|nghĩa cốt lõi là|mang nghĩa là|nghĩa là|có nghĩa là|định nghĩa là)\s*[:]?\s*([^.\n]+)/i,
    /(?:nghĩa tiếng việt|định nghĩa|ý nghĩa)[:\s]+([^.\n]+)/i,
  ];

  for (const regex of coreMeaningRegexes) {
    const match = text.match(regex);
    if (match) {
      const candidate = match[1].replace(/\*\*/g, '').trim();
      // Bỏ qua các câu mở đầu chung chung như "cụ thể như sau:", "như sau:"
      if (!/^(?:cụ thể như sau|như sau|sau đây|dưới đây)[:\s]*$/i.test(candidate)) {
        coreMeaning = candidate;
        break;
      }
    }
  }

  let vietnameseMeaning = coreMeaning;
  if (contextSections.length > 0) {
    const contextList = contextSections.map((c, i) => `${i + 1}. ${c.domain}: ${c.subMeaning}`).join('\n');
    if (coreMeaning && !coreMeaning.toLowerCase().includes('cụ thể')) {
      vietnameseMeaning = `${coreMeaning}\n\nCác ngữ cảnh cụ thể:\n${contextList}`;
    } else {
      vietnameseMeaning = contextList;
    }
  }

  if (!vietnameseMeaning) {
    const firstLine = lines[0] || '';
    vietnameseMeaning = firstLine.replace(/\*\*/g, '').trim();
  }

  // 6. Trích xuất Lưu ý / Ngữ cảnh sử dụng (Common Pitfalls)
  let commonPitfalls = '';
  const noteMatch = text.match(/(?:lưu ý|chú ý|cách dùng|lỗi thường gặp|ngữ cảnh)[:\s]+([^\n]+)/i);
  if (noteMatch) {
    commonPitfalls = noteMatch[1].trim();
  } else if (contextSections.length > 1) {
    commonPitfalls = `Từ có ${contextSections.length} ngữ cảnh khác nhau (${contextSections.map(c => c.domain).join(', ')}). Cần chú ý dùng đúng ngữ cảnh.`;
  }

  // 7. Ước lượng CEFR
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
    contexts: contextSections.map((c) => ({
      domain: c.domain,
      exampleSentence: c.exampleSentence || c.description || c.subMeaning,
      sentenceMeaning: c.sentenceMeaning || c.subMeaning,
    })),
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
