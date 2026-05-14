import AccordionItem from "@/components/AccordionItem";
import styles from "./TrustSection.module.css";

interface TrustSectionProps {
  /**
   * 最小限の使い方説明テキスト（オプショナル）。
   * 指定すると AccordionItem でラップした折りたたみ表示になる。
   */
  howToUse?: string;
  /** 出典・根拠テキスト（オプショナル） */
  source?: string;
  /**
   * AI 生成コンテンツの有無フラグ（Constitution Rule 3 必須）。
   * true の場合は AI 注記を必ず表示する。
   */
  isAiGenerated?: boolean;
  /** 更新日（オプショナル、ISO 8601 形式または YYYY/MM/DD 等） */
  updatedAt?: string;
  /** 変更履歴テキスト（オプショナル） */
  changeHistory?: string;
}

/**
 * TrustSection — 階層 3「信頼・透明性」の表示コンポーネント。
 *
 * ツール本体を使い終えた後にスクロールすれば読める位置にのみ表示される。
 * ファーストビューには入らない設計制約を責務として持つ。
 *
 * 設計:
 * - 使い方説明は AccordionItem でラップして折りたたみ表示
 * - AI 生成ありの場合は Constitution Rule 3 準拠で必ず表示する
 * - データフェッチロジックを持たない（呼び出し元が情報を渡す）
 */
function TrustSection({
  howToUse,
  source,
  isAiGenerated = false,
  updatedAt,
  changeHistory,
}: TrustSectionProps) {
  // 表示するコンテンツが何もない場合は何も表示しない
  const hasContent =
    howToUse || source || isAiGenerated || updatedAt || changeHistory;
  if (!hasContent) return null;

  return (
    <aside className={styles.section} aria-label="このツールについて">
      <h2 className={styles.heading}>このツールについて</h2>

      <div className={styles.content}>
        {/* 使い方説明: AccordionItem で折りたたみ表示 */}
        {howToUse && (
          <AccordionItem heading="使い方">
            <p className={styles.text}>{howToUse}</p>
          </AccordionItem>
        )}

        {/* 出典・根拠 */}
        {source && (
          <div className={styles.row}>
            <dt className={styles.term}>出典・根拠</dt>
            <dd className={styles.description}>{source}</dd>
          </div>
        )}

        {/* AI 注記（Constitution Rule 3 準拠） */}
        {isAiGenerated && (
          <div className={styles.aiNote} role="note">
            <p className={styles.text}>
              このページの一部コンテンツは AI
              が生成しています。内容が誤っている可能性があります。
              重要な情報は公式の情報源を確認してください。
            </p>
          </div>
        )}

        {/* 更新日・変更履歴 */}
        {(updatedAt || changeHistory) && (
          <div className={styles.row}>
            {updatedAt && (
              <>
                <dt className={styles.term}>最終更新</dt>
                <dd className={styles.description}>
                  <time dateTime={updatedAt}>{updatedAt}</time>
                </dd>
              </>
            )}
            {changeHistory && (
              <>
                <dt className={styles.term}>変更履歴</dt>
                <dd className={styles.description}>{changeHistory}</dd>
              </>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}

export default TrustSection;
