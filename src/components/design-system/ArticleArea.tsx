/**
 * ArticleArea — 記事・ツールページの本文エリア
 *
 * ## 用途
 * ツールページや記事ページの主要コンテンツ領域を構成する。
 * タイトル・本体コンテンツ・使い方（ステップ）・関連リンクを
 * 一貫した構造で組み立てる複合部品。
 *
 * 素地の ToolHero / HowTo / RelatedTools（`ui_kits/tool-page/ToolPage.jsx`）
 * の設計パターンを TypeScript + CSS Modules に移植・再構成したもの。
 *
 * ## 使う場面
 * - ツールページ（テキストカウンター・タイマー等）のメインコンテンツ
 * - 読み物コンテンツで「使い方」ステップを提示したいとき
 * - 記事末尾に関連ツール・関連記事へのリンクを表示したいとき
 *
 * ## 使わない場面
 * - ヘッダー・フッター等の Chrome 要素には使わない
 * - 複数の ArticleArea を入れ子にしない（役割の重複を避けるため）
 * - Panel の内側に ArticleArea をネストしない（ページ最上位の構造として使う）
 *
 * ## スロット構成
 * - `children`: ツール本体（入力欄・ライブプレビュー等）が入る主要エリア
 * - `title`: ページ先頭の見出し（省略可）
 * - `meta`: タイトル横に表示する補足情報（カテゴリ・日付等）
 * - `steps`: 「使い方」の番号付きステップ（省略可）
 * - `related`: 関連リンク（省略可）
 */

import { useId } from "react";
import Link from "next/link";
import SectionHead from "./SectionHead";
import styles from "./ArticleArea.module.css";

/** 関連リンク 1 件の型 */
export interface RelatedItem {
  /** リンク先 URL */
  href: string;
  /** リンクラベル */
  label: string;
  /** 種別タグ（例: "ツール", "辞典"） */
  tag?: string;
}

export interface ArticleAreaProps {
  /**
   * ツール本体・本文など、ページの主要コンテンツ。
   * 必須スロット。
   */
  children: React.ReactNode;
  /**
   * ページ先頭の H1 相当タイトル。
   * 省略した場合はタイトル行そのものが表示されない。
   */
  title?: string;
  /**
   * タイトルの右端に表示する補足情報。
   * カテゴリ名・日付・バッジ等のテキストを想定。
   */
  meta?: string;
  /**
   * 「使い方」セクションに表示する手順の配列。
   * 番号はゼロパディング（01, 02, ...）で自動付与される。
   * 省略した場合は「使い方」セクションが非表示になる。
   */
  steps?: string[];
  /**
   * 末尾の「関連」セクションに表示するリンク一覧。
   * 省略した場合は関連セクションが非表示になる。
   */
  related?: RelatedItem[];
}

/**
 * 記事・ツールページの本文エリア。
 * ToolHero / HowTo / RelatedTools の 3 要素を汎用化した複合部品。
 */
export default function ArticleArea({
  children,
  title,
  meta,
  steps,
  related,
}: ArticleAreaProps) {
  // useId() で ArticleArea インスタンスごとに一意なプレフィックスを生成する。
  // 同一ページに複数の ArticleArea が描画されても ID 重複が起きない（HTML 仕様準拠）。
  const uid = useId();
  const howToId = `${uid}-how-to`;
  const relatedId = `${uid}-related`;

  return (
    <article className={styles.article}>
      {/* タイトル行（title がある場合のみ表示） */}
      {title && (
        <div className={styles.titleRow}>
          <h1 className={styles.title}>{title}</h1>
          {meta && <span className={styles.meta}>{meta}</span>}
        </div>
      )}

      {/* メインコンテンツエリア（ツール本体・記事本文） */}
      <div className={styles.main}>{children}</div>

      {/* 使い方ステップ（steps がある場合のみ表示） */}
      {steps && steps.length > 0 && (
        <section className={styles.howTo} aria-labelledby={howToId}>
          <SectionHead title="使い方" level={2} id={howToId} />
          <ol className={styles.stepList} role="list">
            {steps.map((step, index) => (
              <li key={index} className={styles.stepItem}>
                <span className={styles.stepNumber} aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className={styles.stepText}>{step}</span>
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* 関連コンテンツ（related がある場合のみ表示） */}
      {related && related.length > 0 && (
        <section className={styles.related} aria-labelledby={relatedId}>
          <SectionHead title="関連" level={2} id={relatedId} />
          <ul className={styles.relatedList} role="list">
            {related.map((item) => (
              <li key={item.href} className={styles.relatedItem}>
                <Link href={item.href} className={styles.relatedLink}>
                  {item.tag && (
                    <span className={styles.relatedTag}>{item.tag}</span>
                  )}
                  <span className={styles.relatedLabel}>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}
