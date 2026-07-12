import { notFound } from "next/navigation";
import Breadcrumb from "@/components/Breadcrumb";
import DictionaryEntryList, {
  type DictionaryEntryItem,
} from "@/dictionary/_components/DictionaryEntryList";
import FacetIndex from "@/dictionary/_components/FacetIndex";
import {
  getColorsByCategory,
  getColorCategories,
} from "@/dictionary/_lib/colors";
import type { ColorCategory } from "@/dictionary/_lib/types";
import { COLOR_CATEGORY_LABELS } from "@/dictionary/_lib/types";
import {
  generateColorCategoryMetadata,
  generateBreadcrumbJsonLd,
  safeJsonLdStringify,
} from "@/lib/seo";
import styles from "./page.module.css";

/**
 * 伝統色辞典・色みファセット面（DESIGN.md フェーズ R・新デザイン「店構え」へ変換）。
 *
 * 旧デザイン（ColorCard のカードグリッド・§8-4 とピル群・§8-5・旧トークン）を全廃し、辞典の
 * 「引く体験」に揃えた——絞り込んだ色は共有の品書き（DictionaryEntryList）で「色名＋色見本＋
 * ローマ字＋HEX の値札」として出し、ほかの色みへの導線は罫の索引（FacetIndex）で置く。
 * 色見本は成果物の中身＝和色（§2 の唯一の例外）としてデータ由来の変数で当て、器には漏らさない。
 * 色・角丸・書体・余白はすべてトークン経由（§10・直書き禁止）。BreadcrumbList JSON-LD は維持。
 */

export function generateStaticParams() {
  return getColorCategories().map((category) => ({ category }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const label = COLOR_CATEGORY_LABELS[category as ColorCategory] || category;
  return generateColorCategoryMetadata(category, label);
}

export default async function ColorCategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const validCategories = getColorCategories();
  if (!validCategories.includes(category as ColorCategory)) {
    notFound();
  }

  const colorList = getColorsByCategory(category as ColorCategory);
  const categoryLabel = COLOR_CATEGORY_LABELS[category as ColorCategory];

  // 品書きの行（色名＋色見本＋ローマ字＋HEX の値札）。swatch は成果物の中身＝和色（§2）。
  const entries: DictionaryEntryItem[] = colorList.map((c) => ({
    key: c.slug,
    name: c.name,
    href: `/dictionary/colors/${c.slug}`,
    reading: c.romaji,
    swatch: c.hex,
    tags: [c.hex],
  }));

  const categoryItems = validCategories.map((c) => ({
    slug: c,
    label: COLOR_CATEGORY_LABELS[c],
  }));

  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { label: "ホーム", href: "/" },
    { label: "辞典", href: "/dictionary" },
    { label: "伝統色辞典", href: "/dictionary/colors" },
    { label: `${categoryLabel}の伝統色` },
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
          { label: "伝統色辞典", href: "/dictionary/colors" },
          { label: `${categoryLabel}の伝統色` },
        ]}
      />
      <h1 className={styles.title}>{`${categoryLabel}の伝統色`}</h1>
      <p className={styles.count}>
        <span className={styles.countNum}>
          {colorList.length.toLocaleString("ja-JP")}
        </span>
        色を収録しています。
      </p>

      <DictionaryEntryList
        items={entries}
        ariaLabel={`${categoryLabel}の伝統色一覧`}
      />

      <FacetIndex
        heading="ほかの色みから探す"
        items={categoryItems}
        basePath="/dictionary/colors/category"
        activeSlug={category}
        allHref="/dictionary/colors"
        ariaLabel="色みのグループから伝統色を探す"
      />
    </div>
  );
}
