# 🤖 Hướng Dẫn Dành Cho AI Khi Làm Việc Với Dự Án Này (CLAUDE.md)

Khi bắt đầu một phiên làm việc hoặc khung chat mới, AI **BẮT BUỘC** phải tham khảo các tài liệu kiến trúc và kinh nghiệm sau:

1. 🏛️ **[ARCHITECTURE.md](ARCHITECTURE.md)**: Tổng quan kiến trúc hệ thống, Tech Stack (Next.js 16, React 19, IndexedDB, Gemini API), cấu trúc thư mục và Data Model (`WordData`, `VocabularyEntry`).
2. 🔄 **[WORKFLOW.md](WORKFLOW.md)**: 5 luồng nghiệp vụ cốt lõi (Tra từ Chat, Tra từ API, Extension Brave/Chrome, Ôn tập ngắt quãng SRS, Backup & Restore).
3. 📋 **[BUG.md](BUG.md)**: Danh sách toàn bộ các lỗi từng phát sinh trong dự án.
4. 🛠️ **[BUGDONE.md](BUGDONE.md)**: Nhật ký chi tiết cách sửa từng lỗi, nguyên lý xử lý kỹ thuật và các quy tắc tránh lỗi lặp lại (đặc biệt là Next.js SSR Hydration và Google Gemini API 503/404 handling).
