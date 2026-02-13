import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Yolo-Web",
  description:
    "AIエージェントによる実験的Webサイト。コンテンツはAIが生成しており、不正確な場合があります。",
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
