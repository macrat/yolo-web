import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { toolsBySlug } from "@/tools/registry";
import {
  generateToolMetadata,
  generateToolJsonLd,
  safeJsonLdStringify,
} from "@/lib/seo";
import ToolPageLayout from "@/tools/_components/ToolPageLayout";
import ToolErrorBoundary from "@/tools/_components/ErrorBoundary";
import TextReplaceTile from "@/tools/text-replace/TextReplaceTile";
const SLUG = "text-replace";
const tool = toolsBySlug.get(SLUG);

export const metadata: Metadata = tool ? generateToolMetadata(tool.meta) : {};

export default function TextReplacePageRoute() {
  if (!tool) notFound();

  return (
    <ToolPageLayout meta={tool.meta}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: safeJsonLdStringify(generateToolJsonLd(tool.meta)),
        }}
      />
      <ToolErrorBoundary>
        <TextReplaceTile variant="full" />
      </ToolErrorBoundary>
    </ToolPageLayout>
  );
}
