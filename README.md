# 📚 Smart Linguistic Lexicon Notebook (AI-Powered)

Sổ tay từ vựng tiếng Anh thông minh ứng dụng AI (Google Gemini, ChatGPT, Claude) kết hợp tiện ích mở rộng trình duyệt (Brave / Chrome Extension) giúp bôi đen và tra cứu từ vựng tức thì khi đọc báo, xem tài liệu, kèm **Trợ lý AI chấm điểm giọng nói, câu văn và kiến thức ôn tập đa giác quan**.

---

## ✨ Tính năng nổi bật

- 🤖 **Phân tích từ vựng chuyên sâu bằng AI**: Tự động giải nghĩa tiếng Việt đa ngữ cảnh, phiên âm IPA, định cấp độ CEFR (A1 - C2), phân loại từ loại, ví dụ song ngữ, collocations, lỗi sai thường gặp và **Gia đình từ (Word Family)**, từ đồng nghĩa/trái nghĩa.
- 🧩 **Tiện ích mở rộng trình duyệt (Brave / Chrome Extension)**: Bôi đen từ trên bất kỳ website nào $\rightarrow$ Click chuột phải hoặc nhấn `Alt + Q` hoặc bấm nút nổi `✨ Tra AI` để tra cứu lập tức.
- 🔄 **Linh hoạt 2 chế độ AI**:
  - **Chế độ API 1-Click (Khuyên dùng)**: Kết nối trực tiếp Google Gemini API (dòng Gemini 3.x Flash siêu tốc, miễn phí 1500 req/ngày).
  - **Chế độ Web Chat Miễn phí**: Tự động sinh câu lệnh chuẩn ngôn ngữ học, tự copy vào Clipboard để bạn dán sang ChatGPT, Claude, Gemini mà không cần API Key.
- 🎯 **Trợ lý Ôn tập Đa giác quan 4 trong 1 (Smart Review Hub)**:
  - 🃏 **Lật thẻ Flashcard (SRS)**: Ôn tập ngắt quãng dựa trên đường cong lãng quên Ebbinghaus & Leitner.
  - 🎙️ **Luyện phát âm & Chấm điểm giọng nói**: Thu âm qua Micro (Web Speech API), so khớp ngữ âm Levenshtein, chấm điểm 0 - 100%, chỉ ra âm lệch và hướng dẫn phát âm chuẩn theo IPA.
  - ✍️ **Đặt câu & Trợ lý sửa lỗi ngữ pháp**: Tự viết câu chứa từ vựng, Trợ lý AI chấm điểm ngữ pháp, thì, độ tự nhiên, gợi ý câu viết bản xứ kèm phát âm mẫu.
  - 💡 **Kiểm tra trí nhớ nghĩa**: Tự gõ nghĩa tiếng Việt hoặc tiếng Anh, hệ thống đối chiếu và chấm điểm độ hiểu từ.
- 🔊 **Phát âm chuẩn IPA**: Hỗ trợ Text-to-Speech phát âm chuẩn giọng Anh - Anh (UK) và Anh - Mỹ (US).
- 💾 **Lưu trữ Offline an toàn**: Dữ liệu lưu vĩnh viễn trên trình duyệt bằng **IndexedDB**, có tính năng Xuất/Nhập file JSON để sao lưu hoặc chuyển đổi thiết bị.

---

## 🔒 Chính Sách Bảo Mật & Phân Định Công Khai (Security & Privacy)

Dự án tuân thủ nghiêm ngặt nguyên tắc **Local-First & Privacy-By-Design**:

### 1. Dữ liệu được CÔNG KHAI (Public Repository)
- Toàn bộ mã nguồn Next.js (App Router), components, hooks và các thuật toán phân tích ngôn ngữ học.
- Tiện ích mở rộng Chrome/Brave Extension (Manifest V3).
- Tài liệu kiến trúc hệ thống ([`ARCHITECTURE.md`](ARCHITECTURE.md)), quy trình hoạt động ([`WORKFLOW.md`](WORKFLOW.md)), nhật ký sửa lỗi ([`BUGDONE.md`](BUGDONE.md)).

### 2. Dữ liệu BẢO MẬT & THUỘC QUYỀN SỞ HỮU CÁ NHÂN (Private & Protected)
- 🔑 **API Keys**: Các khóa API (Gemini, OpenAI, Claude) được lưu trữ hoàn toàn tại `localStorage` trên trình duyệt cá nhân của người dùng. **Tuyệt đối không gửi về bất kỳ máy chủ bên thứ ba nào** và được loại trừ hoàn toàn khỏi mã nguồn Git (`.gitignore`).
- 📓 **Dữ liệu Sổ tay Từ vựng**: Lưu 100% trên `IndexedDB` nội bộ máy tính của bạn, hoạt động hoàn hảo khi không có internet.
- 🎙️ **Giọng nói & Âm thanh**: Quá trình thu âm phát âm được xử lý trực tiếp trên trình duyệt thông qua Web Speech API tiêu chuẩn, không lưu tệp âm thanh ra ngoài.
- 📦 **Tệp sao lưu cá nhân**: Các tệp xuất `lexicon-backup-*.json` được cấu hình tự động bỏ qua trong `.gitignore` để đảm bảo sự riêng tư cho kho từ vựng của bạn.

---

## 🚀 Hướng Dẫn Cài Đặt Dành Cho Máy Tính Mới (3 Bước Nhanh)

### Bước 1: Chuẩn bị môi trường (Nếu máy chưa có)
- Tải và cài đặt **Node.js (Bản LTS khuyên dùng: v20 hoặc v22)** tại: [https://nodejs.org](https://nodejs.org/) (chỉ cần Next $\rightarrow$ Next $\rightarrow$ Install).
- Tải mã nguồn dự án về máy tính:
  ```bash
  git clone https://github.com/Stuckwthuw/NoteBook_English_AI.git
  cd NoteBook_English_AI
  ```

---

### Bước 2: Cài đặt thư viện và Khởi chạy

Mở thư mục dự án vừa tải về, bạn có thể chọn **1 trong 2 cách** sau:

#### Cách A: Chạy nhanh bằng 1-Click (Dành cho người không rành dòng lệnh)
1. Mở thư mục dự án trên máy.
2. Mở cửa sổ dòng lệnh (Terminal / PowerShell / CMD) tại thư mục đó và chạy lệnh cài đặt thư viện một lần duy nhất:
   ```bash
   npm install
   ```
3. Sau đó, bạn chỉ cần **nhấp đúp chuột vào file `start-server.bat`** để khởi chạy máy chủ!
4. Mở trình duyệt truy cập: **[http://localhost:3000](http://localhost:3000)**

> 💡 **Mẹo cực hay - Tự khởi động cùng Windows:**  
> Bạn nhấp đúp vào file `scripts\setup-windows-startup.bat`. Từ nay về sau, **mỗi khi bật máy tính lên là sổ từ điển sẽ tự động chạy ngầm sẵn sàng**, bạn không cần phải mở cửa sổ terminal đen thủ công nữa!

#### Cách B: Khởi chạy bằng Terminal
```bash
# Cài đặt thư viện
npm install

# Khởi chạy chế độ phát triển
npm run dev
```

---

### Bước 3: Cài đặt Tiện ích mở rộng (Brave / Chrome Extension)

Tiện ích mở rộng nằm sẵn trong thư mục `extension/` của dự án:

1. Mở trình duyệt:
   - **Brave**: Truy cập `brave://extensions`
   - **Google Chrome**: Truy cập `chrome://extensions`
2. Bật công tắc **"Chế độ dành cho nhà phát triển" (Developer mode)** ở góc trên bên phải.
3. Bấm vào nút **"Tải tiện ích đã giải nén" (Load unpacked)** ở góc trên bên trái.
4. Điều hướng đến và chọn thư mục `extension` bên trong thư mục đồ án trên máy của bạn (Ví dụ: `C:\...\NoteBook_English_AI\extension`).
5. **Cách sử dụng khi lướt web:** Bôi đen bất kỳ từ tiếng Anh nào trên báo/web:
   - Click chuột phải $\rightarrow$ Chọn **"🔍 Tra từ điển AI"**
   - Hoặc nhấn tổ hợp phím tắt **`Alt + Q`**
   - Hoặc nhấp vào nút nổi **`✨ Tra AI`** xuất hiện ngay cạnh con trỏ chuột!

---

## ⚙️ Cấu hình AI & Chia sẻ dữ liệu từ vựng

### 1. Cấu hình AI (Tại trang Cài đặt `http://localhost:3000/settings`)
- **Cách 1 - Dùng API Key (Khuyên dùng - 1 Click ra kết quả):**
  1. Vào [aistudio.google.com](https://aistudio.google.com/) $\rightarrow$ Đăng nhập tài khoản Google và bấm **"Create API Key"** (Miễn phí 100%).
  2. Vào trang **Cài đặt** của ứng dụng $\rightarrow$ Chọn chế độ `🔑 Free API` $\rightarrow$ Dán API Key Gemini vào ô và lưu lại.
- **Cách 2 - Dùng Web Chat miễn phí (Không cần tạo Key):**
  1. Chọn chế độ `💬 Free Web Chat`.
  2. Khi tra từ, bấm chọn biểu tượng Gemini, ChatGPT hoặc Claude $\rightarrow$ Hệ thống tự mở tab và copy sẵn câu lệnh cho bạn $\rightarrow$ Bạn dán vào chat rồi copy kết quả dán lại vào ứng dụng.

### 2. Chia sẻ kho từ vựng từ máy này sang máy khác
- **Trên máy của bạn:** Vào trang **Cài đặt** $\rightarrow$ Bấm nút **"Xuất dữ liệu"** $\rightarrow$ Trình duyệt tải về file `lexicon-backup-YYYY-MM-DD.json`.
- **Gửi file JSON này cho bạn của bạn.**
- **Trên máy bạn của bạn:** Vào trang **Cài đặt** $\rightarrow$ Bấm nút **"Nhập dữ liệu"** $\rightarrow$ Chọn file `.json` vừa nhận. Toàn bộ từ vựng, phiên âm, gia đình từ và ngữ cảnh sẽ xuất hiện đầy đủ 100%!

---

## 📁 Cấu trúc thư mục dự án

```text
NoteBook_English_AI/
├── extension/                   # Tiện ích mở rộng Manifest V3 (Brave / Chrome)
│   ├── manifest.json            # Khai báo quyền, phím tắt Alt+Q, contextMenus
│   ├── background.js            # Service worker xử lý chuột phải & popup
│   ├── content.js               # Nút nổi tra nhanh khi bôi đen từ vựng
│   └── content.css              # Giao diện nút nổi Tra AI
├── public/                      # Static assets, icons, audio
├── scripts/                     # Kịch bản tự động hóa cho Windows
│   ├── start-server.bat         # Khởi động server (hiển thị terminal)
│   ├── start-server.vbs         # Khởi động server chạy ngầm ẩn danh
│   └── setup-windows-startup.bat# Ghim tự khởi động cùng máy tính Windows
├── src/
│   ├── app/                     # Next.js App Router (Dashboard, Vocabulary, Lookup, Review, Settings)
│   ├── components/
│   │   ├── ai/                  # AILookupPanel, PasteResultModal
│   │   ├── layout/              # Header, Navbar
│   │   ├── review/              # PronunciationPractice, SentencePractice, MeaningPractice
│   │   ├── ui/                  # Toast, CEFRBadges, Modals
│   │   └── vocabulary/          # WordCard, WordFamilyList...
│   ├── hooks/                   # useVocabulary, useAI, usePronunciation, useSpeechRecognition...
│   └── lib/                     # IndexedDB storage, AI Evaluator, Gemini API router & parsers
├── ARCHITECTURE.md              # Kiến trúc hệ thống và TypeScript schema
├── WORKFLOW.md                  # 5 luồng nghiệp vụ & dữ liệu chi tiết
├── BUG.md                       # Tổng hợp lỗi từng gặp
├── BUGDONE.md                   # Nhật ký sửa lỗi chi tiết
├── LICENSE                      # Giấy phép bản quyền MIT License
└── README.md                    # Hướng dẫn cài đặt & sử dụng này
```

---

## 📜 Bản Quyền & Sở Hữu Trí Tuệ (Author & License)

- **Tác giả & Người phát triển chính:** **Lê Văn Hoàng Hiếu** ([Stuckwthuw](https://github.com/Stuckwthuw))
- **Email liên hệ:** `hoanghieu20061109@gmail.com`
- **GitHub Repository:** [https://github.com/Stuckwthuw/NoteBook_English_AI](https://github.com/Stuckwthuw/NoteBook_English_AI)
- **Giấy phép phần mềm:** Dự án được phát hành theo giấy phép mã nguồn mở **[MIT License](LICENSE)**. Toàn quyền tác giả thuộc về Lê Văn Hoàng Hiếu (Copyright © 2026).
