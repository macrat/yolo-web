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
import CronParserComponent from "@/tools/cron-parser/Component";

const SLUG = "cron-parser";
const tool = toolsBySlug.get(SLUG);

export const metadata: Metadata = tool ? generateToolMetadata(tool.meta) : {};

export default function CronParserPage() {
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
        <CronParserComponent />
      </ToolErrorBoundary>
    </ToolLayout>
  );
}
