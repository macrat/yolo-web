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
import LineBreakRemoverComponent from "@/tools/line-break-remover/Component";
import styles from "./page.module.css";

const SLUG = "line-break-remover";
const tool = toolsBySlug.get(SLUG);

export const metadata: Metadata = tool ? generateToolMetadata(tool.meta) : {};

export default function LineBreakRemoverPage() {
  if (!tool) notFound();

  return (
    /* (new) globals.css に --max-width 未定義のため、ToolLayout の max-width: var(--max-width) は
     * none に解決される。外側コンテナで 1200px を直接指定することで幅を制約する。 */
    <div className={styles.page}>
      <ToolPageLayout meta={tool.meta}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: safeJsonLdStringify(generateToolJsonLd(tool.meta)),
          }}
        />
        <ToolErrorBoundary>
          <LineBreakRemoverComponent />
        </ToolErrorBoundary>
      </ToolPageLayout>
    </div>
  );
}
