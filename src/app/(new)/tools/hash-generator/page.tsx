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
import HashGeneratorComponent from "@/tools/hash-generator/HashGeneratorPage";
const SLUG = "hash-generator";
const tool = toolsBySlug.get(SLUG);

export const metadata: Metadata = tool ? generateToolMetadata(tool.meta) : {};

export default function HashGeneratorPage() {
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
        <HashGeneratorComponent />
      </ToolErrorBoundary>
    </ToolPageLayout>
  );
}
