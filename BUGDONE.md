# 🛠️ Nhật Ký Sửa Lỗi & Giải Pháp Kỹ Thuật (BUGDONE.md)

Tài liệu này ghi lại chi tiết thời gian, cách thức sửa chữa và bài học kỹ thuật cho toàn bộ các lỗi đã được giải quyết thành công trong đồ án **NoteBook_English_AI**. Các AI trong tương lai khi nhận dự án cần đọc kỹ tài liệu này để tuân thủ kiến trúc chuẩn, tránh lặp lại các lỗi tương tự.

---

## 1. BUG-001: Tự động khởi động máy chủ cùng Windows
- **Thời gian xử lý:** 2026-09-21 10:30 (UTC+7)
- **Files tạo mới:**
  - `start-server.bat`: Script khởi động tiêu chuẩn.
  - `start-server.vbs`: VBScript khởi động server ngầm (chạy background ẩn hoàn toàn cửa sổ đen CMD).
  - `scripts/setup-windows-startup.bat`: Script tự động tạo shortcut của file `.vbs` vào thư mục `shell:startup` của Windows (`%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup`).
- **Cách sửa chi tiết:**
  - File `.vbs` sử dụng đối tượng `WScript.Shell.Run` với cờ `0` để chạy tiến trình ẩn danh:
    ```vbscript
    Set WshShell = CreateObject("WScript.Shell")
    WshShell.Run "cmd /c npm run dev", 0, False
    ```
  - Khi người dùng chạy `setup-windows-startup.bat`, một shortcut được ghim tự động vào thư mục khởi động của người dùng, giúp máy chủ Next.js luôn sẵn sàng ngay khi mở máy tính mà không gây phiền toái.

---

## 2. BUG-002: Bị sót nghĩa và lọt câu thừa khi dán văn bản AI tự do (VD: từ "entity")
- **Thời gian xử lý:** 2026-09-21 10:45 (UTC+7)
- **File can thiệp:** `src/lib/ai/parser.ts`
- **Nguyên nhân:** AI thường mở đầu bằng các câu giao tiếp như *"Dưới đây là phân tích từ vựng entity, cụ thể như sau:"*. Các biểu thức chính quy (Regex) cũ vô tình bắt lấy dòng này làm nghĩa tiếng Việt chính và cắt ngắn các dòng phân tích chuyên sâu bên dưới.
- **Cách sửa chi tiết:**
  1. Thêm bộ lọc dọn dẹp các cụm từ đệm giao tiếp:
     ```typescript
     const fillerPatterns = [
       /^(dưới đây là|sau đây là|nghĩa của từ|cụ thể như sau|chi tiết như sau|tổng hợp)/i,
       /^\s*[:\-\—\–]+\s*/,
     ];
     ```
  2. Bổ sung bộ phân tách đa ngữ cảnh: Khi văn bản có cấu trúc `1. ...`, `2. ...`, `Ngữ cảnh 1:`, `Kinh tế:`, `Công nghệ:`, parser tự động bóc tách từng khối thành các đối tượng `WordContext` riêng biệt với các trường: `domain`, `exampleSentence`, `sentenceMeaning`.
  3. Kết quả: Từ "entity" lưu được trọn vẹn 3 tầng nghĩa (Triết học/Bản thể luận, Công nghệ phần mềm, Doanh nghiệp/Kinh tế).

---

## 3. BUG-003: Phân loại sai Từ loại (Part of Speech) và thêm tính năng chỉnh sửa trực tiếp
- **Thời gian xử lý:** 2026-09-21 11:15 (UTC+7)
- **Files can thiệp:**
  - `src/lib/ai/parser.ts`
  - `src/components/vocabulary/WordCard.tsx`
- **Nguyên nhân:** AI sinh văn bản tự do đôi khi viết *"Từ loại: verb trong câu ví dụ..."* khiến regex nhận diện nhầm từ *"detection"* thành `verb`.
- **Cách sửa chi tiết:**
  1. **Tích hợp Morphological Suffix Heuristics (Quy tắc hình thái học tiếng Anh):**
     Nếu từ kết thúc bằng các hậu tố đặc trưng, hệ thống sẽ tự động hiệu chỉnh lại từ loại chuẩn xác:
     - Danh từ (`noun`): `-tion`, `-sion`, `-ment`, `-ness`, `-ity`, `-ance`, `-ence`, `-ship`, `-er`, `-or`.
     - Động từ (`verb`): `-ize`, `-ise`, `-ify`, `-ate`, `-en`.
     - Tính từ (`adjective`): `-able`, `-ible`, `-al`, `-ful`, `-ic`, `-ive`, `-ous`, `-less`.
     - Trạng từ (`adverb`): `-ly`, `-ward`, `-wise`.
  2. **Thêm UI Inline Edit trên thẻ từ vựng (`WordCard.tsx`):**
     Cho phép người dùng nhấn trực tiếp vào Badge Từ loại (Noun, Verb, Adj, Adv, Phrase) để chọn lại trong một dropdown menu nếu muốn thay đổi, tự động lưu vào IndexedDB ngay lập tức.

---

## 4. BUG-004: Lỗi React Hydration Mismatch (`Hydration failed`)
- **Thời gian xử lý:** 2026-09-21 15:00 (UTC+7)
- **Files can thiệp:**
  - `src/components/ai/AILookupPanel.tsx`
  - `src/app/settings/page.tsx`
- **Nguyên nhân kỹ thuật:**
  - Trong Next.js App Router (SSR), mã nguồn được render trên Server trước khi gửi về Client.
  - Phía Server không có `window` hoặc `localStorage` $\rightarrow$ hàm `getSettings()` trả về `DEFAULT_SETTINGS` (chưa có API Key). Cây DOM Server **không có nút `<button>Phân tích AI</button>`**.
  - Phía Client vừa tải trang xong thì `getSettings()` đọc ngay `localStorage` thấy đã có API Key $\rightarrow$ Client muốn dựng nút `<button>Phân tích AI</button>`.
  - Cấu trúc DOM Server và Client không khớp nhau tại lần render đầu tiên $\rightarrow$ React ném lỗi **Hydration Mismatch**.
- **Cách sửa chuẩn Next.js:**
  1. Luôn khởi tạo state với `DEFAULT_SETTINGS`:
     ```typescript
     const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
     const [mounted, setMounted] = useState(false);
     ```
  2. Chỉ đọc `localStorage` và bật cờ hiển thị sau khi component đã Mount thành công ở Client thông qua `useEffect`:
     ```typescript
     React.useEffect(() => {
       setMounted(true);
       setSettings(getSettings());
     }, []);

     const hasApiKey = mounted && !!(settings.geminiApiKey || settings.openaiApiKey || settings.anthropicApiKey);
     const isAPIMode = mounted && (settings.aiMode === 'free-api' || settings.aiMode === 'paid-api');
     ```
  - **Bài học cho AI:** Tuyệt đối không gọi các hàm đọc `localStorage` hoặc `window` đồng bộ trực tiếp trong phần thân render (render body) của Component React SSR.

---

## 5. BUG-005 & BUG-006: Gemini Model Deprecated (404) & High Demand Overload (503)
- **Thời gian xử lý:** 2026-09-21 15:20 (UTC+7)
- **File can thiệp:** `src/lib/ai/gemini.ts`
- **Nguyên nhân:**
  1. Google khai tử (deprecated) toàn bộ dòng model `gemini-1.5-flash`, `gemini-1.5-pro` và `gemini-2.5-flash` cho các tài khoản mới, chỉ hỗ trợ dòng `gemini-3.x` (chuẩn là `gemini-3.6-flash`, `gemini-3.7-flash`, `gemini-3.8-flash`).
  2. Đúng lúc người dùng tra từ, máy chủ Google Gemini bị quá tải tạm thời và trả về lỗi `503 High demand`.
  3. Cơ chế fallback cũ chạy sang các model thế hệ cũ đã ngưng hỗ trợ $\rightarrow$ ném ra lỗi `404 models/gemini-1.5-pro is not found`.
- **Cách sửa toàn diện:**
  1. **Tự động nhận diện model động (Dynamic Model Discovery):**
     Gọi endpoint `https://generativelanguage.googleapis.com/v1beta/models?key=API_KEY` để lấy danh sách các model thực tế đang hoạt động của chính API Key đó, lọc các model hỗ trợ `generateContent` và loại bỏ các model cũ.
  2. **Ưu tiên dòng Flash thế hệ 3 mới nhất:**
     `gemini-3.8-flash` > `gemini-3.7-flash` > `gemini-3.6-flash` > `gemini-3.5-flash`.
  3. **Cơ chế tự động Retry khi gặp 503:**
     Khi gặp lỗi `503` hoặc `high demand`, hệ thống không ném lỗi ngay mà tự động tạm dừng 1 giây và thử lại lần thứ 2 hoặc chuyển mượt sang model Flash khác.
  4. **Bản dịch thông báo lỗi tiếng Việt thân thiện:**
     Nếu toàn bộ cụm máy chủ Google bị nghẽn, báo rõ ràng: *"Máy chủ Google Gemini đang tạm thời quá tải (503 High demand). Bạn hãy bấm 'Phân tích AI' lại sau vài giây nhé!"*.
