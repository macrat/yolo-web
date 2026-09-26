import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getKanjiStrokeCounts } from "@/dictionary/_lib/kanji";
import {
  KANJI_LIST_PER_PAGE,
  isKanjiStrokeCount,
  kanjiListEntries,
  kanjiListMetadata,
  kanjiListPageParams,
  type KanjiListScope,
} from "@/dictionary/_lib/kanji-list";
import { listPageFromParam } from "@/lib/list-pages";
import KanjiListView from "@/dictionary/_components/kanji/KanjiListView";

interface Props {
  params: Promise<{ count: string; page: string }>;
}

export const dynamicParams = false;

export function generateStaticParams(): Array<{
  count: string;
  page: string;
}> {
  return getKanjiStrokeCounts().flatMap((strokeCount) =>
    kanjiListPageParams({ type: "stroke", strokeCount }).map(({ page }) => ({
      count: String(strokeCount),
      page,
    })),
  );
}

async function resolve(params: Props["params"]) {
  const { count, page } = await params;
  if (!isKanjiStrokeCount(count)) notFound();
  const scope: KanjiListScope = { type: "stroke", strokeCount: Number(count) };
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

/** /dictionary/kanji/stroke/[count]/page/[page] は1つの画数の漢字の一覧の2ページ目から。 */
export default async function KanjiStrokePaginatedPage({ params }: Props) {
  const { scope, page } = await resolve(params);
  return <KanjiListView scope={scope} page={page} />;
}
