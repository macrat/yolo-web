import type { Metadata } from "next";
import Breadcrumb from "@/components/common/Breadcrumb";
import TrustLevelBadge from "@/components/common/TrustLevelBadge";
import CategoryNav from "@/dictionary/_components/CategoryNav";
import { SITE_NAME, BASE_URL } from "@/lib/constants";
import { getAllColors, getColorCategories } from "@/dictionary/_lib/colors";
import { COLOR_CATEGORY_LABELS } from "@/dictionary/_lib/types";
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
    url: `${BASE_URL}/dictionary/colors`,
  },
  alternates: {
    canonical: `${BASE_URL}/dictionary/colors`,
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
    { label: "辞典", href: "/dictionary" },
    { label: "伝統色辞典" },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <Breadcrumb
        items={[
          { label: "ホーム", href: "/" },
          { label: "辞典", href: "/dictionary" },
          { label: "伝統色辞典" },
        ]}
      />
      <TrustLevelBadge level="curated" />
      <section className={styles.hero}>
        <h1 className={styles.heroTitle}>日本の伝統色</h1>
        <p className={styles.heroSubtext}>
          日本に伝わる美しい伝統色{allColors.length}
          色を収録しています。色名やカラーコードで検索できます。
        </p>
      </section>
      <CategoryNav
        categories={categories}
        basePath="/dictionary/colors/category"
        allLabel="すべて"
        allHref="/dictionary/colors"
      />
      <ColorsIndexClient allColors={allColors} />
    </>
  );
}
