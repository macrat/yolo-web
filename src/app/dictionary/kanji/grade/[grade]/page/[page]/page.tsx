import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getKanjiGrades } from "@/dictionary/_lib/kanji";
import {
  KANJI_LIST_PER_PAGE,
  isKanjiGrade,
  kanjiListEntries,
  kanjiListMetadata,
  kanjiListPageParams,
  type KanjiListScope,
} from "@/dictionary/_lib/kanji-list";
import { listPageFromParam } from "@/lib/list-pages";
import KanjiListView from "@/dictionary/_components/kanji/KanjiListView";

interface Props {
  params: Promise<{ grade: string; page: string }>;
}

export const dynamicParams = false;

export function generateStaticParams(): Array<{
  grade: string;
  page: string;
}> {
  return getKanjiGrades().flatMap((grade) =>
    kanjiListPageParams({ type: "grade", grade: Number(grade) }).map(
      ({ page }) => ({ grade, page }),
    ),
  );
}

async function resolve(params: Props["params"]) {
  const { grade, page } = await params;
  if (!isKanjiGrade(grade)) notFound();
  const scope: KanjiListScope = { type: "grade", grade: Number(grade) };
  return {
    scope,
    page: listPageFromParam(
      page,
      kanjiListEntries(scope).length,
      KANJI_LIST_PER_PAGE,
    ),
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { scope, page } = await resolve(params);
  return kanjiListMetadata(scope, page);
}

/** /dictionary/kanji/grade/[grade]/page/[page] は1つの学年の漢字の一覧の2ページ目から。 */
export default async function KanjiGradePaginatedPage({ params }: Props) {
  const { scope, page } = await resolve(params);
  return <KanjiListView scope={scope} page={page} />;
}
