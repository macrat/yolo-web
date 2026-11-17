import { generateFaqPageJsonLd, safeJsonLdStringify } from "@/lib/seo";
import Accordion from "@/components/Accordion";
import PhrasedText from "@/components/PhrasedText";
import { phrasedNameText } from "@/lib/phrased-name";
import styles from "./FaqSection.module.css";

/** 問いを文節で区切った FAQ の1件。区切りは phraseFaq（@/lib/faq-phrases）がサーバーで作る。 */
export interface PhrasedFaqEntry {
  /** 問いの文節の並び。アコーディオンのラベルとして、見出しと同じく文節で折る（DESIGN.md §4）。 */
  question: readonly string[];
  answer: string;
}

/** 区画の名前にする見出しの id。FAQ は1ページに1つだけ置く。 */
const HEADING_ID = "faq-heading";

interface FaqSectionProps {
  /** 問いを区切った FAQ の並び。空なら何も描かない。 */
  faq: readonly PhrasedFaqEntry[];
}

/**
 * よくある質問。質問ごとにアコーディオンを持ち、質問の行を押すと答えが開く。
 * 検索結果に質問と答えを出せるよう、FAQPage の JSON-LD も出す。
 *
 * 区画の名前は見出し「よくある質問」から取る。ページのセクションの中身として置き、上の切れ目は置いた側が引く（§5）。
 */
export default function FaqSection({ faq }: FaqSectionProps) {
  if (faq.length === 0) {
    return null;
  }

  const jsonLd = generateFaqPageJsonLd(
    faq.map((entry) => ({
      question: phrasedNameText(entry.question),
      answer: entry.answer,
    })),
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLdStringify(jsonLd) }}
      />
      <section aria-labelledby={HEADING_ID}>
        <PhrasedText
          as="h2"
          id={HEADING_ID}
          className={styles.heading}
          phrases={["よくある", "質問"]}
        />
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
