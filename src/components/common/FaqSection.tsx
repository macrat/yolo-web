import {
  generateFaqPageJsonLd,
  safeJsonLdStringify,
  type FaqEntry,
} from "@/lib/seo";
import styles from "./FaqSection.module.css";

interface FaqSectionProps {
  /** FAQ データの配列。空または undefined の場合は何も表示しない */
  faq: FaqEntry[] | undefined;
}

/**
 * FAQ セクションコンポーネント。
 * details/summary タグによるアコーディオン形式で Q&A を表示する。
 * ToolLayout と CheatsheetLayout の両方で使用される共通コンポーネント。
 *
 * B-024 で実装済みの FAQPage schema JSON-LD のデータソースである。
 * FAQPage JSON-LD は本コンポーネント内で自動生成・出力される。
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
                  {"\u25B6"}
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
