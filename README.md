# 📚 Smart Linguistic Lexicon Notebook (AI-Powered)

Ứng dụng sổ tay từ vựng tiếng Anh thông minh tích hợp trí tuệ nhân tạo (Gemini, ChatGPT, Claude) và tiện ích mở rộng trình duyệt (Brave / Chrome) giúp tra cứu từ vựng tức thì khi đọc báo, tài liệu.

---

## ✨ Tính năng nổi bật

- 🤖 **Phân tích từ vựng chuyên sâu bằng AI**: Tự động giải nghĩa tiếng Việt, phiên âm IPA, định cấp độ CEFR (A1 - C2), phân loại từ, ví dụ ngữ cảnh song ngữ, cụm từ liên quan (collocations, idioms) và từ đồng nghĩa/trái nghĩa.
- 🧩 **Tiện ích mở rộng trình duyệt (Brave / Chrome Extension)**: Bôi đen từ trên bất kỳ trang web nào $\rightarrow$ Click chuột phải hoặc nhấn `Alt + Q` hoặc bấm nút nổi `✨ Tra AI` để mở ngay cửa sổ tra từ AI popup.
- 🔄 **Đa dạng chế độ AI**:
  - **Chế độ API Tự động**: Hỗ trợ Google Gemini API, OpenAI (GPT-4o), Anthropic (Claude 3.5 Sonnet).
  - **Chế độ Web Chat Miễn phí**: Tự động tạo prompt chuẩn hóa, copy vào clipboard và điều hướng sang giao diện web chat của ChatGPT, Claude, Gemini không tốn phí API.
- 🧠 **Ôn tập thông minh (Spaced Repetition)**: Thuật toán lặp lại ngắt quãng (SM-2 Algorithm) giúp tối ưu hóa khả năng ghi nhớ dài hạn theo chu kỳ thời gian.
- 🔊 **Phát âm chuẩn IPA**: Hỗ trợ Text-to-Speech phát âm giọng Anh - Anh (UK) và Anh - Mỹ (US).
- 💾 **Lưu trữ Offline an toàn**: Toàn bộ dữ liệu từ vựng được lưu trữ an toàn ngay trên trình duyệt thông qua **IndexedDB**, không lo thất thoát dữ liệu.

---

## 🚀 Khởi chạy dự án

### 1. Cài đặt và chạy ứng dụng Web

```bash
# Cài đặt các gói phụ thuộc
npm install

# Khởi chạy máy chủ phát triển
npm run dev
```

Mở trình duyệt và truy cập: **[http://localhost:3000](http://localhost:3000)**

---

## 🧩 Cài đặt Tiện ích mở rộng (Brave & Chrome Extension)

Tiện ích mở rộng nằm trong thư mục `extension/`. Bạn có thể cài đặt dễ dàng chỉ trong 15 giây:

1. Mở trình duyệt:
   - **Brave**: Vào `brave://extensions`
   - **Google Chrome**: Vào `chrome://extensions`
2. Bật **"Chế độ dành cho nhà phát triển" (Developer mode)** ở góc trên bên phải.
3. Nhấp vào **"Tải tiện ích đã giải nén" (Load unpacked)** ở góc trên bên trái.
4. Chọn thư mục `extension` trong mã nguồn dự án:
   ```
   d:\NoteBook_English\NoteBook_English_AI\extension
   ```
5. **Cách dùng**: Bôi đen bất kỳ từ tiếng Anh nào trên web:
   - Click chuột phải $\rightarrow$ Chọn **"🔍 Tra từ điển AI"**
   - Hoặc nhấn phím tắt **`Alt + Q`**
   - Hoặc bấm vào nút nổi **`✨ Tra AI`** xuất hiện cạnh con trỏ chuột.

---

## 📁 Cấu trúc thư mục dự án

```text
NoteBook_English_AI/
├── extension/             # Tiện ích mở rộng Manifest V3 (Brave / Chrome)
│   ├── manifest.json      # Khai báo quyền, phím tắt Alt+Q, contextMenus
│   ├── background.js      # Service worker mở cửa sổ popup tra từ
│   ├── content.js         # Nút nổi tra nhanh khi bôi đen từ vựng
│   ├── content.css        # Giao diện nút nổi Tra AI
│   └── icons/             # Icon tiện ích (16px, 48px, 128px)
├── src/
│   ├── app/               # Next.js App Router (Dashboard, Vocabulary, Lookup, Review, Settings)
│   ├── components/        # UI components (WordCard, AILookupPanel, Header, Sidebar, Toast...)
│   ├── hooks/             # Custom React hooks (useVocabulary, useAI, usePronunciation, useTheme...)
│   └── lib/               # IndexedDB storage, AI Prompt builder, API routers & parsers
└── scripts/               # Các kịch bản tiện ích và hỗ trợ tự động
```

---

## 🛠️ Công nghệ sử dụng

- **Frontend**: Next.js 16 (Turbopack, App Router), React 19, TypeScript
- **Styling**: Vanilla CSS Modules & CSS Custom Properties Design System
- **Icons**: Lucide React
- **Storage**: IndexedDB (thư viện `idb`), LocalStorage
- **AI Integrations**: Google Generative AI SDK, OpenAI API, Anthropic Claude API
- **Browser Extension**: Manifest V3 (Chrome & Brave compatible)

---

## 📖 Tài liệu kỹ thuật & Nhật ký phát triển

Dành cho nhà phát triển và các trợ lý AI (AI Coding Assistants):

- 🏛️ **[ARCHITECTURE.md](ARCHITECTURE.md)**: Kiến trúc phần mềm, cấu trúc thư mục, Tech Stack & Lược đồ dữ liệu TypeScript.
- 🔄 **[WORKFLOW.md](WORKFLOW.md)**: 5 Luồng nghiệp vụ từ tra từ, phân tích AI, tiện ích Extension đến chu kỳ ôn tập ngắt quãng (SRS).
- 📋 **[BUG.md](BUG.md)**: Tổng hợp các lỗi đã phát sinh từ lúc khởi tạo dự án đến nay.
- 🛠️ **[BUGDONE.md](BUGDONE.md)**: Nhật ký giải quyết lỗi chi tiết (ngày giờ, nguyên nhân, cách sửa chuẩn & bài học kinh nghiệm).

