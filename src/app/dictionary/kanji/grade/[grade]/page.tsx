import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getKanjiGrades } from "@/dictionary/_lib/kanji";
import {
  isKanjiGrade,
  kanjiListMetadata,
  type KanjiListScope,
} from "@/dictionary/_lib/kanji-list";
import KanjiListView from "@/dictionary/_components/kanji/KanjiListView";

interface Props {
  params: Promise<{ grade: string }>;
}

export function generateStaticParams(): Array<{ grade: string }> {
  return getKanjiGrades().map((grade) => ({ grade }));
}

async function resolveScope(params: Props["params"]): Promise<KanjiListScope> {
  const { grade } = await params;
  if (!isKanjiGrade(grade)) notFound();
  return { type: "grade", grade: Number(grade) };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return kanjiListMetadata(await resolveScope(params), 1);
}

/** /dictionary/kanji/grade/[grade] は1つの学年の漢字の一覧の1ページ目。 */
export default async function KanjiGradePage({ params }: Props) {
  return <KanjiListView scope={await resolveScope(params)} page={1} />;
}
