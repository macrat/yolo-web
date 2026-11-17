import type { Metadata } from "next";
import {
  YOJI_LIST_PER_PAGE,
  yojiListEntries,
  yojiListMetadata,
  yojiListPageParams,
} from "@/dictionary/_lib/yoji-list";
import { listPageFromParam } from "@/lib/list-pages";
import YojiListView from "@/dictionary/_components/yoji/YojiListView";

interface Props {
  params: Promise<{ page: string }>;
}

const SCOPE = { type: "all" } as const;

export const dynamicParams = false;

export function generateStaticParams(): Array<{ page: string }> {
  return yojiListPageParams(SCOPE);
}

async function resolvePage(params: Props["params"]): Promise<number> {
  const { page } = await params;
  return listPageFromParam(
    page,
    yojiListEntries(SCOPE).length,
    YOJI_LIST_PER_PAGE,
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return yojiListMetadata(SCOPE, await resolvePage(params));
}

/** /dictionary/yoji/page/[page] は四字熟語の全体の一覧の2ページ目から。 */
export default async function YojiPaginatedPage({ params }: Props) {
  return <YojiListView scope={SCOPE} page={await resolvePage(params)} />;
}
