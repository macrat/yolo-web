"use client";

/**
 * ToolboxContent — 道具箱プレビューのインタラクティブ部分
 *
 * cycle-226 T-2: 生きたタイルを並べる本物の道具箱。
 *
 * ## タイル配置
 *
 * - url-encode タイル × 3（full / encode / decode）: 生きたインスタンス。
 *   その場で入力・変換・コピーができる。ページ遷移なし。
 * - ダミータイル × 2: 本物と同じ Panel ルート・同じ寸法枠だが中身はプレースホルダ。
 *   後続サイクルで本物のタイルに差し替える枠。
 *
 * ## タイル寸法（tile-grid.ts 規格: TILE_CELL_PX=128 / TILE_GAP_PX=8）
 *
 * calcTilePixels(cols, rows) = { width: 136*cols - 8, height: 136*rows - 8 }
 *
 * - full タイル（方向トグルあり）: 4列 × 4行 = 536 × 536 px
 *   → 内部幅 488px (padding 24px×2 引き) で controls (SegmentedControl + Select) が
 *     横並びに収まり、textarea rows=5 × 2 が破綻なく表示される。
 * - encode / decode タイル（方向トグルなし）: 3列 × 4行 = 400 × 536 px
 *   → 内部幅 352px でモード Select のみのシンプルな controls が収まる。
 * - ダミータイル: 2列 × 2行 = 264 × 264 px
 *
 * 注: 128px 離散規格に収まらない場合（タイル高さ 536px 超になった場合）は、
 * タイルの機能を削らずに min-height でオーバーフローを許容する。
 * 規格見直しの必要性は T-4 実機確認後に判断する。
 *
 * ## 重要: リンク/カードではない
 *
 * タイルは <Link> でも詳細ページへの誘導カードでもない。
 * UrlEncodeTile は "use client" の自己完結コンポーネントで、
 * この道具箱の中で直接入力・変換・コピーができる。
 */

import Panel from "@/components/Panel";
import UrlEncodeTile from "@/tools/url-encode/UrlEncodeTile";
import { calcTilePixels } from "@/tools/_constants/tile-grid";
import styles from "./ToolboxContent.module.css";

// タイル寸法を tile-grid.ts 規格から計算
// url-encode タイル（textarea2つ＋コントロール）の実測推定:
//   内部高さ ≈ 412px + padding 48px = 460px → 4行 (536px) で収まる
//   full: 方向トグルあり → 4列幅で controls が横並びに収まる
//   encode/decode: 方向トグルなし → 3列幅でも収まる
const FULL_TILE_SIZE = calcTilePixels(4, 4); // 536 × 536 px
const VARIANT_TILE_SIZE = calcTilePixels(3, 4); // 400 × 536 px
const DUMMY_TILE_SIZE = calcTilePixels(2, 2); // 264 × 264 px

export default function ToolboxContent() {
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>道具箱プレビュー</h1>
        <p className={styles.description}>
          タイルを並べる道具箱のプレビューです。各タイルはこのページを離れずにその場で機能します。
          <br />
          <small className={styles.note}>
            （このページは開発プレビューです。DnD・永続化・公開は後続で追加予定）
          </small>
        </p>
      </div>

      {/* 道具箱グリッド: タイルを横並びに折り返して配置 */}
      <div className={styles.grid}>
        {/* ----- 生きたタイル: url-encode (full) ----- */}
        {/* variant="full": 方向トグル（エンコード/デコード切り替え）あり */}
        {/* maxWidth: デスクトップでは tile-grid 規格幅を上限に、狭い画面では親に収まる */}
        <div
          className={styles.tileWrapper}
          style={{
            maxWidth: FULL_TILE_SIZE.width,
            minHeight: FULL_TILE_SIZE.height,
          }}
        >
          <UrlEncodeTile variant="full" as="div" className={styles.liveTile} />
        </div>

        {/* ----- 生きたタイル: url-encode (encode) ----- */}
        {/* variant="encode": エンコード固定、方向トグル非表示 */}
        <div
          className={styles.tileWrapper}
          style={{
            maxWidth: VARIANT_TILE_SIZE.width,
            minHeight: VARIANT_TILE_SIZE.height,
          }}
        >
          <UrlEncodeTile
            variant="encode"
            as="div"
            className={styles.liveTile}
          />
        </div>

        {/* ----- 生きたタイル: url-encode (decode) ----- */}
        {/* variant="decode": デコード固定、方向トグル非表示 */}
        <div
          className={styles.tileWrapper}
          style={{
            maxWidth: VARIANT_TILE_SIZE.width,
            minHeight: VARIANT_TILE_SIZE.height,
          }}
        >
          <UrlEncodeTile
            variant="decode"
            as="div"
            className={styles.liveTile}
          />
        </div>

        {/* ----- ダミータイル × 2: 後続サイクルで本物に差し替える枠 ----- */}
        {/* Panel ルート・同じ寸法枠・プレースホルダ中身。機能なし（正常）。 */}
        <div
          className={styles.tileWrapper}
          style={{
            maxWidth: DUMMY_TILE_SIZE.width,
            minHeight: DUMMY_TILE_SIZE.height,
          }}
        >
          <Panel as="div" className={styles.dummyTile}>
            <span className={styles.dummyLabel}>（準備中のタイル）</span>
          </Panel>
        </div>

        <div
          className={styles.tileWrapper}
          style={{
            maxWidth: DUMMY_TILE_SIZE.width,
            minHeight: DUMMY_TILE_SIZE.height,
          }}
        >
          <Panel as="div" className={styles.dummyTile}>
            <span className={styles.dummyLabel}>（準備中のタイル）</span>
          </Panel>
        </div>
      </div>
    </div>
  );
}
