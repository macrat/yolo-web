import { CATEGORY_LABELS, type BlogPostMeta } from "@/blog/_lib/blog";
import type { ShareImageContent } from "@/lib/share-image";

/**
 * 記事の画像に書く中身。名前は記事の h1 と同じ題で、副題に記事のカテゴリを添える。画像の Route Handler と、
 * 記事のページのメタデータ・構造化データが、同じ中身から画像と代替テキストと URL を作る。
 */
export function blogShareImageContent(
  post: Pick<BlogPostMeta, "title" | "category">,
): ShareImageContent {
  return {
    aux: "ブログ",
    name: post.title,
    subtitle: CATEGORY_LABELS[post.category],
  };
}
