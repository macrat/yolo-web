import PrivacyBadge from "@/components/PrivacyBadge";
import styles from "./TrustSection.module.css";

interface TrustSectionProps {
  /**
   * PrivacyBadge（「ブラウザ内完結」表記）を表示するか否か。
   * デフォルト: true。M1a likes 4（外部送信への不安解消）に直結。
   */
  privacy?: boolean;
  /**
   * 動作原理テキスト（必須）。meta.howItWorks フィールドの値を渡す。
   * 改行 \n は <br /> に変換して表示する。
   */
  howItWorks: string;
  /**
   * 情報源開示テキスト（任意）。指定時のみ開示セクションを追加表示。
   * 例: "文化庁「敬語の指針」(2007年) に基づく"
   */
  source?: string;
}

/**
 * TrustSection — ブラウザ内完結の旨 + 動作原理の簡単な説明 + 必要な場合の情報源開示。
 *
 * 責務:
 * - PrivacyBadge を内部使用して「ブラウザ内完結」を視覚的に伝える
 * - howItWorks テキストで動作原理を簡潔に説明する（M1a likes 5）
 * - source が渡されたとき情報源を開示する
 *
 * trustLevel は一切参照しない（cycle-180 全廃 + cycle-193 で全件撤去済）。
 * 描画場所は ToolDetailLayout 内のみ（軽量版タイル内では描画しない）。
 *
 * @see docs/tile-and-detail-design.md §3 #6
 */
function TrustSection({
  privacy = true,
  howItWorks,
  source,
}: TrustSectionProps) {
  return (
    <div className={styles.section}>
      {privacy && <PrivacyBadge className={styles.privacyBadge} />}
      <p className={styles.howItWorks}>{renderWithLineBreaks(howItWorks)}</p>
      {source !== undefined && (
        <p className={styles.source} data-testid="trust-source">
          {source}
        </p>
      )}
    </div>
  );
}

/**
 * 文字列の改行 \n を React の <br /> に変換して返す。
 * 連続する \n も個別に処理する。
 */
function renderWithLineBreaks(text: string): React.ReactNode {
  const lines = text.split("\n");
  return lines.map((line, index) => (
    <span key={index}>
      {line}
      {index < lines.length - 1 && <br />}
    </span>
  ));
}

export default TrustSection;
