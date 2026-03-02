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
import ColorConverterComponent from "@/tools/color-converter/Component";

const SLUG = "color-converter";
const tool = toolsBySlug.get(SLUG);

export const metadata: Metadata = tool ? generateToolMetadata(tool.meta) : {};

export default function ColorConverterPage() {
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
        <ColorConverterComponent />
      </ToolErrorBoundary>
    </ToolLayout>
  );
}
