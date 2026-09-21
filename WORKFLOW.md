# 🔄 Quy Trình Hoạt Động & Luồng Dữ Liệu (WORKFLOW.md)

Tài liệu này mô tả chi tiết các luồng nghiệp vụ (Workflows) của dự án **Smart Lexicon Notebook**, giải thích rõ cách dữ liệu di chuyển từ lúc người dùng tìm kiếm từ mới cho đến khi lưu trữ và ôn tập theo chu kỳ ngắt quãng (Spaced Repetition).

---

## 1. Luồng 1: Tra cứu bằng AI Chat miễn phí (Free Web Chat Mode)

Đây là chế độ mặc định, hoàn toàn không tốn chi phí và không cần đăng ký API Key.

```mermaid
sequenceDiagram
    autonumber
    actor User as Người dùng
    participant UI as Giao diện (AILookupPanel)
    participant PB as Prompt Builder
    participant Ext as Web AI (Gemini/ChatGPT/Claude)
    participant Parser as Bộ bóc tách (parser.ts)
    participant DB as Cơ sở dữ liệu IndexedDB

    User->>UI: Nhập từ cần tra (VD: "mitigate") & Chọn AI (VD: Gemini)
    UI->>PB: Yêu cầu tạo câu lệnh mẫu chuẩn ngôn ngữ học
    PB-->>UI: Trả về câu lệnh tối ưu
    UI->>User: Tự động copy câu lệnh vào Clipboard & Mở tab AI mới
    User->>Ext: Dán (Ctrl + V) câu lệnh vào khung chat AI
    Ext-->>User: AI sinh kết quả phân tích
    User->>UI: Copy kết quả và dán vào ô "Dán kết quả từ AI"
    UI->>Parser: Chuyển chuỗi văn bản cho parseAIResponse()
    Parser->>Parser: Nhận diện JSON hoặc Regex trích xuất (POS, CEFR, Family, Nghĩa, Ví dụ)
    Parser-->>UI: Trả về đối tượng WordData hoàn chỉnh
    UI->>User: Hiển thị giao diện xem trước (Preview Card)
    User->>DB: Nhấn "Lưu vào Sổ tay"
    DB-->>User: Lưu thành công vào IndexedDB & Thông báo Toast
```

---

## 2. Luồng 2: Tra cứu tự động 1-Click bằng Gemini API (API Mode)

Dành cho người dùng đã nhập API Key Gemini trong trang Cài đặt.

```mermaid
sequenceDiagram
    autonumber
    actor User as Người dùng
    participant UI as AILookupPanel
    participant Router as router.ts
    participant Gemini as gemini.ts (API Engine)
    participant Google as Google Generative Language API
    participant DB as IndexedDB

    User->>UI: Nhập từ & bấm nút "Phân tích AI" (hoặc nhấn Enter)
    UI->>Router: Gọi analyzeViaAPI(word)
    Router->>Gemini: analyzeWithGemini(word, apiKey)
    Gemini->>Google: GET /v1beta/models?key=API_KEY (Lấy danh sách model còn sống)
    Google-->>Gemini: Trả về danh sách model khả dụng (gemini-3.6-flash, 3.7, 3.8...)
    Gemini->>Google: POST /v1beta/models/gemini-3.6-flash:generateContent
    alt Thành công
        Google-->>Gemini: Trả về văn bản phân tích
        Gemini->>UI: Parse thành WordData & hiển thị lên màn hình
        User->>DB: Nhấn "Lưu vào sổ từ vựng"
    else Quá tải 503 (High demand)
        Google-->>Gemini: Mã lỗi 503
        Gemini->>Gemini: Tự động tạm dừng 1s & Thử lại hoặc chuyển sang model Flash tiếp theo
    else Hết Quota (429)
        Gemini-->>UI: Báo lỗi tiếng Việt "Đã vượt quá giới hạn 15 req/phút"
    end
```

---

## 3. Luồng 3: Tiện ích mở rộng trình duyệt (Brave / Chrome Extension)

Cho phép người dùng tra nhanh từ bất kỳ website nào khi đang đọc báo, xem tài liệu:

1. **Bôi đen từ vựng:** Người dùng bôi đen một từ tiếng Anh trên trang web bất kỳ.
2. **Kích hoạt:** Nhấp chuột phải chọn *"Tra từ với Smart Lexicon"* hoặc bấm biểu tượng Extension trên thanh công cụ.
3. **Chuyển hướng thông minh:** Extension tự động mở tab `http://localhost:3000/lookup?word={từ_vựng}`.
4. **Phân tích tự động:** Trang `lookup` nhận query param `word`, tự động điền vào ô tìm kiếm và gọi phân tích ngay nếu người dùng đã bật API Mode.

---

## 4. Luồng 4: Ôn tập ngắt quãng thông minh (Spaced Repetition Review)

Dựa trên nguyên lý đường cong lãng quên (Ebbinghaus Forgetting Curve) và hệ thống Leitner:

1. **Thuật toán phân loại:**
   - Hệ thống quét toàn bộ từ trong `IndexedDB`.
   - Các từ chưa thuộc (`isMastered === false`) hoặc có khoảng cách từ lần ôn tập trước (`lastReviewedAt`) vượt quá chu kỳ sẽ được đưa vào hàng đợi ôn tập hôm nay.
2. **Trải nghiệm Flashcard:**
   - **Mặt trước:** Hiển thị Từ tiếng Anh, Phiên âm IPA, Cấp độ CEFR, Câu ví dụ khuyết từ (ẩn từ khóa).
   - **Lật thẻ:** Hiển thị Nghĩa tiếng Việt, Từ loại, Gia đình từ, Từ đồng nghĩa/trái nghĩa, Lỗi sai phổ biến.
3. **Phản hồi người học:**
   - **Chưa nhớ (Again):** Giữ nguyên hoặc giảm cấp độ, đưa lại vào hàng đợi ôn tập sớm.
   - **Đã nhớ (Good / Mastered):** Tăng `reviewCount`, cập nhật `lastReviewedAt = Date.now()`, nếu ôn đủ số lần sẽ đánh dấu `isMastered = true`.

---

## 5. Luồng 5: Sao lưu & Phục hồi dữ liệu (Backup & Restore)

1. **Xuất dữ liệu (Export):**
   - Đọc toàn bộ kho từ vựng từ `IndexedDB` $\rightarrow$ Chuyển thành file định dạng JSON `lexicon-backup-YYYY-MM-DD.json` tải về máy tính.
2. **Nhập dữ liệu (Import):**
   - Đọc file JSON từ máy tính $\rightarrow$ Kiểm tra tính hợp lệ của cấu trúc `WordData` $\rightarrow$ Thực hiện cơ chế Merge an toàn (từ nào đã có thì cập nhật, từ mới thì thêm vào) $\rightarrow$ Không làm mất dữ liệu hiện tại.
