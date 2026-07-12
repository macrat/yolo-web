import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Breadcrumb from "@/components/Breadcrumb";
import DictionaryEntryList, {
  type DictionaryEntryItem,
} from "@/dictionary/_components/DictionaryEntryList";
import FacetIndex from "@/dictionary/_components/FacetIndex";
import { SITE_NAME, BASE_URL } from "@/lib/constants";
import { getKanjiByGrade, getKanjiGrades } from "@/dictionary/_lib/kanji";
import { KANJI_GRADE_LABELS } from "@/dictionary/_lib/types";
import styles from "./page.module.css";

/**
 * 漢字辞典・学年ファセット面（DESIGN.md フェーズ R・新デザイン「店構え」へ変換）。
 *
 * 旧デザイン（共有 DictionaryGrid/DictionaryCard のカードグリッド・§8-4 と CategoryNav の
 * ピル群・§8-5・旧トークン）を全廃し、辞典の「引く体験」に揃えた——絞り込んだ漢字は
 * 共有の品書き（DictionaryEntryList・罫区切りリスト）で「漢字＋読み＋意味＋画数の値札」として
 * 出し、ほかの学年への導線は罫の索引（FacetIndex・トップのファセット索引と同じ流儀）で置く。
 * 学年で絞ったので値札は重複を避け画数を添える（§4「値札は情報であって装飾ではない」）。
 * 色・角丸・書体・余白はすべてトークン経由（§10・直書き禁止）。インライン style は使わない。
 */

export function generateStaticParams() {
  return getKanjiGrades().map((grade) => ({ grade }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ grade: string }>;
}): Promise<Metadata> {
  const { grade } = await params;
  const gradeNum = Number(grade);
  const label = KANJI_GRADE_LABELS[gradeNum] || grade;
  const title = `${label}の漢字一覧 - 漢字辞典 | ${SITE_NAME}`;
  const description = `${label}で習う漢字の一覧。読み方・意味・部首情報を確認できます。`;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      url: `${BASE_URL}/dictionary/kanji/grade/${grade}`,
      siteName: SITE_NAME,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    alternates: {
      canonical: `${BASE_URL}/dictionary/kanji/grade/${grade}`,
    },
  };
}

export default async function KanjiGradePage({
  params,
}: {
  params: Promise<{ grade: string }>;
}) {
  const { grade } = await params;
  const validGrades = getKanjiGrades();
  if (!validGrades.includes(grade)) {
    notFound();
  }

  const gradeNum = Number(grade);
  const kanjiList = getKanjiByGrade(gradeNum);
  const gradeLabel = KANJI_GRADE_LABELS[gradeNum];

  // 品書きの行（漢字＋読み＋意味＋画数の値札）。学年で絞ったので値札は画数（学年は重複）。
  const entries: DictionaryEntryItem[] = kanjiList.map((k) => ({
    key: k.character,
    name: k.character,
    href: `/dictionary/kanji/${encodeURIComponent(k.character)}`,
    reading: [...k.onYomi, ...k.kunYomi].join("・") || undefined,
    note: k.meanings.join("・") || undefined,
    tags: [`${k.strokeCount}画`],
  }));

  const gradeItems = validGrades.map((g) => ({
    slug: g,
    label: KANJI_GRADE_LABELS[Number(g)],
  }));

  return (
    <div className={styles.container}>
      <Breadcrumb
        items={[
          { label: "ホーム", href: "/" },
          { label: "辞典", href: "/dictionary" },
          { label: "漢字辞典", href: "/dictionary/kanji" },
          { label: `${gradeLabel}の漢字` },
        ]}
      />
      <h1 className={styles.title}>{`${gradeLabel}の漢字`}</h1>
      <p className={styles.count}>
        <span className={styles.countNum}>
          {kanjiList.length.toLocaleString("ja-JP")}
        </span>
        字を収録しています。
      </p>

      <DictionaryEntryList
        items={entries}
        ariaLabel={`${gradeLabel}の漢字一覧`}
      />

      <FacetIndex
        heading="ほかの学年から探す"
        items={gradeItems}
        basePath="/dictionary/kanji/grade"
        activeSlug={grade}
        allHref="/dictionary/kanji"
        ariaLabel="学年別に漢字を探す"
      />
    </div>
  );
}
