import {
  cheatsheetsBySlug,
  getAllCheatsheetSlugs,
} from "@/cheatsheets/registry";
import {
  createOgpImageResponse,
  ogpSize,
  ogpContentType,
} from "@/lib/ogp-image";

export const alt = "yolos.net cheatsheet";
export const size = ogpSize;
export const contentType = ogpContentType;

export function generateStaticParams() {
  return getAllCheatsheetSlugs().map((slug) => ({ slug }));
}

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function OpenGraphImage({ params }: Props) {
  const { slug } = await params;
  const cheatsheet = cheatsheetsBySlug.get(slug);

  const title = cheatsheet?.meta.name ?? "Cheatsheet";
  const subtitle = cheatsheet?.meta.shortDescription ?? "";

  return createOgpImageResponse({
    title,
    subtitle,
    accentColor: "#7c3aed",
    icon: "\u{1F4CB}",
  });
}
