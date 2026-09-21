/**
 * Smart Prompt Builder
 * Tạo prompt tối ưu để AI trả về JSON theo Linguistic Schema
 */

export function buildVocabularyPrompt(word: string): string {
  return `Bạn là một chuyên gia ngôn ngữ học tiếng Anh. Hãy phân tích từ/cụm từ sau và trả về CHÍNH XÁC dưới dạng JSON (không có markdown, không có code block, chỉ JSON thuần):

Từ cần phân tích: "${word}"

Trả về JSON theo format sau:
{
  "word": "${word}",
  "ipa": "phiên âm IPA chuẩn",
  "partOfSpeech": "noun/verb/adjective/adverb/...",
  "vietnameseMeaning": "nghĩa tiếng Việt chi tiết, giải thích nghĩa chính và các nghĩa theo ngữ cảnh",
  "cefrLevel": "A1/A2/B1/B2/C1/C2",
  "register": "Formal/Informal/Academic/Neutral/...",
  "wordFamily": [
    {
      "word": "từ trong cùng gia đình từ (VD: correspond)",
      "partOfSpeech": "verb",
      "meaning": "nghĩa tiếng Việt"
    },
    {
      "word": "correspondence",
      "partOfSpeech": "noun",
      "meaning": "thư từ; sự tương ứng"
    },
    {
      "word": "corresponding",
      "partOfSpeech": "adjective",
      "meaning": "tương ứng, tương đương"
    }
  ],
  "synonyms": ["từ đồng nghĩa 1", "từ đồng nghĩa 2", "từ đồng nghĩa 3"],
  "antonyms": ["từ trái nghĩa 1", "từ trái nghĩa 2"],
  "collocations": ["cụm từ thường đi kèm 1", "cụm từ 2", "cụm từ 3"],
  "contexts": [
    {
      "domain": "Lĩnh vực (ví dụ: Academic Writing, Business, Daily Life...)",
      "exampleSentence": "Câu ví dụ tự nhiên bằng tiếng Anh",
      "sentenceMeaning": "Nghĩa tiếng Việt của câu ví dụ"
    }
  ],
  "commonPitfalls": "Lỗi thường gặp khi sử dụng từ này, mẹo tránh nhầm lẫn (viết bằng tiếng Việt)"
}

QUY TẮC QUAN TRỌNG:
1. Chỉ trả về JSON thuần, KHÔNG có markdown, KHÔNG có \`\`\`json, KHÔNG có text giải thích ngoài JSON
2. vietnameseMeaning phải chi tiết, dễ hiểu cho người Việt Nam
3. wordFamily: Cung cấp đầy đủ các dạng từ trong cùng họ (noun, verb, adj, adv) kèm loại từ và nghĩa tiếng Việt
4. synonyms: Tối thiểu 3 từ đồng nghĩa phổ biến nhất
5. antonyms: Tối thiểu 1-2 từ trái nghĩa (nếu có)
6. Tối thiểu 2 contexts với domain khác nhau
7. Tối thiểu 3 collocations`;
}

export function buildPromptForCopy(word: string): string {
  return `Hãy phân tích từ vựng tiếng Anh "${word}" và trả về dưới dạng JSON theo format sau (CHỈ trả về JSON, không có text khác):

{
  "word": "${word}",
  "ipa": "phiên âm IPA",
  "partOfSpeech": "loại từ (noun/verb/adj/adv)",
  "vietnameseMeaning": "nghĩa tiếng Việt chi tiết",
  "cefrLevel": "level CEFR (A1-C2)",
  "register": "Formal/Informal/Academic/Neutral",
  "wordFamily": [
    {
      "word": "từ cùng gia đình từ",
      "partOfSpeech": "loại từ (noun/verb/adj/adv)",
      "meaning": "nghĩa tiếng Việt"
    }
  ],
  "synonyms": ["từ đồng nghĩa 1", "từ đồng nghĩa 2", "từ đồng nghĩa 3"],
  "antonyms": ["từ trái nghĩa 1", "từ trái nghĩa 2"],
  "collocations": ["cụm từ đi kèm 1", "cụm từ 2", "cụm từ 3"],
  "contexts": [
    {
      "domain": "Lĩnh vực sử dụng",
      "exampleSentence": "Câu ví dụ tiếng Anh",
      "sentenceMeaning": "Nghĩa tiếng Việt của câu"
    }
  ],
  "commonPitfalls": "Lỗi thường gặp khi dùng từ này (tiếng Việt)"
}`;
}
