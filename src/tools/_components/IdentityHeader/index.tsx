import styles from "./IdentityHeader.module.css";

interface IdentityHeaderProps {
  /** ツール表示名（必須）。h1 としてレンダリングされる。 */
  name: string;
  /** 短い説明（必須）。ファーストビュー内に収まる簡潔なテキスト。 */
  shortDescription: string;
  /** カテゴリ（任意）。省略時は描画しない。 */
  category?: string;
}

/**
 * IdentityHeader — ツール名 / 説明 / カテゴリの簡潔ヘッダー。
 *
 * ファーストビュー内の高さを最小限に保ち、入力欄が画面下に押し下げられないようにする。
 * 高さ予算: w360 viewport で 100-150px 以内（tile-and-detail-design.md §14 R27）。
 *
 * @see docs/tile-and-detail-design.md §3 #5
 */
function IdentityHeader({
  name,
  shortDescription,
  category,
}: IdentityHeaderProps) {
  return (
    <header className={styles.header}>
      {category !== undefined && (
        <p className={styles.category} data-testid="category">
          {category}
        </p>
      )}
      <h1 className={styles.name}>{name}</h1>
      <p className={styles.description}>{shortDescription}</p>
    </header>
  );
}

export default IdentityHeader;
