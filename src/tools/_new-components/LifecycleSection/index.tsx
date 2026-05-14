import type { ReactNode } from "react";
import Button from "@/components/Button";
import styles from "./LifecycleSection.module.css";

/** 関連コンテンツの 1 件 */
interface RelatedContent {
  /** コンテンツ種別（ツール / ブログ記事等） */
  type: "tool" | "blog" | "play";
  /** タイトル */
  title: string;
  /** URL または相対パス */
  href: string;
  /** 推薦根拠（空文字 / undefined の場合はリスト非表示） */
  reason?: string;
}

interface LifecycleSectionProps {
  /**
   * 関連コンテンツ一覧（オプショナル）。
   * reason が空または未定義のコンテンツは表示しない（機械的羅列防止）。
   */
  relatedContents?: RelatedContent[];
  /**
   * タイルバリアント情報（オプショナル）。
   * Phase D / Phase 9 で使用予定のプレースホルダ。
   */
  tileVariant?: ReactNode;
  /**
   * 道具箱追加コールバック（オプショナル）。
   * Phase 9 配線実装時に接続予定のプレースホルダ。
   */
  onAddToToolbox?: () => void;
  /**
   * 日替わりコンテンツ（オプショナル）。
   * ツール種別依存の日替わりコンテンツ表示エリア。
   */
  dailyContent?: ReactNode;
}

/**
 * LifecycleSection — 階層 4「生活への組み込み」の表示コンポーネント。
 *
 * 関連コンテンツ / タイルプレビュー / 道具箱追加 / タイル説明 / 日替わりコンテンツを
 * オプショナルに組み合わせて表示する。
 *
 * 本サイクルでの実装方針:
 * - すべてのサブ要素はオプショナルとして最小実装
 * - 関連コンテンツのみ最低限の表示機能を実装
 * - タイルプレビュー / 道具箱追加は Phase D / Phase 9 で使用予定のプレースホルダ
 * - 推薦根拠が空の場合は関連コンテンツを表示しない（機械的羅列防止）
 */
function LifecycleSection({
  relatedContents,
  tileVariant,
  onAddToToolbox,
  dailyContent,
}: LifecycleSectionProps) {
  // 推薦根拠が明確なコンテンツのみ表示する
  const visibleRelated = relatedContents?.filter(
    (c) => c.reason && c.reason.trim().length > 0,
  );

  // 表示するコンテンツが何もない場合は何も表示しない
  const hasContent =
    (visibleRelated && visibleRelated.length > 0) ||
    tileVariant ||
    onAddToToolbox ||
    dailyContent;

  if (!hasContent) return null;

  return (
    <aside className={styles.section} aria-label="あわせて使いたい">
      {/* 関連コンテンツ */}
      {visibleRelated && visibleRelated.length > 0 && (
        <div className={styles.relatedArea}>
          <h2 className={styles.heading}>あわせて使いたい</h2>
          <ul className={styles.relatedList}>
            {visibleRelated.map((content) => (
              <li key={content.href} className={styles.relatedItem}>
                <a href={content.href} className={styles.relatedLink}>
                  <span className={styles.relatedTitle}>{content.title}</span>
                  {content.reason && (
                    <span className={styles.relatedReason}>
                      {content.reason}
                    </span>
                  )}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* タイルバリアントプレビュー（Phase D / Phase 9 配線予定のプレースホルダ） */}
      {tileVariant && <div className={styles.tileArea}>{tileVariant}</div>}

      {/* 道具箱追加（Phase 9 配線予定のプレースホルダ） */}
      {onAddToToolbox && <Button onClick={onAddToToolbox}>道具箱に追加</Button>}

      {/* 日替わりコンテンツ */}
      {dailyContent && <div className={styles.dailyArea}>{dailyContent}</div>}
    </aside>
  );
}

export default LifecycleSection;
export type { RelatedContent };
