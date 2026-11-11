import type { ReactNode } from "react";
import { safeJsonLdStringify } from "@/lib/seo";
import type { BreadcrumbItem } from "@/lib/seo";
import type { DictionaryMeta } from "@/dictionary/_lib/types";
import type { PlayContentMeta } from "@/play/types";
import Breadcrumb from "@/components/Breadcrumb";
import FaqSection from "@/components/FaqSection";
import PhrasedText from "@/components/PhrasedText";
import Section from "@/components/Section";
import ShareButtons from "@/components/ShareButtons";
import { phraseFaq } from "@/lib/faq-phrases";
import PlayRecommendBlock from "./PlayRecommendBlock";
import styles from "./DictionaryDetailLayout.module.css";

interface DictionaryDetailLayoutProps {
  /** 辞典のメタデータ（名乗りの一言と FAQ）。 */
  meta: DictionaryMeta;
  /** パンくず。ホームから、いま開いている項目まで。 */
  breadcrumbItems: BreadcrumbItem[];
  /** 項目の構造化データ。1つか、その並び。パンくずと FAQ の構造化データは枠が出すので含めない。 */
  jsonLd: object | object[];
  /** 共有する項目のパス（例: "/dictionary/kanji/山"）。 */
  shareUrl: string;
  /** 共有する項目の題。 */
  shareTitle: string;
  /** 共有のセクションの見出しの区切りの並び（例: ["この", "漢字を", "共有"]）。 */
  shareHeading: readonly string[];
  /**
   * 項目の中身を組む関数。ページの頭（パンくずと名乗りの一言）を受け取り、それを最初のセクションの頭に置いて、
   * 項目の本文のセクションから同じ仲間の索引・関連のセクションまでを返す。
   */
  children: (head: ReactNode) => ReactNode;
  /** 末尾に並べる遊びのおすすめ。無ければそのセクションを描かない。 */
  playRecommendations?: PlayContentMeta[];
}

/**
 * 辞典の詳細のページ（漢字・四字熟語・伝統色）の組み方。ページはセクションを上から並べる（DESIGN.md §5 ページの割り方）。
 *   1. 項目の中身（children が返すセクション）。最初のセクションの頭に、ここで作るパンくずと名乗りの一言が立ち、
 *      そのあとに項目の本文（主見出しを含む）が続く。同じ仲間の索引と関連は、そのあとのセクションになる
 *   2. よくある質問（FAQPage の JSON-LD を持つ）
 *   3. 項目の共有
 *   4. 遊びのおすすめ（PlayRecommendBlock）
 */
export default function DictionaryDetailLayout({
  meta,
  breadcrumbItems,
  jsonLd,
  shareUrl,
  shareTitle,
  shareHeading,
  children,
  playRecommendations,
}: DictionaryDetailLayoutProps) {
  const faq = phraseFaq(meta.faq);
  const head = (
    <div className={styles.head}>
      <Breadcrumb items={breadcrumbItems} />
      {meta.valueProposition && (
        <p className={styles.valueProposition}>{meta.valueProposition}</p>
      )}
    </div>
  );

  return (
    <>
      {(Array.isArray(jsonLd) ? jsonLd : [jsonLd]).map((ld, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonLdStringify(ld) }}
        />
      ))}

      {children(head)}

      {faq.length > 0 && (
        <Section>
          <FaqSection faq={faq} />
        </Section>
      )}

      <Section>
        <PhrasedText
          as="h2"
          className={styles.sectionHeading}
          phrases={shareHeading}
        />
        <ShareButtons
          url={shareUrl}
          title={shareTitle}
          sns={["x", "line", "copy"]}
          contentType="dictionary"
          contentId={shareUrl}
        />
      </Section>

      {playRecommendations && (
        <PlayRecommendBlock recommendations={playRecommendations} />
      )}
    </>
  );
}
