# 📋 Danh Sách Các Lỗi Đã Gặp Trong Đồ Án (BUG.md)

Tài liệu này tổng hợp toàn bộ các lỗi (Bugs) phát sinh trong quá trình xây dựng, chạy thử và phát triển dự án **NoteBook_English_AI (Smart Lexicon)** từ lúc khởi tạo đến hiện tại.

---

## Mục lục lỗi theo phân loại

| Mã Lỗi | Tên Lỗi / Triệu Chứng | Phân Loại | File Ảnh Hưởng | Trạng Thái |
| :--- | :--- | :--- | :--- | :--- |
| **BUG-001** | Máy chủ không tự khởi động cùng Windows khi bật máy | Hệ thống / Tự động hóa | `scripts/` | ✅ Đã sửa |
| **BUG-002** | Dán đoạn văn bản nhiều nghĩa bị nuốt nghĩa, chỉ hiện filler text `"cụ thể như sau:"` | Xử lý dữ liệu (Parser) | `src/lib/ai/parser.ts` | ✅ Đã sửa |
| **BUG-003** | Sai từ loại hiển thị (Detection là Noun nhưng bị nhận diện nhầm thành Verb) | Ngôn ngữ học / Heuristics | `src/lib/ai/parser.ts`, `WordCard.tsx` | ✅ Đã sửa |
| **BUG-004** | Lỗi React Hydration Mismatch (`Hydration failed because server rendered HTML didn't match client`) | React / Next.js SSR | `AILookupPanel.tsx`, `settings/page.tsx` | ✅ Đã sửa |
| **BUG-005** | Báo lỗi 404 Model Not Found khi gọi Gemini API (`models/gemini-1.5-pro is not found for API version v1beta`) | Tích hợp AI / Google Gemini | `src/lib/ai/gemini.ts` | ✅ Đã sửa |
| **BUG-006** | Gemini API trả về mã lỗi quá tải 503 (`This model is currently experiencing high demand`) | Tích hợp AI / Network & Quota | `src/lib/ai/gemini.ts` | ✅ Đã sửa |

---

## Chi tiết từng lỗi

### 1. BUG-001: Máy chủ Next.js không tự động chạy khi khởi động Windows
- **Triệu chứng:** Khi mở máy tính hoặc trình duyệt Brave/Chrome Extension, người dùng phải mở terminal gõ `npm run dev` thủ công. Nếu quên, Extension và trang web `http://localhost:3000` không truy cập được.
- **Hoàn cảnh xuất hiện:** Khởi động lại Windows.
- **Phân loại:** Automation / Server Lifecycle.

---

### 2. BUG-002: Bị sót nghĩa và lọt câu thừa khi dán kết quả AI có nhiều ngữ cảnh (VD: từ "entity")
- **Triệu chứng:** Khi tra từ có nhiều nghĩa thuộc nhiều lĩnh vực chuyên ngành khác nhau (ví dụ: thực thể, sự tồn tại, doanh nghiệp độc lập), mục định nghĩa tiếng Việt chỉ lưu câu đệm của AI như *"cụ thể như sau:"*, các nghĩa chi tiết bên dưới bị bỏ qua.
- **Hoàn cảnh xuất hiện:** Người dùng dán văn bản tự do từ Gemini / ChatGPT dạng hội thoại vào ô "Dán kết quả từ AI".
- **Thông báo lỗi:** Không văng exception nhưng dữ liệu lưu vào IndexedDB bị rỗng hoặc sai nghĩa.
- **File ảnh hưởng:** `src/lib/ai/parser.ts`.

---

### 3. BUG-003: Phân loại sai Từ loại (Part of Speech) đối với các từ có hậu tố rõ ràng (VD: "detection")
- **Triệu chứng:** Từ *"detection"* (danh từ) bị AI hoặc regex phân loại nhầm thành `verb`.
- **Hoàn cảnh xuất hiện:** Khi văn bản AI sinh ra có chứa câu ví dụ chứa động từ hoặc định dạng POS không đồng nhất. Người dùng cũng không thể sửa nhanh từ loại trên giao diện nếu AI nhận diện nhầm.
- **File ảnh hưởng:** `src/lib/ai/parser.ts`, `src/components/vocabulary/WordCard.tsx`.

---

### 4. BUG-004: Next.js React Hydration Failed Mismatch
- **Triệu chứng:** Màn hình xuất hiện khung đỏ lỗi nhà phát triển:
  ```text
  Recoverable Error:
  Hydration failed because the server rendered HTML didn't match the client.
  As a result this tree will be regenerated on the client.
  src/components/ai/AILookupPanel.tsx (114:13) @ AILookupPanel
  > 114 | <button onClick={handleAPILookup} ...>
  ```
- **Hoàn cảnh xuất hiện:** Ngay khi tải hoặc F5 trang `http://localhost:3000` hoặc `/lookup` sau khi người dùng đã lưu API Key trong Cài đặt.
- **Nguyên nhân cốt lõi:** Lệnh đọc `getSettings()` lấy dữ liệu từ `localStorage` của trình duyệt. Phía Server SSR không có `localStorage` nên render ra mã HTML **không có** nút `<button>Phân tích AI</button>`, trong khi Client render lần đầu **có** nút `<button>`. Sự lệch cấu trúc DOM gây ra Hydration Error.
- **File ảnh hưởng:** `src/components/ai/AILookupPanel.tsx`, `src/app/settings/page.tsx`.

---

### 5. BUG-005 & BUG-006: Gemini API văng lỗi 404 Model Deprecated và 503 High Demand Spikes
- **Triệu chứng:** Khi nhấn "Phân tích AI", hệ thống báo lỗi đỏ:
  ```text
  ❌ Lỗi từ Gemini API: [GoogleGenerativeAI Error]: Error fetching from https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent:
  [404 ] models/gemini-1.5-pro is not found for API version v1beta, or is not supported for generateContent.
  Call ModelService.ListModels to see the list of available models and their supported methods.
  ```
- **Log máy chủ chi tiết:**
  ```text
  [browser] Model gemini-3.6-flash lỗi: [503 ] This model is currently experiencing high demand. Spikes in demand are usually temporary. Please try again later.
  [browser] Model gemini-2.5-flash lỗi: [404 ] This model models/gemini-2.5-flash is no longer available to new users. Please update your code to use models/gemini-3.6-flash...
  [browser] Model gemini-1.5-flash lỗi: [404 ] models/gemini-1.5-flash is not found for API version v1beta...
  [browser] Model gemini-1.5-pro lỗi:   [404 ] models/gemini-1.5-pro is not found for API version v1beta...
  ```
- **Hoàn cảnh xuất hiện:** Người dùng nhập API Key Gemini từ Google AI Studio rồi bấm "Phân tích AI".
- **Nguyên nhân cốt lõi:**
  1. Máy chủ Google Gemini tạm thời bị nghẽn (mã 503 quá tải đột biến).
  2. Vòng lặp dự phòng trong code chuyển tiếp sang các model thế hệ cũ: `gemini-2.5-flash`, `gemini-1.5-flash`, `gemini-1.5-pro`.
  3. Toàn bộ các model thế hệ 1.5 và 2.5 đã bị Google ngừng cung cấp (deprecated) cho tài khoản mới. Model cuối cùng trong danh sách (`gemini-1.5-pro`) trả về 404 và ghi đè lỗi làm người dùng nhầm tưởng đang gọi model cũ.
- **File ảnh hưởng:** `src/lib/ai/gemini.ts`.
