import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumb from "@/components/common/Breadcrumb";
import TrustLevelBadge from "@/components/common/TrustLevelBadge";
import { generateHumorDictMetadata, safeJsonLdStringify } from "@/lib/seo";
import { getAllEntries } from "@/humor-dict/data";
import { humorDictMeta } from "@/humor-dict/meta";
import styles from "./page.module.css";

export const metadata: Metadata = generateHumorDictMetadata();

/**
 * 定義文から最初の一文を抽出してプレビューとして返す。
 * 句点（。）で区切り、なければ全文を返す。
 */
function getDefinitionPreview(definition: string): string {
  const firstSentenceEnd = definition.indexOf("。");
  if (firstSentenceEnd !== -1) {
    return definition.slice(0, firstSentenceEnd + 1);
  }
  return definition;
}

export default function HumorDictIndexPage() {
  const entries = getAllEntries();

  const definedTermSetJsonLd = {
    "@context": "https://schema.org",
    "@type": "DefinedTermSet",
    name: humorDictMeta.title,
    description: humorDictMeta.description,
    url: "https://yolos.net/dictionary/humor",
    inLanguage: "ja",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: safeJsonLdStringify(definedTermSetJsonLd),
        }}
      />
      <Breadcrumb
        items={[
          { label: "ホーム", href: "/" },
          { label: "辞典", href: "/dictionary" },
          { label: "ユーモア辞典" },
        ]}
      />
      <TrustLevelBadge level="generated" />
      <section className={styles.hero}>
        <h1 className={styles.heroTitle}>{humorDictMeta.title}</h1>
        <p className={styles.heroSubtext}>
          {humorDictMeta.description}
          <br />全{entries.length}語を五十音順に収録しています。
        </p>
      </section>
      <section>
        <ul className={styles.entryList} aria-label="ユーモア辞典 見出し語一覧">
          {entries.map((entry) => (
            <li key={entry.slug} className={styles.entryItem}>
              <Link
                href={`/dictionary/humor/${entry.slug}`}
                className={styles.entryLink}
              >
                <span className={styles.entryWord}>{entry.word}</span>
                <span className={styles.entryReading}>【{entry.reading}】</span>
                <span className={styles.entryPreview}>
                  {getDefinitionPreview(entry.definition)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
