import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Breadcrumb from "@/components/Breadcrumb";
import ItemList from "@/components/ItemList";
import PhrasedText from "@/components/PhrasedText";
import Section from "@/components/Section";
import ShareButtons from "@/components/ShareButtons";
import {
  generateHumorDictEntryMetadata,
  generateHumorDictJsonLd,
  safeJsonLdStringify,
} from "@/lib/seo";
import { getAllSlugs, getEntryBySlug } from "@/humor-dict/data";
import EntryRatingButton from "@/humor-dict/_components/EntryRatingButton";
import { getDefinitionPreview } from "@/humor-dict/_lib/definition-preview";
import { humorShareImageContent } from "@/humor-dict/_lib/share-image-content";
import { shareOpenGraphImage } from "@/lib/share-image";
import { splitIntoPhrases } from "@/lib/phrase-breaks";
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
  if (!entry) notFound();
  return generateHumorDictEntryMetadata(
    entry,
    shareOpenGraphImage(
      `/dictionary/humor/${slug}`,
      humorShareImageContent(entry),
    ),
  );
}

/**
 * ユーモア辞典の見出し語の詳細（DESIGN.md §5 ページの割り方）。最初のセクションに、パンくずと項目の本文
 * （主見出しの見出し語・読み・定義・解説・用例）を置く。そのあとに、関連語・評価・共有・一覧へ戻る道を、
 * この順にそれぞれのセクションにする。
 */
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

      <Section>
        <Breadcrumb
          items={[
            { label: "ホーム", href: "/" },
            { label: "辞典", href: "/dictionary" },
            { label: "ユーモア辞典", href: "/dictionary/humor" },
            { label: entry.word, href: `/dictionary/humor/${entry.slug}` },
          ]}
        />
        <article className={styles.entry}>
          <PhrasedText
            as="h1"
            phrases={splitIntoPhrases(entry.word)}
            {...headingFontAttr(entry.word)}
          />
          <p className={styles.reading}>{entry.reading}</p>
          <p className={styles.definition}>{entry.definition}</p>

          <PhrasedText
            as="h2"
            className={styles.subheading}
            phrases={["解説"]}
          />
          <p className={styles.text}>{entry.explanation}</p>

          <PhrasedText
            as="h2"
            className={styles.subheading}
            phrases={["用例"]}
          />
          <p className={styles.text}>{entry.example}</p>
        </article>
      </Section>

      {relatedEntries.length > 0 && (
        <Section>
          <PhrasedText
            as="h2"
            id={RELATED_HEADING_ID}
            className={styles.sectionHeading}
            phrases={["関連語"]}
          />
          <ItemList
            labelledBy={RELATED_HEADING_ID}
            items={relatedEntries.map((related) => ({
              name: related.word,
              href: `/dictionary/humor/${related.slug}`,
              reading: related.reading,
              description: getDefinitionPreview(related.definition),
            }))}
          />
        </Section>
      )}

      <Section>
        <PhrasedText
          as="h2"
          className={styles.sectionHeading}
          phrases={["この", "言葉を", "評価"]}
        />
        <EntryRatingButton slug={entry.slug} />
      </Section>

      <Section>
        <PhrasedText
          as="h2"
          className={styles.sectionHeading}
          phrases={["この", "言葉を", "共有"]}
        />
        <ShareButtons
          url={`/dictionary/humor/${entry.slug}`}
          title={`【ユーモア辞書】${entry.word}: ${entry.definition} | yolos.net`}
          contentType="humor-dictionary"
          contentId={entry.slug}
        />
      </Section>

      <Section>
        <PhrasedText
          as="h2"
          className={styles.sectionHeading}
          phrases={["ほかの", "言葉を", "探す"]}
        />
        <Link
          href="/dictionary/humor"
          className={styles.link}
          data-text-box="inline"
        >
          ユーモア辞典の一覧へ
        </Link>
      </Section>
    </>
  );
}
