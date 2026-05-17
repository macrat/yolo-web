"use client";

/**
 * KeigoReferenceComponent — 敬語早見表詳細ページの主要 UI コンポーネント。
 *
 * 設計方針:
 * - Button / Input を使用（DESIGN.md §5 準拠 / src/components/ からのみ import）
 * - useToolStorage で検索・カテゴリ・タブを localStorage に永続化（M1b likes 3）
 * - AccordionItem で例文展開（キーボード操作対応 / aria 属性管理 / cycle-192 同型失敗防止）
 * - CSS トークンは新体系（--bg / --fg / --border / --accent 等）のみ使用
 * - 旧トークン（--color-border / --color-primary 等）は一切使わない
 *
 * @see docs/tile-and-detail-design.md §2 Core Intent
 * @see docs/cycles/cycle-193.md 致命3 対応
 */

import { useMemo } from "react";
import Button from "@/components/Button";
import Input from "@/components/Input";
import AccordionItem from "@/tools/_components/AccordionItem";
import {
  filterEntries,
  getKeigoCategories,
  COMMON_MISTAKES,
  type KeigoCategory,
  type KeigoEntry,
  type MistakeType,
} from "./logic";
import { useToolStorage } from "@/tools/_hooks/use-tool-storage";
import { STORAGE_KEY_SEARCH, STORAGE_KEY_CATEGORY } from "./storage-keys";
import styles from "./Component.module.css";

type ActiveTab = "table" | "mistakes";

const CATEGORIES = getKeigoCategories();

const MISTAKE_SECTIONS: { type: MistakeType; label: string }[] = [
  { type: "double-keigo", label: "二重敬語" },
  { type: "wrong-direction", label: "尊敬語・謙譲語の混同" },
  { type: "baito-keigo", label: "バイト敬語" },
];

/**
 * 例文パネルコンポーネント（AccordionItem の children として使用）。
 * 普通語 / 尊敬語 / 謙譲語の例文と補足説明を表示する。
 */
function EntryExamples({ entry }: { entry: KeigoEntry }) {
  return (
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
}

export default function KeigoReferenceComponent() {
  // --- localStorage 永続化（M1b likes 3）---
  // key 命名規約: yolos-tool-<slug>-<purpose>（storage-keys.ts 共有定数を使用）
  const [activeTab, setActiveTab] = useToolStorage<ActiveTab>(
    "yolos-tool-keigo-reference-tab",
    "table",
  );
  const [searchQuery, setSearchQuery] = useToolStorage<string>(
    STORAGE_KEY_SEARCH,
    "",
  );
  const [selectedCategory, setSelectedCategory] = useToolStorage<
    KeigoCategory | "all"
  >(STORAGE_KEY_CATEGORY, "all");

  const filteredEntries = useMemo(
    () => filterEntries(searchQuery, selectedCategory),
    [searchQuery, selectedCategory],
  );

  return (
    <div className={styles.container}>
      {/* タブ切替: 「敬語早見表」と「よくある間違い」の 2 タブ */}
      {/* Button コンポーネントを使用（DESIGN.md §5 準拠）*/}
      <div className={styles.mainTabs} role="tablist" aria-label="表示切替">
        <Button
          role="tab"
          aria-selected={activeTab === "table"}
          variant={activeTab === "table" ? "primary" : "default"}
          onClick={() => setActiveTab("table")}
        >
          敬語早見表
        </Button>
        <Button
          role="tab"
          aria-selected={activeTab === "mistakes"}
          variant={activeTab === "mistakes" ? "primary" : "default"}
          onClick={() => setActiveTab("mistakes")}
        >
          よくある間違い
        </Button>
      </div>

      {/* 敬語早見表タブ */}
      {activeTab === "table" && (
        <>
          {/* 検索バー: Input コンポーネントを使用（DESIGN.md §5 準拠）*/}
          <div className={styles.searchBar}>
            <Input
              type="search"
              placeholder="動詞を検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="敬語を検索"
              className={styles.searchInput}
            />
          </div>

          {/* カテゴリフィルタ: Button コンポーネントを使用（Tile.tsx と同パターン）*/}
          <div
            className={styles.filterButtons}
            role="group"
            aria-label="カテゴリフィルター"
          >
            <Button
              variant={selectedCategory === "all" ? "primary" : "default"}
              aria-pressed={selectedCategory === "all"}
              onClick={() => setSelectedCategory("all")}
            >
              すべて
            </Button>
            {CATEGORIES.map((cat) => (
              <Button
                key={cat.id}
                variant={selectedCategory === cat.id ? "primary" : "default"}
                aria-pressed={selectedCategory === cat.id}
                onClick={() => setSelectedCategory(cat.id)}
              >
                {cat.name}
              </Button>
            ))}
          </div>

          <div className={styles.resultCount} aria-live="polite">
            {filteredEntries.length}件の動詞
          </div>

          {/* エントリ一覧 */}
          {filteredEntries.length > 0 ? (
            <>
              {/* デスクトップ: テーブル + AccordionItem 展開行 */}
              <div className={styles.desktopTable}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th className={styles.th}>普通語</th>
                      <th className={styles.th}>尊敬語</th>
                      <th className={styles.th}>謙譲語</th>
                      <th className={styles.th}>丁寧語</th>
                      <th className={styles.th}>例文</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEntries.map((entry) => (
                      <tr key={entry.id} className={styles.tableRow}>
                        <td className={`${styles.td} ${styles.casualCell}`}>
                          {entry.casual}
                        </td>
                        <td className={styles.td}>{entry.sonkeigo}</td>
                        <td className={styles.td}>{entry.kenjogo}</td>
                        <td className={styles.td}>{entry.teineigo}</td>
                        <td className={styles.td}>
                          {/* AccordionItem で例文展開（キーボード対応・aria 属性管理） */}
                          <AccordionItem title="例文を見る">
                            <EntryExamples entry={entry} />
                          </AccordionItem>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* モバイル: カード形式 + AccordionItem 展開 */}
              <div className={styles.mobileCards}>
                {filteredEntries.map((entry) => (
                  <div key={entry.id} className={styles.mobileCard}>
                    <div className={styles.mobileCardTitle}>{entry.casual}</div>
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
                    {/* AccordionItem で例文展開（キーボード対応・aria 属性管理） */}
                    <AccordionItem title="例文を見る">
                      <EntryExamples entry={entry} />
                    </AccordionItem>
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

      {/* よくある間違いタブ */}
      {activeTab === "mistakes" && (
        <>
          {MISTAKE_SECTIONS.map((section) => {
            const mistakes = COMMON_MISTAKES.filter(
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
