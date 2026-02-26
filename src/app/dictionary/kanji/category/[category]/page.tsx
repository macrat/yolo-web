import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Breadcrumb from "@/components/common/Breadcrumb";
import CategoryNav from "@/dictionary/_components/CategoryNav";
import DictionaryCard from "@/dictionary/_components/DictionaryCard";
import DictionaryGrid from "@/dictionary/_components/DictionaryGrid";
import { SITE_NAME } from "@/lib/constants";
import {
  getKanjiByCategory,
  getKanjiCategories,
} from "@/dictionary/_lib/kanji";
import type { KanjiCategory } from "@/dictionary/_lib/types";
import { KANJI_CATEGORY_LABELS } from "@/dictionary/_lib/types";
import styles from "./page.module.css";

/** Descriptive text for single-entry categories to avoid thin content */
const SINGLE_ENTRY_DESCRIPTIONS: Partial<Record<KanjiCategory, string>> = {
  fire: "「火」は自然現象の一つであり、古代から人類の生活に欠かせない存在です。火に関する漢字は、熱や光、エネルギーに関連する意味を持つものが多くあります。",
  language:
    "言語に関する漢字は、学問や教育と深い関わりがあります。文字や言葉を通じて知識を伝え、学ぶことの大切さを表しています。",
  building:
    "建物に関する漢字は、人々が集まり学び生活する場所を表します。社会の基盤となる施設や構造物に関連しています。",
  action:
    "動作に関する漢字は、生きること・活動することを表します。人間の根本的な営みや行動を示す重要な漢字です。",
  weather:
    "天気に関する漢字は、自然の気象現象を表します。日本では四季の変化が豊かであり、天気を表す漢字は日常的によく使われます。",
  tool: "道具に関する漢字は、人間が作り出した物や素材を表します。金属や工具など、文明の発展に関わる重要な概念を含んでいます。",
};

export function generateStaticParams() {
  return getKanjiCategories().map((category) => ({ category }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  const label = KANJI_CATEGORY_LABELS[category as KanjiCategory] || category;
  return {
    title: `${label}の漢字一覧 - 漢字辞典 | ${SITE_NAME}`,
    description: `「${label}」カテゴリの漢字一覧。読み方・意味・部首情報を確認できます。`,
    alternates: {
      canonical: `/dictionary/kanji/category/${category}`,
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
  if (!validCategories.includes(category as KanjiCategory)) {
    notFound();
  }

  const kanjiList = getKanjiByCategory(category as KanjiCategory);
  const categoryLabel = KANJI_CATEGORY_LABELS[category as KanjiCategory];
  const allCategories = validCategories.map((c) => ({
    slug: c,
    label: KANJI_CATEGORY_LABELS[c],
  }));

  const singleEntryDesc = SINGLE_ENTRY_DESCRIPTIONS[category as KanjiCategory];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "ホーム", href: "/" },
          { label: "辞典", href: "/dictionary" },
          { label: "漢字辞典", href: "/dictionary/kanji" },
          { label: `${categoryLabel}の漢字` },
        ]}
      />
      <h1 className={styles.title}>{categoryLabel}の漢字</h1>
      <p className={styles.count}>{kanjiList.length}字収録</p>

      {singleEntryDesc && kanjiList.length <= 1 && (
        <p className={styles.singleEntryNote}>{singleEntryDesc}</p>
      )}

      <CategoryNav
        categories={allCategories}
        basePath="/dictionary/kanji/category"
        activeCategory={category}
        allLabel="すべて"
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
