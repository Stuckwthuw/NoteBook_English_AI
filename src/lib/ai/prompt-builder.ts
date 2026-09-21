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
  "vietnameseMeaning": "nghĩa tiếng Việt chi tiết, có giải thích ngữ cảnh",
  "cefrLevel": "A1/A2/B1/B2/C1/C2",
  "register": "Formal/Informal/Academic/Neutral/...",
  "collocations": ["cụm từ thường đi kèm 1", "cụm từ 2", "cụm từ 3"],
  "contexts": [
    {
      "domain": "Lĩnh vực 1 (ví dụ: Academic Writing, Business, Daily Life...)",
      "exampleSentence": "Câu ví dụ tự nhiên bằng tiếng Anh",
      "sentenceMeaning": "Nghĩa tiếng Việt của câu ví dụ"
    },
    {
      "domain": "Lĩnh vực 2",
      "exampleSentence": "Câu ví dụ khác",
      "sentenceMeaning": "Nghĩa tiếng Việt"
    }
  ],
  "commonPitfalls": "Lỗi thường gặp khi sử dụng từ này, mẹo tránh nhầm lẫn (viết bằng tiếng Việt)"
}

QUY TẮC QUAN TRỌNG:
1. Chỉ trả về JSON thuần, KHÔNG có markdown, KHÔNG có \`\`\`json, KHÔNG có text giải thích
2. vietnameseMeaning phải chi tiết, dễ hiểu cho học sinh Việt Nam
3. Tối thiểu 2 contexts với domain khác nhau
4. Tối thiểu 3 collocations
5. commonPitfalls viết bằng tiếng Việt, thực tế và hữu ích`;
}

export function buildPromptForCopy(word: string): string {
  return `Hãy phân tích từ vựng tiếng Anh "${word}" và trả về dưới dạng JSON theo format sau (CHỈ trả về JSON, không có text khác):

{
  "word": "${word}",
  "ipa": "phiên âm IPA",
  "partOfSpeech": "loại từ",
  "vietnameseMeaning": "nghĩa tiếng Việt chi tiết",
  "cefrLevel": "level CEFR (A1-C2)",
  "register": "Formal/Informal/Academic/Neutral",
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
