import type { ToolMeta } from "@/tools/types";
import Breadcrumb from "@/components/Breadcrumb";
import FaqSection from "@/components/FaqSection";
import ShareButtons from "@/components/ShareButtons";
import RelatedTools from "@/components/RelatedTools";
import RelatedBlogPosts from "@/components/RelatedBlogPosts";
import styles from "./ToolPageLayout.module.css";

interface ToolPageLayoutProps {
  meta: ToolMeta;
  children: React.ReactNode;
}

/**
 * ToolPageLayout — 新デザインのツールページの器。
 *
 * 確定提示方式（タイル＝ツール本体を主役＝ファーストビューに描画し、
 * 補助情報を下に二次配置）を実装する。
 *
 * 要素並び順（cycle-224 判断3）:
 *   1. パンくず（Breadcrumb。BreadcrumbList JSON-LD 内蔵）
 *   2. コンパクトな h1（meta.name）+ 短説明（meta.shortDescription）
 *   3. ツール本体（children＝主役・ファーストビュー）
 *   4. howItWorks（meta.howItWorks）— ここから下は二次的
 *   5. プライバシーノート（固定文言）
 *   6. FAQ（FaqSection。meta.faq。FAQPage JSON-LD 内蔵）
 *   7. シェア（ShareButtons）
 *   8. 関連ツール（RelatedTools）
 *   9. 関連ブログ（RelatedBlogPosts）
 *
 * 制約:
 * - WebApplication JSON-LD はこの器に入れない（page.tsx 側に残す）
 * - 道具箱への追加導線は作らない（Phase 10 の責務）
 * - N-2: children が null/空要素でも howItWorks 以降のレイアウトが破綻しない
 * - 旧 --color-* トークン不使用。bold 不使用（DESIGN.md §3）
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
          { label: meta.name },
        ]}
      />

      {/* 2. コンパクトな h1 + 短説明（ファーストビューを占有しない） */}
      <header className={styles.header}>
        <h1 className={styles.title}>{meta.name}</h1>
        <p className={styles.shortDescription}>{meta.shortDescription}</p>
      </header>

      {/* 3. ツール本体（children＝主役・ファーストビュー）
       *    N-2: children が null/空でも <section> 自体は残るが、
       *    後続セクションのレイアウトは影響を受けない */}
      <section className={styles.content} aria-label={`${meta.name}ツール`}>
        {children}
      </section>

      {/* 4. howItWorks — 二次的補助情報 */}
      <section
        className={styles.howItWorksSection}
        aria-label="このツールについて"
        data-section="howItWorks"
      >
        <h2 className={styles.howItWorksHeading}>{"このツールについて"}</h2>
        <p className={styles.howItWorksText}>{meta.howItWorks}</p>
      </section>

      {/* 5. プライバシーノート（旧 ToolLayout の固定文言を踏襲） */}
      <p className={styles.privacyNote} role="note">
        {
          "このツールはブラウザ上で動作します。入力データがサーバーに送信されることはありません。"
        }
      </p>

      {/* 6. FAQ（FAQPage JSON-LD 内蔵）。faq が undefined/空のとき FaqSection は null を返す */}
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
      <RelatedBlogPosts toolSlug={meta.slug} />
    </article>
  );
}
