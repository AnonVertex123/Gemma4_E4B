import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tự Minh AGI — AI Workspace",
  description: "Hệ thống trí tuệ nhân tạo Tự Minh AGI: Chat AI, Phân tích Dự án, Quản lý Tri thức. Powered by Gemma 4 E4B.",
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}
