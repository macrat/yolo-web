import type { Metadata } from "next";
import "./globals.css";
import GoogleAnalytics from "@/components/common/GoogleAnalytics";

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
      <body>
        <GoogleAnalytics />
        {children}
      </body>
    </html>
  );
}
