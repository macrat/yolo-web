"use client";

/**
 * ToolboxPreviewClient — /toolbox-preview のクライアント側コンポーネント
 *
 * ToolboxShell を dynamic({ ssr: false }) で配置する。
 * useToolboxConfig フックが SSR 側で throw するため、
 * ssr: false の dynamic import でラップして CSR 専用にする。
 *
 * C-5 v10/v11 仕様:
 * - SSR 段階: dynamic の loading prop（SkeletonGrid）が静的 HTML として出力される
 * - CSR 段階: ToolboxShell が hydrate されて FallbackTile + 編集 UI が表示される
 *
 * SSR skeleton の切り替え設計:
 * - Next.js の dynamic() に loading prop を渡すと、SSR 時に loading の内容が HTML に含まれる
 * - ssr: false の場合でも loading は SSR 時に描画される（Next.js の仕様）
 * - ToolboxShell のチャンクがブラウザでロード完了すると、loading が消えて ToolboxShell に切り替わる
 * - これにより SkeletonGrid → ToolboxShell のクリーンな切り替えが実現する
 */

import dynamic from "next/dynamic";
import styles from "./page.module.css";

/**
 * SSR skeleton — ToolboxShell が CSR で hydrate される前に表示するプレースホルダー。
 *
 * タイル枠だけのプレースホルダー（数個程度、配置構造のヒント）。
 * シマー（pulse animation）はなし、静的なグレー単色矩形（仕様: 瞬間 1 / C-5 v10）。
 * Layout Shift を最小化するためにタイル枠のサイズを確定させる。
 * aria-hidden で SR から隠す（ToolboxShell が hydrate 後に SR 向け情報を提供する）。
 */
function SkeletonGrid() {
  // 6 個のスケルトンタイルでグリッド構造を示す（数個程度、配置構造のヒント）
  const skeletonCount = 6;
  return (
    <div className={styles.skeletonGrid} aria-hidden="true">
      {Array.from({ length: skeletonCount }, (_, i) => (
        <div key={i} className={styles.skeletonTile} />
      ))}
    </div>
  );
}

/** ToolboxShell を CSR 専用で動的ロードする（useToolboxConfig の SSR throw を尊重） */
const ToolboxShellDynamic = dynamic(
  () => import("@/lib/toolbox/ToolboxShell").then((m) => m.ToolboxShell),
  {
    ssr: false,
    // loading は SSR 時および CSR チャンクロード完了前に表示される skeleton
    loading: () => <SkeletonGrid />,
  },
);

export default function ToolboxPreviewClient() {
  return <ToolboxShellDynamic />;
}
