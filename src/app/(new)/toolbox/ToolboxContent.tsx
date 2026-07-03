"use client";

/**
 * ToolboxContent — 道具箱ページ（/toolbox）のインタラクティブ部分
 *
 * cycle-228 T-31: 全34ツールの full variant 各1枚 +
 *   形ファミリー代表の固定 variant 5枚 = 合計39枚の生きたタイル。
 * cycle-230 T-3〜T-5: 中核機構（タイルの追加・削除＋構成の localStorage 永続化）。
 *   タイル一覧は toolbox-catalog.tsx（39エントリ）、永続化は toolbox-storage.ts。
 * cycle-231: ペルソナ別プリセット5本（toolbox-presets.ts）と選択 UI。
 * cycle-232 T-3（Phase 10.3 本公開）: /toolbox プレビューからトップ `/` へ移設。
 *   デフォルト構成をカタログ全39枚から daily-life プリセット（6枚）へ変更。
 *   ページ見出し・サイト説明はトップページ（(new)/page.tsx）側が持つ。
 *
 * ## 来訪者ができること
 *
 * - 冒頭の「プリセットから始める」で、場面別の構成（toolbox-presets.ts）へ
 *   ワンアクションで切り替える（オンボーディング動線）。手作業で整えた構成を
 *   上書きするときだけインライン確認を挟む（誤クリック1回での黙った消去を防ぐ。
 *   判定は isHandCraftedConfig に委譲）
 * - 各タイルの「外す」で道具箱からタイルを外す
 * - 末尾の「タイルを追加」パネルで、カタログ全39枚から好きなタイルを加える
 * - 「最初の状態に戻す」でデフォルト構成（daily-life プリセット）に戻す
 * - 構成は localStorage に保存され、リロード・再訪問後も残る
 *
 * ## hydration 安全（PM 決定）
 *
 * SSR/初回レンダーは常にデフォルト構成を描画し、マウント後の useEffect で
 * 保存構成を適用する（hydration mismatch の構造的排除）。
 * 保存構成適用までの一瞬のデフォルト表示は許容。
 *
 * ## 並び順・表示モデル（cycle-232 T-3 で再整理）
 *
 * - どの構成も、カテゴリ見出しを挟まない単一グリッドで itemIds の順序
 *   どおりに描画する（あなたの道具箱はあなたの並び）。
 * - cycle-230/231 にあった「デフォルト構成（全39枚・完全一致）のときだけ
 *   カテゴリ見出し付き」の分岐は撤去した。あの見出しは「39枚の一覧性の
 *   ための暫定整理」であり、デフォルトが daily-life 6枚になった時点で
 *   前提を失った。全39枚の構成も来訪者が手作業で組んだ構成のひとつに
 *   すぎず、内部タクソノミの見出しでグループ化し直さない。カタログ全体の
 *   見渡しは「タイルを追加」パネル（カテゴリ表記付き）と /tools 一覧が担う。
 * - 「追加」は末尾に足す。構成の並びはカタログ順と無関係で、途中への
 *   挿入位置に自然な根拠がないため。
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
 *
 * ## GA4 計測（cycle-234。設計は docs/cycles/cycle-234.md「作業内容」）
 *
 * - 構成操作: 追加 / 外す / リセット / プリセット適用をハンドラ内で送信する。
 *   プリセットはインライン確認を経て**実際に適用されたときだけ**送る
 *   （確認を出しただけ・「やめる」では送らない）。
 * - タイル実利用（tile_first_interaction）: タイル本体だけを包む capture
 *   リスナーで、マウント中タイルごとに最初の 1 回だけ送信する。
 *   39 タイルの実装（src/tools 配下）には一切手を入れない。
 * - item_id はツール slug（entry.slug）・variant は別パラメータ（entry.variant）。
 *   詳細ページ側（surface:"detail"）との比較や trackShare との JOIN を slug
 *   軸で成立させるため、variant 込みの entry.id は GA に送らない。
 * - 入力内容・出力内容は一切送らない（プライバシー方針）。
 */

import { useEffect, useRef, useState } from "react";

import Button from "@/components/Button";
import Panel from "@/components/Panel";
import {
  trackTileFirstInteraction,
  trackToolboxPresetSelect,
  trackToolboxReset,
  trackToolboxTileAdd,
  trackToolboxTileRemove,
} from "@/lib/analytics";
import { calcTilePixels } from "@/tools/_constants/tile-grid";

import {
  TOOLBOX_CATALOG,
  TOOLBOX_CATALOG_BY_ID,
  TOOLBOX_CATALOG_IDS,
  type ToolboxCatalogEntry,
} from "./toolbox-catalog";
import {
  DEFAULT_TOOLBOX_ITEM_IDS,
  DEFAULT_TOOLBOX_PRESET,
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

  // tile_first_interaction 送信済みのカタログエントリ id（entry.id 単位）。
  // 「マウント中 1 回だけ」の記録を ToolboxContent の ref に置くことで、
  // 外す→戻す等でタイル要素が unmount/remount されても訪問中の重複送信を防ぐ
  // （モジュールスコープに置かないのは、ページ再マウント = 新しい訪問観測で
  // 再送するのが意図どおりのため）
  const firstInteractionSentIds = useRef<Set<string>>(new Set());

  // マウント後に保存構成を適用する。保存構成がデフォルトと同一なら同じ参照を
  // 返して再レンダーを回避する。
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
    const entry = TOOLBOX_CATALOG_BY_ID.get(id);
    if (entry) {
      trackToolboxTileRemove({ item_id: entry.slug, variant: entry.variant });
    }
  }

  function handleAdd(id: string): void {
    // 末尾に追加する（理由は冒頭「並び順・表示モデル」を参照）
    if (itemIds.includes(id)) return;
    applyItems([...itemIds, id]);
    const entry = TOOLBOX_CATALOG_BY_ID.get(id);
    if (entry) {
      trackToolboxTileAdd({ item_id: entry.slug, variant: entry.variant });
    }
  }

  function handleReset(): void {
    // 保存構成をキーごと削除する理由は toolbox-storage.ts の clearToolboxItems を参照
    clearToolboxItems();
    setConfirmingPresetId(null);
    setItemIds(DEFAULT_TOOLBOX_ITEM_IDS);
    trackToolboxReset();
  }

  /**
   * プリセットを実際に適用する（即時適用とインライン確認後の「適用する」の
   * 共通経路）。toolbox_preset_select は適用が実行されたここでだけ送る
   * （確認を出しただけ・「やめる」では送らない。設計は cycle-234 T-1）
   */
  function applyPreset(preset: ToolboxPreset): void {
    applyItems(preset.itemIds);
    trackToolboxPresetSelect({ preset_id: preset.id });
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
    applyPreset(preset);
  }

  /**
   * タイル実利用（tile_first_interaction）。マウント中、同一タイル
   * （entry 単位）につき最初のポインタ／キーボード操作で 1 回だけ送る。
   * 入力内容は送らない（操作があった事実だけを観測する）
   */
  function handleTileFirstInteraction(entry: ToolboxCatalogEntry): void {
    if (firstInteractionSentIds.current.has(entry.id)) return;
    firstInteractionSentIds.current.add(entry.id);
    trackTileFirstInteraction({
      item_id: entry.slug,
      surface: "toolbox",
      variant: entry.variant,
    });
  }

  const isDefaultConfig = sameItemIds(itemIds, DEFAULT_TOOLBOX_ITEM_IDS);

  // 現在の構成と完全一致するプリセット（「適用中」表示用）。
  // デフォルト構成 = daily-life プリセットのため、SSR/初回レンダーでは
  // 常に daily-life が「適用中」になる（サーバーとクライアントで一致 = hydration 安全）
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

  /** タイル1枚の描画 */
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
        {/* タイル実利用の捕捉領域: タイル本体だけを包む capture リスナー。
            操作列（「外す」）を first interaction に含めないことを、
            イベント発生元の判定でなく listener の設置場所で構造的に保証する */}
        <div
          className={styles.tileBody}
          onPointerDownCapture={() => handleTileFirstInteraction(entry)}
          onKeyDownCapture={() => handleTileFirstInteraction(entry)}
        >
          {entry.renderTile(styles.liveTile)}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* プリセット選択（オンボーディング動線）: デフォルトの6枚が自分の場面と
          違っても、近い場面の構成へワンアクションで切り替えられる出発点。
          道具箱の手前に置くのは「使い始めの起点」だから */}
      <section className={styles.presetSection}>
        <h2 className={styles.sectionHeading}>プリセットから始める</h2>
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
                    onClick={() => applyPreset(confirmingPreset)}
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

      {/* 道具箱本体: カテゴリ見出しを挟まない単一グリッドで itemIds の順序
          どおりに描画する（理由は冒頭「並び順・表示モデル」を参照） */}
      {orderedEntries.length > 0 && (
        <div className={styles.grid}>
          {orderedEntries.map(renderTileWrapper)}
        </div>
      )}

      {/* タイルの追加・リセット（編集モード・モーダル・DnD は作らない）。
          全39枚（カタログ）への到達手段はこのパネルが専任で担う */}
      <section className={styles.manageSection}>
        <h2 className={styles.sectionHeading}>タイルを追加</h2>
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
              道具箱を最初の構成（プリセット「{DEFAULT_TOOLBOX_PRESET.name}」・
              {DEFAULT_TOOLBOX_ITEM_IDS.length}枚）に戻します。
            </span>
          </div>
        </Panel>
      </section>
    </div>
  );
}
