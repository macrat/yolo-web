import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Breadcrumb from "@/components/common/Breadcrumb";
import TrustLevelBadge from "@/components/common/TrustLevelBadge";
import CategoryNav from "@/dictionary/_components/CategoryNav";
import DictionaryCard from "@/dictionary/_components/DictionaryCard";
import DictionaryGrid from "@/dictionary/_components/DictionaryGrid";
import { SITE_NAME, BASE_URL } from "@/lib/constants";
import { getKanjiByGrade, getKanjiGrades } from "@/dictionary/_lib/kanji";
import { KANJI_GRADE_LABELS } from "@/dictionary/_lib/types";

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
  const allGrades = validGrades.map((g) => ({
    slug: g,
    label: KANJI_GRADE_LABELS[Number(g)],
  }));

  return (
    <>
      <Breadcrumb
        items={[
          { label: "ホーム", href: "/" },
          { label: "辞典", href: "/dictionary" },
          { label: "漢字辞典", href: "/dictionary/kanji" },
          { label: `${gradeLabel}の漢字` },
        ]}
      />
      <TrustLevelBadge level="curated" />
      <h1>
        {gradeLabel}
        {"の漢字"}
      </h1>
      <p>
        {kanjiList.length}
        {"字収録"}
      </p>

      <CategoryNav
        categories={allGrades}
        basePath="/dictionary/kanji/grade"
        activeCategory={grade}
        allLabel={"すべて"}
        allHref="/dictionary/kanji"
      />

      <DictionaryGrid>
        {kanjiList.map((k) => (
          <div key={k.character} role="listitem">
            <DictionaryCard
              type="kanji"
              character={k.character}
              readings={[...k.onYomi, ...k.kunYomi]}
              meanings={k.meanings}
              category={gradeLabel}
            />
          </div>
        ))}
      </DictionaryGrid>
    </>
  );
}
