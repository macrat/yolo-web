"use client";

import { useState } from "react";
import Link from "next/link";
import type { ColorEntry } from "@/lib/dictionary/types";
import { COLOR_CATEGORY_LABELS } from "@/lib/dictionary/types";
import { getColorsByCategory } from "@/lib/dictionary/colors";
import styles from "./ColorDetail.module.css";

interface ColorDetailProps {
  color: ColorEntry;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <button
      className={styles.copyButton}
      onClick={handleCopy}
      aria-label={`${text}をコピー`}
    >
      {copied ? "コピー済み" : "コピー"}
    </button>
  );
}

export default function ColorDetail({ color }: ColorDetailProps) {
  const categoryLabel = COLOR_CATEGORY_LABELS[color.category];

  // Shuffle colors once on mount to avoid impure function calls during render
  const [relatedColors] = useState(() => {
    const colors = getColorsByCategory(color.category).filter(
      (c) => c.slug !== color.slug,
    );

    // Fisher-Yates shuffle
    for (let i = colors.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
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

      <h1 className={styles.title}>
        {color.name}（{color.romaji}）
      </h1>

      <section className={styles.section}>
        <h2>カラーコード</h2>
        <table className={styles.codeTable}>
          <tbody>
            <tr>
              <th>HEX</th>
              <td>{color.hex}</td>
              <td>
                <CopyButton text={color.hex} />
              </td>
            </tr>
            <tr>
              <th>RGB</th>
              <td>{rgbText}</td>
              <td>
                <CopyButton text={rgbText} />
              </td>
            </tr>
            <tr>
              <th>HSL</th>
              <td>{hslText}</td>
              <td>
                <CopyButton text={hslText} />
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      <section className={styles.section}>
        <h2>カテゴリ</h2>
        <Link
          href={`/colors/category/${color.category}`}
          className={styles.categoryLink}
        >
          {categoryLabel}
        </Link>
      </section>

      <section className={styles.section}>
        <h2>関連ツール</h2>
        <Link href="/tools/color-converter" className={styles.crossLink}>
          カラーコードを変換する
        </Link>
      </section>

      {relatedColors.length > 0 && (
        <section className={styles.section}>
          <h2>同じカテゴリの伝統色（{categoryLabel}）</h2>
          <div className={styles.relatedList}>
            {relatedColors.map((c) => (
              <Link
                key={c.slug}
                href={`/colors/${c.slug}`}
                className={styles.relatedLink}
              >
                <span
                  className={styles.relatedSwatch}
                  style={{ backgroundColor: c.hex }}
                />
                <span className={styles.relatedName}>{c.name}</span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
