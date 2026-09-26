import type { Metadata } from "next";
import { listPageFromParam } from "@/lib/list-pages";
import ToolListView from "@/tools/_components/ToolListView";
import {
  TOOL_LIST_PER_PAGE,
  toolListMetadata,
  toolListPageParams,
} from "@/tools/_lib/tool-list";
import { allToolMetas } from "@/tools/registry";

interface Props {
  params: Promise<{ page: string }>;
}

export const dynamicParams = false;

export function generateStaticParams(): Array<{ page: string }> {
  return toolListPageParams();
}

async function resolvePage(params: Props["params"]): Promise<number> {
  const { page } = await params;
  return listPageFromParam(page, allToolMetas.length, TOOL_LIST_PER_PAGE);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return toolListMetadata(await resolvePage(params));
}

/** /tools/page/[page] はツールの一覧の2ページ目から。 */
export default async function ToolsPaginatedPage({ params }: Props) {
  return <ToolListView page={await resolvePage(params)} />;
}
