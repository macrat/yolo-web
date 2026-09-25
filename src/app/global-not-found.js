/**
 * global-not-found.js — グローバル 404 ページ
 *
 * multiple root layouts 構成では通常の app/not-found.tsx で 404 を
 * 構成できないため、Next.js の global-not-found.js
 * (experimental.globalNotFound: true) を使う。
 *
 * - layout の import チェーンに乗らないため、globals.css を冒頭で明示 import し、
 *   <html>/<body> と上端・下端を src/app/layout.tsx と同じ形で出す。
 * - GoogleAnalytics を置く: 404 着地は外部リンク切れの定量把握に直接価値があり、
 *   GA で 404 発生 URL を追跡できないと改善の起点が失われる。
 * - JSON-LD は置かない: 404 は SEO 上 noindex のため不要。
 */

import "@/app/globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import GlobalNotFoundContent from "@/app/global-not-found-content";
import { SITE_NAME } from "@/lib/constants";
import { sharedViewport } from "@/lib/site-metadata";
import { plexSans, zenAntique } from "@/lib/fonts";

export const metadata = {
  title: `ページが見つかりません | ${SITE_NAME}`,
  description: "お探しのページは見つかりませんでした。",
};

export const viewport = sharedViewport;

export default function GlobalNotFound() {
  return (
    <html lang="ja" className={`${zenAntique.variable} ${plexSans.variable}`}>
      <body
        style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
      >
        <GoogleAnalytics />
        <Header />
        <main style={{ flex: 1 }}>
          <GlobalNotFoundContent />
        </main>
        <Footer />
      </body>
    </html>
  );
}
