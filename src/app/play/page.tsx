import type { Metadata } from "next";
import Link from "next/link";
import { SITE_NAME, BASE_URL } from "@/lib/constants";
import {
  getPlayContentsByCategory,
  playContentBySlug,
  allPlayContents,
  DAILY_UPDATE_SLUGS,
  getFeaturedContents,
  quizQuestionCountBySlug,
} from "@/play/registry";
import type { PlayContentMeta } from "@/play/types";
import { getContentPath } from "@/play/paths";
import { getContrastTextColor } from "@/play/color-utils";
import Breadcrumb from "@/components/common/Breadcrumb";
import styles from "./page.module.css";

/** ISR: 24時間ごとにページを再生成し、「今日のピックアップ」の日替わりローテーションを機能させる */
export const revalidate = 86400;

/** コンテンツ総数（metadataと本文で共通使用するため定数化） */
const PLAY_CONTENT_COUNT = allPlayContents.length;

export const metadata: Metadata = {
  title: `遊ぶ | ${SITE_NAME}`,
  description: `占い・性格診断・知識テスト・ゲームなど全${PLAY_CONTENT_COUNT}種のインタラクティブコンテンツが揃う入口。今日の運勢、性格診断、漢字クイズ、パズルゲームをブラウザで無料で楽しめます。`,
  keywords: [
    "ゲーム",
    "クイズ",
    "診断",
    "占い",
    "パズル",
    "ブラウザゲーム",
    "無料",
    "インタラクティブ",
  ],
  openGraph: {
    title: `遊ぶ | ${SITE_NAME}`,
    description: `占い・性格診断・知識テスト・ゲームなど全${PLAY_CONTENT_COUNT}種のコンテンツがブラウザで無料で楽しめます。`,
    type: "website",
    url: `${BASE_URL}/play`,
    siteName: SITE_NAME,
  },
  twitter: {
    card: "summary_large_image",
    title: `遊ぶ | ${SITE_NAME}`,
    description: `占い・性格診断・知識テスト・ゲームなど全${PLAY_CONTENT_COUNT}種のコンテンツがブラウザで無料で楽しめます。`,
  },
  alternates: {
    canonical: `${BASE_URL}/play`,
  },
};

/** カテゴリの表示順序と日本語ラベルの定義 */
const CATEGORY_DISPLAY_ORDER: Array<{
  category: PlayContentMeta["category"];
  label: string;
}> = [
  { category: "fortune", label: "占い" },
  { category: "personality", label: "性格診断" },
  { category: "knowledge", label: "知識テスト" },
  { category: "game", label: "ゲーム" },
];

/**
 * 「今日のピックアップ」のローテーション対象スラグ一覧。
 * dayOfYear % size でデイリー系コンテンツから1つを決定論的に選出する。
 * 毎日異なるコンテンツが選ばれ、リピーター向けの「今日も来る理由」を演出する。
 */
const DAILY_PICKUP_SLUGS: ReadonlyArray<string> = [
  "daily",
  "kanji-kanaru",
  "yoji-kimeru",
  "nakamawake",
  "irodori",
];

/**
 * 今日の年初からの経過日数を返す（1〜366）。
 * サーバーサイドでビルド時に確定される静的な値として使用する。
 * ピックアップコンテンツの決定論的な日替わり選出に使用する。
 */
function getDayOfYear(): number {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 0);
  return Math.floor((now.getTime() - startOfYear.getTime()) / 86400000);
}

/**
 * 今日のピックアップコンテンツを選出する。
 * dayOfYear % DAILY_PICKUP_SLUGS.length で決定論的にインデックスを計算し、
 * 毎日異なるコンテンツを返す。
 */
function getTodaysPickupContent(): PlayContentMeta | null {
  const dayOfYear = getDayOfYear();
  const index = dayOfYear % DAILY_PICKUP_SLUGS.length;
  const slug = DAILY_PICKUP_SLUGS[index];
  return playContentBySlug.get(slug) ?? null;
}

export default function PlayPage() {
  const pickupContent = getTodaysPickupContent();
  const featuredContents = getFeaturedContents();

  return (
    <div className={styles.main}>
      <Breadcrumb items={[{ label: "ホーム", href: "/" }, { label: "遊ぶ" }]} />

      {/* ヒーローバナー */}
      <section className={styles.heroBanner} data-testid="hero-banner">
        {/* 装飾的な背景絵文字（視覚的アクセント） */}
        <span className={styles.heroDeco1} aria-hidden="true">
          🔮
        </span>
        <span className={styles.heroDeco2} aria-hidden="true">
          🧩
        </span>
        <span className={styles.heroDeco3} aria-hidden="true">
          📚
        </span>
        <span className={styles.heroDeco4} aria-hidden="true">
          🎨
        </span>
        <h1 className={styles.heroTitle}>遊ぶ</h1>
        <p className={styles.heroSubtext} data-testid="hero-subtext">
          全{PLAY_CONTENT_COUNT}種のコンテンツがブラウザで無料で楽しめる
        </p>

        {/* 今日のピックアップ: dayOfYearベースで日替わりデイリーコンテンツを1つフィーチャー */}
        {pickupContent && (
          <div className={styles.pickupArea} data-testid="pickup-section">
            <p className={styles.pickupLabel}>今日のピックアップ</p>
            <Link
              href={getContentPath(pickupContent)}
              className={styles.pickupCard}
              style={
                {
                  "--play-accent": pickupContent.accentColor,
                  "--play-cta-text": getContrastTextColor(
                    pickupContent.accentColor,
                  ),
                } as React.CSSProperties
              }
            >
              <span className={styles.pickupIcon}>{pickupContent.icon}</span>
              <h2 className={styles.pickupTitle}>{pickupContent.title}</h2>
              <p className={styles.pickupDescription}>
                {pickupContent.shortDescription}
              </p>
              <span className={styles.pickupCta}>今すぐ遊ぶ</span>
            </Link>
          </div>
        )}
      </section>

      {/* カテゴリアンカーリンクタブ（ヒーロー直下、sticky化でスクロール追従） */}
      <nav
        className={styles.categoryNav}
        aria-label="カテゴリナビゲーション"
        data-sticky="true"
      >
        {CATEGORY_DISPLAY_ORDER.map(({ category, label }) => (
          <a
            key={category}
            href={`#${category}`}
            className={styles.categoryNavTab}
          >
            {label}
          </a>
        ))}
      </nav>

      {/* 「まずはここから」セクション: 各カテゴリの代表コンテンツ4件を横並び表示 */}
      <section
        className={styles.featuredSection}
        data-testid="featured-section"
        aria-labelledby="featured-heading"
      >
        <h2 id="featured-heading" className={styles.featuredHeading}>
          まずはここから
        </h2>
        <ul
          className={styles.featuredGrid}
          role="list"
          aria-label="おすすめコンテンツ"
        >
          {featuredContents.map((content) => (
            <li key={content.slug}>
              <Link
                href={getContentPath(content)}
                className={styles.card}
                data-testid="card-with-gradient"
                style={
                  {
                    "--play-accent": content.accentColor,
                    "--play-cta-text": getContrastTextColor(
                      content.accentColor,
                    ),
                  } as React.CSSProperties
                }
              >
                <div
                  className={styles.cardIconWrapper}
                  data-testid="card-icon-wrapper"
                >
                  <div className={styles.cardIcon}>{content.icon}</div>
                </div>
                <div className={styles.cardTitleRow}>
                  {/* shortTitle が設定されている場合はカード表示ではそちらを優先使用 */}
                  <h3 className={styles.cardTitle}>
                    {content.shortTitle ?? content.title}
                  </h3>
                  {DAILY_UPDATE_SLUGS.has(content.slug) && (
                    <span className={styles.dailyBadge}>毎日更新</span>
                  )}
                </div>
                <p className={styles.cardDescription}>
                  {content.shortDescription}
                </p>
                <div className={styles.cardMeta}>
                  {quizQuestionCountBySlug.get(content.slug) !== undefined && (
                    <span className={styles.cardQuestionCount}>
                      {quizQuestionCountBySlug.get(content.slug)}問
                    </span>
                  )}
                  <span className={styles.cardCta}>遊ぶ</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* カテゴリ別セクション一覧 */}
      {CATEGORY_DISPLAY_ORDER.map(({ category, label }, categoryIndex) => {
        const contents = getPlayContentsByCategory(category);
        if (contents.length === 0) return null;
        // 偶数インデックスのカテゴリに交互背景色を適用して回遊性を高める
        const isEvenSection = categoryIndex % 2 === 0;
        return (
          <section
            key={category}
            id={category}
            className={styles.categorySection}
            data-section-alt={isEvenSection ? "true" : "false"}
          >
            <h2 className={styles.categoryHeading}>{label}</h2>
            <ul
              className={styles.grid}
              role="list"
              aria-label={`${label}カテゴリのコンテンツ一覧`}
            >
              {contents.map((content) => {
                const questionCount = quizQuestionCountBySlug.get(content.slug);
                const isDaily = DAILY_UPDATE_SLUGS.has(content.slug);
                return (
                  <li key={content.slug}>
                    <Link
                      href={getContentPath(content)}
                      className={styles.card}
                      data-testid="card-with-gradient"
                      style={
                        {
                          "--play-accent": content.accentColor,
                          // WCAG AA基準（4.5:1）を満たすテキスト色をCSS変数として注入
                          "--play-cta-text": getContrastTextColor(
                            content.accentColor,
                          ),
                        } as React.CSSProperties
                      }
                    >
                      {/* アクセントカラーの薄い背景円でアイコンを目立たせる */}
                      <div
                        className={styles.cardIconWrapper}
                        data-testid="card-icon-wrapper"
                      >
                        <div className={styles.cardIcon}>{content.icon}</div>
                      </div>
                      <div className={styles.cardTitleRow}>
                        {/* shortTitle が設定されている場合はカード表示ではそちらを優先使用 */}
                        <h3 className={styles.cardTitle}>
                          {content.shortTitle ?? content.title}
                        </h3>
                        {/* デイリー更新コンテンツにのみバッジを表示 */}
                        {isDaily && (
                          <span className={styles.dailyBadge}>毎日更新</span>
                        )}
                      </div>
                      <p className={styles.cardDescription}>
                        {content.shortDescription}
                      </p>
                      <div className={styles.cardMeta}>
                        {questionCount !== undefined && (
                          <span className={styles.cardQuestionCount}>
                            {questionCount}問
                          </span>
                        )}
                        <span className={styles.cardCta}>遊ぶ</span>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
