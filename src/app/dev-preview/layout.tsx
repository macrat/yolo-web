/**
 * dev-preview/ 専用レイアウト
 *
 * ## 目的
 * design-system コンポーネントの動作確認ページ専用のレイアウト。
 * ルートレイアウト（src/app/layout.tsx）に加えて適用され、
 * dev-preview/ 配下にのみ Noto Sans JP を読み込む。
 *
 * ## なぜ専用 layout を使うか
 * - globals.css に @import を書くと全ページに副作用が及ぶ（cycle-170 T-03 Rev1 Blocker B1 の再発防止）
 * - next/font/google を dev-preview/ 専用 layout に限定することで副作用を完全に閉じ込める
 * - src/app/layout.tsx（ルートレイアウト）は一切変更しない
 *
 * ## 検索エンジン対応
 * このレイアウト配下のページは page.tsx で noindex/nofollow を設定する。
 * robots.ts の disallow と sitemap.ts への非掲載と合わせて三層で遮断する。
 */

import type { ReactNode } from "react";
import { Noto_Sans_JP } from "next/font/google";
import styles from "./layout.module.css";

const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  // CSS 変数として注入する（dev-preview/ スコープのみ）
  variable: "--dev-font-noto",
  display: "swap",
});

export default function DevPreviewLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className={`${notoSansJP.variable} ${styles.devRoot}`}>{children}</div>
  );
}
