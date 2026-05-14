import type { ToolMeta } from "@/tools/types";
import Breadcrumb from "@/components/common/Breadcrumb";
import FaqSection from "@/components/common/FaqSection";
import ShareButtons from "@/components/common/ShareButtons";
import Panel from "@/components/Panel";
import RelatedTools from "./RelatedTools";
import RelatedBlogPosts from "./RelatedBlogPosts";
import styles from "./ToolLayout.module.css";

interface ToolLayoutProps {
  meta: ToolMeta;
  children: React.ReactNode;
}

export default function ToolLayout({ meta, children }: ToolLayoutProps) {
  return (
    <article className={styles.layout}>
      {/* ゾーン1: 即座の文脈確認 */}
      <Breadcrumb
        items={[
          { label: "ホーム", href: "/" },
          { label: "ツール", href: "/tools" },
          { label: meta.name },
        ]}
      />
      <header className={styles.header}>
        <h1 className={styles.title}>{meta.name}</h1>
        {/* shortDescriptionをh1直下に表示。descriptionはSEO専用でページ上には表示しない */}
        <p className={styles.shortDescription}>{meta.shortDescription}</p>
      </header>

      {/* ゾーン2: ツール本体 — ゾーン1の直後に配置してファーストビューに近づける */}
      <Panel as="section" padding="comfortable" aria-label={meta.name}>
        {children}
      </Panel>

      {/* ゾーン3: 補助情報 — howItWorks〜RelatedBlogPosts の 6 要素を 1 つの Panel で包む */}
      <Panel
        as="section"
        padding="normal"
        aria-label="このツールに関する補助情報"
        className={styles.zone3Panel}
      >
        <section aria-label="このツールについて">
          <h2 className={styles.howItWorksHeading}>{"このツールについて"}</h2>
          <p className={styles.howItWorksText}>{meta.howItWorks}</p>
        </section>
        <p className={styles.privacyNote} role="note">
          {
            "このツールはブラウザ上で動作します。入力データがサーバーに送信されることはありません。"
          }
        </p>
        <FaqSection faq={meta.faq} />
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
        <RelatedTools
          currentSlug={meta.slug}
          relatedSlugs={meta.relatedSlugs}
        />
        <RelatedBlogPosts toolSlug={meta.slug} />
      </Panel>
    </article>
  );
}
