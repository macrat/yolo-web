import { notFound } from "next/navigation";
import { toolsBySlug, getAllToolSlugs } from "@/tools/registry";
import { generateToolMetadata, generateToolJsonLd } from "@/lib/seo";
import ToolLayout from "@/tools/_components/ToolLayout";
import ToolRenderer from "./ToolRenderer";

// Generate all tool pages at build time
export function generateStaticParams() {
  return getAllToolSlugs().map((slug) => ({ slug }));
}

// Dynamic metadata for SEO
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tool = toolsBySlug.get(slug);
  if (!tool) return {};
  return generateToolMetadata(tool.meta);
}

export default async function ToolPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tool = toolsBySlug.get(slug);
  if (!tool) notFound();

  return (
    <ToolLayout meta={tool.meta}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateToolJsonLd(tool.meta)),
        }}
      />
      <ToolRenderer slug={slug} />
    </ToolLayout>
  );
}
