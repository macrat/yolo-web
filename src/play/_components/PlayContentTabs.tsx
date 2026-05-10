"use client";

/**
 * PlayContentTabs — ホームページ用のカテゴリ別タブ切り替えコンポーネント。
 *
 * Server Component (page.tsx) からデータを受け取り、タブ切り替えと
 * 「もっと見る」展開をクライアントサイドで管理する。
 * カードのスタイルは page.module.css から import し、再利用する。
 */

import { useState } from "react";
import Link from "next/link";
import type { PlayContentMeta } from "@/play/types";
import { getContentPath } from "@/play/paths";
import { getContrastTextColor } from "@/play/color-utils";
// カードスタイルは (new)/page.module.css から参照（B-334-4-2 で PlayContentTabs.module.css へ分離予定）
import cardStyles from "@/app/(new)/page.module.css";
import styles from "./PlayContentTabs.module.css";

/** タブの定義 */
type TabId = "all" | "personality" | "knowledge" | "game";

interface Tab {
  id: TabId;
  label: string;
}

const TABS: Tab[] = [
  { id: "all", label: "すべて" },
  { id: "personality", label: "診断" },
  { id: "knowledge", label: "知識" },
  { id: "game", label: "ゲーム" },
];

/** tabpanel の id — タブと tabpanel を aria-controls / aria-labelledby で関連付けるための固定値 */
const TABPANEL_ID = "tabpanel-recommended";

/** category に対応する CTA テキストを返す */
function getCtaText(category: PlayContentMeta["category"]): string {
  switch (category) {
    case "knowledge":
      return "挑戦する";
    case "personality":
      return "診断する";
    case "game":
      return "遊ぶ";
    default:
      return "試してみる";
  }
}

interface PlayContentTabsProps {
  /** fortune 除外の全コンテンツ */
  allContents: PlayContentMeta[];
  /** デフォルト表示する件数分のコンテンツ */
  defaultContents: PlayContentMeta[];
  /** quiz の slug → 問数のマップ */
  questionCountBySlug: Map<string, number>;
  /** 毎日更新コンテンツの slug セット */
  dailyUpdateSlugs: ReadonlySet<string>;
}

/** カテゴリ別タブ切り替えコンポーネント */
export default function PlayContentTabs({
  allContents,
  defaultContents,
  questionCountBySlug,
  dailyUpdateSlugs,
}: PlayContentTabsProps) {
  const [activeTab, setActiveTab] = useState<TabId>("all");
  // 「すべて」タブの「もっと見る」展開状態
  const [isExpanded, setIsExpanded] = useState(false);

  /** タブ切り替えハンドラ: 展開状態もリセット */
  function handleTabChange(tabId: TabId) {
    setActiveTab(tabId);
    setIsExpanded(false);
  }

  /** 表示するコンテンツ一覧を返す */
  function getDisplayContents(): PlayContentMeta[] {
    if (activeTab === "all") {
      if (isExpanded) {
        // 展開時は全件を publishedAt 新しい順で表示
        return [...allContents].sort((a, b) =>
          b.publishedAt.localeCompare(a.publishedAt),
        );
      }
      return defaultContents;
    }
    // カテゴリフィルタリング: publishedAt 新しい順で全件表示
    return [...allContents]
      .filter((c) => c.category === activeTab)
      .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  }

  const displayContents = getDisplayContents();
  const remainingCount = allContents.length - defaultContents.length;
  const showMoreButton =
    activeTab === "all" && !isExpanded && remainingCount > 0;

  return (
    <div className={styles.container}>
      {/* タブバー */}
      <div
        role="tablist"
        aria-label="コンテンツカテゴリ"
        className={styles.tabBar}
      >
        {TABS.map((tab) => (
          <button
            key={tab.id}
            id={`tab-${tab.id}`}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={TABPANEL_ID}
            className={`${styles.tab} ${activeTab === tab.id ? styles.tabActive : ""}`}
            onClick={() => handleTabChange(tab.id)}
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* コンテンツグリッド */}
      <div
        id={TABPANEL_ID}
        role="tabpanel"
        aria-labelledby={`tab-${activeTab}`}
        className={styles.panel}
      >
        <ul className={styles.grid}>
          {displayContents.map((content) => (
            <li key={content.slug}>
              <Link
                href={getContentPath(content)}
                className={cardStyles.featuredCard}
                style={
                  {
                    "--play-accent": content.accentColor,
                    "--play-cta-text": getContrastTextColor(
                      content.accentColor,
                    ),
                  } as React.CSSProperties
                }
              >
                {dailyUpdateSlugs.has(content.slug) && (
                  <span className={cardStyles.dailyBadge}>毎日更新</span>
                )}
                <div className={cardStyles.featuredCardIconWrapper}>
                  <div className={cardStyles.featuredCardIcon}>
                    {content.icon}
                  </div>
                </div>
                <div className={cardStyles.featuredCardTitleRow}>
                  <h3 className={cardStyles.featuredCardTitle}>
                    {content.shortTitle ?? content.title}
                  </h3>
                </div>
                <p className={cardStyles.featuredCardDescription}>
                  {content.shortDescription}
                </p>
                <div className={cardStyles.featuredCardMeta}>
                  {questionCountBySlug.get(content.slug) !== undefined && (
                    <span className={cardStyles.featuredCardQuestionCount}>
                      {questionCountBySlug.get(content.slug)}問
                    </span>
                  )}
                  <span className={cardStyles.featuredCardCta}>
                    {getCtaText(content.category)}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>

        {/* 「もっと見る」ボタン */}
        {showMoreButton && (
          <div className={styles.showMoreWrapper}>
            <button
              type="button"
              className={styles.showMoreButton}
              onClick={() => setIsExpanded(true)}
            >
              もっと見る（残り{remainingCount}件）
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
