import { safeJsonLdStringify } from "@/lib/seo";
import type { BreadcrumbItem } from "@/lib/seo";
import type { DictionaryMeta } from "@/dictionary/_lib/types";
import type { PlayContentMeta } from "@/play/types";
import Breadcrumb from "@/components/common/Breadcrumb";
import FaqSection from "@/components/common/FaqSection";
import ShareButtons from "@/components/common/ShareButtons";
import PlayRecommendBlock from "@/play/_components/PlayRecommendBlock";
import styles from "./DictionaryDetailLayout.module.css";

interface DictionaryDetailLayoutProps {
  /** 辞典種別メタデータ（品質要素を含む） */
  meta: DictionaryMeta;
  /** パンくずリスト項目（辞典ごとに異なるため外部から渡す） */
  breadcrumbItems: BreadcrumbItem[];
  /** JSON-LD構造化データ。単一オブジェクトまたは配列 */
  jsonLd: object | object[];
  /** シェアボタンのURL（パスのみ。例: "/dictionary/kanji/山"） */
  shareUrl: string;
  /** シェアボタンのタイトル */
  shareTitle: string;
  /** 各辞典のDetailコンポーネント（KanjiDetail / YojiDetail / ColorDetail） */
  children: React.ReactNode;
  /** 関連するplay系コンテンツの推薦リスト（省略時は表示しない） */
  playRecommendations?: PlayContentMeta[];
}

/**
 * 辞典詳細ページの共通レイアウトコンポーネント。
 * JSON-LD, Breadcrumb, valueProposition, Detail, FAQ, ShareButtons を
 * 統一的な構造で出力する。ToolLayout/CheatsheetLayoutのパターンに準拠。
 *
 * Server Component として実装。ColorDetail のような "use client" コンポーネントは
 * children として渡されるため問題なし。
 *
 * h1 は各 Detail コンポーネント（KanjiDetail, YojiDetail, ColorDetail）内部で
 * 管理されるため、このレイアウトには h1 を置かない。
 */
export default function DictionaryDetailLayout({
  meta,
  breadcrumbItems,
  jsonLd,
  shareUrl,
  shareTitle,
  children,
  playRecommendations,
}: DictionaryDetailLayoutProps) {
  return (
    <article>
      {/* JSON-LD: 配列の場合は各要素を個別の script タグとして出力 */}
      {Array.isArray(jsonLd) ? (
        jsonLd.map((ld, i) => (
          <script
            key={i}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: safeJsonLdStringify(ld) }}
          />
        ))
      ) : (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonLdStringify(jsonLd) }}
        />
      )}

      {/* Breadcrumb コンポーネントが内部で breadcrumb JSON-LD を自動出力する */}
      <Breadcrumb items={breadcrumbItems} />

      {/* valueProposition: Breadcrumb の直後、children の前 */}
      {meta.valueProposition && (
        <p className={styles.valueProposition}>{meta.valueProposition}</p>
      )}

      {children}

      <FaqSection faq={meta.faq} />

      <section className={styles.shareSection}>
        <ShareButtons
          url={shareUrl}
          title={shareTitle}
          sns={["x", "line", "copy"]}
          contentType="dictionary"
          contentId={shareUrl}
        />
      </section>

      {playRecommendations && (
        <PlayRecommendBlock recommendations={playRecommendations} />
      )}
    </article>
  );
}
