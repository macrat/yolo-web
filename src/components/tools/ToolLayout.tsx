import type { ToolMeta } from "@/tools/types";
import Breadcrumb from "@/components/common/Breadcrumb";
import RelatedTools from "./RelatedTools";
import RelatedBlogPosts from "./RelatedBlogPosts";
import AiDisclaimer from "./AiDisclaimer";
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
      <RelatedTools currentSlug={meta.slug} relatedSlugs={meta.relatedSlugs} />
      <RelatedBlogPosts toolSlug={meta.slug} />
      <AiDisclaimer />
    </article>
  );
}
