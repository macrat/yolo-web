import type { CheatsheetMeta } from "@/cheatsheets/types";
import Breadcrumb from "@/components/common/Breadcrumb";
import FaqSection from "@/components/common/FaqSection";
import ShareButtons from "@/components/common/ShareButtons";
import TrustLevelBadge from "@/components/common/TrustLevelBadge";
import TableOfContents from "./TableOfContents";
import RelatedCheatsheets from "./RelatedCheatsheets";
import styles from "./CheatsheetLayout.module.css";
import { allToolMetas } from "@/tools/registry";
import Link from "next/link";

interface CheatsheetLayoutProps {
  meta: CheatsheetMeta;
  children: React.ReactNode;
}

export default function CheatsheetLayout({
  meta,
  children,
}: CheatsheetLayoutProps) {
  const relatedTools = allToolMetas.filter((tool) =>
    meta.relatedToolSlugs.includes(tool.slug),
  );

  return (
    <article className={styles.layout}>
      <Breadcrumb
        items={[
          { label: "ホーム", href: "/" },
          { label: "チートシート", href: "/cheatsheets" },
          { label: meta.name },
        ]}
      />
      <header className={styles.header}>
        <h1 className={styles.title}>{meta.name}</h1>
        <TrustLevelBadge level={meta.trustLevel} />
        <p className={styles.description}>{meta.description}</p>
        {meta.valueProposition && (
          <p className={styles.valueProposition}>{meta.valueProposition}</p>
        )}
      </header>
      <TableOfContents sections={meta.sections} />
      <section className={styles.content} aria-label="Cheatsheet">
        {children}
      </section>
      {meta.usageExample && (
        <div className={styles.usageExample}>
          <p className={styles.usageExampleHeading}>こんなときに使えます</p>
          <div className={styles.usageExampleContent}>
            <div className={styles.usageExampleBox}>
              <span className={styles.usageExampleLabel}>シーン</span>
              <span className={styles.usageExampleText}>
                {meta.usageExample.input}
              </span>
            </div>
            <span className={styles.usageExampleArrow} aria-hidden="true">
              {"\u2192"}
            </span>
            <div className={styles.usageExampleBox}>
              <span className={styles.usageExampleLabel}>得られる情報</span>
              <span className={styles.usageExampleText}>
                {meta.usageExample.output}
              </span>
            </div>
          </div>
          {meta.usageExample.description && (
            <p className={styles.usageExampleDescription}>
              {meta.usageExample.description}
            </p>
          )}
        </div>
      )}
      <FaqSection faq={meta.faq} />
      <section className={styles.shareSection}>
        <h2 className={styles.shareSectionTitle}>
          {
            "\u3053\u306E\u30C1\u30FC\u30C8\u30B7\u30FC\u30C8\u3092\u30B7\u30A7\u30A2"
          }
        </h2>
        <ShareButtons
          url={`/cheatsheets/${meta.slug}`}
          title={meta.name}
          sns={["x", "line", "hatena", "copy"]}
        />
      </section>
      {relatedTools.length > 0 && (
        <nav className={styles.relatedTools} aria-label="Related tools">
          <h2 className={styles.relatedHeading}>関連ツール</h2>
          <ul className={styles.relatedList}>
            {relatedTools.map((tool) => (
              <li key={tool.slug}>
                <Link
                  href={`/tools/${tool.slug}`}
                  className={styles.relatedLink}
                >
                  <span className={styles.relatedName}>{tool.name}</span>
                  <span className={styles.relatedDesc}>
                    {tool.shortDescription}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
      <RelatedCheatsheets
        currentSlug={meta.slug}
        relatedSlugs={meta.relatedCheatsheetSlugs}
      />
    </article>
  );
}
