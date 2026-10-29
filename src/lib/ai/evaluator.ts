import { GoogleGenerativeAI } from '@google/generative-ai';
import type {
  WordData,
  PronunciationResult,
  SentenceEvaluationResult,
  MeaningEvaluationResult,
} from '../types';

/**
 * Tính khoảng cách Levenshtein giữa 2 chuỗi
 */
function levenshteinDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }

  return dp[m][n];
}

/**
 * Làm sạch chuỗi từ dấu câu, chuyển về chữ thường
 */
function cleanText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"'’]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * 🎙️ 1. Chấm điểm phát âm dựa trên Speech Recognition
 */
export function evaluatePronunciation(
  spokenText: string,
  targetWord: string,
  ipa?: string
): PronunciationResult {
  const cleanSpoken = cleanText(spokenText);
  const cleanTarget = cleanText(targetWord);

  if (!cleanSpoken) {
    return {
      score: 0,
      spokenText: '',
      expectedText: targetWord,
      verdict: 'poor',
      feedback: 'Chưa phát hiện thấy giọng nói. Hãy nhấn giữ micro và phát âm lại rõ ràng nhé!',
      tip: ipa ? `Phiên âm IPA chuẩn: ${ipa}` : undefined,
    };
  }

  // Khớp chính xác
  if (cleanSpoken === cleanTarget) {
    return {
      score: 100,
      spokenText: cleanSpoken,
      expectedText: cleanTarget,
      verdict: 'perfect',
      feedback: '🎉 Xuất sắc! Bạn phát âm chuẩn xác 100%, ngữ điệu rất rõ ràng và tự nhiên.',
      tip: ipa ? `Chuẩn âm IPA: ${ipa}` : undefined,
    };
  }

  // Nếu câu nói chứa từ mục tiêu
  const spokenWords = cleanSpoken.split(' ');
  const targetWords = cleanTarget.split(' ');

  let bestMatchScore = 0;

  if (targetWords.length === 1) {
    // Tìm từ tương đồng nhất trong các từ nói được
    for (const word of spokenWords) {
      const distance = levenshteinDistance(word, cleanTarget);
      const maxLen = Math.max(word.length, cleanTarget.length);
      const similarity = Math.max(0, Math.round(((maxLen - distance) / maxLen) * 100));
      if (similarity > bestMatchScore) {
        bestMatchScore = similarity;
      }
    }
  } else {
    // So sánh cụm từ
    const distance = levenshteinDistance(cleanSpoken, cleanTarget);
    const maxLen = Math.max(cleanSpoken.length, cleanTarget.length);
    bestMatchScore = Math.max(0, Math.round(((maxLen - distance) / maxLen) * 100));
  }

  // Phân loại kết quả
  if (bestMatchScore >= 85) {
    return {
      score: bestMatchScore,
      spokenText: cleanSpoken,
      expectedText: cleanTarget,
      verdict: 'good',
      feedback: `✨ Rất tốt! Bạn phát âm rất sát (đạt ${bestMatchScore}%). Người bản xứ hoàn toàn hiểu được.`,
      tip: ipa ? `Mẹo: Chú ý thêm trọng âm và âm đuôi theo IPA: ${ipa}` : undefined,
    };
  } else if (bestMatchScore >= 60) {
    return {
      score: bestMatchScore,
      spokenText: cleanSpoken,
      expectedText: cleanTarget,
      verdict: 'fair',
      feedback: `👍 Khá ổn (${bestMatchScore}%). Hệ thống nghe thấy bạn đọc là "${cleanSpoken}". Hãy nghe lại âm thanh mẫu để chỉnh lại nhé!`,
      tip: ipa ? `Phiên âm IPA: ${ipa}` : undefined,
    };
  } else {
    return {
      score: Math.max(25, bestMatchScore),
      spokenText: cleanSpoken,
      expectedText: cleanTarget,
      verdict: 'poor',
      feedback: `⚠️ Chưa chính xác. Máy nghe thành "${cleanSpoken}", từ chuẩn là "${targetWord}". Hãy bấm nút "Nghe phát âm" để nghe mẫu rồi thử lại.`,
      tip: ipa ? `Phiên âm IPA: ${ipa}` : undefined,
    };
  }
}

/**
 * ✍️ 2. Chấm điểm câu học viên tự đặt (Sentence Making)
 */
export async function evaluateSentence(
  sentence: string,
  targetWord: WordData,
  apiKey?: string
): Promise<SentenceEvaluationResult> {
  const cleanSent = sentence.trim();
  if (!cleanSent) {
    return {
      score: 0,
      isGrammaticallyCorrect: false,
      wordUsageScore: 0,
      feedback: 'Bạn chưa nhập câu nào. Hãy thử viết một câu chứa từ vựng nhé!',
    };
  }

  // Nếu có API Key từ Gemini, thử gọi AI phân tích chuyên sâu
  if (apiKey && apiKey.trim()) {
    try {
      const genAI = new GoogleGenerativeAI(apiKey.trim());
      // Ưu tiên dòng Flash thế hệ 3 chuẩn theo quy định hệ thống
      const model = genAI.getGenerativeModel({ model: 'gemini-3.8-flash' });

      const prompt = `Bạn là một trợ lý giáo viên tiếng Anh AI chấm điểm bài tập đặt câu.
Từ mục tiêu: "${targetWord.word}"
Từ loại: ${targetWord.partOfSpeech}
Nghĩa tiếng Việt: ${targetWord.vietnameseMeaning}

Câu của học viên: "${cleanSent}"

Hãy đánh giá và trả về DUY NHẤT một mã JSON thuần không có markdown, không có \`\`\`json:
{
  "score": 85,
  "isGrammaticallyCorrect": true,
  "wordUsageScore": 90,
  "feedback": "Nhận xét chi tiết bằng tiếng Việt: khen điểm tốt, chỉ ra lỗi ngữ pháp, thì, giới từ hoặc ngữ cảnh nếu có.",
  "betterSentence": "Gợi ý câu viết tự nhiên hơn (nếu câu của học viên chưa mượt mà)",
  "translation": "Bản dịch nghĩa tiếng Việt của câu học viên viết"
}`;

      const res = await model.generateContent(prompt);
      const text = res.response.text();
      const cleanedJson = text.replace(/```json\n?|```/g, '').trim();
      const parsed = JSON.parse(cleanedJson);

      return {
        score: typeof parsed.score === 'number' ? parsed.score : 80,
        isGrammaticallyCorrect: !!parsed.isGrammaticallyCorrect,
        wordUsageScore: typeof parsed.wordUsageScore === 'number' ? parsed.wordUsageScore : 80,
        feedback: parsed.feedback || 'Câu viết rất tốt!',
        betterSentence: parsed.betterSentence || undefined,
        translation: parsed.translation || undefined,
      };
    } catch (e) {
      console.warn('Lỗi gọi AI chấm câu, chuyển sang bộ chấm điểm cục bộ:', e);
      // Fallback sang chấm cục bộ ngay bên dưới
    }
  }

  // Bộ chấm điểm thông minh cục bộ (Offline / Rule-based Heuristic)
  return evaluateSentenceLocally(cleanSent, targetWord);
}

/**
 * Đánh giá câu cục bộ không cần mạng / API
 */
export function evaluateSentenceLocally(
  sentence: string,
  targetWord: WordData
): SentenceEvaluationResult {
  const lowerSent = sentence.toLowerCase();
  const lowerWord = targetWord.word.toLowerCase();

  // Kiểm tra sự xuất hiện của từ hoặc các biến thể (stemming / family)
  const stems = [lowerWord];
  if (targetWord.wordFamily) {
    targetWord.wordFamily.forEach((f) => stems.push(f.word.toLowerCase()));
  }

  // Tạo các biến thể cơ bản (-s, -ed, -ing, -es)
  if (lowerWord.endsWith('e')) {
    stems.push(lowerWord + 'd', lowerWord.slice(0, -1) + 'ing');
  } else {
    stems.push(lowerWord + 's', lowerWord + 'es', lowerWord + 'ed', lowerWord + 'ing');
  }

  const hasWord = stems.some((s) => {
    const regex = new RegExp(`\\b${s}\\b`, 'i');
    return regex.test(lowerSent);
  });

  const words = sentence.trim().split(/\s+/);
  const wordCount = words.length;

  const startsWithCapital = /^[A-Z"']/.test(sentence.trim());
  const endsWithPunctuation = /[.!?]"?$/.test(sentence.trim());

  let score = 50;
  const feedbackParts: string[] = [];

  if (!hasWord) {
    return {
      score: 35,
      isGrammaticallyCorrect: startsWithCapital && endsWithPunctuation,
      wordUsageScore: 20,
      feedback: `⚠️ Câu chưa chứa từ "${targetWord.word}" (hoặc các dạng biến thể của từ). Bạn hãy thêm từ này vào câu nhé!`,
      betterSentence: targetWord.contexts[0]?.exampleSentence || undefined,
      translation: targetWord.contexts[0]?.sentenceMeaning || undefined,
    };
  }

  score += 25; // Có từ mục tiêu
  let wordUsageScore = 80;

  if (wordCount < 4) {
    feedbackParts.push('Câu hơi ngắn. Bạn có thể mở rộng thêm tân ngữ hoặc trạng từ để câu phong phú hơn.');
    score -= 10;
  } else if (wordCount >= 6) {
    score += 10;
    feedbackParts.push('Độ dài câu rất tốt, cấu trúc đầy đủ.');
  }

  if (startsWithCapital && endsWithPunctuation) {
    score += 10;
  } else {
    feedbackParts.push('Lưu ý viết hoa chữ cái đầu câu và có dấu chấm câu ở cuối nhé.');
    score -= 5;
  }

  // Kiểm tra xem có chứa collocation nào không
  const matchedCollocation = targetWord.collocations.find((c) =>
    lowerSent.includes(c.toLowerCase())
  );
  if (matchedCollocation) {
    score += 10;
    wordUsageScore = 95;
    feedbackParts.push(`Xuất sắc! Bạn đã sử dụng cụm từ collocations rất chuẩn: "${matchedCollocation}".`);
  }

  const finalScore = Math.min(100, Math.max(40, score));

  return {
    score: finalScore,
    isGrammaticallyCorrect: startsWithCapital && endsWithPunctuation && wordCount >= 3,
    wordUsageScore: wordUsageScore,
    feedback: feedbackParts.join(' ') || 'Câu đặt rất tốt và đúng ngữ cảnh!',
    betterSentence: targetWord.contexts[0]?.exampleSentence || undefined,
    translation: targetWord.contexts[0]?.sentenceMeaning || undefined,
  };
}

/**
 * 💡 3. Chấm điểm nhớ nghĩa (Meaning Recall)
 */
export async function evaluateMeaning(
  userMeaning: string,
  targetWord: WordData,
  apiKey?: string
): Promise<MeaningEvaluationResult> {
  const cleanInput = userMeaning.trim().toLowerCase();
  if (!cleanInput) {
    return {
      score: 0,
      isCorrect: false,
      userMeaning: '',
      officialMeaning: targetWord.vietnameseMeaning,
      feedback: 'Bạn chưa nhập nghĩa. Hãy thử gõ nghĩa tiếng Việt hoặc tiếng Anh của từ nhé!',
    };
  }

  // Nếu có API Key, dùng Gemini để đánh giá ngữ nghĩa tinh tế
  if (apiKey && apiKey.trim()) {
    try {
      const genAI = new GoogleGenerativeAI(apiKey.trim());
      const model = genAI.getGenerativeModel({ model: 'gemini-3.8-flash' });

      const prompt = `Bạn là trợ lý đánh giá kiến thức từ vựng tiếng Anh.
Từ: "${targetWord.word}"
Nghĩa chuẩn tiếng Việt: "${targetWord.vietnameseMeaning}"
Các từ đồng nghĩa: ${targetWord.synonyms?.join(', ') || 'không có'}

Học viên trả lời nghĩa là: "${cleanInput}"

Hãy đánh giá xem học viên có hiểu đúng nghĩa của từ này không (chấp nhận cả tiếng Việt lẫn tiếng Anh).
Trả về DUY NHẤT một JSON hợp lệ:
{
  "score": 90, // thang điểm 100
  "isCorrect": true,
  "feedback": "Nhận xét ngắn gọn tiếng Việt (1-2 câu): khen nếu đúng, bổ sung nếu thiếu sắc thái nghĩa."
}`;

      const res = await model.generateContent(prompt);
      const text = res.response.text();
      const cleanedJson = text.replace(/```json\n?|```/g, '').trim();
      const parsed = JSON.parse(cleanedJson);

      return {
        score: typeof parsed.score === 'number' ? parsed.score : 85,
        isCorrect: !!parsed.isCorrect,
        userMeaning: cleanInput,
        officialMeaning: targetWord.vietnameseMeaning,
        feedback: parsed.feedback || 'Bạn đã nhớ đúng nghĩa!',
        additionalNuances: targetWord.contexts.map((c) => `${c.domain}: ${c.sentenceMeaning}`),
      };
    } catch (e) {
      console.warn('Lỗi gọi AI kiểm tra nghĩa, fallback sang chấm cục bộ:', e);
    }
  }

  // Bộ so khớp ngữ nghĩa cục bộ
  const targetMeaning = targetWord.vietnameseMeaning.toLowerCase();
  const inputWords = cleanInput.split(/[,;\s/]+/).filter((w) => w.length > 1);

  // Đếm từ khóa trùng khớp trong nghĩa tiếng Việt
  let matchCount = 0;
  for (const w of inputWords) {
    if (targetMeaning.includes(w)) {
      matchCount++;
    }
  }

  // Kiểm tra xem có trùng với từ đồng nghĩa tiếng Anh (Synonyms) không
  const isEnglishSynonymMatch = targetWord.synonyms?.some((s) =>
    s.toLowerCase().includes(cleanInput) || cleanInput.includes(s.toLowerCase())
  );

  let score = 30;
  let isCorrect = false;
  let feedback = '';

  if (targetMeaning.includes(cleanInput) || cleanInput.includes(targetMeaning)) {
    score = 100;
    isCorrect = true;
    feedback = '🎉 Xuất sắc! Bạn nhớ chuẩn xác nghĩa chính của từ này.';
  } else if (isEnglishSynonymMatch) {
    score = 95;
    isCorrect = true;
    feedback = '✨ Rất giỏi! Bạn nhớ chính xác từ đồng nghĩa tiếng Anh của từ này.';
  } else if (matchCount >= 2 || (inputWords.length === 1 && matchCount === 1)) {
    score = 80;
    isCorrect = true;
    feedback = '👍 Đúng trọng tâm! Bạn đã hiểu đúng nghĩa cốt lõi của từ.';
  } else if (matchCount === 1) {
    score = 60;
    isCorrect = true;
    feedback = 'Khá sát! Bạn nhớ được một phần nghĩa, hãy tham khảo thêm nghĩa chi tiết bên dưới.';
  } else {
    score = 30;
    isCorrect = false;
    feedback = 'Chưa hoàn toàn chuẩn xác. Bạn hãy đối chiếu với nghĩa chuẩn và ví dụ bên dưới nhé!';
  }

  return {
    score,
    isCorrect,
    userMeaning: cleanInput,
    officialMeaning: targetWord.vietnameseMeaning,
    feedback,
    additionalNuances: targetWord.contexts.map((c) => `${c.domain}: ${c.sentenceMeaning}`),
  };
}
