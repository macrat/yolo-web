import type { Metadata } from "next";
import { listPageFromParam } from "@/lib/list-pages";
import PlayListView from "@/play/_components/PlayListView";
import {
  PLAY_LIST_PER_PAGE,
  playListMetadata,
  playListPageParams,
} from "@/play/play-list";
import { allPlayContents } from "@/play/registry";

interface Props {
  params: Promise<{ page: string }>;
}

export const dynamicParams = false;

export function generateStaticParams(): Array<{ page: string }> {
  return playListPageParams();
}

async function resolvePage(params: Props["params"]): Promise<number> {
  const { page } = await params;
  return listPageFromParam(page, allPlayContents.length, PLAY_LIST_PER_PAGE);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return playListMetadata(await resolvePage(params));
}

/** /play/page/[page] は遊びの一覧の2ページ目から。 */
export default async function PlayPaginatedPage({ params }: Props) {
  return <PlayListView page={await resolvePage(params)} />;
}
