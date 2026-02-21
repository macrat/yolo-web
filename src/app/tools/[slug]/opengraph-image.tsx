import { toolsBySlug, getAllToolSlugs } from "@/tools/registry";
import {
  createOgpImageResponse,
  ogpSize,
  ogpContentType,
} from "@/lib/ogp-image";

export const alt = "yolos.net tool";
export const size = ogpSize;
export const contentType = ogpContentType;

export function generateStaticParams() {
  return getAllToolSlugs().map((slug) => ({ slug }));
}

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function OpenGraphImage({ params }: Props) {
  const { slug } = await params;
  const tool = toolsBySlug.get(slug);

  const title = tool?.meta.name ?? "Tool";
  const subtitle = tool?.meta.shortDescription ?? "";

  return createOgpImageResponse({
    title,
    subtitle,
    accentColor: "#0891b2",
    icon: "\u{1F6E0}\u{FE0F}",
  });
}
