import type { Metadata } from "next";
import Breadcrumb from "@/components/common/Breadcrumb";
import TrustLevelBadge from "@/components/common/TrustLevelBadge";
import CategoryNav from "@/dictionary/_components/CategoryNav";
import { SITE_NAME } from "@/lib/constants";
import { getAllYoji, getYojiCategories } from "@/dictionary/_lib/yoji";
import { YOJI_CATEGORY_LABELS } from "@/dictionary/_lib/types";
import YojiIndexClient from "./YojiIndexClient";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: `四字熟語辞典 | ${SITE_NAME}`,
  description:
    "よく使われる四字熟語101語の読み方・意味を収録。カテゴリ・難易度別に整理された四字熟語辞典です。",
  keywords: ["四字熟語辞典", "四字熟語", "読み方", "意味", "カテゴリ"],
  openGraph: {
    title: `四字熟語辞典 | ${SITE_NAME}`,
    description: "四字熟語101語の読み方・意味を収録。",
    type: "website",
  },
  alternates: {
    canonical: "/dictionary/yoji",
  },
};

export default function YojiIndexPage() {
  const allYoji = getAllYoji();
  const categories = getYojiCategories().map((c) => ({
    slug: c,
    label: YOJI_CATEGORY_LABELS[c],
  }));

  return (
    <>
      <Breadcrumb
        items={[
          { label: "ホーム", href: "/" },
          { label: "辞典", href: "/dictionary" },
          { label: "四字熟語辞典" },
        ]}
      />
      <TrustLevelBadge level="curated" />
      <h1 className={styles.title}>四字熟語辞典</h1>
      <p className={styles.description}>
        よく使われる四字熟語{allYoji.length}
        語を収録しています。四字熟語をクリックして詳細を見ることができます。
      </p>
      <CategoryNav
        categories={categories}
        basePath="/dictionary/yoji/category"
        allLabel="すべて"
        allHref="/dictionary/yoji"
      />
      <YojiIndexClient allYoji={allYoji} />
    </>
  );
}
