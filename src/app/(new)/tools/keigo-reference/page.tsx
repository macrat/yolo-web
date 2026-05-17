import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { toolsBySlug } from "@/tools/registry";
import {
  generateToolMetadata,
  generateToolJsonLd,
  generateFaqPageJsonLd,
  generateBreadcrumbJsonLd,
  safeJsonLdStringify,
} from "@/lib/seo";
import ToolDetailLayout from "@/tools/_components/ToolDetailLayout";
import ToolInputArea from "@/tools/_components/ToolInputArea";
import KeigoReferenceComponent from "@/tools/keigo-reference/Component";

const SLUG = "keigo-reference";
const tool = toolsBySlug.get(SLUG);

export const metadata: Metadata = tool ? generateToolMetadata(tool.meta) : {};

/**
 * 敬語早見表ページ — (new) デザインシステムへ移行済み。
 *
 * 主体: ToolDetailLayout（案 9 確定）
 * - IdentityHeader / ToolInputArea / TrustSection / LifecycleSection を内包
 * - JSON-LD（WebApplication / FAQPage / BreadcrumbList）を維持
 * - ToolLayout / ToolErrorBoundary は使わない（(legacy) 系）
 *
 * @see docs/tile-and-detail-design.md §3 #4
 * @see docs/cycles/cycle-193.md 案 9
 */
export default function KeigoReferencePage() {
  if (!tool) notFound();

  const { meta } = tool;

  // JSON-LD: WebApplication
  const webAppJsonLd = safeJsonLdStringify(generateToolJsonLd(meta));

  // JSON-LD: FAQPage（meta.faq が SSoT）
  const faqJsonLd = meta.faq
    ? safeJsonLdStringify(generateFaqPageJsonLd(meta.faq))
    : null;

  // JSON-LD: BreadcrumbList
  const breadcrumbJsonLd = safeJsonLdStringify(
    generateBreadcrumbJsonLd([
      { label: "ホーム", href: "/" },
      { label: "ツール一覧", href: "/tools" },
      { label: meta.name },
    ]),
  );

  return (
    <>
      {/* JSON-LD 構造化データ（SSoT: meta.ts の faq / howItWorks を経由） */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: webAppJsonLd }}
      />
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: faqJsonLd }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: breadcrumbJsonLd }}
      />

      {/* 詳細ページ主体: ToolDetailLayout（旧 ToolLayout は使わない） */}
      <ToolDetailLayout meta={meta}>
        {/*
         * ToolInputArea でラップすることでファーストビューに検索・フィルタが来る構造。
         * M1a likes 1「ページを開いた瞬間に入力欄が見えて、すぐ使い始められること」準拠。
         * KeigoReferenceComponent が検索 / カテゴリフィルタ / 表本体 / よくある間違いを内包。
         */}
        <ToolInputArea>
          <KeigoReferenceComponent />
        </ToolInputArea>
      </ToolDetailLayout>
    </>
  );
}
