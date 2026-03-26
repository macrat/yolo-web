import type { Metadata } from "next";
import Link from "next/link";
import { SITE_NAME, BASE_URL } from "@/lib/constants";
import {
  getPlayContentsByCategory,
  playContentBySlug,
  allPlayContents,
  DAILY_UPDATE_SLUGS,
  getPlayFeaturedContents,
  quizQuestionCountBySlug,
} from "@/play/registry";
import type { PlayContentMeta } from "@/play/types";
import type { PlayFeaturedContent } from "@/play/registry";
import { getContentPath } from "@/play/paths";
import { getContrastTextColor } from "@/play/color-utils";
import { getDayOfYearJst } from "@/lib/date";
import Breadcrumb from "@/components/common/Breadcrumb";
import styles from "./page.module.css";
import CategoryNav from "./_components/CategoryNav";

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
 * カテゴリに応じたCTAテキストを返す。
 * personality → 「診断する」、knowledge → 「挑戦する」、game → 「遊ぶ」、
 * fortune → 「占う」、その他 → 「試してみる」
 */
function getCtaText(category: PlayContentMeta["category"]): string {
  switch (category) {
    case "personality":
      return "診断する";
    case "knowledge":
      return "挑戦する";
    case "game":
      return "遊ぶ";
    case "fortune":
      return "占う";
    default:
      return "試してみる";
  }
}

/**
 * 今日のピックアップコンテンツを選出する。
 * JSTベースの年初からの経過日数（getDayOfYearJst）を使って決定論的にインデックスを計算し、
 * サーバーのシステムタイムゾーンに依存せず、毎日異なるコンテンツを返す。
 */
function getTodaysPickupContent(): PlayContentMeta | null {
  // JSTベースで日付を計算することで、UTC環境のサーバーでも
  // 日本時間の日付に基づく正しいピックアップコンテンツが選出される
  const dayOfYear = getDayOfYearJst();
  const index = dayOfYear % DAILY_PICKUP_SLUGS.length;
  const slug = DAILY_PICKUP_SLUGS[index];
  return playContentBySlug.get(slug) ?? null;
}

export default function PlayPage() {
  const pickupContent = getTodaysPickupContent();
  const featuredContents = getPlayFeaturedContents();

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

        {/* 今日のピックアップ: JSTベースのdayOfYearで日替わりデイリーコンテンツを1つフィーチャー */}
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
      {/* CategoryNav はクライアントコンポーネントとして IntersectionObserver でアクティブタブを制御する */}
      <CategoryNav categories={CATEGORY_DISPLAY_ORDER} />

      {/* 「イチオシ」セクション: /play ページ専用のおすすめコンテンツ3件をおすすめ理由バッジ付きで表示 */}
      <section
        className={styles.featuredSection}
        data-testid="featured-section"
        aria-labelledby="featured-heading"
      >
        <h2 id="featured-heading" className={styles.featuredHeading}>
          イチオシ
        </h2>
        <p className={styles.featuredSubtext}>
          迷ったらここから！厳選おすすめコンテンツ
        </p>
        <ul
          className={styles.featuredGrid}
          role="list"
          aria-label="おすすめコンテンツ"
        >
          {featuredContents.map((content: PlayFeaturedContent) => (
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
                {/* おすすめ理由バッジ: タイトル上部に控えめなラベルとして表示 */}
                <span className={styles.recommendBadge}>
                  {content.recommendReason}
                </span>
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
                  {/* CTAテキストはカテゴリに応じて変更する */}
                  <span className={styles.cardCta}>
                    {getCtaText(content.category)}
                  </span>
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
                        <span className={styles.cardCta}>
                          {getCtaText(content.category)}
                        </span>
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
