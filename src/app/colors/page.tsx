import type { Metadata } from "next";
import Breadcrumb from "@/components/common/Breadcrumb";
import CategoryNav from "@/components/dictionary/CategoryNav";
import { SITE_NAME } from "@/lib/constants";
import { getAllColors, getColorCategories } from "@/lib/dictionary/colors";
import { COLOR_CATEGORY_LABELS } from "@/lib/dictionary/types";
import { generateBreadcrumbJsonLd } from "@/lib/seo";
import ColorsIndexClient from "./ColorsIndexClient";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: `日本の伝統色 - 250色一覧 | ${SITE_NAME}`,
  description:
    "日本の伝統色250色の一覧。色名・ローマ字・カラーコード（HEX/RGB/HSL）をカテゴリ別に検索できます。",
  keywords: ["伝統色", "日本の色", "カラーコード", "和色", "色見本"],
  openGraph: {
    title: `日本の伝統色 - 250色一覧 | ${SITE_NAME}`,
    description: "日本の伝統色250色の一覧。カラーコードをカテゴリ別に検索。",
    type: "website",
  },
  alternates: {
    canonical: "/colors",
  },
};

export default function ColorsIndexPage() {
  const allColors = getAllColors();
  const categories = getColorCategories().map((c) => ({
    slug: c,
    label: COLOR_CATEGORY_LABELS[c],
  }));

  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { label: "ホーム", href: "/" },
    { label: "伝統色" },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <Breadcrumb
        items={[{ label: "ホーム", href: "/" }, { label: "伝統色" }]}
      />
      <section className={styles.hero}>
        <h1 className={styles.heroTitle}>日本の伝統色</h1>
        <p className={styles.heroSubtext}>
          日本に伝わる美しい伝統色{allColors.length}
          色を収録しています。色名やカラーコードで検索できます。
        </p>
      </section>
      <CategoryNav
        categories={categories}
        basePath="/colors/category"
        allLabel="すべて"
        allHref="/colors"
      />
      <ColorsIndexClient allColors={allColors} />
    </>
  );
}
