import type { Metadata } from "next";
import { getAllEntries } from "@/humor-dict/data";
import {
  HUMOR_LIST_PER_PAGE,
  humorListMetadata,
  humorListPageParams,
} from "@/humor-dict/_lib/humor-list";
import { listPageFromParam } from "@/lib/list-pages";
import HumorListView from "@/humor-dict/_components/HumorListView";

interface Props {
  params: Promise<{ page: string }>;
}

export const dynamicParams = false;

export function generateStaticParams(): Array<{ page: string }> {
  return humorListPageParams();
}

async function resolvePage(params: Props["params"]): Promise<number> {
  const { page } = await params;
  return listPageFromParam(page, getAllEntries().length, HUMOR_LIST_PER_PAGE);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return humorListMetadata(await resolvePage(params));
}

/** /dictionary/humor/page/[page] はユーモア辞典の見出し語の一覧の2ページ目から。 */
export default async function HumorDictPaginatedPage({ params }: Props) {
  return <HumorListView page={await resolvePage(params)} />;
}
