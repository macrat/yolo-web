import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Breadcrumb from "@/components/Breadcrumb";
import DictionaryEntryList, {
  type DictionaryEntryItem,
} from "@/dictionary/_components/DictionaryEntryList";
import FacetIndex from "@/dictionary/_components/FacetIndex";
import { SITE_NAME, BASE_URL } from "@/lib/constants";
import { getKanjiByRadical, getKanjiRadicals } from "@/dictionary/_lib/kanji";
import { KANJI_GRADE_LABELS } from "@/dictionary/_lib/types";
import styles from "./page.module.css";

/**
 * 漢字辞典・部首ファセット面（DESIGN.md フェーズ R・新デザイン「店構え」へ変換）。
 *
 * 旧デザイン（カードグリッド・§8-4 とピル群・§8-5・旧トークン）を全廃し、辞典の「引く体験」に
 * 揃えた——絞り込んだ漢字は共有の品書き（DictionaryEntryList）で「漢字＋読み＋意味＋学年/画数の
 * 値札」として出し、ほかの部首への導線は罫の索引（FacetIndex）で置く。部首で絞ったので値札は
 * 学年と画数を添える。色・角丸・書体・余白はすべてトークン経由（§10・直書き禁止）。
 */

export function generateStaticParams() {
  return getKanjiRadicals().map((r) => ({
    radical: r,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ radical: string }>;
}): Promise<Metadata> {
  const { radical: rawRadical } = await params;
  const radical = decodeURIComponent(rawRadical);
  const title = `部首「${radical}」の漢字一覧 - 漢字辞典 | ${SITE_NAME}`;
  const description = `部首「${radical}」を持つ漢字の一覧。読み方・意味・画数情報を確認できます。`;
  const url = `${BASE_URL}/dictionary/kanji/radical/${encodeURIComponent(radical)}`;
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

export default async function KanjiRadicalPage({
  params,
}: {
  params: Promise<{ radical: string }>;
}) {
  const { radical: rawRadical } = await params;
  const radical = decodeURIComponent(rawRadical);
  const allRadicals = getKanjiRadicals();
  if (!allRadicals.includes(radical)) {
    notFound();
  }

  const kanjiList = getKanjiByRadical(radical);

  // 品書きの行（漢字＋読み＋意味＋学年/画数の値札）。部首で絞ったので値札は学年と画数を添える。
  const entries: DictionaryEntryItem[] = kanjiList.map((k) => ({
    key: k.character,
    name: k.character,
    href: `/dictionary/kanji/${encodeURIComponent(k.character)}`,
    reading: [...k.onYomi, ...k.kunYomi].join("・") || undefined,
    note: k.meanings.join("・") || undefined,
    tags: [KANJI_GRADE_LABELS[k.grade], `${k.strokeCount}画`],
  }));

  const radicalItems = allRadicals.map((r) => ({
    slug: encodeURIComponent(r),
    label: r,
  }));

  return (
    <div className={styles.container}>
      <Breadcrumb
        items={[
          { label: "ホーム", href: "/" },
          { label: "辞典", href: "/dictionary" },
          { label: "漢字辞典", href: "/dictionary/kanji" },
          { label: `部首「${radical}」の漢字` },
        ]}
      />
      <h1 className={styles.title}>{`部首「${radical}」の漢字`}</h1>
      <p className={styles.count}>
        <span className={styles.countNum}>
          {kanjiList.length.toLocaleString("ja-JP")}
        </span>
        字を収録しています。
      </p>

      <DictionaryEntryList
        items={entries}
        ariaLabel={`部首「${radical}」の漢字一覧`}
      />

      <FacetIndex
        heading="ほかの部首から探す"
        items={radicalItems}
        basePath="/dictionary/kanji/radical"
        activeSlug={encodeURIComponent(radical)}
        allHref="/dictionary/kanji"
        ariaLabel="部首別に漢字を探す"
      />
    </div>
  );
}
