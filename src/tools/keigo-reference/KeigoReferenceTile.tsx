"use client";

/**
 * KeigoReferenceTile — 敬語早見表の単一正典タイル
 *
 * cycle-228 T-18: KeigoReferencePage.tsx をタイル・アーキテクチャへ移行。
 * ルートが <Panel>（DESIGN.md §1 パネル準拠）で自己完結。
 *
 * ## 設計原則
 *
 * - **タイル = ツール実装そのもののルート**: 最上位要素が <Panel>。
 * - **1ツール 1タイル**: 唯一の共有エンジン logic.ts を使う。variant は full のみ。
 * - **id インスタンス一意化**: useId ベースで生成。
 * - **ToolPageLayout 非依存**: タイル単体で機能が完結する。
 *
 * ## variant
 *
 * - `"full"` (デフォルト): 全機能（SegmentedControl table/mistakes + 検索 + フィルタ + テーブル/カード）
 *
 * ## アクセシビリティ
 *
 * - C-2: 全 SegmentedControl に aria-label 付与
 * - C-3: role="status" aria-live="polite" のライブリージョン＋件数サマリ
 * - C-8: テーブルは <tr> に role="button" 禁止（ARIA in HTML 仕様）。
 *   先頭セル <th scope="row"> 内の実 <button aria-expanded> でキーボード操作する。
 *   モバイルカード <div> は role="button" + tabIndex=0 + onKeyDown で可。
 */

import { useState, useMemo, Fragment, useId } from "react";
import Panel from "@/components/Panel";
import SegmentedControl from "@/components/SegmentedControl";
import Input from "@/components/Input";
import {
  filterEntries,
  getKeigoCategories,
  getCommonMistakes,
  type KeigoCategory,
  type KeigoEntry,
  type MistakeType,
} from "./logic";
import styles from "./KeigoReferenceTile.module.css";

type ActiveTab = "table" | "mistakes";

const CATEGORIES = getKeigoCategories();

const TAB_OPTIONS: { label: string; value: ActiveTab }[] = [
  { label: "敬語早見表", value: "table" },
  { label: "よくある間違い", value: "mistakes" },
];

const CATEGORY_OPTIONS = [
  { label: "すべて", value: "all" as KeigoCategory | "all" },
  ...CATEGORIES.map((cat) => ({
    label: cat.name,
    value: cat.id as KeigoCategory | "all",
  })),
];

const MISTAKE_SECTIONS: { type: MistakeType; label: string }[] = [
  { type: "double-keigo", label: "二重敬語" },
  { type: "wrong-direction", label: "尊敬語・謙譲語の混同" },
  { type: "baito-keigo", label: "バイト敬語" },
];

/** variant prop: 表示バリエーションの設定差。別実装ではない。 */
export type KeigoReferenceTileVariant = "full";

export interface KeigoReferenceTileProps {
  /**
   * 表示バリエーション（デフォルト: "full"）
   * - "full": 全機能（タブ切替・検索・カテゴリフィルタ・テーブル/カード表示）
   */
  variant?: KeigoReferenceTileVariant;
  /** Panel の as prop に透過される HTML タグ（デフォルト: "section"） */
  as?: "section" | "div" | "article" | "aside";
  /** 追加クラス */
  className?: string;
}

export default function KeigoReferenceTile({
  variant = "full",
  as = "section",
  className,
}: KeigoReferenceTileProps = {}) {
  // ---------- id インスタンス一意化（複数同居時の重複 id・label 誤結合防止） ----------
  // SegmentedControl は id prop を持たないが、Input には useId を使う。
  const uid = useId();
  const searchId = `${uid}-search`;

  // ---------- State ----------
  const [activeTab, setActiveTab] = useState<ActiveTab>("table");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<
    KeigoCategory | "all"
  >("all");
  const [expandedEntryId, setExpandedEntryId] = useState<string | null>(null);

  // ---------- 派生データ ----------
  const filteredEntries = useMemo(
    () => filterEntries(searchQuery, selectedCategory),
    [searchQuery, selectedCategory],
  );

  const commonMistakes = useMemo(() => getCommonMistakes(), []);

  // ---------- ハンドラ ----------
  const toggleEntry = (id: string) => {
    setExpandedEntryId((prev) => (prev === id ? null : id));
  };

  /**
   * テーブル行の <button> キーボード操作ハンドラ（WCAG 2.1.1 Keyboard Level A）
   * Enter / Space キーでアコーディオン展開/折り畳みする
   */
  const handleExpandKeyDown = (
    e: React.KeyboardEvent<HTMLButtonElement>,
    id: string,
  ) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggleEntry(id);
    }
  };

  /**
   * モバイルカード向けキーボード操作ハンドラ（<div role="button"> で使う）
   */
  const handleCardKeyDown = (
    e: React.KeyboardEvent<HTMLDivElement>,
    id: string,
  ) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggleEntry(id);
    }
  };

  // C-3: ライブリージョン用のサマリテキスト（実テキストノード）
  const resultSummary =
    activeTab === "table"
      ? searchQuery.trim() || selectedCategory !== "all"
        ? `${filteredEntries.length}件の動詞が一致しました`
        : `${filteredEntries.length}件の動詞`
      : "";

  // 空クエリ時に「「」に一致する…」が表示されないよう分岐（cycle-225 reviewer指摘3対応）
  const noResultsMessage = searchQuery.trim()
    ? `「${searchQuery}」に一致する動詞が見つかりませんでした`
    : "該当する敬語が見つかりませんでした";

  const renderEntryExamples = (entry: KeigoEntry) => (
    <div className={styles.examplePanel}>
      {entry.examples.map((ex, i) => (
        <div key={i} className={styles.exampleItem}>
          <div className={styles.exampleContext}>{ex.context}</div>
          <div className={styles.exampleLine}>
            <span className={styles.exampleLabel}>普通:</span>
            {ex.casual}
          </div>
          <div className={styles.exampleLine}>
            <span className={styles.exampleLabel}>尊敬語:</span>
            {ex.sonkeigo}
          </div>
          <div className={styles.exampleLine}>
            <span className={styles.exampleLabel}>謙譲語:</span>
            {ex.kenjogo}
          </div>
        </div>
      ))}
      {entry.notes && <div className={styles.noteText}>{entry.notes}</div>}
    </div>
  );

  // ---------- variant は現在 full のみ。将来の拡張に備えて variant 変数を参照しておく。
  void variant;

  // ---------- Render ----------
  // タイルのルートが Panel（= DESIGN.md §1 パネル準拠・タイル = ツール実装そのもの）
  return (
    <Panel as={as} className={className}>
      <div className={styles.inner}>
        {/* メインタブ切替: SegmentedControl（C-2: aria-label 必須）*/}
        <SegmentedControl
          options={TAB_OPTIONS}
          value={activeTab}
          onChange={(val) => setActiveTab(val as ActiveTab)}
          aria-label="表示切替"
        />

        {/* 表タブコンテンツ */}
        {activeTab === "table" && (
          <>
            {/* 検索バー: 操作側は flexShrink:0（AP-P21 スクロール競合防止） */}
            <div className={styles.searchBar}>
              {/* 検索入力: Input コンポーネント（共通部品必須再利用）*/}
              <div className={styles.searchInputWrapper}>
                <Input
                  id={searchId}
                  type="text"
                  placeholder="動詞を検索..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  aria-label="敬語を検索"
                />
              </div>

              {/* カテゴリフィルター: SegmentedControl（C-2: aria-label 必須）*/}
              <SegmentedControl
                options={CATEGORY_OPTIONS}
                value={selectedCategory}
                onChange={(val) =>
                  setSelectedCategory(val as KeigoCategory | "all")
                }
                aria-label="カテゴリフィルター"
                className={styles.categoryControl}
              />
            </div>

            {/* C-3: ライブリージョン（実テキストノードのサマリ）*/}
            <div
              role="status"
              aria-live="polite"
              aria-atomic="true"
              className={styles.resultCount}
            >
              {resultSummary}
            </div>

            {/* テーブル/カード領域: 膨張側（AP-P21）*/}
            {filteredEntries.length > 0 ? (
              <>
                {/* デスクトップテーブル */}
                <div className={styles.desktopTable}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th className={styles.th}>普通語</th>
                        <th className={styles.th}>尊敬語</th>
                        <th className={styles.th}>謙譲語</th>
                        <th className={styles.th}>丁寧語</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredEntries.map((entry) => (
                        <Fragment key={entry.id}>
                          {/*
                           * <tr> にはネイティブの暗黙ロール "row" があるため
                           * role="button" を付けるとテーブル構造が壊れる（ARIA in HTML仕様違反）。
                           * <tr> は素のまま維持し、先頭セルを <th scope="row"> にして
                           * その中の実 <button> にインタラクション（aria-expanded等）を持たせる。
                           */}
                          <tr
                            className={`${styles.tableRow} ${expandedEntryId === entry.id ? styles.tableRowExpanded : ""}`}
                          >
                            {/* 先頭セルを th scope="row" にし、実 button を内包 */}
                            <th
                              scope="row"
                              className={`${styles.td} ${styles.casualCell} ${styles.casualTh}`}
                            >
                              <button
                                type="button"
                                className={styles.expandButton}
                                onClick={() => toggleEntry(entry.id)}
                                onKeyDown={(e) =>
                                  handleExpandKeyDown(e, entry.id)
                                }
                                aria-expanded={expandedEntryId === entry.id}
                                aria-label={`${entry.casual} の例文を${expandedEntryId === entry.id ? "閉じる" : "表示"}`}
                              >
                                {entry.casual}
                              </button>
                            </th>
                            <td className={styles.td}>{entry.sonkeigo}</td>
                            <td className={styles.td}>{entry.kenjogo}</td>
                            <td className={styles.td}>{entry.teineigo}</td>
                          </tr>
                          {expandedEntryId === entry.id && (
                            <tr className={styles.examplePanelRow}>
                              <td colSpan={4}>{renderEntryExamples(entry)}</td>
                            </tr>
                          )}
                        </Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* モバイルカードビュー */}
                {/* モバイルカードは <div> なので role="button" + tabIndex=0 が適切（<tr>/<li> でないため問題なし）*/}
                <div className={styles.mobileCards}>
                  {filteredEntries.map((entry) => (
                    <div key={entry.id}>
                      <div
                        className={styles.mobileCard}
                        role="button"
                        tabIndex={0}
                        onClick={() => toggleEntry(entry.id)}
                        onKeyDown={(e) => handleCardKeyDown(e, entry.id)}
                        aria-expanded={expandedEntryId === entry.id}
                      >
                        <div className={styles.mobileCardTitle}>
                          {entry.casual}
                        </div>
                        <div className={styles.mobileCardRow}>
                          <span className={styles.mobileCardLabel}>
                            尊敬語:
                          </span>
                          <span>{entry.sonkeigo}</span>
                        </div>
                        <div className={styles.mobileCardRow}>
                          <span className={styles.mobileCardLabel}>
                            謙譲語:
                          </span>
                          <span>{entry.kenjogo}</span>
                        </div>
                        <div className={styles.mobileCardRow}>
                          <span className={styles.mobileCardLabel}>
                            丁寧語:
                          </span>
                          <span>{entry.teineigo}</span>
                        </div>
                      </div>
                      {expandedEntryId === entry.id &&
                        renderEntryExamples(entry)}
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className={styles.noResults}>{noResultsMessage}</div>
            )}
          </>
        )}

        {/* よくある間違いタブコンテンツ */}
        {activeTab === "mistakes" && (
          <>
            {MISTAKE_SECTIONS.map((section) => {
              const mistakes = commonMistakes.filter(
                (m) => m.mistakeType === section.type,
              );
              if (mistakes.length === 0) return null;
              return (
                <div key={section.type} className={styles.mistakeSection}>
                  <h3 className={styles.mistakeSectionTitle}>
                    {section.label}
                  </h3>
                  {mistakes.map((mistake) => (
                    <div key={mistake.id} className={styles.mistakeCard}>
                      <div>
                        <span className={styles.mistakeLabel}>誤:</span>
                        <span className={styles.wrongText}>
                          {mistake.wrong}
                        </span>
                      </div>
                      <div>
                        <span className={styles.mistakeLabel}>正:</span>
                        <span className={styles.correctText}>
                          {mistake.correct}
                        </span>
                      </div>
                      <div className={styles.explanationText}>
                        {mistake.explanation}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
          </>
        )}
      </div>
    </Panel>
  );
}
