import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { toolsBySlug } from "@/tools/registry";
import {
  generateToolMetadata,
  generateToolJsonLd,
  safeJsonLdStringify,
} from "@/lib/seo";
import ToolDetailLayout from "@/tools/_new-components/ToolDetailLayout";
import TrustSection from "@/tools/_new-components/TrustSection";
import LifecycleSection, {
  type RelatedContent,
} from "@/tools/_new-components/LifecycleSection";
import PrivacyBadge from "@/components/PrivacyBadge";
import KeigoReferenceComponent from "@/tools/keigo-reference/Component";

const SLUG = "keigo-reference";
const tool = toolsBySlug.get(SLUG);

export const metadata: Metadata = tool ? generateToolMetadata(tool.meta) : {};

/**
 * 関連コンテンツ（T-A 設計記録 (v) relatedSlugs 採用・reason 付与）。
 * meta.ts の relatedSlugs を page.tsx 内で reason 付き RelatedContent に変換する。
 */
const RELATED_CONTENTS: RelatedContent[] = [
  {
    type: "tool",
    title: "ビジネスメール文例",
    href: "/tools/business-email",
    reason: "敬語を使ったメール文章を素早く作成できます",
  },
  {
    type: "tool",
    title: "かな変換",
    href: "/tools/kana-converter",
    reason: "ふりがな確認など文書作成時に合わせて使えます",
  },
  {
    type: "tool",
    title: "文字数カウンター",
    href: "/tools/char-count",
    reason: "メール・報告書の文字数確認に便利です",
  },
];

export default function KeigoReferencePage() {
  if (!tool) notFound();

  return (
    <>
      {/* JSON-LD: WebApplication 構造化データ（T-A 設計 (v): faq は削除済のため FAQPage 出力なし） */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: safeJsonLdStringify(generateToolJsonLd(tool.meta)),
        }}
      />

      {/* 4 階層レイアウト（T-A 設計採用案 β'） */}
      <ToolDetailLayout
        toolName={tool.meta.name}
        shortDescription={tool.meta.shortDescription}
        breadcrumbItems={[
          { label: "ホーム", href: "/" },
          { label: "ツール", href: "/tools" },
          { label: tool.meta.name },
        ]}
        trustSection={
          <TrustSection
            howToUse={tool.meta.howItWorks}
            isAiGenerated={true}
            updatedAt={tool.meta.updatedAt}
          />
        }
        lifecycleSection={
          <LifecycleSection relatedContents={RELATED_CONTENTS} />
        }
      >
        {/* 階層 2: 使用 — PrivacyBadge + ツール本体（案 β'） */}
        {/* A-4: プライバシー表示を検索欄近傍に最小文字数で表示 */}
        <PrivacyBadge variant="local" />
        <KeigoReferenceComponent />
      </ToolDetailLayout>
    </>
  );
}
