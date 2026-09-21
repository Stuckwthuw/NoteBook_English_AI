import type { Metadata } from "next";
import "./globals.css";
import { ClientLayout } from "./client-layout";

export const metadata: Metadata = {
  title: "Smart Lexicon — Sổ tay Từ vựng Thông minh",
  description: "Ứng dụng học tiếng Anh theo ngữ cảnh thực tế, tích hợp AI phân tích từ vựng chuyên sâu với phiên âm IPA, CEFR level, collocations và ví dụ thực tế.",
  keywords: ["vocabulary", "English learning", "AI", "CEFR", "IPA", "từ vựng tiếng Anh"],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
