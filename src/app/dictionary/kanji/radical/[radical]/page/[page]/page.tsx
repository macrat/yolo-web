import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getKanjiRadicals } from "@/dictionary/_lib/kanji";
import {
  KANJI_LIST_PER_PAGE,
  isKanjiRadical,
  kanjiListEntries,
  kanjiListMetadata,
  kanjiListPageParams,
  type KanjiListScope,
} from "@/dictionary/_lib/kanji-list";
import { listPageFromParam } from "@/lib/list-pages";
import KanjiListView from "@/dictionary/_components/kanji/KanjiListView";

interface Props {
  params: Promise<{ radical: string; page: string }>;
}

export const dynamicParams = false;

export function generateStaticParams(): Array<{
  radical: string;
  page: string;
}> {
  return getKanjiRadicals().flatMap((radical) =>
    kanjiListPageParams({ type: "radical", radical }).map(({ page }) => ({
      radical,
      page,
    })),
  );
}

async function resolve(params: Props["params"]) {
  const { radical: rawRadical, page } = await params;
  const radical = decodeURIComponent(rawRadical);
  if (!isKanjiRadical(radical)) notFound();
  const scope: KanjiListScope = { type: "radical", radical };
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

/** /dictionary/kanji/radical/[radical]/page/[page] は1つの部首の漢字の一覧の2ページ目から。 */
export default async function KanjiRadicalPaginatedPage({ params }: Props) {
  const { scope, page } = await resolve(params);
  return <KanjiListView scope={scope} page={page} />;
}
