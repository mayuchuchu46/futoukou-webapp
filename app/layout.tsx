import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "どうする先生",
  description: "不登校編 - 保護者向けAI相談",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
