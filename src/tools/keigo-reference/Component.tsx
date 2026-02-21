"use client";

import { useState, useMemo, Fragment } from "react";
import {
  filterEntries,
  getKeigoCategories,
  getCommonMistakes,
  type KeigoCategory,
  type KeigoEntry,
  type MistakeType,
} from "./logic";
import styles from "./Component.module.css";

type ActiveTab = "table" | "mistakes";

const CATEGORIES = getKeigoCategories();

const MISTAKE_SECTIONS: { type: MistakeType; label: string }[] = [
  { type: "double-keigo", label: "二重敬語" },
  { type: "wrong-direction", label: "尊敬語・謙譲語の混同" },
  { type: "baito-keigo", label: "バイト敬語" },
];

export default function KeigoReferenceTool() {
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
      {/* Main tab switch */}
      <div className={styles.mainTabs} role="tablist" aria-label="表示切替">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "table"}
          className={`${styles.mainTab} ${activeTab === "table" ? styles.activeMainTab : ""}`}
          onClick={() => setActiveTab("table")}
        >
          敬語早見表
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "mistakes"}
          className={`${styles.mainTab} ${activeTab === "mistakes" ? styles.activeMainTab : ""}`}
          onClick={() => setActiveTab("mistakes")}
        >
          よくある間違い
        </button>
      </div>

      {/* Table tab content */}
      {activeTab === "table" && (
        <>
          {/* Search and filter bar */}
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

          <div className={styles.resultCount} aria-live="polite">
            {filteredEntries.length}件の動詞
          </div>

          {/* Desktop table */}
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
                        <tr
                          className={styles.tableRow}
                          onClick={() => toggleEntry(entry.id)}
                          aria-expanded={expandedEntryId === entry.id}
                        >
                          <td className={`${styles.td} ${styles.casualCell}`}>
                            {entry.casual}
                          </td>
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

              {/* Mobile card view */}
              <div className={styles.mobileCards}>
                {filteredEntries.map((entry) => (
                  <div key={entry.id}>
                    <div
                      className={styles.mobileCard}
                      onClick={() => toggleEntry(entry.id)}
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
            <div className={styles.noResults}>
              該当する敬語が見つかりませんでした
            </div>
          )}
        </>
      )}

      {/* Mistakes tab content */}
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
