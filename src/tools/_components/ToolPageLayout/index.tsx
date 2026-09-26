import type { ToolMeta } from "@/tools/types";
import Breadcrumb from "@/components/Breadcrumb";
import FaqSection from "@/components/FaqSection";
import ShareButtons from "@/components/ShareButtons";
import RelatedTools from "@/components/RelatedTools";
import RelatedBlogPosts from "@/components/RelatedBlogPosts";
import TileInteractionTracker from "./TileInteractionTracker";
import styles from "./ToolPageLayout.module.css";

interface ToolPageLayoutProps {
  meta: ToolMeta;
  children: React.ReactNode;
}

/**
 * ToolPageLayout — 道具のページの器。
 *
 * 道具（タイル）を主役としてページの頭のすぐ下に置き、補助の情報をその下に並べる。
 *
 * 要素の並び:
 *   1. パンくず（Breadcrumb。BreadcrumbList JSON-LD 内蔵）
 *   2. h1（meta.name）と短い説明（meta.shortDescription）
 *   3. 道具の本体（children）
 *   4. このツールについて（meta.howItWorks）
 *   5. プライバシーの注記（固定の文言）
 *   6. FAQ（FaqSection。meta.faq。FAQPage JSON-LD 内蔵）
 *   7. シェア（ShareButtons）
 *   8. 関連ツール（RelatedTools）
 *   9. 関連ブログ（RelatedBlogPosts）
 *
 * WebApplication JSON-LD は道具ごとに違うので、この器ではなく各ページの page.tsx が出す。
 * children が空でも、4 から下の並びは崩れない。
 */
export default function ToolPageLayout({
  meta,
  children,
}: ToolPageLayoutProps) {
  return (
    <article className={styles.layout}>
      {/* 1. パンくず（BreadcrumbList JSON-LD 内蔵） */}
      <Breadcrumb
        items={[
          { label: "ホーム", href: "/" },
          { label: "ツール", href: "/tools" },
          { label: meta.name, href: `/tools/${meta.slug}` },
        ]}
      />

      {/* 2. h1 と短い説明 */}
      <header className={styles.header}>
        <h1 className={styles.title}>{meta.name}</h1>
        <p className={styles.shortDescription}>{meta.shortDescription}</p>
      </header>

      {/* 3. 道具の本体。TileInteractionTracker が <section> を1つ描き、その中の最初の操作
       *    （tile_first_interaction, surface:"detail"）を計測する。 */}
      <TileInteractionTracker
        itemId={meta.slug}
        className={styles.content}
        ariaLabel={`${meta.name}ツール`}
      >
        {children}
      </TileInteractionTracker>

      {/* 4. このツールについて */}
      <section
        className={styles.howItWorksSection}
        aria-label="このツールについて"
        data-section="howItWorks"
      >
        <h2 className={styles.howItWorksHeading}>{"このツールについて"}</h2>
        <p className={styles.howItWorksText}>{meta.howItWorks}</p>
      </section>

      {/* 5. プライバシーの注記 */}
      <p className={styles.privacyNote} role="note">
        {
          "このツールはブラウザ上で動作します。入力データがサーバーに送信されることはありません。"
        }
      </p>

      {/* 6. FAQ。faq が無いとき FaqSection は何も描かない */}
      <FaqSection faq={meta.faq} />

      {/* 7. シェア */}
      <section className={styles.shareSection}>
        <h2 className={styles.shareSectionTitle}>
          {"このツールが便利だったらシェア"}
        </h2>
        <ShareButtons
          url={`/tools/${meta.slug}`}
          title={meta.name}
          sns={["x", "line", "hatena", "copy"]}
          contentType="tool"
          contentId={meta.slug}
        />
      </section>

      {/* 8. 関連ツール */}
      <RelatedTools currentSlug={meta.slug} relatedSlugs={meta.relatedSlugs} />

      {/* 9. 関連ブログ */}
      <RelatedBlogPosts slug={meta.slug} />
    </article>
  );
}
