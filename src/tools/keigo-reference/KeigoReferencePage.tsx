"use client";

import { useState, useMemo, Fragment } from "react";
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
import styles from "./KeigoReferencePage.module.css";

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

/**
 * KeigoReferencePage — 敬語早見表ページの単一実装（フル機能）。
 *
 * cycle-225 T-6 で Component.tsx から移行。
 * コピーボタンなし（T-4b 確定: 知る対象）。
 * C-3: ライブリージョンには実テキストノードのサマリを付与。
 *
 * reviewer指摘1対応（ARIA in HTML仕様）:
 * <tr> にはネイティブの暗黙ロール "row" があるため、role="button" を付けると
 * テーブル構造（row/cell）が壊れスクリーンリーダーのナビゲーションが機能しなくなる。
 * 解決策: <tr> は素の行のまま維持し、先頭セルを <th scope="row"> にして
 * その中に実 <button aria-expanded> を置き、キーボード操作・フォーカス・展開状態を持たせる。
 *
 * reviewer指摘3対応（空クエリ時の空状態メッセージ）:
 * 検索クエリが空のときに「「」に一致する…」と表示されないよう、
 * クエリ非空時のみ鉤括弧でクエリを示し、クエリ空時は別文言に分岐する。
 */
export default function KeigoReferencePage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("table");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<
    KeigoCategory | "all"
  >("all");
  const [expandedEntryId, setExpandedEntryId] = useState<string | null>(null);

  const filteredEntries = useMemo(
    () => filterEntries(searchQuery, selectedCategory),
    [searchQuery, selectedCategory],
  );

  const commonMistakes = useMemo(() => getCommonMistakes(), []);

  const toggleEntry = (id: string) => {
    setExpandedEntryId((prev) => (prev === id ? null : id));
  };

  /**
   * キーボード操作ハンドラ（WCAG 2.1.1 Keyboard Level A）
   * Enter / Space キーでアコーディオン展開/折り畳みする
   * ※ <button> 内で使うので HTMLButtonElement 型にする
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

  // reviewer指摘3: 空クエリ時に「「」に一致する…」が表示されないよう分岐
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

  return (
    <div className={styles.container}>
      {/* メインタブ切替: SegmentedControl（A-3）*/}
      <SegmentedControl
        options={TAB_OPTIONS}
        value={activeTab}
        onChange={(val) => setActiveTab(val as ActiveTab)}
        aria-label="表示切替"
      />

      {/* 表タブコンテンツ */}
      {activeTab === "table" && (
        <>
          {/* 検索バー */}
          <div className={styles.searchBar}>
            {/* 検索入力: Input コンポーネント（A-1準拠）*/}
            <div className={styles.searchInputWrapper}>
              <Input
                type="text"
                placeholder="動詞を検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="敬語を検索"
              />
            </div>

            {/* カテゴリフィルター: SegmentedControl（A-3）*/}
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

          {/* デスクトップテーブル */}
          {filteredEntries.length > 0 ? (
            <>
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
                         * reviewer指摘1対応: <tr> にはネイティブの暗黙ロール "row" があるため
                         * role="button" を付けるとテーブル構造が壊れる（ARIA in HTML仕様違反）。
                         * <tr> は素のまま維持し、先頭セルを <th scope="row"> にして
                         * その中の実 <button> にインタラクション（aria-expanded等）を持たせる。
                         * これによりキーボード操作とテーブルセマンティクスの両立を実現する。
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
              <div className={styles.mobileCards}>
                {filteredEntries.map((entry) => (
                  <div key={entry.id}>
                    {/* モバイルカードは <div> なので role="button" + tabIndex=0 が適切（<tr>/<li> でないため問題なし）*/}
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
                        <span className={styles.mobileCardLabel}>尊敬語:</span>
                        <span>{entry.sonkeigo}</span>
                      </div>
                      <div className={styles.mobileCardRow}>
                        <span className={styles.mobileCardLabel}>謙譲語:</span>
                        <span>{entry.kenjogo}</span>
                      </div>
                      <div className={styles.mobileCardRow}>
                        <span className={styles.mobileCardLabel}>丁寧語:</span>
                        <span>{entry.teineigo}</span>
                      </div>
                    </div>
                    {expandedEntryId === entry.id && renderEntryExamples(entry)}
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
                <h3 className={styles.mistakeSectionTitle}>{section.label}</h3>
                {mistakes.map((mistake) => (
                  <div key={mistake.id} className={styles.mistakeCard}>
                    <div>
                      <span className={styles.mistakeLabel}>誤:</span>
                      <span className={styles.wrongText}>{mistake.wrong}</span>
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
  );
}
