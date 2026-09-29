import type { ToolMeta } from "@/tools/types";
import Breadcrumb from "@/components/Breadcrumb";
import FaqSection from "@/components/FaqSection";
import PhrasedText from "@/components/PhrasedText";
import Section from "@/components/Section";
import ShareButtons from "@/components/ShareButtons";
import RelatedTools from "@/components/RelatedTools";
import RelatedBlogPosts from "@/components/RelatedBlogPosts";
import { splitIntoPhrases } from "@/lib/phrase-breaks";
import { phraseFaq } from "@/lib/faq-phrases";
import { headingFontAttr } from "@/lib/zen-antique-charset";
import TileInteractionTracker from "./TileInteractionTracker";
import styles from "./ToolPageLayout.module.css";

interface ToolPageLayoutProps {
  meta: ToolMeta;
  children: React.ReactNode;
}

const ABOUT_HEADING_ID = "about-tool-heading";

/**
 * ToolPageLayout — 道具のページの器。
 *
 * ページはセクションを上から並べる（DESIGN.md §5 ページの割り方）。
 *   1. 道具のセクション。パンくず（BreadcrumbList JSON-LD 内蔵）・主見出し（h1。meta.name）・道具の本体（children）。
 *      道具の本体を h1 のすぐ下に置き、最初の操作と結果を画面の上のほうに出す
 *   2. このツールについて。短い説明（meta.shortDescription）・仕組み（meta.howItWorks）・プライバシーの注記
 *   3. よくある質問（FaqSection。FAQPage JSON-LD 内蔵）。meta.faq が無ければセクションごと描かない
 *   4. このツールを勧める（ShareButtons）
 *   5. 関連ツール（RelatedTools）
 *   6. 関連ブログ記事（RelatedBlogPosts）
 * 5 と 6 は、並べるものが無ければセクションごと描かない。
 *
 * WebApplication JSON-LD は道具ごとに違うので、この器ではなく各ページの page.tsx が出す。
 * children が空でも、2 から下の並びは崩れない。
 */
export default function ToolPageLayout({
  meta,
  children,
}: ToolPageLayoutProps) {
  const faq = phraseFaq(meta.faq);
  return (
    <>
      <Section>
        <div className={styles.head}>
          <Breadcrumb
            items={[
              { label: "ホーム", href: "/" },
              { label: "ツール", href: "/tools" },
              { label: meta.name, href: `/tools/${meta.slug}` },
            ]}
          />
          <PhrasedText
            as="h1"
            phrases={splitIntoPhrases(meta.name)}
            {...headingFontAttr(meta.name)}
          />
        </div>
        {/* TileInteractionTracker が道具の本体を <section> で包み、その中の最初の操作
         *  （tile_first_interaction, surface:"detail"）を計測する。 */}
        <TileInteractionTracker
          itemId={meta.slug}
          ariaLabel={`${meta.name}ツール`}
        >
          {children}
        </TileInteractionTracker>
      </Section>

      <Section aria-labelledby={ABOUT_HEADING_ID}>
        <PhrasedText
          as="h2"
          id={ABOUT_HEADING_ID}
          className={styles.sectionHeading}
          phrases={["この", "ツールに", "ついて"]}
        />
        <div className={styles.about}>
          <p>{meta.shortDescription}</p>
          <p>{meta.howItWorks}</p>
          <p className={styles.privacyNote} role="note">
            {
              "このツールはブラウザ上で動作します。入力データがサーバーに送信されることはありません。"
            }
          </p>
        </div>
      </Section>

      {faq.length > 0 && (
        <Section>
          <FaqSection faq={faq} />
        </Section>
      )}

      <Section>
        <PhrasedText
          as="h2"
          className={styles.sectionHeading}
          phrases={["この", "ツールを", "勧める"]}
        />
        <ShareButtons
          url={`/tools/${meta.slug}`}
          title={meta.name}
          sns={["x", "line", "hatena", "copy"]}
          contentType="tool"
          contentId={meta.slug}
        />
      </Section>

      <RelatedTools currentSlug={meta.slug} relatedSlugs={meta.relatedSlugs} />

      <RelatedBlogPosts slug={meta.slug} />
    </>
  );
}
