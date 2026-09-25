import Link from "next/link";
import type { ReactElement } from "react";
import styles from "./Shinagaki.module.css";

export interface ShinagakiItem {
  /** 品名（一覧の主役・リンクの表示文言）。本文の書体で組む。 */
  name: string;
  /** 品名リンクの遷移先。 */
  href: string;
  /**
   * ひとこと（短い説明・`--ink-2`）。任意——
   * 与えられなければ説明行を出さない（空の器を作らない）。
   */
  note?: string;
  /**
   * 種別（それが何の仲間かを言う語）。任意——複数あれば「・」でつないで1行にする。
   * 空・空要素のみなら種別の行を出さない（中身の無い行を作らない）。
   */
  tags?: string[];
  /** 行右端に添える短いメタ（更新日・件数など）。任意——空なら描画しない。 */
  meta?: string;
  /**
   * `meta` が日付のとき、その機械可読な datetime 値（ISO 8601）。任意——
   * 与えられると右端メタを `<time dateTime={metaDateTime}>` で包み、意味的な日付にする。
   * 件数など日付でないメタのときは渡さない（プレーンな `<span>` のまま）。
   */
  metaDateTime?: string;
}

export interface ShinagakiProps {
  /** 品書きの項目。各項目が罫で区切られた 1 行になる。 */
  items: ShinagakiItem[];
  /**
   * 棚（区画）の見出し。任意——与えると見出し付きの棚になる。
   * 複数の棚でグルーピングしたいときは、呼び出し側がこのコンポーネントを見出しごとに並べる
   * （単一リストを堅牢に保ち、グルーピングは合成で表現する）。
   */
  heading?: string;
  /** 見出しの意味的レベル（既定 2）。ページ内の見出し階層に合わせて調整する。 */
  headingLevel?: 2 | 3 | 4;
  /** リスト全体のアクセシビリティ名（任意）。 */
  ariaLabel?: string;
}

/**
 * 品書き（Shinagaki）— 一覧。
 *
 * 仕様:
 * - 一覧は「罫区切りのリスト」であってカードのグリッドではない。
 *   各行を細い線（`--rule-2`）で仕切る（カード装飾・影・色地なし）。
 * - 各行 = 品名（リンク・墨）+ ひとこと（`--ink-2`）+ 任意の種別 + 任意の右端メタ。
 * - 左揃え。幅は呼び出し側が決められるよう、このコンポーネントは幅を固定しない
 *   （読む面は `--measure`、操作面は `--max-width` を親で当てる）。
 */
export default function Shinagaki({
  items,
  heading,
  headingLevel = 2,
  ariaLabel,
}: ShinagakiProps): ReactElement {
  // 動的な見出しタグを型安全に決める（テンプレートリテラルで型を崩さない）
  const HeadingTag =
    headingLevel === 2 ? "h2" : headingLevel === 3 ? "h3" : "h4";

  return (
    <section className={styles.shinagaki}>
      {heading ? (
        <HeadingTag className={styles.heading}>{heading}</HeadingTag>
      ) : null}
      <ul className={styles.list} aria-label={ariaLabel} data-text-box="rows">
        {items.map((item) => {
          const kind = (item.tags ?? [])
            .filter((tag) => tag.trim() !== "")
            .join("・");
          return (
            <li key={item.href} className={styles.row}>
              <div className={styles.main}>
                <Link
                  href={item.href}
                  className={styles.name}
                  data-hit-area="after"
                >
                  {item.name}
                </Link>
                {item.note ? <p className={styles.note}>{item.note}</p> : null}
                {kind ? <p className={styles.kind}>{kind}</p> : null}
              </div>
              {item.meta && item.meta.trim() !== "" ? (
                item.metaDateTime ? (
                  <time className={styles.meta} dateTime={item.metaDateTime}>
                    {item.meta}
                  </time>
                ) : (
                  <span className={styles.meta}>{item.meta}</span>
                )
              ) : null}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
