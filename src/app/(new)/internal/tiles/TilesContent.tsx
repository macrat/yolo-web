"use client";

/**
 * TilesContent — /internal/tiles 検証ページのクライアントコンポーネント
 *
 * 責務（tile-and-detail-design.md §7 / cycle-193.md 屋台骨第 4 項）:
 * - keigo-reference 用 1 軽量版タイルが Panel 内で破綻なく描画できることの単体確認
 * - getTileComponent("keigo-reference") 経由でタイルを描画
 *
 * スコープ外（Phase 9 / B-336 の責務）:
 * - CSS Grid サイズ規格（large=2×2 等）の検証
 * - ダッシュボード本体グリッドの DnD 検証
 * - 複数タイル並列の DnD 検証
 * - dnd-kit 互換性検証（Phase 9 着手時に本格実施）
 *
 * Tile.tsx が dynamic({ ssr: false }) でロードされるため、
 * Suspense でラップして読み込み中の表示を制御する。
 */

import { Suspense } from "react";
import { getTileComponent } from "@/lib/toolbox/tile-loader";
import styles from "./page.module.css";

/**
 * keigo-reference タイルのローダー（dynamic({ ssr: false }) 経由）。
 * Tile 内部の .container が container-type: inline-size を持つため、
 * @container クエリ（280px / 300px 閾値）はタイル自身の container を基準に動作する。
 */
const KeigoReferenceTile = getTileComponent("keigo-reference");

export default function TilesContent() {
  return (
    <div className={styles.container}>
      <h1 className={styles.pageTitle}>内部検証ページ: タイル単体表示</h1>
      <p className={styles.description}>
        このページは <code>keigo-reference</code> 軽量版タイルが Panel
        内で破綻なく描画できることを確認するための内部検証ページです。
        来訪者には届きません（robots: noindex）。
      </p>

      {/*
       * 検証セクション: keigo-reference 軽量版タイル
       *
       * 検証項目（tile-and-detail-design.md §7 / cycle-193.md T-D Done 条件）:
       * - w360 viewport で横はみ出しゼロ
       * - フォーカス可視性（focus-visible でアウトライン表示）
       * - タップターゲット 44px（Button 本体達成済 = 案 10-α）
       * - Panel 内に収まること
       *
       * TOP_N=8 は暫定値（Tile.tsx L39）。T-視覚回帰での実機計測で確定する。
       */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>keigo-reference 軽量版タイル</h2>
        <p className={styles.sectionNote}>
          w360 横はみ出しゼロ / フォーカス可視性 / タップターゲット 44px
          を確認する。
        </p>

        {/*
         * tileWrapper: w360 相当の表示幅を再現する外側ラッパー。
         * Tile 本体の .container が container-type を持つため、
         * このラッパーへの container-type 追加は不要（I-1 対応）。
         * data-testid: T-視覚回帰の Playwright スクリプトが安定したセレクタで
         * タイル wrapper を取得できるようにする（I-2 対応）。
         */}
        <div
          className={styles.tileWrapper}
          data-testid="keigo-reference-tile-wrapper"
        >
          {/*
           * Suspense fallback: dynamic({ ssr: false }) の読み込み中表示。
           * FallbackTile（tile-loader.ts）は「未実装 slug のフォールバック表示」
           * であり Suspense fallback の用途とは異なるため、シンプルなテキストを使用。
           */}
          <Suspense
            fallback={<div className={styles.loading}>読み込み中...</div>}
          >
            {/*
             * slug prop: TileComponentProps の型契約上必須。
             * KeigoReferenceTile（Tile.tsx）では slug は未使用だが、
             * tile-loader.ts の型契約を満たすために渡す。
             */}
            <KeigoReferenceTile slug="keigo-reference" />
          </Suspense>
        </div>
      </section>
    </div>
  );
}
