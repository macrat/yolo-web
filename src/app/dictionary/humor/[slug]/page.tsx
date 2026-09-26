import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Breadcrumb from "@/components/Breadcrumb";
import ItemList from "@/components/ItemList";
import ShareButtons from "@/components/ShareButtons";
import {
  generateHumorDictEntryMetadata,
  generateHumorDictJsonLd,
  safeJsonLdStringify,
} from "@/lib/seo";
import { getAllSlugs, getEntryBySlug } from "@/humor-dict/data";
import EntryRatingButton from "@/humor-dict/_components/EntryRatingButton";
import { getDefinitionPreview } from "@/humor-dict/_lib/definition-preview";
import { headingFontAttr } from "@/lib/zen-antique-charset";
import styles from "./page.module.css";

const RELATED_HEADING_ID = "related-words";

export function generateStaticParams(): Array<{ slug: string }> {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const entry = getEntryBySlug(slug);
  if (!entry) return {};
  return generateHumorDictEntryMetadata(entry);
}

export default async function HumorDictEntryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const entry = getEntryBySlug(slug);
  if (!entry) notFound();

  const jsonLd = generateHumorDictJsonLd(entry);

  // 関連語のエントリを解決する（存在するものだけ表示）
  const relatedEntries = entry.relatedSlugs
    .map((relatedSlug) => getEntryBySlug(relatedSlug))
    .filter((e): e is NonNullable<typeof e> => e !== undefined);

  return (
    <div className={styles.container}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLdStringify(jsonLd) }}
      />
      <Breadcrumb
        items={[
          { label: "ホーム", href: "/" },
          { label: "辞典", href: "/dictionary" },
          { label: "ユーモア辞典", href: "/dictionary/humor" },
          { label: entry.word },
        ]}
      />
      <article className={styles.article}>
        {/* ファーストビュー: 見出し語・よみがな・ユーモア定義文 */}
        <header className={styles.header}>
          <div className={styles.headingGroup}>
            <h1 className={styles.word} {...headingFontAttr(entry.word)}>
              {entry.word}
            </h1>
            <span className={styles.reading}>【{entry.reading}】</span>
          </div>
          <blockquote className={styles.definition}>
            <p>{entry.definition}</p>
          </blockquote>
        </header>

        {/* 解説 */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>解説</h2>
          <p className={styles.explanation}>{entry.explanation}</p>
        </section>

        {/* 用例 */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>用例</h2>
          <blockquote className={styles.example}>
            <p>{entry.example}</p>
          </blockquote>
        </section>

        {relatedEntries.length > 0 && (
          <section
            className={styles.section}
            aria-labelledby={RELATED_HEADING_ID}
          >
            <h2 id={RELATED_HEADING_ID} className={styles.sectionTitle}>
              関連語
            </h2>
            <ItemList
              labelledBy={RELATED_HEADING_ID}
              items={relatedEntries.map((related) => ({
                name: related.word,
                href: `/dictionary/humor/${related.slug}`,
                reading: related.reading,
                description: getDefinitionPreview(related.definition),
              }))}
            />
          </section>
        )}

        {/* 評価ボタン */}
        <EntryRatingButton slug={entry.slug} />

        {/* SNSシェアボタン */}
        <ShareButtons
          url={`/dictionary/humor/${entry.slug}`}
          title={`【ユーモア辞書】${entry.word}: ${entry.definition} | yolos.net`}
          contentType="humor-dictionary"
          contentId={entry.slug}
        />

        {/* 一覧へ戻るリンク */}
        <div className={styles.backLink}>
          <Link
            href="/dictionary/humor"
            className={styles.backLinkAnchor}
            data-text-box="inline"
          >
            ← ユーモア辞典一覧へ
          </Link>
        </div>
      </article>
    </div>
  );
}
