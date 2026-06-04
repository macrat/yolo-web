import {
  generateFaqPageJsonLd,
  safeJsonLdStringify,
  type FaqEntry,
} from "@/lib/seo";
import styles from "./FaqSection.module.css";

export type { FaqEntry };

interface FaqSectionProps {
  /** FAQ データの配列。空または undefined の場合は何も表示しない */
  faq: FaqEntry[] | undefined;
}

/**
 * FaqSection — 新デザイン体系の FAQ セクションコンポーネント。
 *
 * - <details>/<summary> によるアコーディオン形式で Q&A を表示する。
 * - FAQPage JSON-LD を <script type="application/ld+json"> で出力し SEO を維持する。
 * - 新デザイントークン（--fg / --fg-soft / --border / --r-normal 等）のみ使用。
 * - 旧 src/components/common/FaqSection は (legacy) レイアウトで引き続き使用するため不変。
 */
export default function FaqSection({ faq }: FaqSectionProps) {
  if (!faq || faq.length === 0) {
    return null;
  }

  const jsonLd = generateFaqPageJsonLd(faq);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLdStringify(jsonLd) }}
      />
      <section className={styles.section} aria-label="FAQ">
        <h2 className={styles.heading}>よくある質問</h2>
        <div className={styles.list}>
          {faq.map((entry, index) => (
            <details key={index} className={styles.item}>
              <summary className={styles.question}>
                <span className={styles.questionLabel} aria-hidden="true">
                  Q.
                </span>
                <span className={styles.questionText}>{entry.question}</span>
                <span className={styles.indicator} aria-hidden="true">
                  {"▶"}
                </span>
              </summary>
              <div className={styles.answer}>
                <span className={styles.answerLabel} aria-hidden="true">
                  A.
                </span>
                {entry.answer}
              </div>
            </details>
          ))}
        </div>
      </section>
    </>
  );
}
