import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Breadcrumb from "@/components/Breadcrumb";
import DictionaryEntryList, {
  type DictionaryEntryItem,
} from "@/dictionary/_components/DictionaryEntryList";
import FacetIndex from "@/dictionary/_components/FacetIndex";
import { SITE_NAME, BASE_URL } from "@/lib/constants";
import {
  getKanjiByStrokeCount,
  getKanjiStrokeCounts,
} from "@/dictionary/_lib/kanji";
import { KANJI_GRADE_LABELS } from "@/dictionary/_lib/types";
import styles from "./page.module.css";

/**
 * 漢字辞典・画数ファセット面（DESIGN.md フェーズ R・新デザイン「店構え」へ変換）。
 *
 * 旧デザイン（カードグリッド・§8-4 とピル群・§8-5・旧トークン）を全廃し、辞典の「引く体験」に
 * 揃えた——絞り込んだ漢字は共有の品書き（DictionaryEntryList）で「漢字＋読み＋意味＋学年の値札」
 * として出し、ほかの画数への導線は罫の索引（FacetIndex）で置く。画数で絞ったので値札は重複を
 * 避け学年を添える。色・角丸・書体・余白はすべてトークン経由（§10・直書き禁止）。
 */

export function generateStaticParams() {
  return getKanjiStrokeCounts().map((c) => ({ count: String(c) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ count: string }>;
}): Promise<Metadata> {
  const { count } = await params;
  const title = `${count}画の漢字一覧 - 漢字辞典 | ${SITE_NAME}`;
  const description = `${count}画の漢字一覧。読み方・意味・部首情報を確認できます。`;
  const url = `${BASE_URL}/dictionary/kanji/stroke/${count}`;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      url,
      siteName: SITE_NAME,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    alternates: {
      canonical: url,
    },
  };
}

export default async function KanjiStrokePage({
  params,
}: {
  params: Promise<{ count: string }>;
}) {
  const { count } = await params;
  const validCounts = getKanjiStrokeCounts().map(String);
  if (!validCounts.includes(count)) {
    notFound();
  }

  const strokeCount = Number(count);
  const kanjiList = getKanjiByStrokeCount(strokeCount);

  // 品書きの行（漢字＋読み＋意味＋学年の値札）。画数で絞ったので値札は学年（画数は重複）。
  const entries: DictionaryEntryItem[] = kanjiList.map((k) => ({
    key: k.character,
    name: k.character,
    href: `/dictionary/kanji/${encodeURIComponent(k.character)}`,
    reading: [...k.onYomi, ...k.kunYomi].join("・") || undefined,
    note: k.meanings.join("・") || undefined,
    tags: [KANJI_GRADE_LABELS[k.grade]],
  }));

  const strokeItems = validCounts.map((c) => ({
    slug: c,
    label: `${c}画`,
  }));

  return (
    <div className={styles.container}>
      <Breadcrumb
        items={[
          { label: "ホーム", href: "/" },
          { label: "辞典", href: "/dictionary" },
          { label: "漢字辞典", href: "/dictionary/kanji" },
          { label: `${count}画の漢字` },
        ]}
      />
      <h1 className={styles.title}>{`${count}画の漢字`}</h1>
      <p className={styles.count}>
        <span className={styles.countNum}>
          {kanjiList.length.toLocaleString("ja-JP")}
        </span>
        字を収録しています。
      </p>

      <DictionaryEntryList items={entries} ariaLabel={`${count}画の漢字一覧`} />

      <FacetIndex
        heading="ほかの画数から探す"
        items={strokeItems}
        basePath="/dictionary/kanji/stroke"
        activeSlug={count}
        allHref="/dictionary/kanji"
        ariaLabel="画数別に漢字を探す"
      />
    </div>
  );
}
