import type { Metadata } from "next";
import Breadcrumb from "@/components/Breadcrumb";
import Shinagaki, { type ShinagakiItem } from "@/components/Shinagaki";
import { SITE_NAME, BASE_URL } from "@/lib/constants";
import {
  allPlayContents,
  quizQuestionCountBySlug,
  DAILY_UPDATE_SLUGS,
} from "@/play/registry";
import type { PlayContentMeta } from "@/play/types";
import { getContentPath } from "@/play/paths";
import { PLAY_CATEGORIES } from "@/play/_components/categoryLabels";
import styles from "./page.module.css";

const totalCount = allPlayContents.length;

const summaryText = `占い・診断・クイズ・パズルなど、AIが作った全${totalCount}種のコンテンツをジャンル別に一覧できます。気になるものを選んで、その場で試せます。`;

/** 名乗りの一言（読む面）。総数は allPlayContents.length が単一情報源。 */
const leadText = `占い・性格診断・知識クイズ・毎日のパズルなど、AIが作った全${totalCount}種を揃えました。`;

export const metadata: Metadata = {
  title: `遊ぶ | ${SITE_NAME}`,
  description: summaryText,
  keywords: [
    "ゲーム",
    "クイズ",
    "診断",
    "占い",
    "パズル",
    "ブラウザゲーム",
    "無料",
  ],
  openGraph: {
    title: `遊ぶ | ${SITE_NAME}`,
    description: summaryText,
    type: "website",
    url: `${BASE_URL}/play`,
    siteName: SITE_NAME,
  },
  twitter: {
    card: "summary_large_image",
    title: `遊ぶ | ${SITE_NAME}`,
    description: summaryText,
  },
  alternates: {
    canonical: `${BASE_URL}/play`,
  },
};

/**
 * あそび一覧（/play）— DESIGN.md フェーズ R で新デザイン「店構え」へ変換。
 *
 * 旧実装（PlayListView → PlayFilterableList → PlayGrid → PlayCard）は、URL クエリで
 * キーワード検索・カテゴリ絞り込みを行うクライアント側フィルタ UI + 同型カードグリッドだった。
 * 新デザインは一覧の既定を品書き（Shinagaki・§4）に置き換えるため、以下の構成にした:
 *
 * - 器は静か（§1/§7）。高揚は各コンテンツの結果面が担い、この一覧は罫と組版だけで組む。
 * - 全20種（ゲーム4+クイズ15+占い1）を、既存のカテゴリ区分（PLAY_CATEGORIES）ごとに
 *   棚（見出し付き Shinagaki）として並べる。件数が20件程度に収まるため、検索/絞り込み UI
 *   を持たなくても一覧性で十分に探せる——静かな器の方が §1 の設計思想に合う。
 * - 値札（Nefuda・tags）は「中身のあるものだけ」（§4）: 毎日更新されるコンテンツにのみ
 *   「毎日更新」を付す（DAILY_UPDATE_SLUGS が単一情報源）。
 * - meta（行右端）はクイズの問題数「全N問」（quizQuestionCountBySlug が単一情報源。
 *   詳細ページ/おすすめ導線と表記を統一）。ゲーム・占いには実情報が無いため付けない。
 *
 * 旧コンポーネント（PlayListView 等）は削除せず残置した（他ページから未参照だが、
 * 削除は共有資産の変更にあたるため本タスクの範囲外。要報告——PMへ）。
 */

/** カテゴリ内の並び順: 公開日降順（新しい順）。旧 PlayFilterableList の既定と同じ。 */
function byPublishedAtDesc(a: PlayContentMeta, b: PlayContentMeta): number {
  return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
}

/** PlayContentMeta → ShinagakiItem。値札・メタは「中身のあるものだけ」付ける（§4）。 */
function toShinagakiItem(content: PlayContentMeta): ShinagakiItem {
  const questionCount = quizQuestionCountBySlug.get(content.slug);
  return {
    name: content.shortTitle ?? content.title,
    href: getContentPath(content),
    note: content.shortDescription,
    tags: DAILY_UPDATE_SLUGS.has(content.slug) ? ["毎日更新"] : undefined,
    meta: questionCount !== undefined ? `全${questionCount}問` : undefined,
  };
}

/** カテゴリごとの棚。中身が無いカテゴリは描画しない（空の棚を作らない）。 */
const categoryShelves = PLAY_CATEGORIES.map(({ value, label }) => ({
  value,
  label,
  items: allPlayContents
    .filter((content) => content.category === value)
    .sort(byPublishedAtDesc)
    .map(toShinagakiItem),
})).filter((shelf) => shelf.items.length > 0);

export default function PlayPage() {
  return (
    <div className={styles.page}>
      <Breadcrumb items={[{ label: "ホーム", href: "/" }, { label: "遊ぶ" }]} />

      {/* 名乗り（読む面）。何がどれだけあるかを具体で（§6）。 */}
      <div className={styles.intro}>
        <h1 className={styles.title}>遊ぶ</h1>
        <p className={styles.lead}>{leadText}</p>
        <p className={styles.body}>
          どれもその場で答えて、結果をすぐ全部見られます。気になるものから試してください。
        </p>
      </div>

      {/* カテゴリごとの品書き（棚）。カード羅列ではなく罫区切りの一覧で渡す（§4）。 */}
      {categoryShelves.map((shelf) => (
        <div className={styles.shelf} key={shelf.value}>
          <Shinagaki
            heading={shelf.label}
            items={shelf.items}
            ariaLabel={`${shelf.label}の品書き`}
          />
        </div>
      ))}
    </div>
  );
}
