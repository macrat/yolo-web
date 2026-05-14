import type { ReactNode } from "react";
import type { BreadcrumbItem } from "@/components/Breadcrumb";
import IdentityHeader from "@/tools/_new-components/IdentityHeader";
import styles from "./ToolDetailLayout.module.css";

interface ToolDetailLayoutProps {
  /** ツール名（h1 テキスト） */
  toolName: string;
  /** 短い説明文（2 行以内） */
  shortDescription: string;
  /** パンくずリストの項目 */
  breadcrumbItems: BreadcrumbItem[];
  /** ツール本体コンテンツ（階層 2: 使用） */
  children: ReactNode;
  /**
   * 信頼・透明性情報（階層 3）。
   * TrustSection が期待する形で渡すか、TrustSection コンポーネントそのものを渡す。
   */
  trustSection?: ReactNode;
  /** 生活への組み込みセクション（階層 4、オプショナル） */
  lifecycleSection?: ReactNode;
}

/**
 * ToolDetailLayout — ツール詳細ページの 4 階層レイアウトコンポーネント。
 *
 * 階層 1（識別）→ 階層 2（使用）→ 階層 3（信頼・透明性）→ 階層 4（生活への組み込み）
 * の順序を構造として強制し、ファーストビューに階層 2 が支配的に見えるレイアウト制約を実施する。
 *
 * 設計:
 * - ツール固有のロジック / SEO メタデータ（head タグ内）は含まない
 * - 共通ナビゲーション / フッターは layout.tsx が提供する（このコンポーネントの責務外）
 * - shortDescription の 2 行以内制約は IdentityHeader が実装する
 */
function ToolDetailLayout({
  toolName,
  shortDescription,
  breadcrumbItems,
  children,
  trustSection,
  lifecycleSection,
}: ToolDetailLayoutProps) {
  return (
    <article className={styles.article}>
      {/* 階層 1: 識別 — パンくず + h1 + shortDescription */}
      <div className={styles.identityWrapper}>
        <IdentityHeader
          toolName={toolName}
          shortDescription={shortDescription}
          breadcrumbItems={breadcrumbItems}
        />
      </div>

      {/* 階層 2: 使用 — ツール本体（ファーストビューで支配的に見える） */}
      <section className={styles.toolWrapper} aria-label={`${toolName}ツール`}>
        {children}
      </section>

      {/* 階層 3: 信頼・透明性 — 使い方説明 / 出典 / AI 注記 / 更新日 */}
      {trustSection && (
        <div className={styles.trustWrapper}>{trustSection}</div>
      )}

      {/* 階層 4: 生活への組み込み — 関連コンテンツ / タイル / 道具箱追加等 */}
      {lifecycleSection && (
        <div className={styles.lifecycleWrapper}>{lifecycleSection}</div>
      )}
    </article>
  );
}

export default ToolDetailLayout;
