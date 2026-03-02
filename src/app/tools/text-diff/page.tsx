import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { toolsBySlug } from "@/tools/registry";
import {
  generateToolMetadata,
  generateToolJsonLd,
  safeJsonLdStringify,
} from "@/lib/seo";
import ToolLayout from "@/tools/_components/ToolLayout";
import ToolErrorBoundary from "@/tools/_components/ErrorBoundary";
import TextDiffComponent from "@/tools/text-diff/Component";

const SLUG = "text-diff";
const tool = toolsBySlug.get(SLUG);

export const metadata: Metadata = tool ? generateToolMetadata(tool.meta) : {};

export default function TextDiffPage() {
  if (!tool) notFound();

  return (
    <ToolLayout meta={tool.meta}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: safeJsonLdStringify(generateToolJsonLd(tool.meta)),
        }}
      />
      <ToolErrorBoundary>
        <TextDiffComponent />
      </ToolErrorBoundary>
    </ToolLayout>
  );
}
