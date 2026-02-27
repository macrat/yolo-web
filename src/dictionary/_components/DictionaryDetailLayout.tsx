import type { BreadcrumbItem } from "@/lib/seo";
import type { DictionaryMeta } from "@/dictionary/_lib/types";
import Breadcrumb from "@/components/common/Breadcrumb";
import FaqSection from "@/components/common/FaqSection";
import ShareButtons from "@/components/common/ShareButtons";
import TrustLevelBadge from "@/components/common/TrustLevelBadge";
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
}

/**
 * 辞典詳細ページの共通レイアウトコンポーネント。
 * JSON-LD, Breadcrumb, TrustLevelBadge, valueProposition, Detail, FAQ, ShareButtons を
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
}: DictionaryDetailLayoutProps) {
  return (
    <article>
      {/* JSON-LD: 配列の場合は各要素を個別の script タグとして出力 */}
      {Array.isArray(jsonLd) ? (
        jsonLd.map((ld, i) => (
          <script
            key={i}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }}
          />
        ))
      ) : (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}

      {/* Breadcrumb コンポーネントが内部で breadcrumb JSON-LD を自動出力する */}
      <Breadcrumb items={breadcrumbItems} />

      <TrustLevelBadge level={meta.trustLevel} />

      {/* valueProposition: Breadcrumb + TrustLevelBadge の直後、children の前 */}
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
        />
      </section>
    </article>
  );
}
