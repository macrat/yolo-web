import { notFound } from "next/navigation";
import Breadcrumb from "@/components/common/Breadcrumb";
import TrustLevelBadge from "@/components/common/TrustLevelBadge";
import CategoryNav from "@/dictionary/_components/CategoryNav";
import ColorCard from "@/dictionary/_components/color/ColorCard";
import DictionaryGrid from "@/dictionary/_components/DictionaryGrid";
import {
  getColorsByCategory,
  getColorCategories,
} from "@/dictionary/_lib/colors";
import type { ColorCategory } from "@/dictionary/_lib/types";
import { COLOR_CATEGORY_LABELS } from "@/dictionary/_lib/types";
import {
  generateColorCategoryMetadata,
  generateBreadcrumbJsonLd,
} from "@/lib/seo";
import styles from "./page.module.css";

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
  const allCategories = validCategories.map((c) => ({
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
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <Breadcrumb
        items={[
          { label: "ホーム", href: "/" },
          { label: "辞典", href: "/dictionary" },
          { label: "伝統色辞典", href: "/dictionary/colors" },
          { label: `${categoryLabel}の伝統色` },
        ]}
      />
      <TrustLevelBadge level="curated" />
      <h1 className={styles.title}>{categoryLabel}の伝統色</h1>
      <p className={styles.count}>{colorList.length}色収録</p>

      <CategoryNav
        categories={allCategories}
        basePath="/dictionary/colors/category"
        activeCategory={category}
        allLabel="すべて"
        allHref="/dictionary/colors"
      />

      <DictionaryGrid wide>
        {colorList.map((c) => (
          <div key={c.slug} role="listitem">
            <ColorCard
              slug={c.slug}
              name={c.name}
              romaji={c.romaji}
              hex={c.hex}
              categoryLabel={categoryLabel}
            />
          </div>
        ))}
      </DictionaryGrid>
    </>
  );
}
