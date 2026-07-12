import type { Metadata } from "next";
import Breadcrumb from "@/components/Breadcrumb";
import Shinagaki, { type ShinagakiItem } from "@/components/Shinagaki";
import { SITE_NAME, BASE_URL } from "@/lib/constants";
import { getAllColors, getColorCategories } from "@/dictionary/_lib/colors";
import {
  COLOR_CATEGORY_LABELS,
  type ColorCategory,
} from "@/dictionary/_lib/types";
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

  // 「色みから探す」棚（品書き）。色相のグループを入口として並べる。
  // 並び順は虹の並び（COLOR_CATEGORY_LABELS の定義順＝赤→…→無彩色）を正準にする。
  // getColorCategories() はアルファベット順にソートするため、そのまま使うと色相の並びが崩れる。
  // 件数は値札（Nefuda）で各棚に添える（§4「メタは値札で・中身のあるものだけ」）。
  const presentCategories = new Set<ColorCategory>(getColorCategories());
  const categoryOrder = Object.keys(COLOR_CATEGORY_LABELS) as ColorCategory[];
  const categoryItems: ShinagakiItem[] = categoryOrder
    .filter((slug) => presentCategories.has(slug))
    .map((slug) => {
      const count = allColors.filter((c) => c.category === slug).length;
      return {
        name: COLOR_CATEGORY_LABELS[slug],
        href: `/dictionary/colors/category/${slug}`,
        tags: [`${count}色`],
      };
    });

  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { label: "ホーム", href: "/" },
    { label: "辞典", href: "/dictionary" },
    { label: "伝統色辞典" },
  ]);

  return (
    <div className={styles.page}>
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

      {/* 名乗り（読む面）。何が引けるかを具体で（§6）。器は静か・色見本は成果物側に置く（§2）。 */}
      <div className={styles.intro}>
        <h1 className={styles.title}>日本の伝統色</h1>
        <p className={styles.lead}>
          むかしから使われてきた和の色名を、{colorCount}色ぶん集めました。
        </p>
        <p className={styles.body}>
          それぞれの色に、色名の読み方とカラーコード（HEX・RGB・HSL）を載せています。色みのグループからたどるか、色名やコードで検索して、目当ての色を探してください。
        </p>
      </div>

      {/* 棚1: 色みから探す（色相グループへの入口・品書き） */}
      <div className={styles.shelf}>
        <Shinagaki
          heading="色みから探す"
          items={categoryItems}
          ariaLabel="色みのグループから探す品書き"
        />
      </div>

      {/* 棚2: 色名・コードから探す（検索と全色の一覧・ColorsIndexClient が担う） */}
      <div className={styles.shelf}>
        <h2 className={styles.shelfHeading}>色名・コードから探す</h2>
        <ColorsIndexClient allColors={allColors} />
      </div>
    </div>
  );
}
