import type { ToolMeta } from "@/tools/types";
import Breadcrumb from "@/components/common/Breadcrumb";
import ShareButtons from "@/components/common/ShareButtons";
import TrustLevelBadge from "@/components/common/TrustLevelBadge";
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
        <TrustLevelBadge level={meta.trustLevel} />
        <p className={styles.description}>{meta.description}</p>
      </header>
      <section className={styles.content} aria-label="Tool">
        {children}
      </section>
      <p className={styles.privacyNote} role="note">
        {
          "\u3053\u306E\u30C4\u30FC\u30EB\u306F\u30D6\u30E9\u30A6\u30B6\u4E0A\u3067\u52D5\u4F5C\u3057\u307E\u3059\u3002\u5165\u529B\u30C7\u30FC\u30BF\u304C\u30B5\u30FC\u30D0\u30FC\u306B\u9001\u4FE1\u3055\u308C\u308B\u3053\u3068\u306F\u3042\u308A\u307E\u305B\u3093\u3002"
        }
      </p>
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
