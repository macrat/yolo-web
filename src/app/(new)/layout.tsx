import type { Metadata } from "next";
import "@/app/globals.css";
// 検索ボタンは Header に渡される onSearchOpen prop が未設定のため、(new)/ 配下では
// 表示されない設計（cycle-181 = Phase 4.1 で確立）。検索コンポーネントの結線は
// Phase 5 = B-331 のスコープであり、本サイクル (cycle-185 = Phase 4.4) では対象外。
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ThemeProvider from "@/components/ThemeProvider";
import ThemeToggle from "@/components/ThemeToggle";
import GoogleAnalytics from "@/components/common/GoogleAnalytics";
import { generateWebSiteJsonLd, safeJsonLdStringify } from "@/lib/seo";
import { sharedMetadata } from "@/lib/site-metadata";
// フェーズ R の新デザイントークン層で使う Web フォント（見出し明朝・数字）を
// CSS 変数（--font-mincho / --font-number）としてツリー全体に配線する（DESIGN.md §3）。
import { mincho, number } from "@/lib/fonts";

export const metadata: Metadata = sharedMetadata;

export default function NewRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const websiteJsonLd = generateWebSiteJsonLd();
  return (
    // suppressHydrationWarning: next-themes がクライアント側で <html class="dark"> を付与するため、
    // サーバーとクライアントの class 不一致による hydration 警告を抑制する
    <html
      lang="ja"
      suppressHydrationWarning
      className={`${mincho.variable} ${number.variable}`}
    >
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
          <GoogleAnalytics />
          <Header actions={<ThemeToggle />} />
          <main style={{ flex: 1 }}>{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
