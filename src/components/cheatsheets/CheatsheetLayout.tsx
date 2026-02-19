import type { CheatsheetMeta } from "@/cheatsheets/types";
import Breadcrumb from "@/components/common/Breadcrumb";
import TableOfContents from "./TableOfContents";
import RelatedCheatsheets from "./RelatedCheatsheets";
import AiDisclaimer from "@/components/tools/AiDisclaimer";
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
        <p className={styles.description}>{meta.description}</p>
      </header>
      <TableOfContents sections={meta.sections} />
      <section className={styles.content} aria-label="Cheatsheet">
        {children}
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
      <AiDisclaimer />
    </article>
  );
}
