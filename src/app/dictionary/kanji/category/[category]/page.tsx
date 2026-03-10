import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Breadcrumb from "@/components/common/Breadcrumb";
import TrustLevelBadge from "@/components/common/TrustLevelBadge";
import CategoryNav from "@/dictionary/_components/CategoryNav";
import DictionaryCard from "@/dictionary/_components/DictionaryCard";
import DictionaryGrid from "@/dictionary/_components/DictionaryGrid";
import { SITE_NAME, BASE_URL } from "@/lib/constants";
import {
  getKanjiByCategory,
  getKanjiCategories,
} from "@/dictionary/_lib/kanji";
import { KANJI_CATEGORY_LABELS } from "@/dictionary/_lib/types";

export function generateStaticParams() {
  return getKanjiCategories().map((category) => ({ category }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  const categoryNum = Number(category);
  const label = KANJI_CATEGORY_LABELS[categoryNum] || category;
  return {
    title: `${label}の漢字一覧 - 漢字辞典 | ${SITE_NAME}`,
    description: `「${label}」カテゴリの漢字一覧。読み方・意味・部首情報を確認できます。`,
    openGraph: {
      title: `${label}の漢字一覧 - 漢字辞典 | ${SITE_NAME}`,
      description: `「${label}」カテゴリの漢字一覧。読み方・意味・部首情報を確認できます。`,
      type: "website",
      url: `${BASE_URL}/dictionary/kanji/category/${category}`,
      siteName: SITE_NAME,
    },
    twitter: {
      card: "summary_large_image",
      title: `${label}の漢字一覧 - 漢字辞典 | ${SITE_NAME}`,
      description: `「${label}」カテゴリの漢字一覧。読み方・意味・部首情報を確認できます。`,
    },
    alternates: {
      canonical: `${BASE_URL}/dictionary/kanji/category/${category}`,
    },
  };
}

export default async function KanjiCategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const validCategories = getKanjiCategories();
  if (!validCategories.includes(category)) {
    notFound();
  }

  const categoryNum = Number(category);
  const kanjiList = getKanjiByCategory(categoryNum);
  const categoryLabel = KANJI_CATEGORY_LABELS[categoryNum];
  const allCategories = validCategories.map((c) => ({
    slug: c,
    label: KANJI_CATEGORY_LABELS[Number(c)],
  }));

  return (
    <>
      <Breadcrumb
        items={[
          { label: "\u30DB\u30FC\u30E0", href: "/" },
          { label: "\u8F9E\u5178", href: "/dictionary" },
          { label: "\u6F22\u5B57\u8F9E\u5178", href: "/dictionary/kanji" },
          { label: `${categoryLabel}\u306E\u6F22\u5B57` },
        ]}
      />
      <TrustLevelBadge level="curated" />
      <h1>
        {categoryLabel}
        {"\u306E\u6F22\u5B57"}
      </h1>
      <p>
        {kanjiList.length}
        {"\u5B57\u53CE\u9332"}
      </p>

      <CategoryNav
        categories={allCategories}
        basePath="/dictionary/kanji/category"
        activeCategory={category}
        allLabel={"\u3059\u3079\u3066"}
        allHref="/dictionary/kanji"
      />

      <DictionaryGrid>
        {kanjiList.map((k) => (
          <div key={k.character} role="listitem">
            <DictionaryCard
              type="kanji"
              character={k.character}
              readings={[...k.onYomi, ...k.kunYomi]}
              meanings={k.meanings}
              category={categoryLabel}
            />
          </div>
        ))}
      </DictionaryGrid>
    </>
  );
}
