"use client";

/**
 * ToolboxContent — 道具箱プレビューのインタラクティブ部分
 *
 * cycle-228 T-31: 全34ツールの full variant 各1枚 +
 *   形ファミリー代表の固定 variant 5枚 = 合計39枚の生きたタイル。
 * cycle-230 T-3〜T-5: 中核機構（タイルの追加・削除＋構成の localStorage 永続化）。
 *   タイル一覧は toolbox-catalog.tsx（39エントリ）、永続化は toolbox-storage.ts。
 *
 * ## 来訪者ができること
 *
 * - 各タイルの「外す」で道具箱からタイルを外す
 * - ページ末尾の「タイルを追加」パネルで、外したタイルを道具箱に戻す
 * - 「最初の状態に戻す」でデフォルト構成（カタログ全39枚）に戻す
 * - 構成は localStorage に保存され、リロード・再訪問後も残る
 *
 * ## hydration 安全（PM 決定）
 *
 * SSR/初回レンダーは常にデフォルト構成を描画し、マウント後の useEffect で
 * 保存構成を適用する（hydration mismatch の構造的排除）。
 * 保存構成適用までの一瞬のデフォルト表示は許容。
 *
 * ## 並び順モデル（PM 決定の選択肢から builder が選定・テストで固定）
 *
 * 「追加されたタイルはカタログ定義順で当該カテゴリ位置に戻る」を採用。
 * 道具箱はカテゴリ見出しで整理されており、末尾追加だと追加タイルが
 * 自分のカテゴリから離れた場所に出てしまい不自然なため。
 * （DnD 並べ替えは後続サイクル。編集モード・モーダル・Undo は作らない）
 *
 * ## 重要: リンク/カードではない（cycle-175 の失敗を繰り返さない）
 *
 * タイルは <Link> でも詳細ページへの誘導カードでもない。
 * 各タイルは "use client" の自己完結コンポーネントで、
 * この道具箱の中で直接入力・変換・コピーができる。
 *
 * ## タイル寸法（tile-grid.ts 規格: TILE_CELL_PX=128 / TILE_GAP_PX=8）
 *
 * カタログはセル数（cols × rows）のみを保持し、px 換算は calcTilePixels に委譲。
 * maxWidth + width:100% でレスポンシブ（固定 width 禁止 = w360 横はみ出し防止）。
 * 規格に収まらない場合は機能を削らずに minHeight でオーバーフローを許容する。
 */

import { useEffect, useState } from "react";

import Button from "@/components/Button";
import Panel from "@/components/Panel";
import { calcTilePixels } from "@/tools/_constants/tile-grid";

import {
  DEFAULT_TOOLBOX_ITEM_IDS,
  TOOLBOX_CATALOG,
  TOOLBOX_CATALOG_BY_ID,
  TOOLBOX_CATALOG_IDS,
  TOOLBOX_CATEGORY_ORDER,
  type ToolboxCatalogEntry,
} from "./toolbox-catalog";
import {
  clearToolboxItems,
  loadToolboxItems,
  saveToolboxItems,
} from "./toolbox-storage";
import styles from "./ToolboxContent.module.css";

/** カタログ内の定義位置の索引（追加タイルを「当該カテゴリ位置」へ戻すために使う） */
const catalogIndexById: ReadonlyMap<string, number> = new Map(
  TOOLBOX_CATALOG.map((entry, index) => [entry.id, index]),
);

/** 2つの構成（順序付き id 配列）が同一かを判定する */
function sameItemIds(a: readonly string[], b: readonly string[]): boolean {
  return a.length === b.length && a.every((id, index) => id === b[index]);
}

/**
 * 追加するエントリをカタログ定義順の位置に挿入する。
 * 現在の並びの中で「カタログ上の定義位置が追加対象より後ろ」になる
 * 最初の要素の手前に入れることで、カテゴリのまとまりを保つ。
 */
function insertAtCatalogPosition(
  items: readonly string[],
  id: string,
): string[] {
  if (items.includes(id)) return [...items];
  const orderOf = (itemId: string): number =>
    catalogIndexById.get(itemId) ?? Number.MAX_SAFE_INTEGER;
  const insertIndex = items.findIndex(
    (itemId) => orderOf(itemId) > orderOf(id),
  );
  if (insertIndex === -1) return [...items, id];
  return [...items.slice(0, insertIndex), id, ...items.slice(insertIndex)];
}

export default function ToolboxContent() {
  // SSR/初回レンダーは常にデフォルト構成（hydration mismatch の構造的排除）
  const [itemIds, setItemIds] = useState<readonly string[]>(
    DEFAULT_TOOLBOX_ITEM_IDS,
  );

  // マウント後に保存構成を適用する。保存構成がデフォルトと同一なら同じ参照を
  // 返して再レンダーを回避する（39タイルの再レンダーは重い）。
  // hydration 安全パターン: SSR/初回レンダーは常にデフォルト構成を描画し、
  // localStorage はマウント後の effect でのみ読む（unix-timestamp 等と同じ作法）
  useEffect(() => {
    const stored = loadToolboxItems(
      DEFAULT_TOOLBOX_ITEM_IDS,
      TOOLBOX_CATALOG_IDS,
    );
    // eslint-disable-next-line react-hooks/set-state-in-effect -- localStorage はマウント後にしか読めないため、ここでの setState が唯一の適用点
    setItemIds((current) => (sameItemIds(stored, current) ? current : stored));
  }, []);

  /** 構成を更新して localStorage に保存する（追加・削除の共通処理） */
  function applyItems(next: readonly string[]): void {
    setItemIds(next);
    saveToolboxItems(next);
  }

  function handleRemove(id: string): void {
    applyItems(itemIds.filter((itemId) => itemId !== id));
  }

  function handleAdd(id: string): void {
    applyItems(insertAtCatalogPosition(itemIds, id));
  }

  function handleReset(): void {
    // 保存構成をキーごと削除する理由は toolbox-storage.ts の clearToolboxItems を参照
    clearToolboxItems();
    setItemIds(DEFAULT_TOOLBOX_ITEM_IDS);
  }

  const isDefaultConfig = sameItemIds(itemIds, DEFAULT_TOOLBOX_ITEM_IDS);

  // 道具箱にないカタログエントリ（=「タイルを追加」パネルの選択肢）
  const itemIdSet = new Set(itemIds);
  const availableEntries = TOOLBOX_CATALOG.filter(
    (entry) => !itemIdSet.has(entry.id),
  );

  // itemIds（順序付き）をカテゴリ見出しの下にグループ化する。
  // 空になったカテゴリは見出しごと表示しない。
  const sections = TOOLBOX_CATEGORY_ORDER.map((category) => ({
    category,
    entries: itemIds
      .map((id) => TOOLBOX_CATALOG_BY_ID.get(id))
      .filter(
        (entry): entry is ToolboxCatalogEntry =>
          entry !== undefined && entry.category === category,
      ),
  })).filter((section) => section.entries.length > 0);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>道具箱プレビュー</h1>
        <p className={styles.description}>
          タイルを並べる道具箱のプレビューです。各タイルはこのページを離れずにその場で機能します。
          「外す」と「追加」で気に入ったツールだけを残せます。構成はこのブラウザに保存され、次回訪問時も残ります。
          <br />
          <small className={styles.note}>
            （このページは開発プレビューです。タイルの追加・削除と構成の保存に対応済み。ドラッグでの並べ替えと正式公開は後続で追加予定）
          </small>
        </p>
      </div>

      {/* 全タイルを外したときの空状態（追加パネルへの導線を案内する） */}
      {sections.length === 0 && (
        <Panel as="div" className={styles.emptyPanel}>
          <p className={styles.emptyMessage}>
            道具箱が空です。下の「タイルを追加」から、好きなツールを道具箱に戻せます。
          </p>
        </Panel>
      )}

      {sections.map((section) => (
        <section key={section.category} className={styles.category}>
          <h2 className={styles.categoryHeading}>{section.category}</h2>
          <div className={styles.grid}>
            {section.entries.map((entry) => {
              const tilePx = calcTilePixels(entry.cols, entry.rows);
              return (
                <div
                  key={entry.id}
                  className={styles.tileWrapper}
                  style={{ maxWidth: tilePx.width, minHeight: tilePx.height }}
                >
                  {/* タイル上部の操作列。タイル本体（XxxTile）には手を入れない */}
                  <div className={styles.tileToolbar}>
                    <Button
                      onClick={() => handleRemove(entry.id)}
                      aria-label={`${entry.displayLabel}を道具箱から外す`}
                    >
                      外す
                    </Button>
                  </div>
                  {entry.renderTile(styles.liveTile)}
                </div>
              );
            })}
          </div>
        </section>
      ))}

      {/* タイルの追加・リセット（編集モード・モーダル・DnD は作らない） */}
      <section className={styles.manageSection}>
        <h2 className={styles.categoryHeading}>タイルを追加</h2>
        <Panel as="div">
          {availableEntries.length === 0 ? (
            <p className={styles.manageEmptyMessage}>
              すべてのタイルが道具箱に並んでいます。タイルの「外す」で外したものがここに表示され、いつでも戻せます。
            </p>
          ) : (
            <ul className={styles.availableList}>
              {availableEntries.map((entry) => (
                <li key={entry.id} className={styles.availableItem}>
                  <span className={styles.availableLabel}>
                    {entry.displayLabel}
                    <span className={styles.availableCategory}>
                      {entry.category}
                    </span>
                  </span>
                  <Button
                    onClick={() => handleAdd(entry.id)}
                    aria-label={`${entry.displayLabel}を道具箱に追加`}
                  >
                    追加
                  </Button>
                </li>
              ))}
            </ul>
          )}
          <div className={styles.resetRow}>
            <Button onClick={handleReset} disabled={isDefaultConfig}>
              最初の状態に戻す
            </Button>
            <span className={styles.resetNote}>
              道具箱をデフォルト構成（全{TOOLBOX_CATALOG.length}
              枚）に戻します。
            </span>
          </div>
        </Panel>
      </section>
    </div>
  );
}
