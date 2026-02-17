import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Breadcrumb from "@/components/common/Breadcrumb";
import CategoryNav from "@/components/dictionary/CategoryNav";
import DictionaryCard from "@/components/dictionary/DictionaryCard";
import DictionaryGrid from "@/components/dictionary/DictionaryGrid";
import { SITE_NAME } from "@/lib/constants";
import { getYojiByCategory, getYojiCategories } from "@/lib/dictionary/yoji";
import type { YojiCategory } from "@/lib/dictionary/types";
import {
  YOJI_CATEGORY_LABELS,
  YOJI_DIFFICULTY_LABELS,
} from "@/lib/dictionary/types";
import styles from "./page.module.css";

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
    alternates: {
      canonical: `/dictionary/yoji/category/${category}`,
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
  const allCategories = validCategories.map((c) => ({
    slug: c,
    label: YOJI_CATEGORY_LABELS[c],
  }));

  return (
    <>
      <Breadcrumb
        items={[
          { label: "ホーム", href: "/" },
          { label: "辞典", href: "/dictionary" },
          { label: "四字熟語辞典", href: "/dictionary/yoji" },
          { label: `${categoryLabel}の四字熟語` },
        ]}
      />
      <h1 className={styles.title}>{categoryLabel}の四字熟語</h1>
      <p className={styles.count}>{yojiList.length}語収録</p>

      <CategoryNav
        categories={allCategories}
        basePath="/dictionary/yoji/category"
        activeCategory={category}
        allLabel="すべて"
        allHref="/dictionary/yoji"
      />

      <DictionaryGrid wide>
        {yojiList.map((y) => (
          <div key={y.yoji} role="listitem">
            <DictionaryCard
              type="yoji"
              yoji={y.yoji}
              reading={y.reading}
              meaning={y.meaning}
              category={categoryLabel}
              difficultyLabel={YOJI_DIFFICULTY_LABELS[y.difficulty]}
            />
          </div>
        ))}
      </DictionaryGrid>
    </>
  );
}
