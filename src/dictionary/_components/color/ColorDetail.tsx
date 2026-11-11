"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import DataTable from "@/components/DataTable";
import ItemList from "@/components/ItemList";
import PhrasedText from "@/components/PhrasedText";
import Section from "@/components/Section";
import type { ColorEntry } from "@/dictionary/_lib/types";
import { COLOR_CATEGORY_LABELS } from "@/dictionary/_lib/types";
import { getColorsByCategory } from "@/dictionary/_lib/colors";
import type { HeadingFontAttr } from "@/lib/zen-antique-charset";
import styles from "./ColorDetail.module.css";

const COLOR_CODE_HEADING_ID = "color-code";
const SAME_CATEGORY_HEADING_ID = "same-category-colors";

interface ColorDetailProps {
  /** ページの頭（パンくずなど）。項目の本文のセクションの頭に置く。 */
  head: ReactNode;
  color: ColorEntry;
  /**
   * 主見出し（色名）を組むための折り所の区切りと属性。区切りの関数と字の表をクライアントに入れないよう、
   * サーバーのページが作って渡す。
   */
  namePhrases: string[];
  nameFontAttr: HeadingFontAttr;
}

/**
 * 伝統色の詳細（DESIGN.md §5 ページの割り方）。最初のセクションに項目の本文（主見出しの色名・読み・色見本・
 * カラーコード・カテゴリ）を置き、同じカテゴリの伝統色と関連ツールを、この順にそれぞれそのあとのセクションにする。
 * 読みは見出しに含めず、見出しの下に補助情報として添える（§4。丸括弧の読みを見出しに入れると、長い読みが
 * 狭い画面で括弧の中で折れる）。
 */
export default function ColorDetail({
  color,
  namePhrases,
  nameFontAttr,
  head,
}: ColorDetailProps) {
  const categoryLabel = COLOR_CATEGORY_LABELS[color.category];

  // Use a deterministic shuffle seeded by the color slug to avoid
  // SSR/CSR hydration mismatch. Math.random() would produce different
  // results on server vs client, causing React hydration warnings.
  const [relatedColors] = useState(() => {
    const colors = getColorsByCategory(color.category).filter(
      (c) => c.slug !== color.slug,
    );

    // Simple deterministic hash from slug for seeding the shuffle.
    // This ensures the same color page always shows the same related colors
    // in the same order, which is fine for the "related colors" use case.
    let seed = 0;
    for (let i = 0; i < color.slug.length; i++) {
      seed = (seed * 31 + color.slug.charCodeAt(i)) | 0;
    }

    // Seeded pseudo-random number generator (linear congruential generator)
    const seededRandom = (): number => {
      seed = (seed * 1664525 + 1013904223) | 0;
      return (seed >>> 0) / 0x100000000;
    };

    // Fisher-Yates shuffle with seeded random
    for (let i = colors.length - 1; i > 0; i--) {
      const j = Math.floor(seededRandom() * (i + 1));
      [colors[i], colors[j]] = [colors[j], colors[i]];
    }

    return colors.slice(0, 6);
  });

  const rgbText = `rgb(${color.rgb.join(", ")})`;
  const hslText = `hsl(${color.hsl[0]}, ${color.hsl[1]}%, ${color.hsl[2]}%)`;
  const codes = [
    { key: "hex", label: "HEX", text: color.hex },
    { key: "rgb", label: "RGB", text: rgbText },
    { key: "hsl", label: "HSL", text: hslText },
  ];

  return (
    <>
      <Section>
        {head}
        <article data-testid="color-detail">
          <PhrasedText as="h1" phrases={namePhrases} {...nameFontAttr} />
          <p className={styles.reading}>{color.romaji}</p>
          {/* 色の名前とカラーコードは字が伝えるので、色見本は読み上げに出さない。 */}
          <div
            className={styles.swatch}
            style={{ backgroundColor: color.hex }}
            aria-hidden="true"
            data-testid="color-swatch"
          />

          <PhrasedText
            as="h2"
            id={COLOR_CODE_HEADING_ID}
            className={styles.subheading}
            phrases={["カラーコード"]}
          />
          {/* 値は1つの文節として渡す。値の中の空白が折り所になる。 */}
          <DataTable
            labelledBy={COLOR_CODE_HEADING_ID}
            rows={codes.map(({ key, label, text }) => ({
              key,
              header: [label],
              cells: [[text]],
              copy: { text, target: label },
            }))}
          />

          <PhrasedText
            as="h2"
            className={styles.subheading}
            phrases={["カテゴリ"]}
          />
          <Link
            href={`/dictionary/colors/category/${color.category}`}
            className={styles.link}
            data-text-box="inline"
          >
            {categoryLabel}
          </Link>
        </article>
      </Section>

      {relatedColors.length > 0 && (
        <Section>
          <PhrasedText
            as="h2"
            id={SAME_CATEGORY_HEADING_ID}
            className={styles.sectionHeading}
            phrases={["同じ", "カテゴリの", "伝統色", `（${categoryLabel}）`]}
          />
          <ItemList
            labelledBy={SAME_CATEGORY_HEADING_ID}
            items={relatedColors.map((c) => ({
              name: c.name,
              href: `/dictionary/colors/${c.slug}`,
              reading: c.romaji,
              swatch: c.hex,
            }))}
          />
        </Section>
      )}

      <Section>
        <PhrasedText
          as="h2"
          className={styles.sectionHeading}
          phrases={["関連", "ツール"]}
        />
        <Link
          href="/tools/color-converter"
          className={styles.link}
          data-text-box="inline"
        >
          カラーコードを変換する
        </Link>
      </Section>
    </>
  );
}
