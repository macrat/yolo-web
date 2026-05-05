/**
 * global-not-found.js — グローバル 404 ページ
 *
 * multiple root layouts 構成では通常の app/not-found.tsx で 404 を
 * 構成できないため、Next.js v16.2 の global-not-found.js
 * (experimental.globalNotFound: true) を採用。
 *
 * - global-not-found は layout の import チェーンに乗らないため、
 *   globals.css と必要な Provider を冒頭で明示 import する。
 * - <html>/<body> を手動出力（(new)/layout.tsx の構造を再現）。
 * - ThemeProvider 採用: 404 着地時にダークモード設定が反映されないと、
 *   404 から戻った先のページとの視覚不一致が生じるため。
 * - GoogleAnalytics 採用: 404 着地は外部リンク切れの定量把握に直接価値があり、
 *   Search Console / GA で 404 発生 URL を追跡できないと改善の起点が失われる。
 * - AchievementProvider/StreakBadge/JSON-LD は不採用:
 *   404 にバッジ表示も実績記録も無く、SEO 上 noindex で JSON-LD も不要。
 * - Header の actions プロップには ThemeToggle のみ渡す。
 *   StreakBadge は AchievementProvider 不在のため除外。
 *
 * B-333-7 (cycle-180) / R1 Major-2 修正で ThemeProvider と GoogleAnalytics を追加
 */

import "@/app/globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ThemeProvider from "@/components/ThemeProvider";
import ThemeToggle from "@/components/ThemeToggle";
import GoogleAnalytics from "@/components/common/GoogleAnalytics";
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
        <ThemeProvider>
          <GoogleAnalytics />
          <Header actions={<ThemeToggle />} />
          <main style={{ flex: 1 }}>
            <GlobalNotFoundContent />
          </main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
