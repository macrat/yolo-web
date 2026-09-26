"use client";

import { useState } from "react";
import Link from "next/link";
import Button from "@/components/Button";
import ItemList from "@/components/ItemList";
import type { ColorEntry } from "@/dictionary/_lib/types";
import { COLOR_CATEGORY_LABELS } from "@/dictionary/_lib/types";
import { getColorsByCategory } from "@/dictionary/_lib/colors";
import type { HeadingFontAttr } from "@/lib/zen-antique-charset";
import styles from "./ColorDetail.module.css";

const SAME_CATEGORY_HEADING_ID = "same-category-colors";

interface ColorDetailProps {
  color: ColorEntry;
  /** 見出し（色名）を組むための属性。字の表をクライアントに入れないよう、サーバーのページが判定して渡す。 */
  titleFontAttr: HeadingFontAttr;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard API may fail in insecure contexts or denied permissions
    }
  };

  return (
    <Button onClick={handleCopy} aria-label={`${text}をコピー`}>
      {copied ? "コピー済み" : "コピー"}
    </Button>
  );
}

export default function ColorDetail({
  color,
  titleFontAttr,
}: ColorDetailProps) {
  const categoryLabel = COLOR_CATEGORY_LABELS[color.category];
  const title = `${color.name}（${color.romaji}）`;

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

  return (
    <article className={styles.detail} data-testid="color-detail">
      <div
        className={styles.swatch}
        style={{ backgroundColor: color.hex }}
        aria-label={`${color.name}の色見本`}
      />

      <h1 className={styles.title} {...titleFontAttr}>
        {title}
      </h1>

      <section className={styles.section}>
        <h2>カラーコード</h2>
        <table className={styles.codeTable}>
          <tbody>
            <tr>
              <th>HEX</th>
              <td className={styles.codeValue}>{color.hex}</td>
              <td className={styles.codeAction}>
                <CopyButton text={color.hex} />
              </td>
            </tr>
            <tr>
              <th>RGB</th>
              <td className={styles.codeValue}>{rgbText}</td>
              <td className={styles.codeAction}>
                <CopyButton text={rgbText} />
              </td>
            </tr>
            <tr>
              <th>HSL</th>
              <td className={styles.codeValue}>{hslText}</td>
              <td className={styles.codeAction}>
                <CopyButton text={hslText} />
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      <section className={styles.section}>
        <h2>カテゴリ</h2>
        <Link
          href={`/dictionary/colors/category/${color.category}`}
          className={styles.categoryLink}
          data-text-box="inline"
        >
          {categoryLabel}
        </Link>
      </section>

      <section className={styles.section}>
        <h2>関連ツール</h2>
        <Link
          href="/tools/color-converter"
          className={styles.crossLink}
          data-text-box="inline"
        >
          カラーコードを変換する
        </Link>
      </section>

      {relatedColors.length > 0 && (
        <section
          className={styles.section}
          aria-labelledby={SAME_CATEGORY_HEADING_ID}
        >
          <h2 id={SAME_CATEGORY_HEADING_ID}>
            同じカテゴリの伝統色（{categoryLabel}）
          </h2>
          <ItemList
            labelledBy={SAME_CATEGORY_HEADING_ID}
            items={relatedColors.map((c) => ({
              name: c.name,
              href: `/dictionary/colors/${c.slug}`,
              reading: c.romaji,
              swatch: c.hex,
            }))}
          />
        </section>
      )}
    </article>
  );
}
