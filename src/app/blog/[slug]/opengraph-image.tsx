import { notFound } from "next/navigation";
import {
  getAllBlogSlugs,
  getBlogPostBySlug,
  CATEGORY_LABELS,
} from "@/blog/_lib/blog";
import {
  createShareImageResponse,
  shareImageAltByKind,
  SHARE_IMAGE_CONTENT_TYPE,
  SHARE_IMAGE_SIZE,
} from "@/lib/share-image";

export const alt = shareImageAltByKind("ブログの記事の題");
export const size = SHARE_IMAGE_SIZE;
export const contentType = SHARE_IMAGE_CONTENT_TYPE;

export function generateStaticParams() {
  return getAllBlogSlugs().map((slug) => ({ slug }));
}

/** 記事の画像。名前は記事の h1 と同じ題で、副題に記事のカテゴリを添える。 */
export default async function OpenGraphImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) notFound();
  return createShareImageResponse({
    aux: "ブログ",
    name: post.title,
    subtitle: CATEGORY_LABELS[post.category],
  });
}
