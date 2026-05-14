"use client";

import Panel from "@/components/Panel";
import type { TileVariant } from "@/lib/toolbox/tile-variant-types";
import styles from "./page.module.css";

/**
 * T-C-検証場所（cycle-191）: タイルバリアント検証ページのコンテンツ。
 *
 * 本サイクル時点では Tile.tsx（実コンポーネント）が存在しないため、
 * プレースホルダ表示で各 TileVariant の枠組みが動くことを確認する。
 * T-D-実装 で keigo-reference の small + medium タイルが実装されたら、
 * このページから表示できるようにする（loaderId ベースでレジストリ参照）。
 *
 * ## バリアント登録の枠組み
 *
 * TILE_REGISTRY に TileVariant[] を登録することで、このページに
 * 新しいバリアントが自動で追加される。各エントリに slug を付与して
 * コンテンツ単位でグルーピングして表示する。
 */

/** バリアント登録エントリ（コンテンツ slug + バリアントリスト）。
 * T-D-実装 で keigo-reference の Tile.tsx が完成したら、この registry に追加する。 */
interface TileRegistryEntry {
  /** コンテンツの slug（例: "keigo-reference"） */
  slug: string;
  /** コンテンツの表示名（例: "敬語早見表"） */
  displayName: string;
  /** このコンテンツのバリアント一覧 */
  variants: TileVariant[];
}

/**
 * タイルレジストリ。
 *
 * 現状（T-C-検証場所 時点）: T-C-型契約 で確定したサンプルデータのみ。
 * Tile コンポーネント本体は T-D-実装 で追加予定。
 * T-D-実装 完了後は loaderId に対応する実コンポーネントをここで lazy load する。
 *
 * 追加方法: 以下の TILE_REGISTRY 配列に TileRegistryEntry を push する。
 */
const TILE_REGISTRY: TileRegistryEntry[] = [
  {
    slug: "keigo-reference",
    displayName: "敬語早見表",
    variants: [
      {
        variantId: "keigo-reference-large-full",
        gridSpan: { cols: 2, rows: 2 },
        tileDescription:
          "敬語早見表の全機能（検索・カテゴリフィルター・例文展開・誤用パターン）",
        loaderId: "keigo-reference-large-full",
        isDefaultVariant: false,
      },
      {
        variantId: "keigo-reference-medium-search",
        gridSpan: { cols: 2, rows: 1 },
        tileDescription:
          "検索と候補一覧のみ。詳細例文は詳細ページで確認できます",
        loaderId: "keigo-reference-medium-search",
        isDefaultVariant: true,
      },
      {
        variantId: "keigo-reference-medium-category-business",
        gridSpan: { cols: 2, rows: 1 },
        tileDescription: "ビジネス敬語に特化した候補一覧（カテゴリ固定）",
        loaderId: "keigo-reference-medium-category-business",
        isDefaultVariant: false,
      },
      {
        variantId: "keigo-reference-medium-mistakes",
        gridSpan: { cols: 2, rows: 1 },
        tileDescription: "よくある敬語の間違いパターン一覧",
        loaderId: "keigo-reference-medium-mistakes",
        isDefaultVariant: false,
      },
      {
        variantId: "keigo-reference-small-daily-pick",
        gridSpan: { cols: 1, rows: 1 },
        tileDescription: "今日の敬語 1 件を毎日表示",
        loaderId: "keigo-reference-small-daily-pick",
        isDefaultVariant: false,
      },
      {
        variantId: "keigo-reference-small-quick-search",
        gridSpan: { cols: 1, rows: 1 },
        tileDescription: "検索入力欄のみ。結果は詳細ページへ",
        loaderId: "keigo-reference-small-quick-search",
        isDefaultVariant: false,
      },
    ],
  },
  {
    slug: "sql-formatter",
    displayName: "SQL フォーマッター",
    variants: [
      {
        variantId: "sql-formatter-large-full",
        gridSpan: { cols: 2, rows: 2 },
        tileDescription:
          "SQL フォーマッターの全機能（入力・整形・圧縮・オプション・コピー）",
        loaderId: "sql-formatter-large-full",
        isDefaultVariant: false,
      },
      {
        variantId: "sql-formatter-medium-format",
        gridSpan: { cols: 2, rows: 1 },
        tileDescription: "SQL を整形してクリップボードにコピー",
        loaderId: "sql-formatter-medium-format",
        isDefaultVariant: true,
      },
      {
        variantId: "sql-formatter-medium-minify",
        gridSpan: { cols: 2, rows: 1 },
        tileDescription: "SQL を 1 行に圧縮してコピー",
        loaderId: "sql-formatter-medium-minify",
        isDefaultVariant: false,
      },
    ],
  },
  {
    slug: "char-count",
    displayName: "文字カウンター",
    variants: [
      {
        variantId: "char-count-large-full",
        gridSpan: { cols: 2, rows: 2 },
        tileDescription:
          "文字数カウンターの全機能（文字数・バイト数・単語数・行数・段落数）",
        loaderId: "char-count-large-full",
        isDefaultVariant: false,
      },
      {
        variantId: "char-count-medium-text-volume",
        gridSpan: { cols: 2, rows: 1 },
        tileDescription: "文字数・バイト数をリアルタイム表示",
        loaderId: "char-count-medium-text-volume",
        isDefaultVariant: false,
      },
      {
        variantId: "char-count-medium-text-structure",
        gridSpan: { cols: 2, rows: 1 },
        tileDescription: "単語数・行数・段落数をリアルタイム表示",
        loaderId: "char-count-medium-text-structure",
        isDefaultVariant: false,
      },
      {
        variantId: "char-count-small-char-only",
        gridSpan: { cols: 1, rows: 1 },
        tileDescription: "文字数のみをリアルタイム確認",
        loaderId: "char-count-small-char-only",
        isDefaultVariant: true,
      },
    ],
  },
];

/** gridSpan からサイズラベルを生成する（表示用）。 */
function getGridSpanLabel(gridSpan: TileVariant["gridSpan"]): string {
  if (gridSpan.cols === 1 && gridSpan.rows === 1) return "small (1×1)";
  if (gridSpan.cols === 2 && gridSpan.rows === 1) return "medium (2×1)";
  if (gridSpan.cols === 2 && gridSpan.rows === 2) return "large (2×2)";
  return `${gridSpan.cols}×${gridSpan.rows}`;
}

/** プレースホルダタイル — Tile コンポーネント本体が未実装の間、枠のみ表示する。
 * T-D-実装 完了後は loaderId に対応する実コンポーネントに置き換える。 */
function PlaceholderTile({ variant }: { variant: TileVariant }) {
  const spanLabel = getGridSpanLabel(variant.gridSpan);
  return (
    <div className={styles.placeholderTile}>
      <div className={styles.placeholderInner}>
        <div className={styles.placeholderBadge}>{spanLabel}</div>
        <div className={styles.placeholderLabel}>{variant.variantId}</div>
        <div className={styles.placeholderDescription}>
          {variant.tileDescription}
        </div>
        <div className={styles.placeholderMeta}>
          {variant.isDefaultVariant && (
            <span className={styles.defaultBadge}>デフォルト</span>
          )}
          <span className={styles.loaderIdLabel}>
            loaderId: {variant.loaderId}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function TilesPreviewContent() {
  return (
    <div className={styles.container}>
      {/* === ヘッダーセクション === */}
      <section className={styles.section}>
        <h1 className={styles.pageTitle}>タイル検証（開発者向け）</h1>
        <Panel as="div">
          <span className={styles.previewLabel}>概要</span>
          <div className={styles.notice}>
            <p>
              このページは <code>TileVariant</code>{" "}
              の各バリアントを単独レンダリングして検証するための開発者向けページ。
              <code>/storybook</code>{" "}
              は共通コンポーネント専用のため、コンテンツ固有のタイルはこちらで検証する。
            </p>
            <p>
              現状（T-C-検証場所 時点）: Tile
              コンポーネント本体（Tile.tsx）が未実装のため、
              プレースホルダ表示。T-D-実装 で keigo-reference の small + medium
              タイルが 追加されたら実コンポーネントを表示するよう更新する。
            </p>
          </div>

          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <div className={styles.infoLabel}>登録コンテンツ数</div>
              <div className={styles.infoValue}>{TILE_REGISTRY.length} 件</div>
            </div>
            <div className={styles.infoItem}>
              <div className={styles.infoLabel}>登録バリアント数</div>
              <div className={styles.infoValue}>
                {TILE_REGISTRY.reduce(
                  (sum, entry) => sum + entry.variants.length,
                  0,
                )}{" "}
                件
              </div>
            </div>
          </div>
        </Panel>
      </section>

      {/* === 各コンテンツのバリアント一覧 === */}
      {TILE_REGISTRY.map((entry) => (
        <section key={entry.slug} id={entry.slug} className={styles.section}>
          <h2 className={styles.sectionTitle}>
            {entry.displayName}
            <span className={styles.slugLabel}>{entry.slug}</span>
          </h2>
          <Panel as="div">
            <span className={styles.previewLabel}>
              Preview: {entry.displayName} タイル（{entry.variants.length}{" "}
              バリアント）
            </span>

            <div className={styles.variantGrid}>
              {entry.variants.map((variant) => (
                <PlaceholderTile key={variant.variantId} variant={variant} />
              ))}
            </div>
          </Panel>
        </section>
      ))}
    </div>
  );
}
