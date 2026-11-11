import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  colorListCategories,
  isColorCategory,
  colorListMetadata,
  type ColorListScope,
} from "@/dictionary/_lib/color-list";
import ColorListView from "@/dictionary/_components/color/ColorListView";

interface Props {
  params: Promise<{ category: string }>;
}

export function generateStaticParams(): Array<{ category: string }> {
  return colorListCategories().map((category) => ({ category }));
}

async function resolveScope(params: Props["params"]): Promise<ColorListScope> {
  const { category } = await params;
  if (!isColorCategory(category)) notFound();
  return { type: "category", category };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return colorListMetadata(await resolveScope(params), 1);
}

/** /dictionary/colors/category/[category] は1つの色みの伝統色の一覧の1ページ目。 */
export default async function ColorCategoryPage({ params }: Props) {
  return <ColorListView scope={await resolveScope(params)} page={1} />;
}
