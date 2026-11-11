import { notFound } from "next/navigation";
import { getAllQuizSlugs } from "@/play/quiz/registry";
import { playContentBySlug } from "@/play/registry";
import { playShareImageContent } from "@/play/share-image-content";
import { createShareImageResponse } from "@/lib/share-image";

// 画像はビルドで書き出す。書体を取れないとビルドが止まり、無い診断・クイズの画像は 404 になる。
export const dynamic = "force-static";
export const dynamicParams = false;
export const revalidate = false;

/**
 * 診断・クイズのすべて。専用のディレクトリを持つ診断（music-personality）のページも、画像はこのルートが描く。
 * 占いとパズルは、それぞれのディレクトリの画像のファイルが描く。
 */
export function generateStaticParams() {
  return getAllQuizSlugs().map((slug) => ({ slug }));
}

/** 診断・クイズのページの画像。URL の `?v=` は読まずに、同じ画像を返す。 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const meta = playContentBySlug.get(slug);
  if (!meta || meta.contentType !== "quiz") notFound();
  return createShareImageResponse(playShareImageContent(meta));
}
