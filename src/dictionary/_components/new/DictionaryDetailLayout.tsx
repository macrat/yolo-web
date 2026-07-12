import { safeJsonLdStringify } from "@/lib/seo";
import type { BreadcrumbItem } from "@/lib/seo";
import type { DictionaryMeta } from "@/dictionary/_lib/types";
import type { PlayContentMeta } from "@/play/types";
import Breadcrumb from "@/components/Breadcrumb";
import FaqSection from "@/components/FaqSection";
import ShareButtons from "@/components/ShareButtons";
import PlayRecommendBlock from "./PlayRecommendBlock";
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
 * 辞典詳細ページの共通レイアウトコンポーネント（(new) デザイン体系版）。
 * JSON-LD, Breadcrumb, valueProposition, Detail, FAQ, ShareButtons を
 * 統一的な構造で出力する。ToolLayout のパターンに準拠。
 *
 * legacy 版（src/dictionary/_components/DictionaryDetailLayout.tsx）からのフォーク。
 * 差分:
 * - import を (new) 体系（@/components/Breadcrumb 等）へ差し替え
 * - 信頼度バッジ（legacy の品質バッジ）を撤去（(new) 版なし・AI 注記は Footer が担保）
 * - 最上位 <article> に --max-width(960px) の外枠を持たせる（詳細は「実務／参照」の
 *   操作面寄り・§4/§7）。CSS は DESIGN.md フェーズ R の店構えへ変換済み（罫と組版で組む・
 *   旧トークン/影/ピル/角丸装飾なし）。各 Detail の内側は読む面 --measure に絞られる。
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
    <article className={styles.container}>
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
