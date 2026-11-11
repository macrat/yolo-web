import { notFound } from "next/navigation";
import { getAllBlogSlugs, getBlogPostBySlug } from "@/blog/_lib/blog";
import { blogShareImageContent } from "@/blog/_lib/share-image-content";
import { createShareImageResponse } from "@/lib/share-image";

// 画像はビルドで書き出す。書体を取れないとビルドが止まり、無い記事の画像は 404 になる。
export const dynamic = "force-static";
export const dynamicParams = false;
export const revalidate = false;

export function generateStaticParams() {
  return getAllBlogSlugs().map((slug) => ({ slug }));
}

/** 記事の画像。URL の `?v=` は読まずに、同じ画像を返す。 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) notFound();
  return createShareImageResponse(blogShareImageContent(post));
}
