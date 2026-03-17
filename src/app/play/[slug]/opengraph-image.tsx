import {
  createOgpImageResponse,
  ogpSize,
  ogpContentType,
} from "@/lib/ogp-image";
import { playContentBySlug } from "@/play/registry";
import { getAllPlaySlugs } from "@/play/registry";

export const alt = "yolos.net play";
export const size = ogpSize;
export const contentType = ogpContentType;

/** Generate static params for all play content slugs. */
export function generateStaticParams(): Array<{ slug: string }> {
  return getAllPlaySlugs().map((slug) => ({ slug }));
}

export default async function OpenGraphImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const meta = playContentBySlug.get(slug);

  if (!meta) {
    return createOgpImageResponse({
      title: "遊ぶ",
      accentColor: "#2563eb",
    });
  }

  return createOgpImageResponse({
    title: meta.title,
    accentColor: meta.accentColor,
    icon: meta.icon,
  });
}
