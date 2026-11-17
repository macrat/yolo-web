import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  colorListCategories,
  COLOR_LIST_PER_PAGE,
  isColorCategory,
  colorListEntries,
  colorListMetadata,
  colorListPageParams,
  type ColorListScope,
} from "@/dictionary/_lib/color-list";
import { listPageFromParam } from "@/lib/list-pages";
import ColorListView from "@/dictionary/_components/color/ColorListView";

interface Props {
  params: Promise<{ category: string; page: string }>;
}

export const dynamicParams = false;

export function generateStaticParams(): Array<{
  category: string;
  page: string;
}> {
  return colorListCategories().flatMap((category) =>
    colorListPageParams({ type: "category", category }).map(({ page }) => ({
      category,
      page,
    })),
  );
}

async function resolve(params: Props["params"]) {
  const { category, page } = await params;
  if (!isColorCategory(category)) notFound();
  const scope: ColorListScope = { type: "category", category };
  return {
    scope,
    page: listPageFromParam(
      page,
      colorListEntries(scope).length,
      COLOR_LIST_PER_PAGE,
    ),
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { scope, page } = await resolve(params);
  return colorListMetadata(scope, page);
}

/** /dictionary/colors/category/[category]/page/[page] は1つの色みの伝統色の一覧の2ページ目から。 */
export default async function ColorCategoryPaginatedPage({ params }: Props) {
  const { scope, page } = await resolve(params);
  return <ColorListView scope={scope} page={page} />;
}
