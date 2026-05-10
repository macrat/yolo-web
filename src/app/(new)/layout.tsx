import type { Metadata } from "next";
import "@/app/globals.css";
// Phase 4.4 暫定対処（cycle-185 / B-334-4-5 reviewer 指摘の致命的 UI 退行への対応 v2）。
// Phase 4.4 移行で (legacy)/layout.tsx → (new)/layout.tsx の切替えに伴い、
// ヘッダーから検索ボタンが消失していた（M1b dislikes「慣れた操作手順が突然変わる」に直撃）。
// 前回 v1（actions スロットへの SearchTrigger 直渡し）は desktop のみ修正で
// mobile では依然として消失していたため v2 として再修正。
// HeaderWithSearch が SearchModal の open/close 状態を管理し、onSearchOpen を Header に渡す。
// これにより Header の mobileSearchButton も自動生成され、desktop + mobile 両対応となる。
// Phase 5 (B-331) で新検索コンポーネントに置き換える際は HeaderWithSearch ごと削除すること。
import HeaderWithSearch from "./_components/HeaderWithSearch";
import Footer from "@/components/Footer";
import ThemeProvider from "@/components/ThemeProvider";
import ThemeToggle from "@/components/ThemeToggle";
import GoogleAnalytics from "@/components/common/GoogleAnalytics";
import AchievementProvider from "@/lib/achievements/AchievementProvider";
import StreakBadge from "@/lib/achievements/StreakBadge";
import { generateWebSiteJsonLd, safeJsonLdStringify } from "@/lib/seo";
import { sharedMetadata } from "@/lib/site-metadata";

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
            <HeaderWithSearch
              actions={
                <>
                  <StreakBadge />
                  <ThemeToggle />
                </>
              }
            />
            <main style={{ flex: 1 }}>{children}</main>
            <Footer />
          </AchievementProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
