import type { Metadata } from "next";
import Breadcrumb from "@/components/common/Breadcrumb";
import CategoryNav from "@/dictionary/_components/CategoryNav";
import { SITE_NAME, BASE_URL } from "@/lib/constants";
import {
  getAllKanji,
  getKanjiGrades,
  getKanjiRadicals,
  getKanjiStrokeCounts,
} from "@/dictionary/_lib/kanji";
import { KANJI_GRADE_LABELS } from "@/dictionary/_lib/types";
import KanjiIndexClient from "./KanjiIndexClient";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: `漢字辞典 | ${SITE_NAME}`,
  description:
    "常用漢字2,136字の読み方・意味・部首・画数を丁寧にまとめたオンライン漢字辞典。各漢字の使用例もあわせて確認できます。",
  keywords: ["漢字辞典", "漢字", "読み方", "常用漢字"],
  openGraph: {
    title: `漢字辞典 | ${SITE_NAME}`,
    description:
      "常用漢字2,136字の読み方・意味・部首・画数を丁寧にまとめたオンライン漢字辞典。",
    type: "website",
    url: `${BASE_URL}/dictionary/kanji`,
    siteName: SITE_NAME,
  },
  twitter: {
    card: "summary_large_image",
    title: `漢字辞典 | ${SITE_NAME}`,
    description:
      "常用漢字2,136字の読み方・意味・部首・画数を丁寧にまとめたオンライン漢字辞典。",
  },
  alternates: {
    canonical: `${BASE_URL}/dictionary/kanji`,
  },
};

export default function KanjiIndexPage() {
  const allKanji = getAllKanji();

  /* 学年別ナビゲーション */
  const gradeCategories = getKanjiGrades().map((g) => ({
    slug: g,
    label: KANJI_GRADE_LABELS[Number(g)],
  }));

  /* 部首別ナビゲーション */
  const radicalCategories = getKanjiRadicals().map((r) => ({
    slug: encodeURIComponent(r),
    label: r,
  }));

  /* 画数別ナビゲーション */
  const strokeCategories = getKanjiStrokeCounts().map((c) => ({
    slug: String(c),
    label: `${c}画`,
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
      <h1 className={styles.title}>{"漢字辞典"}</h1>
      <p className={styles.description}>
        {"常用漢字"}
        {allKanji.length}
        {
          "字の読み方・意味・部首・画数を丁寧にまとめました。漢字をクリックすると、使用例や関連する漢字も確認できます。"
        }
      </p>

      <h2>{"学年別"}</h2>
      <CategoryNav
        categories={gradeCategories}
        basePath="/dictionary/kanji/grade"
        allLabel={"すべて"}
        allHref="/dictionary/kanji"
      />

      <h2>{"部首別"}</h2>
      <CategoryNav
        categories={radicalCategories}
        basePath="/dictionary/kanji/radical"
      />

      <h2>{"画数別"}</h2>
      <CategoryNav
        categories={strokeCategories}
        basePath="/dictionary/kanji/stroke"
      />

      <KanjiIndexClient allKanji={allKanji} />
    </>
  );
}
