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
import UrlEncodeComponent from "@/tools/url-encode/Component";
import styles from "./page.module.css";

const SLUG = "url-encode";
const tool = toolsBySlug.get(SLUG);

export const metadata: Metadata = tool ? generateToolMetadata(tool.meta) : {};

export default function UrlEncodePage() {
  if (!tool) notFound();

  return (
    /* cycle-202 T-2: ToolLayout 外側で 1200px をハードコード（採用案 (f)、cycle-196 正準パターン）。
     * (new) globals.css に --max-width 未定義のため ToolLayout の max-width: var(--max-width) は
     * none に解決される。外側コンテナで制約をかけることで ToolLayout は内側で 1200px に収まる。 */
    <div className={styles.page}>
      <ToolPageLayout meta={tool.meta}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: safeJsonLdStringify(generateToolJsonLd(tool.meta)),
          }}
        />
        <ToolErrorBoundary>
          <UrlEncodeComponent />
        </ToolErrorBoundary>
      </ToolPageLayout>
    </div>
  );
}
