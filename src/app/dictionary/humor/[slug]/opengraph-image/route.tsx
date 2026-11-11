import { notFound } from "next/navigation";
import { getAllSlugs, getEntryBySlug } from "@/humor-dict/data";
import { humorShareImageContent } from "@/humor-dict/_lib/share-image-content";
import { createShareImageResponse } from "@/lib/share-image";

// 画像はビルドで書き出す。書体を取れないとビルドが止まり、無い語の画像は 404 になる。
export const dynamic = "force-static";
export const dynamicParams = false;
export const revalidate = false;

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

/** 語の画像。URL の `?v=` は読まずに、同じ画像を返す。 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const entry = getEntryBySlug(slug);
  if (!entry) notFound();
  return createShareImageResponse(humorShareImageContent(entry));
}
