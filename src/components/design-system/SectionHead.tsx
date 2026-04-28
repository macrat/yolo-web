/**
 * SectionHead — セクション見出し部品
 *
 * ## 用途
 * ページ内のセクションを視覚的に区切り、見出しとオプションのメタ情報を表示する。
 * 細い罫線で区切ることで、装飾なしに論理的な区切りを伝える。
 *
 * ## 使う場面
 * - ページ内セクション（「使い方」「関連ツール」等）の先頭
 * - ツールページでステップや結果の前に配置する
 * - リスト・グリッドの上に「ほかの道具」などの文脈を与える
 *
 * ## 使わない場面
 * - ページ最上部の H1 相当見出しには使わない（ページ側でインライン HTML で記述する）
 * - ページ内に同一階層の見出しが連続するときは level props で明示的に管理する
 * - サイト共通のヘッダー・フッターの中では使わない
 */

import styles from "./SectionHead.module.css";

export interface SectionHeadProps {
  /** セクションタイトルテキスト */
  title: string;
  /**
   * 右端に表示する補助情報（件数・タイムスタンプ・ラベルなど）。
   * 省略可。
   */
  meta?: string;
  /**
   * 見出しレベル。ページの階層構造に合わせて指定する。
   * @default 2
   */
  level?: 2 | 3 | 4;
  /**
   * 見出し要素（h2/h3/h4）に付与する id 属性。
   * 親の `<section aria-labelledby={id}>` と紐付けるために使う。
   * 省略した場合は id を出力しない。
   * 複数の SectionHead が同一ページに存在する場合は、必ず一意な値を渡すこと。
   */
  id?: string;
}

/**
 * セクション見出し。
 * タイトルと右端のメタ情報を横並びに表示し、下に細い罫線を引く。
 */
export default function SectionHead({
  title,
  meta,
  level = 2,
  id,
}: SectionHeadProps) {
  const Tag = `h${level}` as "h2" | "h3" | "h4";

  return (
    <div className={styles.head}>
      <Tag className={styles.title} id={id}>
        {title}
      </Tag>
      {meta && (
        <span
          className={styles.meta}
          data-testid="section-head-meta"
          aria-label={`補足情報: ${meta}`}
        >
          {meta}
        </span>
      )}
    </div>
  );
}
