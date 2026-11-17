import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getYojiCategories } from "@/dictionary/_lib/yoji";
import {
  isYojiCategory,
  yojiListMetadata,
  type YojiListScope,
} from "@/dictionary/_lib/yoji-list";
import YojiListView from "@/dictionary/_components/yoji/YojiListView";

interface Props {
  params: Promise<{ category: string }>;
}

export function generateStaticParams(): Array<{ category: string }> {
  return getYojiCategories().map((category) => ({ category }));
}

async function resolveScope(params: Props["params"]): Promise<YojiListScope> {
  const { category } = await params;
  if (!isYojiCategory(category)) notFound();
  return { type: "category", category };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return yojiListMetadata(await resolveScope(params), 1);
}

/** /dictionary/yoji/category/[category] は1つのカテゴリの四字熟語の一覧の1ページ目。 */
export default async function YojiCategoryPage({ params }: Props) {
  return <YojiListView scope={await resolveScope(params)} page={1} />;
}
