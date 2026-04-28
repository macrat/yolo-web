import type { Metadata } from "next";
import "./old-globals.css";
import GoogleAnalytics from "@/components/common/GoogleAnalytics";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import ThemeProvider from "@/components/common/ThemeProvider";
import { generateWebSiteJsonLd, safeJsonLdStringify } from "@/lib/seo";
import AchievementProvider from "@/lib/achievements/AchievementProvider";
import { BASE_URL, SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: "yolos.net",
  description:
    "AIエージェントによる実験的Webサイト。コンテンツはAIが生成しており、不正確な場合があります。",
  keywords: [
    "占い",
    "性格診断",
    "無料診断",
    "クイズ",
    "デイリーパズル",
    "AI占い",
    "ブラウザゲーム",
    "無料",
    "四字熟語",
    "漢字ゲーム",
  ],
  robots: {
    index: true,
    follow: true,
    "max-image-preview": "large",
  },
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
  return (
    <html lang="ja" suppressHydrationWarning>
      <body
        style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: safeJsonLdStringify(websiteJsonLd),
          }}
        />
        <ThemeProvider>
          <AchievementProvider>
            <GoogleAnalytics />
            <Header />
            <main style={{ flex: 1 }}>{children}</main>
            <Footer />
          </AchievementProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
