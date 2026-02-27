import type { Metadata } from "next";
import { notFound } from "next/navigation";
import DictionaryDetailLayout from "@/dictionary/_components/DictionaryDetailLayout";
import { COLOR_DICTIONARY_META } from "@/dictionary/_lib/dictionary-meta";
import ColorDetail from "@/dictionary/_components/color/ColorDetail";
import { generateColorPageMetadata, generateColorJsonLd } from "@/lib/seo";
import { getColorBySlug, getAllColorSlugs } from "@/dictionary/_lib/colors";

export function generateStaticParams() {
  return getAllColorSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const color = getColorBySlug(slug);
  if (!color) return {};
  return generateColorPageMetadata(color);
}

export default async function ColorDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const color = getColorBySlug(slug);
  if (!color) notFound();

  // 辞典固有の JSON-LD のみ渡す。
  // breadcrumb JSON-LD は Breadcrumb コンポーネントが自動出力するため手動呼び出し不要。
  const jsonLd = generateColorJsonLd(color);

  return (
    <DictionaryDetailLayout
      meta={COLOR_DICTIONARY_META}
      breadcrumbItems={[
        { label: "ホーム", href: "/" },
        { label: "伝統色", href: "/colors" },
        { label: color.name },
      ]}
      jsonLd={jsonLd}
      shareUrl={`/colors/${color.slug}`}
      shareTitle={`${color.name}（${color.romaji}）`}
    >
      <ColorDetail color={color} />
    </DictionaryDetailLayout>
  );
}
