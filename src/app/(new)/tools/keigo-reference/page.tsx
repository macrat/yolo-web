import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { toolsBySlug } from "@/tools/registry";
import {
  generateToolMetadata,
  generateToolJsonLd,
  safeJsonLdStringify,
} from "@/lib/seo";
import ToolDetailLayout from "@/tools/_components/ToolDetailLayout";
import ToolInputArea from "@/tools/_components/ToolInputArea";
import Breadcrumb from "@/components/Breadcrumb";
import FaqSection from "@/components/common/FaqSection";
import ShareButtons from "@/components/common/ShareButtons";
import RelatedTools from "@/tools/_components/RelatedTools";
import RelatedBlogPosts from "@/tools/_components/RelatedBlogPosts";
import KeigoReferenceComponent from "@/tools/keigo-reference/Component";

const SLUG = "keigo-reference";
const tool = toolsBySlug.get(SLUG);

export const metadata: Metadata = tool ? generateToolMetadata(tool.meta) : {};

/**
 * 敬語早見表ページ — (new) デザインシステムへ移行済み。
 *
 * 主体: ToolDetailLayout（案 9 確定）
 * - IdentityHeader / ToolInputArea / TrustSection / LifecycleSection を内包
 * - JSON-LD（WebApplication）を page.tsx で出力
 * - FAQPage JSON-LD は FaqSection コンポーネントが自動出力（可視 FAQ UI と同時）
 * - BreadcrumbList JSON-LD は Breadcrumb コンポーネントが自動出力（可視 UI と同時）
 * - ToolLayout / ToolErrorBoundary は使わない（(legacy) 系）
 * - ShareButtons / RelatedTools / RelatedBlogPosts は children 経由で配置（致命5 対応）
 *
 * Google 構造化データポリシー準拠:
 * 「All of the FAQ content must be visible to the user on the source page」
 * FaqSection が JSON-LD と可視 UI を同時に出力するため、ポリシー違反を回避する。
 *
 * @see docs/tile-and-detail-design.md §3 #4
 * @see docs/cycles/cycle-193.md 案 9 + 致命2/5 対応
 */
export default function KeigoReferencePage() {
  if (!tool) notFound();

  const { meta } = tool;

  // JSON-LD: WebApplication（page.tsx 側で出力）
  const webAppJsonLd = safeJsonLdStringify(generateToolJsonLd(meta));

  // Breadcrumb items（Breadcrumb コンポーネントが BreadcrumbList JSON-LD を自動出力）
  const breadcrumbItems = [
    { label: "ホーム", href: "/" },
    { label: "ツール一覧", href: "/tools" },
    { label: meta.name },
  ];

  return (
    <>
      {/* JSON-LD: WebApplication */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: webAppJsonLd }}
      />

      {/*
       * Breadcrumb — パンくずリスト。
       * BreadcrumbList JSON-LD を内部で自動出力（可視 UI + 構造化データの同時出力）。
       * ToolDetailLayout 外に配置することで全幅表示を確保する。
       */}
      <Breadcrumb items={breadcrumbItems} />

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

        {/*
         * FaqSection — FAQ の可視 UI + FAQPage JSON-LD を同時出力。
         * Google 構造化データポリシー「FAQ content must be visible」に準拠。
         * meta.faq が SSoT。AccordionItem ではなく FaqSection を使うことで
         * JSON-LD 出力が保証される（致命2 対応）。
         */}
        {meta.faq && meta.faq.length > 0 && <FaqSection faq={meta.faq} />}

        {/*
         * 共有・関連リンクセクション（致命5 対応: 旧 ToolLayout 末尾要素の復活）。
         * M1b likes 1「一貫性」準拠: 他の (legacy) ツール 33 件と同じ末尾構造を維持。
         */}
        <section aria-label="このツールをシェア">
          <h2>このツールが便利だったらシェア</h2>
          <ShareButtons
            url={`/tools/${meta.slug}`}
            title={meta.name}
            sns={["x", "line", "hatena", "copy"]}
            contentType="tool"
            contentId={meta.slug}
          />
        </section>
        <RelatedTools
          currentSlug={meta.slug}
          relatedSlugs={meta.relatedSlugs}
        />
        <RelatedBlogPosts toolSlug={meta.slug} />
      </ToolDetailLayout>
    </>
  );
}
