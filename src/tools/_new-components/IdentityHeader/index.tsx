import Breadcrumb, { type BreadcrumbItem } from "@/components/Breadcrumb";
import styles from "./IdentityHeader.module.css";

interface IdentityHeaderProps {
  /** ツール名（h1 テキスト） */
  toolName: string;
  /** 短い説明文（2 行以内に制約、超過分は CSS で省略） */
  shortDescription: string;
  /** パンくずリストの項目 */
  breadcrumbItems: BreadcrumbItem[];
}

/**
 * IdentityHeader — 階層 1「識別」の表示コンポーネント。
 *
 * パンくず + h1 + shortDescription を最小の視覚的重さでレンダリングする。
 * ファーストビューで階層 2（ツール本体）が支配的に見えるようにするため、
 * 識別セクション自体はコンパクトに保つ。
 *
 * 設計:
 * - shortDescription は CSS で 2 行以内に制約（-webkit-line-clamp）
 * - 既存 Breadcrumb コンポーネントを内包（JSON-LD も自動出力）
 * - 詳細な機能説明・FAQ・信頼性情報はこのコンポーネントに含めない（TrustSection の責務）
 */
function IdentityHeader({
  toolName,
  shortDescription,
  breadcrumbItems,
}: IdentityHeaderProps) {
  return (
    <header className={styles.header}>
      <Breadcrumb items={breadcrumbItems} />
      <h1 className={styles.toolName}>{toolName}</h1>
      <p className={styles.shortDescription}>{shortDescription}</p>
    </header>
  );
}

export default IdentityHeader;
