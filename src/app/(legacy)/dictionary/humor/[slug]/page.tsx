import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Breadcrumb from "@/components/common/Breadcrumb";
import ShareButtons from "@/components/common/ShareButtons";
import TrustLevelBadge from "@/components/common/TrustLevelBadge";
import {
  generateHumorDictEntryMetadata,
  generateHumorDictJsonLd,
  safeJsonLdStringify,
} from "@/lib/seo";
import { getAllSlugs, getEntryBySlug } from "@/humor-dict/data";
import RecordPlay from "@/humor-dict/_components/RecordPlay";
import EntryRatingButton from "@/humor-dict/_components/EntryRatingButton";
import styles from "./page.module.css";

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
    <>
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
      <TrustLevelBadge level="generated" />
      <RecordPlay />
      <article className={styles.article}>
        {/* ファーストビュー: 見出し語・よみがな・ユーモア定義文 */}
        <header className={styles.header}>
          <div className={styles.headingGroup}>
            <h1 className={styles.word}>{entry.word}</h1>
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

        {/* 関連語 */}
        {relatedEntries.length > 0 && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>関連語</h2>
            <ul className={styles.relatedList}>
              {relatedEntries.map((related) => (
                <li key={related.slug}>
                  <Link
                    href={`/dictionary/humor/${related.slug}`}
                    className={styles.relatedLink}
                  >
                    <span className={styles.relatedWord}>{related.word}</span>
                    <span className={styles.relatedReading}>
                      【{related.reading}】
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
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
          <Link href="/dictionary/humor">← ユーモア辞典一覧へ</Link>
        </div>
      </article>
    </>
  );
}
