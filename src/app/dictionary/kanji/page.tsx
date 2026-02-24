import type { Metadata } from "next";
import Breadcrumb from "@/components/common/Breadcrumb";
import CategoryNav from "@/components/dictionary/CategoryNav";
import { SITE_NAME } from "@/lib/constants";
import { getAllKanji, getKanjiCategories } from "@/lib/dictionary/kanji";
import { KANJI_CATEGORY_LABELS } from "@/lib/dictionary/types";
import KanjiIndexClient from "./KanjiIndexClient";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: `漢字辞典 | ${SITE_NAME}`,
  description:
    "小学1年生で学ぶ基本漢字80字の読み方・意味・部首・画数を丁寧にまとめたオンライン漢字辞典。各漢字の使用例もあわせて確認できます。",
  keywords: ["漢字辞典", "漢字", "読み方", "小学1年生", "基本漢字"],
  openGraph: {
    title: `漢字辞典 | ${SITE_NAME}`,
    description:
      "小学1年生で学ぶ基本漢字80字の読み方・意味・部首・画数を丁寧にまとめたオンライン漢字辞典。",
    type: "website",
  },
  alternates: {
    canonical: "/dictionary/kanji",
  },
};

export default function KanjiIndexPage() {
  const allKanji = getAllKanji();
  const categories = getKanjiCategories().map((c) => ({
    slug: c,
    label: KANJI_CATEGORY_LABELS[c],
  }));

  return (
    <>
      <Breadcrumb
        items={[
          { label: "ホーム", href: "/" },
          { label: "辞典", href: "/dictionary" },
          { label: "漢字辞典" },
        ]}
      />
      <h1 className={styles.title}>漢字辞典</h1>
      <p className={styles.description}>
        小学1年生で学ぶ基本漢字{allKanji.length}
        字の読み方・意味・部首・画数を丁寧にまとめました。漢字をクリックすると、使用例や関連する漢字も確認できます。
      </p>
      <CategoryNav
        categories={categories}
        basePath="/dictionary/kanji/category"
        allLabel="すべて"
        allHref="/dictionary/kanji"
      />
      <KanjiIndexClient allKanji={allKanji} />
    </>
  );
}
