import type { ToolMeta } from "@/tools/types";
import Breadcrumb from "@/components/common/Breadcrumb";
import ShareButtons from "@/components/common/ShareButtons";
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
      <Breadcrumb
        items={[
          { label: "ホーム", href: "/" },
          { label: "ツール", href: "/tools" },
          { label: meta.name },
        ]}
      />
      <header className={styles.header}>
        <h1 className={styles.title}>{meta.name}</h1>
        <p className={styles.description}>{meta.description}</p>
      </header>
      <section className={styles.content} aria-label="Tool">
        {children}
      </section>
      <section className={styles.shareSection}>
        <h2 className={styles.shareSectionTitle}>
          {
            "\u3053\u306E\u30C4\u30FC\u30EB\u304C\u4FBF\u5229\u3060\u3063\u305F\u3089\u30B7\u30A7\u30A2"
          }
        </h2>
        <ShareButtons
          url={`/tools/${meta.slug}`}
          title={meta.name}
          sns={["x", "line", "hatena", "copy"]}
        />
      </section>
      <RelatedTools currentSlug={meta.slug} relatedSlugs={meta.relatedSlugs} />
      <RelatedBlogPosts toolSlug={meta.slug} />
    </article>
  );
}
