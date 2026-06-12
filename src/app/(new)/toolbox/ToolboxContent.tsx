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
 * - ページ冒頭の「プリセットから始める」で、場面別の構成（toolbox-presets.ts）へ
 *   ワンアクションで切り替える（オンボーディング動線）。手作業で整えた構成を
 *   上書きするときだけインライン確認を挟む（誤クリック1回での黙った消去を防ぐ。
 *   判定は isHandCraftedConfig に委譲）
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
 * ## 並び順・表示モデル
 *
 * - デフォルト構成（全39枚・未カスタマイズ）のときだけ、39枚の一覧性のための
 *   暫定整理としてカテゴリ見出し付きセクションで描画する。
 * - それ以外の構成（プリセット適用後・手作業構成とも）は、カテゴリ見出しなしの
 *   単一グリッドで itemIds の順序どおりに描画する。プリセットの並びは内部分類
 *   ではなく「来訪者が最初に目にする順」として設計されているため、内部
 *   タクソノミの見出しでグループ化し直さない（あなたの道具箱はあなたの並び）。
 * - 「追加」は末尾に足す。非デフォルト構成の並びはカタログ順と無関係で、
 *   途中への挿入位置に自然な根拠がないため（デフォルト構成は全39枚なので、
 *   追加は常に非デフォルト構成への操作になる）。
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
  findAppliedPreset,
  isHandCraftedConfig,
  sameItemIds,
  TOOLBOX_PRESETS,
  type ToolboxPreset,
} from "./toolbox-presets";
import {
  clearToolboxItems,
  loadToolboxItems,
  saveToolboxItems,
} from "./toolbox-storage";
import styles from "./ToolboxContent.module.css";

export default function ToolboxContent() {
  // SSR/初回レンダーは常にデフォルト構成（hydration mismatch の構造的排除）
  const [itemIds, setItemIds] = useState<readonly string[]>(
    DEFAULT_TOOLBOX_ITEM_IDS,
  );

  // インライン上書き確認の対象プリセット id（null = 確認なし）。
  // 手作業で整えた構成にプリセットを重ねるときだけセットされる
  const [confirmingPresetId, setConfirmingPresetId] = useState<string | null>(
    null,
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

  /**
   * 構成を更新して localStorage に保存する（プリセット適用・追加・削除の共通処理）。
   * 構成が変わると表示中の上書き確認は前提（変更前の構成）を失うため、必ず閉じる。
   */
  function applyItems(next: readonly string[]): void {
    setConfirmingPresetId(null);
    setItemIds(next);
    saveToolboxItems(next);
  }

  function handleRemove(id: string): void {
    applyItems(itemIds.filter((itemId) => itemId !== id));
  }

  function handleAdd(id: string): void {
    // 末尾に追加する（理由は冒頭「並び順・表示モデル」を参照）
    if (itemIds.includes(id)) return;
    applyItems([...itemIds, id]);
  }

  function handleReset(): void {
    // 保存構成をキーごと削除する理由は toolbox-storage.ts の clearToolboxItems を参照
    clearToolboxItems();
    setConfirmingPresetId(null);
    setItemIds(DEFAULT_TOOLBOX_ITEM_IDS);
  }

  /**
   * プリセット選択。デフォルト構成・適用済みプリセット（ワンアクションで
   * 復元できる構成）からは即時適用し、手作業で整えた構成（復元手段がない）
   * からはインライン確認を挟む。判定理由は toolbox-presets.ts を参照
   */
  function handlePresetSelect(preset: ToolboxPreset): void {
    if (isHandCraftedConfig(itemIds, DEFAULT_TOOLBOX_ITEM_IDS)) {
      setConfirmingPresetId(preset.id);
      return;
    }
    applyItems(preset.itemIds);
  }

  const isDefaultConfig = sameItemIds(itemIds, DEFAULT_TOOLBOX_ITEM_IDS);

  // 現在の構成と完全一致するプリセット（「適用中」表示用）。
  // SSR/初回レンダーはデフォルト構成のため必ず undefined になり hydration 安全
  const appliedPreset = findAppliedPreset(itemIds);
  const confirmingPreset =
    TOOLBOX_PRESETS.find((preset) => preset.id === confirmingPresetId) ?? null;

  // 道具箱にないカタログエントリ（=「タイルを追加」パネルの選択肢）
  const itemIdSet = new Set(itemIds);
  const availableEntries = TOOLBOX_CATALOG.filter(
    (entry) => !itemIdSet.has(entry.id),
  );

  // 現在の構成のエントリ（itemIds の順序を保つ）
  const orderedEntries = itemIds
    .map((id) => TOOLBOX_CATALOG_BY_ID.get(id))
    .filter((entry): entry is ToolboxCatalogEntry => entry !== undefined);

  // デフォルト構成のときだけカテゴリ見出しでグループ化する（理由は冒頭
  // 「並び順・表示モデル」を参照）。デフォルト構成はカタログ定義順のため、
  // カテゴリでまとめ直しても並び順は変わらない
  const sections = isDefaultConfig
    ? TOOLBOX_CATEGORY_ORDER.map((category) => ({
        category,
        entries: orderedEntries.filter((entry) => entry.category === category),
      })).filter((section) => section.entries.length > 0)
    : [];

  /** タイル1枚の描画（見出しあり/なしの両表示モードで共通） */
  function renderTileWrapper(entry: ToolboxCatalogEntry) {
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
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>道具箱プレビュー</h1>
        <p className={styles.description}>
          タイルを並べる道具箱のプレビューです。各タイルはこのページを離れずにその場で機能します。
          プリセットから使い始めて、「外す」と「追加」で気に入ったツールだけを残せます。構成はこのブラウザに保存され、次回訪問時も残ります。
          <br />
          <small className={styles.note}>
            （このページは開発プレビューです。プリセットの選択、タイルの追加・削除、構成の保存に対応済み。ドラッグでの並べ替えと正式公開は後続で追加予定）
          </small>
        </p>
      </div>

      {/* プリセット選択（オンボーディング動線）: 全39枚から1枚ずつ外さなくても、
          自分に近い場面の構成からワンアクションで使い始められる出発点。
          道具箱の手前に置くのは「使い始めの起点」だから。
          全39枚へ戻る経路は下の「最初の状態に戻す」に任せ、ここには並べない */}
      <section className={styles.presetSection}>
        <h2 className={styles.categoryHeading}>プリセットから始める</h2>
        <Panel as="div">
          <p className={styles.presetIntro}>
            使いたい場面に近いプリセットを選ぶと、道具箱がその構成に切り替わります。タイルはあとから1枚ずつ追加・削除できます。
          </p>
          <ul className={styles.presetList}>
            {TOOLBOX_PRESETS.map((preset) => (
              <li key={preset.id} className={styles.presetItem}>
                <span className={styles.presetLabel}>
                  <span className={styles.presetName}>
                    {preset.name}
                    <span className={styles.presetCount}>
                      {preset.itemIds.length}枚
                    </span>
                  </span>
                  <span className={styles.presetDescription}>
                    {preset.description}
                  </span>
                </span>
                {appliedPreset?.id === preset.id ? (
                  // 適用中のプリセットは再適用しても変化がないため、ボタンの
                  // 代わりに状態表示にする（--accent の塗りは使わない）
                  <span className={styles.presetApplied}>適用中</span>
                ) : (
                  <Button
                    onClick={() => handlePresetSelect(preset)}
                    aria-label={`プリセット「${preset.name}」を道具箱に適用`}
                  >
                    適用
                  </Button>
                )}
              </li>
            ))}
          </ul>
          {/* 手作業構成の上書き確認（モーダル・Undo は作らない制約下のインライン確認）。
              aria-live で確認文の出現を支援技術にも伝える */}
          <div aria-live="polite">
            {confirmingPreset && (
              <div className={styles.presetConfirm}>
                <p className={styles.presetConfirmMessage}>
                  いまの道具箱は手作業でカスタマイズした構成です。プリセット「
                  {confirmingPreset.name}
                  」を適用すると、いまの構成は失われます。
                </p>
                <div className={styles.presetConfirmActions}>
                  <Button
                    onClick={() => applyItems(confirmingPreset.itemIds)}
                    aria-label={`プリセット「${confirmingPreset.name}」を適用する`}
                  >
                    適用する
                  </Button>
                  <Button onClick={() => setConfirmingPresetId(null)}>
                    やめる
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Panel>
      </section>

      {/* 全タイルを外したときの空状態（プリセットと追加パネルへの導線を案内する） */}
      {orderedEntries.length === 0 && (
        <Panel as="div" className={styles.emptyPanel}>
          <p className={styles.emptyMessage}>
            道具箱が空です。上のプリセットを選ぶか、下の「タイルを追加」から好きなツールを道具箱に戻せます。
          </p>
        </Panel>
      )}

      {isDefaultConfig
        ? // デフォルト構成: 39枚の一覧性のためカテゴリ見出し付きで描画する
          sections.map((section) => (
            <section key={section.category} className={styles.category}>
              <h2 className={styles.categoryHeading}>{section.category}</h2>
              <div className={styles.grid}>
                {section.entries.map(renderTileWrapper)}
              </div>
            </section>
          ))
        : // プリセット適用後・手作業構成: 内部タクソノミの見出しを挟まず、
          // itemIds の順序（プリセットは設計どおりの並び）どおりに描画する
          orderedEntries.length > 0 && (
            <div className={styles.category}>
              <div className={styles.grid}>
                {orderedEntries.map(renderTileWrapper)}
              </div>
            </div>
          )}

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
