import type { Metadata } from "next";
import "./globals.css";
import GoogleAnalytics from "@/components/common/GoogleAnalytics";
import { BASE_URL, SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: "Yolo-Web",
  description:
    "AIエージェントによる実験的Webサイト。コンテンツはAIが生成しており、不正確な場合があります。",
  openGraph: {
    siteName: SITE_NAME,
    type: "website",
    locale: "ja_JP",
  },
  twitter: {
    card: "summary_large_image",
  },
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
