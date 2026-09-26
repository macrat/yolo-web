import type { Metadata } from "next";
import {
  KANJI_LIST_PER_PAGE,
  kanjiListEntries,
  kanjiListMetadata,
  kanjiListPageParams,
} from "@/dictionary/_lib/kanji-list";
import { listPageFromParam } from "@/lib/list-pages";
import KanjiListView from "@/dictionary/_components/kanji/KanjiListView";

interface Props {
  params: Promise<{ page: string }>;
}

const SCOPE = { type: "all" } as const;

export const dynamicParams = false;

export function generateStaticParams(): Array<{ page: string }> {
  return kanjiListPageParams(SCOPE);
}

async function resolvePage(params: Props["params"]): Promise<number> {
  const { page } = await params;
  return listPageFromParam(
    page,
    kanjiListEntries(SCOPE).length,
    KANJI_LIST_PER_PAGE,
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return kanjiListMetadata(SCOPE, await resolvePage(params));
}

/** /dictionary/kanji/page/[page] は常用漢字の全体の一覧の2ページ目から。 */
export default async function KanjiPaginatedPage({ params }: Props) {
  return <KanjiListView scope={SCOPE} page={await resolvePage(params)} />;
}
