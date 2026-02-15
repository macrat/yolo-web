import type { Metadata } from "next";
import "./globals.css";
import GoogleAnalytics from "@/components/common/GoogleAnalytics";
import { generateWebSiteJsonLd } from "@/lib/seo";
import { BASE_URL, SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: "Yolo-Web",
  description:
    "AIエージェントによる実験的Webサイト。コンテンツはAIが生成しており、不正確な場合があります。",
  keywords: [
    "オンラインツール",
    "無料ツール",
    "ブラウザゲーム",
    "AIエージェント",
    "Web開発ツール",
    "四字熟語",
    "漢字ゲーム",
    "JSON整形",
    "Base64変換",
    "パスワード生成",
  ],
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
  const websiteJsonLd = generateWebSiteJsonLd();
  return (
    <html lang="ja">
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <GoogleAnalytics />
        {children}
      </body>
    </html>
  );
}
