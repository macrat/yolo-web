/**
 * global-not-found.js — グローバル 404 ページ
 *
 * multiple root layouts 構成では通常の app/not-found.tsx で 404 を
 * 構成できないため、Next.js v16.2 の global-not-found.js
 * (experimental.globalNotFound: true) を採用。
 *
 * - global-not-found は layout の import チェーンに乗らないため、
 *   globals.css を冒頭で明示 import する。
 * - <html>/<body> を手動出力（(new)/layout.tsx の構造を再現）。
 * - ThemeProvider/AchievementProvider/GoogleAnalytics/JSON-LD は不採用:
 *   404 は layout の Provider チェーンに乗らず、SEO 上 noindex のため
 *   JSON-LD も計測も不要。
 * - Header の actions プロップには ThemeToggle のみ渡す。
 *   StreakBadge は AchievementProvider 不在のため除外。
 *
 * B-333-7 (cycle-180)
 */

import "@/app/globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ThemeToggle from "@/components/ThemeToggle";
import GlobalNotFoundContent from "@/app/global-not-found-content";
import { SITE_NAME } from "@/lib/constants";

export const metadata = {
  title: `ページが見つかりません | ${SITE_NAME}`,
  description: "お探しのページは見つかりませんでした。",
};

export default function GlobalNotFound() {
  return (
    // suppressHydrationWarning: next-themes がクライアント側で <html class="dark"> を付与するため、
    // サーバーとクライアントの class 不一致による hydration 警告を抑制する
    <html lang="ja" suppressHydrationWarning>
      <body
        style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
      >
        <Header actions={<ThemeToggle />} />
        <main style={{ flex: 1 }}>
          <GlobalNotFoundContent />
        </main>
        <Footer />
      </body>
    </html>
  );
}
