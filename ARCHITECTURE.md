# 🏛️ Kiến Trúc Hệ Thống (ARCHITECTURE.md)

Tài liệu này cung cấp cái nhìn tổng quan về kiến trúc công nghệ, mô hình dữ liệu và các module của dự án **Smart Lexicon Notebook (NoteBook_English_AI)** để các AI và kỹ sư nắm bắt nhanh chóng khi bắt đầu phiên làm việc mới.

---

## 1. Công Nghệ Sử Dụng (Tech Stack)

| Thành Phần | Công Nghệ | Phiên Bản | Ghi Chú |
| :--- | :--- | :--- | :--- |
| **Framework** | Next.js (App Router) | 16.3.5 (Turbopack) | Server-Side Rendering kết hợp Client Components |
| **Thư viện UI** | React & React DOM | 19.2.8 | Client-side React hooks & state management |
| **Ngôn ngữ** | TypeScript | 5.x | Strict type safety cho toàn bộ mô hình dữ liệu |
| **Cơ sở dữ liệu** | IndexedDB (`idb`) | 8.0.3 | Lưu trữ toàn bộ từ vựng offline vĩnh viễn trên trình duyệt |
| **Cấu hình & Theme**| `localStorage` | Chuẩn HTML5 | Lưu API keys, Theme sáng/tối, Tùy chọn giọng đọc US/UK |
| **Tích hợp AI** | `@google/generative-ai` | 0.24.1 | Google Gemini API (Dòng 3.x Flash: 3.8, 3.7, 3.6) |
| **Icons & Style** | `lucide-react`, Vanilla CSS | 1.47.0 | Dark mode tinh tế, glassmorphism, responsive đa nền tảng |
| **Extension** | Manifest V3 Chrome/Brave | 1.0.0 | Tiện ích tra nhanh từ vựng khi bôi đen trên web |

---

## 2. Cấu Trúc Thư Mục Dự Án

```text
NoteBook_English_AI/
├── extension/                   # Chrome / Brave Browser Extension (Manifest V3)
│   ├── manifest.json            # Cấu hình quyền và metadata extension
│   ├── popup.html / popup.js    # Giao diện popup tra từ nhanh
│   └── background.js            # Context menu (Chuột phải tra từ)
├── public/                      # Static assets, audio, icons
├── scripts/                     # Shell scripts quản trị hệ thống
│   ├── start-server.bat         # Khởi động server (hiển thị terminal)
│   ├── start-server.vbs         # Khởi động server chạy ngầm không hiện cửa sổ
│   └── setup-windows-startup.bat# Cài đặt tự khởi động cùng Windows
├── src/
│   ├── app/                     # Next.js App Router Pages
│   │   ├── layout.tsx           # Root layout bọc Navbar, Toast, Theme
│   │   ├── page.tsx             # Trang chủ (Dashboard thống kê & gợi ý)
│   │   ├── lookup/page.tsx      # Trang Tra cứu AI chuyên sâu
│   │   ├── vocabulary/page.tsx  # Trang Sổ từ vựng (Lọc, Tìm kiếm, Thẻ từ)
│   │   ├── review/page.tsx      # Trang Ôn tập thông minh (Flashcard SRS)
│   │   └── settings/page.tsx    # Trang Cài đặt (API Keys, Backup JSON, Theme)
│   ├── components/
│   │   ├── ai/                  # Giao diện AI (AILookupPanel, PasteResultModal)
│   │   ├── layout/              # Header, Navbar thanh điều hướng
│   │   ├── ui/                  # Toast notification, Badges, Modals
│   │   └── vocabulary/          # WordCard, WordFamilyList, ContextsList
│   ├── hooks/                   # Custom React Hooks
│   │   ├── useAI.ts             # Hook điều phối phân tích AI và modal dán kết quả
│   │   ├── useTheme.ts          # Hook quản lý theme dark/light
│   │   └── useVocabulary.ts     # Hook CRUD từ vựng và đồng bộ IndexedDB
│   └── lib/
│       ├── ai/                  # AI Engine Modules
│       │   ├── gemini.ts        # Gọi Google Gemini API với auto-discovery & retry
│       │   ├── parser.ts        # Trích xuất linh hoạt từ JSON hoặc văn bản chat
│       │   ├── prompt-builder.ts# Tạo câu lệnh chuẩn ngôn ngữ học (CEFR, Family, POS)
│       │   └── router.ts        # Bộ định tuyến giữa Free Web Chat và API Keys
│       ├── db.ts                # IndexedDB wrapper (CRUD từ vựng, Thống kê, Export/Import)
│       ├── storage.ts           # Wrapper quản lý `localStorage` an toàn SSR
│       └── types.ts             # Định nghĩa toàn bộ TypeScript Interfaces
├── ARCHITECTURE.md              # Tài liệu kiến trúc này
├── BUG.md                       # Danh sách lỗi đã gặp
├── BUGDONE.md                   # Nhật ký sửa lỗi chi tiết
└── README.md                    # Hướng dẫn cài đặt và sử dụng
```

---

## 3. Lược Đồ Dữ Liệu Cốt Lõi (`src/lib/types.ts`)

```typescript
// Thành viên trong gia đình từ (Word Family)
export interface WordFamilyMember {
  word: string;
  partOfSpeech: string;       // noun, verb, adjective, adverb
  meaning: string;            // Nghĩa tiếng Việt của từ phái sinh
}

// Ngữ cảnh & Ví dụ ứng dụng
export interface WordContext {
  domain: string;             // Ví dụ: Academic, Tech, Business, Daily life
  exampleSentence: string;    // Câu ví dụ tiếng Anh chứa từ
  sentenceMeaning: string;    // Bản dịch câu tiếng Việt
}

// Dữ liệu từ vựng nhận từ AI
export interface WordData {
  word: string;
  ipa: string;                // Phiên âm quốc tế IPA (VD: /ɪnˈdɒmɪtəbl/)
  partOfSpeech: string;       // noun, verb, adjective, adverb, phrase
  vietnameseMeaning: string;  // Nghĩa tiếng Việt chính
  cefrLevel: string;          // A1, A2, B1, B2, C1, C2
  register: string;           // Formal, Informal, Technical, Slang
  collocations: string[];     // Các cụm từ hay đi kèm
  contexts: WordContext[];    // Các tầng nghĩa và câu ví dụ theo ngữ cảnh
  commonPitfalls: string;     // Lỗi người Việt hay dùng sai
  wordFamily?: WordFamilyMember[]; // Gia đình từ liên quan
  synonyms?: string[];        // Từ đồng nghĩa
  antonyms?: string[];        // Từ trái nghĩa
}

// Bản ghi từ vựng lưu trong IndexedDB
export interface VocabularyEntry extends WordData {
  id: string;                 // Khóa chính UUID
  createdAt: number;          // Timestamp thời điểm tạo
  updatedAt: number;
  isMastered: boolean;        // Trạng thái đã thuộc lòng
  reviewCount: number;        // Số lần đã ôn tập
  lastReviewedAt: number | null;
  tags?: string[];
}
```

---

## 4. Các Nguyên Tắc Bất Di Bất Dịch (Important Rules for AI)

1. **Tránh Hydration Mismatch:** Không bao giờ gọi `localStorage` trực tiếp trong khối render ban đầu của Client Component. Luôn khởi tạo với giá trị mặc định (`DEFAULT_SETTINGS`), dùng cờ `mounted = false` và cập nhật trong `useEffect`.
2. **AI Fallback & Error Resilience:** Khi gọi Gemini API, luôn sử dụng cơ chế Dynamic Model Discovery từ `src/lib/ai/gemini.ts` và tự động xử lý mã `503 High demand`. Không gọi các model cũ đã bị Google khai tử (`1.5`, `2.5`).
3. **Flexible Parser:** Người dùng có thể dán định dạng JSON chuẩn hoặc văn bản chat tự do từ bất kỳ AI nào (Gemini, ChatGPT, Claude). Hàm `parseAIResponse()` trong `parser.ts` phải luôn phân tích được mà không được phép làm crash ứng dụng.
