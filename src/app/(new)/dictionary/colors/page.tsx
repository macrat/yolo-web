import type { Metadata } from "next";
import Breadcrumb from "@/components/Breadcrumb";
import CategoryNav from "@/dictionary/_components/new/CategoryNav";
import { SITE_NAME, BASE_URL } from "@/lib/constants";
import { getAllColors, getColorCategories } from "@/dictionary/_lib/colors";
import { COLOR_CATEGORY_LABELS } from "@/dictionary/_lib/types";
import { generateBreadcrumbJsonLd, safeJsonLdStringify } from "@/lib/seo";
import ColorsIndexClient from "./ColorsIndexClient";
import styles from "./page.module.css";

// 収録色数はデータ層から動的に算出する（メタ文言の「250色」ハードコードを排し、
// 色の増減時にメタが自動追従するようにする。B-541 の colors 分回収）。
const colorCount = getAllColors().length;

export const metadata: Metadata = {
  title: `日本の伝統色 - ${colorCount}色一覧 | ${SITE_NAME}`,
  description: `日本の伝統色${colorCount}色の一覧。色名・ローマ字・カラーコード（HEX/RGB/HSL）をカテゴリ別に検索できます。`,
  keywords: ["伝統色", "日本の色", "カラーコード", "和色", "色見本"],
  openGraph: {
    title: `日本の伝統色 - ${colorCount}色一覧 | ${SITE_NAME}`,
    description: `日本の伝統色${colorCount}色の一覧。カラーコードをカテゴリ別に検索。`,
    type: "website",
    url: `${BASE_URL}/dictionary/colors`,
    siteName: SITE_NAME,
  },
  twitter: {
    card: "summary_large_image",
    title: `日本の伝統色 - ${colorCount}色一覧 | ${SITE_NAME}`,
    description: `日本の伝統色${colorCount}色の一覧。カラーコードをカテゴリ別に検索。`,
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
    <div className={styles.container}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: safeJsonLdStringify(breadcrumbJsonLd),
        }}
      />
      <Breadcrumb
        items={[
          { label: "ホーム", href: "/" },
          { label: "辞典", href: "/dictionary" },
          { label: "伝統色辞典" },
        ]}
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
        basePath="/dictionary/colors/category"
        allLabel="すべて"
        allHref="/dictionary/colors"
      />
      <ColorsIndexClient allColors={allColors} />
    </div>
  );
}
