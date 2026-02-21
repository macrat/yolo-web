import {
  getAllBlogSlugs,
  getBlogPostBySlug,
  CATEGORY_LABELS,
  type BlogCategory,
} from "@/lib/blog";
import {
  createOgpImageResponse,
  ogpSize,
  ogpContentType,
} from "@/lib/ogp-image";

export const alt = "yolos.net blog";
export const size = ogpSize;
export const contentType = ogpContentType;

export function generateStaticParams() {
  return getAllBlogSlugs().map((slug) => ({ slug }));
}

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function OpenGraphImage({ params }: Props) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  const title = post?.title ?? "Blog";
  const categoryLabel = post
    ? (CATEGORY_LABELS[post.category as BlogCategory] ?? "")
    : "";

  return createOgpImageResponse({
    title,
    subtitle: categoryLabel,
    accentColor: "#2563eb",
    icon: "\u{1F4DD}",
  });
}
