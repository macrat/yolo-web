"use client";

/**
 * ToolboxContent — 道具箱プレビューのインタラクティブ部分
 *
 * cycle-226 T-2: 生きたタイルを並べる本物の道具箱。
 * cycle-227 T-4: html-entity / base64 / fullwidth-converter の3タイルを追加統合。
 *
 * ## タイル配置（計9枚）
 *
 * - url-encode タイル × 3（full / encode / decode）
 * - html-entity タイル × 2（full / encode）
 * - base64 タイル × 2（full / encode）
 * - fullwidth-converter タイル × 2（full / toHalfwidth）
 *
 * 各タイルはこのページを離れずにその場で機能する（"use client" 自己完結）。
 *
 * ## タイル寸法（tile-grid.ts 規格: TILE_CELL_PX=128 / TILE_GAP_PX=8）
 *
 * calcTilePixels(cols, rows) = { width: 136*cols - 8, height: 136*rows - 8 }
 *
 * - FULL_TILE_SIZE: 4×4 = 536×536px
 *   → 方向トグルあり全タイルの full variant に使用
 * - VARIANT_TILE_SIZE_3x4: 3×4 = 400×536px
 *   → url-encode encode/decode（方向トグルなし・シンプルなコントロール）
 * - VARIANT_TILE_SIZE_4x4: 4×4 = 536×536px
 *   → html-entity encode / base64 encode（URL-safe トグルを含む）
 * - FULLWIDTH_TILE_SIZE: 4×5 = 536×672px
 *   → fullwidth-converter（checkbox3個＋textarea2つ。規格4行では高さ不足のため5行）
 *
 * 注: 規格に収まらない場合は機能を削らずに minHeight でオーバーフローを許容する。
 *
 * ## 重要: リンク/カードではない
 *
 * タイルは <Link> でも詳細ページへの誘導カードでもない。
 * 各タイルは "use client" の自己完結コンポーネントで、
 * この道具箱の中で直接入力・変換・コピーができる。
 */

import UrlEncodeTile from "@/tools/url-encode/UrlEncodeTile";
import HtmlEntityTile from "@/tools/html-entity/HtmlEntityTile";
import Base64Tile from "@/tools/base64/Base64Tile";
import FullwidthConverterTile from "@/tools/fullwidth-converter/FullwidthConverterTile";
import { calcTilePixels } from "@/tools/_constants/tile-grid";
import styles from "./ToolboxContent.module.css";

// タイル寸法を tile-grid.ts 規格から計算
const FULL_TILE_SIZE = calcTilePixels(4, 4); // 536 × 536 px: 全ツールの full variant
const VARIANT_TILE_SIZE_3x4 = calcTilePixels(3, 4); // 400 × 536 px: url-encode encode/decode
const VARIANT_TILE_SIZE_4x4 = calcTilePixels(4, 4); // 536 × 536 px: html-entity encode / base64 encode
const FULLWIDTH_TILE_SIZE = calcTilePixels(4, 5); // 536 × 672 px: fullwidth（checkbox3個で高さが増す）

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
        {/* ===== url-encode タイル ===== */}

        {/* url-encode (full): 方向トグル（エンコード/デコード切り替え）あり */}
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

        {/* url-encode (encode): エンコード固定、方向トグル非表示 */}
        <div
          className={styles.tileWrapper}
          style={{
            maxWidth: VARIANT_TILE_SIZE_3x4.width,
            minHeight: VARIANT_TILE_SIZE_3x4.height,
          }}
        >
          <UrlEncodeTile
            variant="encode"
            as="div"
            className={styles.liveTile}
          />
        </div>

        {/* url-encode (decode): デコード固定、方向トグル非表示 */}
        <div
          className={styles.tileWrapper}
          style={{
            maxWidth: VARIANT_TILE_SIZE_3x4.width,
            minHeight: VARIANT_TILE_SIZE_3x4.height,
          }}
        >
          <UrlEncodeTile
            variant="decode"
            as="div"
            className={styles.liveTile}
          />
        </div>

        {/* ===== html-entity タイル ===== */}

        {/* html-entity (full): 方向トグルあり */}
        <div
          className={styles.tileWrapper}
          style={{
            maxWidth: FULL_TILE_SIZE.width,
            minHeight: FULL_TILE_SIZE.height,
          }}
        >
          <HtmlEntityTile variant="full" as="div" className={styles.liveTile} />
        </div>

        {/* html-entity (encode): HTMLエンティティへのエンコード固定 */}
        <div
          className={styles.tileWrapper}
          style={{
            maxWidth: VARIANT_TILE_SIZE_4x4.width,
            minHeight: VARIANT_TILE_SIZE_4x4.height,
          }}
        >
          <HtmlEntityTile
            variant="encode"
            as="div"
            className={styles.liveTile}
          />
        </div>

        {/* ===== base64 タイル ===== */}

        {/* base64 (full): 方向トグルあり・URL-safe トグルあり（encode 時） */}
        <div
          className={styles.tileWrapper}
          style={{
            maxWidth: FULL_TILE_SIZE.width,
            minHeight: FULL_TILE_SIZE.height,
          }}
        >
          <Base64Tile variant="full" as="div" className={styles.liveTile} />
        </div>

        {/* base64 (encode): エンコード固定・URL-safe トグルあり */}
        <div
          className={styles.tileWrapper}
          style={{
            maxWidth: VARIANT_TILE_SIZE_4x4.width,
            minHeight: VARIANT_TILE_SIZE_4x4.height,
          }}
        >
          <Base64Tile variant="encode" as="div" className={styles.liveTile} />
        </div>

        {/* ===== fullwidth-converter タイル ===== */}

        {/* fullwidth-converter (full): 方向トグルあり・変換対象 checkbox 3個あり */}
        <div
          className={styles.tileWrapper}
          style={{
            maxWidth: FULLWIDTH_TILE_SIZE.width,
            minHeight: FULLWIDTH_TILE_SIZE.height,
          }}
        >
          <FullwidthConverterTile
            variant="full"
            as="div"
            className={styles.liveTile}
          />
        </div>

        {/* fullwidth-converter (toHalfwidth): 全角→半角固定・変換対象 checkbox 3個あり */}
        <div
          className={styles.tileWrapper}
          style={{
            maxWidth: FULLWIDTH_TILE_SIZE.width,
            minHeight: FULLWIDTH_TILE_SIZE.height,
          }}
        >
          <FullwidthConverterTile
            variant="toHalfwidth"
            as="div"
            className={styles.liveTile}
          />
        </div>
      </div>
    </div>
  );
}
