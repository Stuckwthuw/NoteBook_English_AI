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

  // Word Family
  const wordFamily = Array.isArray(data.wordFamily)
    ? data.wordFamily
        .filter((item) => item && typeof item === 'object')
        .map((item: Record<string, unknown>) => ({
          word: String(item.word || '').trim(),
          partOfSpeech: String(item.partOfSpeech || item.pos || '').trim(),
          meaning: String(item.meaning || item.vietnameseMeaning || '').trim(),
        }))
        .filter((item) => item.word && item.meaning)
    : [];

  // Synonyms & Antonyms
  const synonyms = Array.isArray(data.synonyms) ? data.synonyms.map(String).filter(Boolean) : [];
  const antonyms = Array.isArray(data.antonyms) ? data.antonyms.map(String).filter(Boolean) : [];

  return {
    word: word || 'New Word',
    ipa: String(data.ipa || ''),
    partOfSpeech: normalizePartOfSpeech(String(data.partOfSpeech || 'noun'), word),
    vietnameseMeaning: vietnameseMeaning || 'Nghĩa từ vựng',
    cefrLevel: normalizeCEFR(String(data.cefrLevel || 'B1')),
    register: String(data.register || 'Neutral'),
    wordFamily: wordFamily.length > 0 ? wordFamily : undefined,
    synonyms: synonyms.length > 0 ? synonyms : undefined,
    antonyms: antonyms.length > 0 ? antonyms : undefined,
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
  const partOfSpeech = normalizePartOfSpeech(lowerText, word);

  // 4. Phân tích các dòng văn bản để bóc tách ngữ cảnh (Contexts), Gia đình từ (Word Family) & Đồng nghĩa (Synonyms)
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
  const wordFamily: { word: string; partOfSpeech: string; meaning: string }[] = [];
  const synonyms: string[] = [];
  const antonyms: string[] = [];
  let inFamilySection = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Phát hiện bắt đầu mục Gia đình từ (Word Family)
    if (/^(?:[-*•o\s]*)(?:gia đình từ|word family|họ từ|các dạng từ|word forms)[:\s]*/i.test(line)) {
      inFamilySection = true;
      continue;
    }

    // Thoát khỏi mục Gia đình từ khi gặp mục khác
    if (/^(?:[-*•o\s]*)(?:từ đồng nghĩa|đồng nghĩa|synonyms?|từ trái nghĩa|trái nghĩa|antonyms?|collocations?|cụm từ|lưu ý|ngữ cảnh)/i.test(line)) {
      inFamilySection = false;
    }

    // Xử lý các dòng trong mục Gia đình từ
    if (inFamilySection) {
      // Dạng 1: - correspond (verb): tương ứng, trao đổi thư từ
      // Dạng 2: • correspondence (noun) - thư từ
      const famMatch = line.match(/^[-*•+o\s]*([A-Za-z\-']+)\s*[\(（]([a-zA-Z\s\.\/]+)[\)）][: \-–—]+\s*(.+)$/i);
      if (famMatch) {
        wordFamily.push({
          word: famMatch[1].trim(),
          partOfSpeech: famMatch[2].trim().toLowerCase(),
          meaning: famMatch[3].trim(),
        });
        continue;
      }

      // Dạng 3: - Verb: correspond (tương ứng)
      const famMatch2 = line.match(/^[-*•+o\s]*([a-zA-Z]+)[: \-–—]+([A-Za-z\-']+)\s*[\(（](.+?)[\)）]$/i);
      if (famMatch2) {
        wordFamily.push({
          word: famMatch2[2].trim(),
          partOfSpeech: famMatch2[1].trim().toLowerCase(),
          meaning: famMatch2[3].trim(),
        });
        continue;
      }
    }

    // Phát hiện Từ đồng nghĩa (Synonyms)
    const synMatch = line.match(/^[-*•+o\s]*(?:từ đồng nghĩa|đồng nghĩa|synonyms?)(?:\s*[\(（][^\)）]+[\)）])?[:\s]+(.+)$/i);
    if (synMatch) {
      const parts = synMatch[1].split(/[,;]/);
      for (const p of parts) {
        const clean = p.replace(/\*\*/g, '').replace(/[.\s]+$/, '').trim();
        if (clean) synonyms.push(clean);
      }
      continue;
    }

    // Phát hiện Từ trái nghĩa (Antonyms)
    const antMatch = line.match(/^[-*•+o\s]*(?:từ trái nghĩa|trái nghĩa|antonyms?)(?:\s*[\(（][^\)）]+[\)）])?[:\s]+(.+)$/i);
    if (antMatch) {
      const parts = antMatch[1].split(/[,;]/);
      for (const p of parts) {
        const clean = p.replace(/\*\*/g, '').replace(/[.\s]+$/, '').trim();
        if (clean) antonyms.push(clean);
      }
      continue;
    }

    // Phát hiện tiêu đề mục ngữ cảnh dạng số:
    // VD: "1. Trong Kinh doanh và Pháp lý: Pháp nhân, tổ chức"
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

    // Phát hiện cụm từ thường gặp / liên quan (Collocations):
    const colloqMatch = line.match(/^[-*•o\s]*(?:Cụm từ thường gặp|Cụm từ liên quan|Cụm từ đi kèm|Collocations?)[:\s]+(.+)$/i);
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
    if (currentSection && !line.startsWith('o') && !line.startsWith('-') && !line.startsWith('*') && !inFamilySection) {
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
    /(?:mang nghĩa cốt lõi là|nghĩa cốt lõi là|mang nghĩa là|nghĩa là|có nghĩa là|định nghĩa là|nghĩa chính[:\s]+)\s*[:]?\s*([^.\n]+)/i,
    /(?:nghĩa tiếng việt|định nghĩa|ý nghĩa)[:\s]+([^.\n]+)/i,
  ];

  for (const regex of coreMeaningRegexes) {
    const match = text.match(regex);
    if (match) {
      const candidate = match[1].replace(/\*\*/g, '').trim();
      // Bỏ qua các câu mở đầu chung chung
      if (!/^(?:cụ thể như sau|như sau|sau đây|dưới đây|chính tùy thuộc vào ngữ cảnh|tùy thuộc vào|tùy vào|phụ thuộc vào)[:\s]*$/i.test(candidate)) {
        coreMeaning = candidate;
        break;
      }
    }
  }

  let vietnameseMeaning = coreMeaning;
  if (contextSections.length > 0) {
    const contextList = contextSections.map((c, i) => `${i + 1}. ${c.domain}: ${c.subMeaning}`).join('\n');
    if (coreMeaning && !coreMeaning.toLowerCase().includes('tùy thuộc') && !coreMeaning.toLowerCase().includes('cụ thể')) {
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
    wordFamily: wordFamily.length > 0 ? wordFamily : undefined,
    synonyms: synonyms.length > 0 ? synonyms : undefined,
    antonyms: antonyms.length > 0 ? antonyms : undefined,
    collocations,
    contexts: contextSections.map((c) => ({
      domain: c.domain,
      exampleSentence: c.exampleSentence || c.description || c.subMeaning,
      sentenceMeaning: c.sentenceMeaning || c.subMeaning,
    })),
    commonPitfalls: commonPitfalls || 'Chú ý ngữ cảnh sử dụng phù hợp.',
  };
}

export function normalizePartOfSpeech(posOrText: string, word = ''): string {
  const str = (posOrText || '').trim().toLowerCase();

  // 1. Kiểm tra trực tiếp các nhãn loại từ chuẩn ngắn gọn
  if (str === 'noun' || str === 'danh từ' || str === 'n' || str === 'n.') return 'noun';
  if (str === 'verb' || str === 'động từ' || str === 'v' || str === 'v.') return 'verb';
  if (str === 'adjective' || str === 'tính từ' || str === 'adj' || str === 'adj.') return 'adjective';
  if (str === 'adverb' || str === 'trạng từ' || str === 'phó từ' || str === 'adv' || str === 'adv.') return 'adverb';
  if (str === 'idiom' || str === 'thành ngữ') return 'idiom';
  if (str === 'phrase' || str === 'cụm từ') return 'phrase';
  if (str === 'preposition' || str === 'giới từ') return 'preposition';
  if (str === 'conjunction' || str === 'liên từ') return 'conjunction';

  // 2. Nếu chuỗi truyền vào là một đoạn văn bản hoặc câu giải thích
  return detectPartOfSpeechFromText(posOrText, word);
}

export function detectPartOfSpeechFromText(text: string, word = ''): string {
  const w = word.toLowerCase().trim();
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
  const firstLines = lines.slice(0, 3).join(' ').toLowerCase();

  // 1. Kiểm tra trường rõ ràng "Loại từ: Danh từ" hoặc "Part of speech: noun"
  const explicitMatch = text.match(/(?:loại từ|từ loại|part of speech)[:\s]+([^\n.,]+)/i);
  if (explicitMatch) {
    const posStr = explicitMatch[1].toLowerCase();
    if (posStr.includes('danh') || posStr.includes('noun') || posStr.includes('n.')) return 'noun';
    if (posStr.includes('động') || posStr.includes('verb') || posStr.includes('v.')) return 'verb';
    if (posStr.includes('tính') || posStr.includes('adj')) return 'adjective';
    if (posStr.includes('trạng') || posStr.includes('adv')) return 'adverb';
  }

  // 2. Kiểm tra câu mở đầu trực tiếp của từ:
  // "Detection là danh từ...", "Correspond là động từ..."
  const directIntroRegex = new RegExp(`^(?:\\*\\*)?${w}(?:\\*\\*)?\\s+là\\s+(?:một\\s+)?(danh từ|động từ|tính từ|trạng từ|noun|verb|adjective|adverb)`, 'i');
  const directMatch = firstLines.match(directIntroRegex);
  if (directMatch) {
    const pos = directMatch[1].toLowerCase();
    if (pos.includes('danh') || pos.includes('noun')) return 'noun';
    if (pos.includes('động') || pos.includes('verb')) return 'verb';
    if (pos.includes('tính') || pos.includes('adj')) return 'adjective';
    if (pos.includes('trạng') || pos.includes('adv')) return 'adverb';
  }

  // Dạng chia động từ: "Corresponds là dạng chia của động từ correspond..."
  const verbConjugationMatch = firstLines.match(/(?:dạng chia|chia ngôi|ngôi thứ|quá khứ|phân từ)\s*(?:của\s+)?(?:động từ|verb)/i);
  if (verbConjugationMatch) {
    return 'verb';
  }

  // 3. Phân tích hình thái hậu tố (Suffix Morphology) - cực kỳ chuẩn xác trong tiếng Anh
  // Danh từ: -tion, -sion, -ment, -ness, -ity, -ance, -ence, -ship, -hood, -dom, -ism, -ist, -ure
  if (/(?:tion|sion|ment|ness|ity|ance|ence|ship|hood|dom|ism|ist|ure|logy|graphy)$/i.test(w)) {
    return 'noun';
  }

  // Tính từ: -able, -ible, -al, -ful, -less, -ous, -ious, -ic, -ive, -ish
  if (/(?:able|ible|ful|less|ous|ious|ic|ive|ish)$/i.test(w)) {
    return 'adjective';
  }

  // Trạng từ: -ly (trừ friendly, lovely, lonely...)
  if (w.endsWith('ly') && w.length > 3 && !['friendly', 'lovely', 'lonely', 'ugly', 'silly', 'lively'].includes(w)) {
    return 'adverb';
  }

  // Động từ: -ize, -ise, -ate, -ify, hoặc dạng chia -ed
  if (/(?:ize|ise|ate|ify|ed)$/i.test(w)) {
    return 'verb';
  }

  // Động từ chia ngôi số ít đuôi -s (khi trong bài có nhắc đến verb/động từ)
  if (w.endsWith('s') && w.length > 4 && (firstLines.includes('động từ') || firstLines.includes('verb'))) {
    return 'verb';
  }

  // 4. Dấu hiệu ngữ nghĩa tiếng Việt ở câu định nghĩa:
  // "sự phát hiện", "việc thực hiện", "khả năng..." -> Danh từ
  if (/^(?:sự|việc|cuộc|niềm|nỗi|khả năng|tính chất)\s+/i.test(firstLines) || text.includes('nghĩa là sự ') || text.includes('là sự ')) {
    return 'noun';
  }

  // Fallback từ câu đầu tiên nếu có nhắc đến từ loại
  if (firstLines.includes('danh từ')) return 'noun';
  if (firstLines.includes('động từ')) return 'verb';
  if (firstLines.includes('tính từ')) return 'adjective';
  if (firstLines.includes('trạng từ')) return 'adverb';

  return 'noun';
}

function normalizeCEFR(level: string): string {
  const upper = level.toUpperCase().trim();
  const valid = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'B2/C1'];
  return valid.includes(upper) ? upper : 'B1';
}


