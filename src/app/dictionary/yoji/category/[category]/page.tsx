import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Breadcrumb from "@/components/Breadcrumb";
import DictionaryEntryList, {
  type DictionaryEntryItem,
} from "@/dictionary/_components/DictionaryEntryList";
import FacetIndex from "@/dictionary/_components/FacetIndex";
import { SITE_NAME, BASE_URL } from "@/lib/constants";
import { getYojiByCategory, getYojiCategories } from "@/dictionary/_lib/yoji";
import type { YojiCategory } from "@/dictionary/_lib/types";
import {
  YOJI_CATEGORY_LABELS,
  YOJI_DIFFICULTY_LABELS,
} from "@/dictionary/_lib/types";
import styles from "./page.module.css";

/**
 * 四字熟語辞典・カテゴリファセット面（DESIGN.md フェーズ R・新デザイン「店構え」へ変換）。
 *
 * 旧デザイン（カードグリッド・§8-4 とピル群・§8-5・旧トークン）を全廃し、辞典の「引く体験」に
 * 揃えた——絞り込んだ四字熟語は共有の品書き（DictionaryEntryList）で「熟語＋読み＋意味＋難易度の
 * 値札」として出し、ほかのカテゴリへの導線は罫の索引（FacetIndex）で置く。カテゴリで絞ったので
 * 値札は重複を避け難易度を添える。色・角丸・書体・余白はすべてトークン経由（§10・直書き禁止）。
 */

export function generateStaticParams() {
  return getYojiCategories().map((category) => ({ category }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  const label = YOJI_CATEGORY_LABELS[category as YojiCategory] || category;
  return {
    title: `${label}の四字熟語一覧 - 四字熟語辞典 | ${SITE_NAME}`,
    description: `「${label}」カテゴリの四字熟語一覧。読み方・意味を確認できます。`,
    openGraph: {
      title: `${label}の四字熟語一覧 - 四字熟語辞典 | ${SITE_NAME}`,
      description: `「${label}」カテゴリの四字熟語一覧。読み方・意味を確認できます。`,
      type: "website",
      url: `${BASE_URL}/dictionary/yoji/category/${category}`,
      siteName: SITE_NAME,
    },
    twitter: {
      card: "summary_large_image",
      title: `${label}の四字熟語一覧 - 四字熟語辞典 | ${SITE_NAME}`,
      description: `「${label}」カテゴリの四字熟語一覧。読み方・意味を確認できます。`,
    },
    alternates: {
      canonical: `${BASE_URL}/dictionary/yoji/category/${category}`,
    },
  };
}

export default async function YojiCategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const validCategories = getYojiCategories();
  if (!validCategories.includes(category as YojiCategory)) {
    notFound();
  }

  const yojiList = getYojiByCategory(category as YojiCategory);
  const categoryLabel = YOJI_CATEGORY_LABELS[category as YojiCategory];

  // 品書きの行（熟語＋読み＋意味＋難易度の値札）。カテゴリで絞ったので値札は難易度（重複回避）。
  const entries: DictionaryEntryItem[] = yojiList.map((y) => ({
    key: y.yoji,
    name: y.yoji,
    href: `/dictionary/yoji/${encodeURIComponent(y.yoji)}`,
    reading: y.reading,
    note: y.meaning,
    tags: [YOJI_DIFFICULTY_LABELS[y.difficulty]],
  }));

  const categoryItems = validCategories.map((c) => ({
    slug: c,
    label: YOJI_CATEGORY_LABELS[c],
  }));

  return (
    <div className={styles.container}>
      <Breadcrumb
        items={[
          { label: "ホーム", href: "/" },
          { label: "辞典", href: "/dictionary" },
          { label: "四字熟語辞典", href: "/dictionary/yoji" },
          { label: `${categoryLabel}の四字熟語` },
        ]}
      />
      <h1 className={styles.title}>{`${categoryLabel}の四字熟語`}</h1>
      <p className={styles.count}>
        <span className={styles.countNum}>
          {yojiList.length.toLocaleString("ja-JP")}
        </span>
        語を収録しています。
      </p>

      <DictionaryEntryList
        items={entries}
        ariaLabel={`${categoryLabel}の四字熟語一覧`}
      />

      <FacetIndex
        heading="ほかのカテゴリから探す"
        items={categoryItems}
        basePath="/dictionary/yoji/category"
        activeSlug={category}
        allHref="/dictionary/yoji"
        ariaLabel="カテゴリ別に四字熟語を探す"
      />
    </div>
  );
}
