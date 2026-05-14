"use client";

import { useEffect, useState, useMemo, Fragment } from "react";
import ResultCopyArea from "@/components/ResultCopyArea";
import useToolStorage from "@/lib/use-tool-storage";
import {
  filterEntries,
  getKeigoCategories,
  getCommonMistakes,
  type KeigoCategory,
  type KeigoEntry,
  type MistakeType,
} from "./logic";
import accordionStyles from "@/components/AccordionItem/AccordionItem.module.css";
import styles from "./Component.module.css";

const CATEGORIES = getKeigoCategories();

const MISTAKE_SECTIONS: { type: MistakeType; label: string }[] = [
  { type: "double-keigo", label: "二重敬語" },
  { type: "wrong-direction", label: "尊敬語・謙譲語の混同" },
  { type: "baito-keigo", label: "バイト敬語" },
];

/**
 * KeigoReferenceTool — 敬語早見表コンポーネント（案 β' 対応）。
 *
 * T-A 設計（case β'）:
 * - 早見表（検索 / カテゴリ / 候補一覧 / 例文展開）を H2 メイン領域に配置
 * - 誤用パターンセクション（F7/F8）は H2 末尾の AccordionItem「よくある間違い」に配置
 * - タブ UI（activeTab）は撤廃
 * - 永続化キー 4 件: searchQuery / selectedCategory / expandedEntryId / mistakesExpanded
 * - SSR/hydration mismatch 対処: isMounted が false の間は aria-busy="true" で defaultValue 状態を表示
 */
export default function KeigoReferenceTool() {
  // SSR/hydration mismatch 対処: クライアントマウント後にのみ localStorage 復元値を表示
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- クライアントマウント検出のための一回限りの setState（外部システム同期パターン）
    setIsMounted(true);
  }, []);

  // 永続化キー 4 件（T-A 設計記録 (iii) 確定）
  const [searchQuery, setSearchQuery] = useToolStorage(
    "tool:keigo-reference:searchQuery",
    "",
  );
  const [selectedCategory, setSelectedCategory] = useToolStorage<
    KeigoCategory | "all"
  >("tool:keigo-reference:selectedCategory", "all");
  const [expandedEntryId, setExpandedEntryId] = useToolStorage<string | null>(
    "tool:keigo-reference:expandedEntryId",
    null,
  );
  const [mistakesExpanded, setMistakesExpanded] = useToolStorage(
    "tool:keigo-reference:mistakesExpanded",
    false,
  );

  const filteredEntries = useMemo(
    () => filterEntries(searchQuery, selectedCategory),
    [searchQuery, selectedCategory],
  );

  const commonMistakes = useMemo(() => getCommonMistakes(), []);

  const toggleEntry = (id: string) => {
    setExpandedEntryId(expandedEntryId === id ? null : id);
  };

  const renderEntryExamples = (entry: KeigoEntry) => (
    <div className={styles.examplePanel}>
      {entry.examples.map((ex, i) => (
        <div key={i} className={styles.exampleItem}>
          <div className={styles.exampleContext}>{ex.context}</div>
          <div className={styles.exampleLine}>
            <span className={styles.exampleLabel}>普通:</span>
            {ex.casual}
          </div>
          {/* 尊敬語行: ResultCopyArea で個別コピー対応（T-A 設計 (vi) ResultCopyArea 採用） */}
          <div className={styles.exampleLine}>
            <span className={styles.exampleLabel}>尊敬語:</span>
            {ex.sonkeigo}
            <ResultCopyArea
              text={ex.sonkeigo}
              buttonLabel="コピー"
              className={styles.copyButton}
            />
          </div>
          {/* 謙譲語行: ResultCopyArea で個別コピー対応 */}
          <div className={styles.exampleLine}>
            <span className={styles.exampleLabel}>謙譲語:</span>
            {ex.kenjogo}
            <ResultCopyArea
              text={ex.kenjogo}
              buttonLabel="コピー"
              className={styles.copyButton}
            />
          </div>
        </div>
      ))}
      {entry.notes && <div className={styles.noteText}>{entry.notes}</div>}
    </div>
  );

  // 永続化 4 キーが影響する領域には、isMounted 前は aria-busy="true" を付与する（SSR ちらつき対処）
  const ariaBusy = !isMounted;

  return (
    // aria-busy は永続化 4 キー影響領域全体（早見表 + よくある間違い）を包む container に付与
    <div className={styles.container} aria-busy={ariaBusy || undefined}>
      {/* 早見表（H2 メイン領域: F2 検索 / F3 カテゴリ / F4 候補一覧 / F5 例文展開 / F6 件数） */}
      <section aria-label="敬語早見表">
        {/* 検索 + カテゴリフィルタ */}
        <div className={styles.searchBar}>
          <input
            type="search"
            className={styles.searchInput}
            placeholder="動詞を検索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="敬語を検索"
          />
          <div
            className={styles.filterButtons}
            role="radiogroup"
            aria-label="カテゴリフィルター"
          >
            <button
              type="button"
              role="radio"
              aria-checked={selectedCategory === "all"}
              className={`${styles.filterButton} ${selectedCategory === "all" ? styles.activeFilter : ""}`}
              onClick={() => setSelectedCategory("all")}
            >
              すべて
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                role="radio"
                aria-checked={selectedCategory === cat.id}
                className={`${styles.filterButton} ${selectedCategory === cat.id ? styles.activeFilter : ""}`}
                onClick={() => setSelectedCategory(cat.id)}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* 件数表示（F6） */}
        <div className={styles.resultCount} aria-live="polite">
          {filteredEntries.length} 件
        </div>

        {/* 候補一覧（F4）+ 例文展開（F5） */}
        {filteredEntries.length > 0 ? (
          <>
            {/* デスクトップ: テーブル表示 */}
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
                      <tr
                        className={styles.tableRow}
                        onClick={() => toggleEntry(entry.id)}
                        aria-expanded={expandedEntryId === entry.id}
                        tabIndex={0}
                        role="button"
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            toggleEntry(entry.id);
                          }
                        }}
                      >
                        <td className={`${styles.td} ${styles.casualCell}`}>
                          <div className={styles.tdContent}>
                            <span>{entry.casual}</span>
                            <ResultCopyArea
                              text={entry.casual}
                              buttonLabel="コピー"
                              feedbackLabel="コピー完了"
                              className={styles.smallCopyButton}
                            />
                          </div>
                        </td>
                        <td className={styles.td}>
                          <div className={styles.tdContent}>
                            <span>{entry.sonkeigo}</span>
                            <ResultCopyArea
                              text={entry.sonkeigo}
                              buttonLabel="コピー"
                              feedbackLabel="コピー完了"
                              className={styles.smallCopyButton}
                            />
                          </div>
                        </td>
                        <td className={styles.td}>
                          <div className={styles.tdContent}>
                            <span>{entry.kenjogo}</span>
                            <ResultCopyArea
                              text={entry.kenjogo}
                              buttonLabel="コピー"
                              feedbackLabel="コピー完了"
                              className={styles.smallCopyButton}
                            />
                          </div>
                        </td>
                        <td className={styles.td}>
                          <div className={styles.tdContent}>
                            <span>{entry.teineigo}</span>
                            <ResultCopyArea
                              text={entry.teineigo}
                              buttonLabel="コピー"
                              feedbackLabel="コピー完了"
                              className={styles.smallCopyButton}
                            />
                          </div>
                        </td>
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

            {/* モバイル: カード表示 */}
            <div className={styles.mobileCards}>
              {filteredEntries.map((entry) => (
                <div key={entry.id}>
                  <div
                    className={styles.mobileCard}
                    onClick={() => toggleEntry(entry.id)}
                    aria-expanded={expandedEntryId === entry.id}
                    tabIndex={0}
                    role="button"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        toggleEntry(entry.id);
                      }
                    }}
                  >
                    <div className={styles.mobileCardTitle}>
                      <span>{entry.casual}</span>
                      <ResultCopyArea
                        text={entry.casual}
                        buttonLabel="コピー"
                        feedbackLabel="コピー完了"
                        className={styles.smallCopyButton}
                      />
                    </div>
                    <div className={styles.mobileCardRow}>
                      <span className={styles.mobileCardLabel}>尊敬語:</span>
                      <span>{entry.sonkeigo}</span>
                      <ResultCopyArea
                        text={entry.sonkeigo}
                        buttonLabel="コピー"
                        feedbackLabel="コピー完了"
                        className={styles.smallCopyButton}
                      />
                    </div>
                    <div className={styles.mobileCardRow}>
                      <span className={styles.mobileCardLabel}>謙譲語:</span>
                      <span>{entry.kenjogo}</span>
                      <ResultCopyArea
                        text={entry.kenjogo}
                        buttonLabel="コピー"
                        feedbackLabel="コピー完了"
                        className={styles.smallCopyButton}
                      />
                    </div>
                    <div className={styles.mobileCardRow}>
                      <span className={styles.mobileCardLabel}>丁寧語:</span>
                      <span>{entry.teineigo}</span>
                      <ResultCopyArea
                        text={entry.teineigo}
                        buttonLabel="コピー"
                        feedbackLabel="コピー完了"
                        className={styles.smallCopyButton}
                      />
                    </div>
                  </div>
                  {expandedEntryId === entry.id && renderEntryExamples(entry)}
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className={styles.noResults}>
            該当する敬語が見つかりませんでした
          </div>
        )}
      </section>

      {/* よくある間違い（F7/F8）: H2 末尾の <details> 直書き（案 β'）
       * AccordionItem は cycle-191 完成済 API（controlled API なし）のまま保持。
       * mistakesExpanded を localStorage 永続化するため、onToggle で直接 setMistakesExpanded を呼ぶ。
       * open={isMounted && mistakesExpanded} で controlled な open 状態管理を行う。
       */}
      <details
        className={accordionStyles.details}
        open={isMounted && mistakesExpanded}
        onToggle={(e) => {
          setMistakesExpanded((e.currentTarget as HTMLDetailsElement).open);
        }}
      >
        <summary className={accordionStyles.summary}>
          <span className={accordionStyles.summaryText}>よくある間違い</span>
          <span className={accordionStyles.icon} aria-hidden="true">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </span>
        </summary>
        <div className={accordionStyles.content}>
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
        </div>
      </details>
    </div>
  );
}
