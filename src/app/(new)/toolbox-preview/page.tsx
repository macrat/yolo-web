import type { Metadata } from "next";
import ToolboxPreviewClient from "./ToolboxPreviewClient";
import styles from "./page.module.css";

/**
 * /toolbox-preview — 道具箱機能の内部検証ルート（C-5 v10/v11）
 *
 * 来訪者向けの公開はしない。内部検証 / 開発者確認 / Phase 7 への基盤の橋渡しに使う。
 * - noindex / nofollow を設定し、クローラーが本ルートを辿らないようにする
 * - sitemap.xml に含まない
 * - robots.txt の disallow には追加しない（noindex meta タグで制御）
 * - Header / Footer のナビゲーションに追加しない
 *
 * SSR / CSR 設計:
 * - SSR 段階: ToolboxPreviewClient が SSR 時の loading（SkeletonGrid）を描画。
 *   ToolboxShell は ssr: false のため SSR に含まれない。
 * - CSR 段階: ToolboxShell が hydrate されて FallbackTile + 編集 UI が表示される。
 *   SkeletonGrid（loading prop）は ToolboxShell ロード完了後に自動的に消える。
 */
export const metadata: Metadata = {
  title: "道具箱（検証用） | yolos.net",
  description: "道具箱機能の内部検証ページ。",
  robots: { index: false, follow: false },
};

export default function ToolboxPreviewPage() {
  return (
    <div className={styles.pageWrapper}>
      <h1 className={styles.pageTitle}>道具箱（検証用）</h1>
      {/*
       * ToolboxPreviewClient:
       * - SSR 時: dynamic の loading prop（SkeletonGrid）が静的 HTML として出力される
       * - CSR 時: ToolboxShell が hydrate された後、SkeletonGrid が自動的に消え
       *   ToolboxShell 本体が表示される（dynamic の loading → コンポーネント本体への切り替え）
       */}
      <ToolboxPreviewClient />
    </div>
  );
}
