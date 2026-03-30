"use client";

import Link from "next/link";
import styles from "./ResultNextContent.module.css";

/**
 * クイズ結果画面直下の「次のおすすめ」に表示する1件分のデータ。
 * Server Component（page.tsx）で事前計算してprops経由で渡す。
 */
export interface ResultNextContentItem {
  slug: string;
  title: string;
  shortTitle?: string;
  icon: string;
  category: string;
  /** getContentPath() の結果（例: "/play/kanji-level"） */
  contentPath: string;
  /** コスト感情報（「全10問」「毎日更新」「パズル」等） */
  metaText: string;
  /** resolveDisplayCategory() の結果（「診断」「クイズ」「パズル」等） */
  categoryLabel: string;
}

interface ResultNextContentProps {
  contents: ResultNextContentItem[];
}

/**
 * クイズ結果画面直下の「次のおすすめ」回遊導線コンポーネント。
 *
 * - ResultCard の直後に配置され、来訪者が結果確認後に次のコンテンツを発見できるようにする
 * - props で受け取ったデータを表示するだけの純粋な表示コンポーネント
 * - QuizContainer（Client Component）の子として描画されるため "use client" を指定
 * - contents が空配列の場合は null を返す
 * - registryやseoへのimportを持たず、クライアントバンドルを肥大化させない
 */
export default function ResultNextContent({
  contents,
}: ResultNextContentProps) {
  if (contents.length === 0) return null;

  return (
    <section className={styles.section} aria-label="次のおすすめ">
      <h3 className={styles.heading}>次はこれを試してみよう</h3>
      <ul className={styles.list}>
        {contents.map((content) => (
          <li key={content.slug}>
            <Link href={content.contentPath} className={styles.link}>
              <span className={styles.icon} aria-hidden="true">
                {content.icon}
              </span>
              <div className={styles.info}>
                <span className={styles.title}>
                  {content.shortTitle ?? content.title}
                </span>
                <span className={styles.meta}>{content.metaText}</span>
                <span className={styles.badge} data-category={content.category}>
                  {content.categoryLabel}
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
