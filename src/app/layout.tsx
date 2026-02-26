import type { Metadata } from "next";
import "./globals.css";
import GoogleAnalytics from "@/components/common/GoogleAnalytics";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import ThemeProvider from "@/components/common/ThemeProvider";
import { generateWebSiteJsonLd } from "@/lib/seo";
import { BASE_URL, SITE_NAME } from "@/lib/constants";
import { allGameMetas, getGamePath } from "@/games/registry";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: "yolos.net",
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
  alternates: {
    types: {
      "application/rss+xml": "/feed",
      "application/atom+xml": "/feed/atom",
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const websiteJsonLd = generateWebSiteJsonLd();
  const gameLinks = allGameMetas.map((game) => ({
    href: getGamePath(game.slug),
    label: game.title,
  }));
  return (
    <html lang="ja" suppressHydrationWarning>
      <body
        style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <ThemeProvider>
          <GoogleAnalytics />
          <Header />
          <main style={{ flex: 1 }}>{children}</main>
          <Footer gameLinks={gameLinks} />
        </ThemeProvider>
      </body>
    </html>
  );
}
