import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getYojiCategories } from "@/dictionary/_lib/yoji";
import {
  YOJI_LIST_PER_PAGE,
  isYojiCategory,
  yojiListEntries,
  yojiListMetadata,
  yojiListPageParams,
  type YojiListScope,
} from "@/dictionary/_lib/yoji-list";
import { listPageFromParam } from "@/lib/list-pages";
import YojiListView from "@/dictionary/_components/yoji/YojiListView";

interface Props {
  params: Promise<{ category: string; page: string }>;
}

export const dynamicParams = false;

export function generateStaticParams(): Array<{
  category: string;
  page: string;
}> {
  return getYojiCategories().flatMap((category) =>
    yojiListPageParams({ type: "category", category }).map(({ page }) => ({
      category,
      page,
    })),
  );
}

async function resolve(params: Props["params"]) {
  const { category, page } = await params;
  if (!isYojiCategory(category)) notFound();
  const scope: YojiListScope = { type: "category", category };
  return {
    scope,
    page: listPageFromParam(
      page,
      yojiListEntries(scope).length,
      YOJI_LIST_PER_PAGE,
    ),
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { scope, page } = await resolve(params);
  return yojiListMetadata(scope, page);
}

/** /dictionary/yoji/category/[category]/page/[page] は1つのカテゴリの四字熟語の一覧の2ページ目から。 */
export default async function YojiCategoryPaginatedPage({ params }: Props) {
  const { scope, page } = await resolve(params);
  return <YojiListView scope={scope} page={page} />;
}
