import {
  generateFaqPageJsonLd,
  safeJsonLdStringify,
  type FaqEntry,
} from "@/lib/seo";
import Accordion from "@/components/Accordion";
import styles from "./FaqSection.module.css";

export type { FaqEntry };

interface FaqSectionProps {
  /** FAQ データの配列。空または undefined の場合は何も表示しない */
  faq: FaqEntry[] | undefined;
}

/**
 * よくある質問。質問ごとにアコーディオンを持ち、質問の行を押すと答えが開く。
 * 検索結果に質問と答えを出せるよう、FAQPage の JSON-LD も出す。
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
        <div>
          {faq.map((entry, index) => (
            <Accordion key={index} summary={entry.question}>
              <p className={styles.answer}>{entry.answer}</p>
            </Accordion>
          ))}
        </div>
      </section>
    </>
  );
}
