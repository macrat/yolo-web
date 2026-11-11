import type { Metadata } from "next";
import {
  COLOR_LIST_PER_PAGE,
  colorListEntries,
  colorListMetadata,
  colorListPageParams,
} from "@/dictionary/_lib/color-list";
import { listPageFromParam } from "@/lib/list-pages";
import ColorListView from "@/dictionary/_components/color/ColorListView";

interface Props {
  params: Promise<{ page: string }>;
}

const SCOPE = { type: "all" } as const;

export const dynamicParams = false;

export function generateStaticParams(): Array<{ page: string }> {
  return colorListPageParams(SCOPE);
}

async function resolvePage(params: Props["params"]): Promise<number> {
  const { page } = await params;
  return listPageFromParam(
    page,
    colorListEntries(SCOPE).length,
    COLOR_LIST_PER_PAGE,
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return colorListMetadata(SCOPE, await resolvePage(params));
}

/** /dictionary/colors/page/[page] は伝統色の全体の一覧の2ページ目から。 */
export default async function ColorsPaginatedPage({ params }: Props) {
  return <ColorListView scope={SCOPE} page={await resolvePage(params)} />;
}
