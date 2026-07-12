import Link from "next/link";
import type { ReactElement } from "react";
import { NefudaGroup } from "@/components/Nefuda";
import styles from "./DictionaryEntryList.module.css";

/**
 * 品書きの 1 行に必要な正規化データ。各辞典（kanji/yoji/colors）が自分のデータ形から
 * この共通形へ落とし込んで渡す（器はデータ形に依存しない）。検索器（DictionarySearch）の
 * 検索結果と、ファセット/カテゴリの絞り込み結果が、同じ 1 枚の品書きの器を共有する。
 */
export interface DictionaryEntryItem {
  /** React key（辞典内で一意な文字・slug 等）。 */
  key: string;
  /** 品名（見出し・一覧の主役・明朝）。漢字なら 1 字、四字熟語なら 4 字、色なら色名。 */
  name: string;
  /** 品名リンクの遷移先（実在ルート）。 */
  href: string;
  /** よみ（品名に添える補助情報）。任意——無ければ出さない。 */
  reading?: string;
  /** ひとこと（意味・語義プレビュー）。任意——無ければ出さない。 */
  note?: string;
  /** 値札の文言配列（種別・難易度・カラーコード等）。任意——空なら描画しない。 */
  tags?: string[];
  /**
   * 色見本の地色（colors のみ・成果物の中身＝和色・§2 の唯一の例外）。
   * CSS ではなくインライン style で当てる（成果物パレットは器のトークンの外・データ由来の変数）。任意。
   */
  swatch?: string;
}

interface DictionaryEntryListProps {
  /** 品書きに並べる項目。各項目が罫で区切られた 1 行になる。 */
  items: DictionaryEntryItem[];
  /** リスト全体のアクセシビリティ名。 */
  ariaLabel: string;
}

/**
 * 品書き（辞典エントリ一覧）— 辞典共有の「一覧の既定形」（DESIGN.md §4/§8-4）。
 *
 * - 一覧の既定は罫区切りのリストであってカードのグリッドではない。上辺＋各行の一本罫で全行を囲い、
 *   カード装飾・box-shadow（§8-2）・色地を持たない。
 * - 各行 = 品名（リンク・明朝・墨）＋ よみ（--ink-2）＋ ひとこと（意味）＋ 任意の値札群、
 *   colors のみ品名の頭に色見本（成果物の中身＝和色・§2）。
 * - 検索器の結果とファセット絞り込みの結果が、この 1 枚の器を共有する（見せ方を一貫させる）。
 *   幅は呼び出し側が決める（読む面 --measure / 操作面 --max-width を親で当てる）。
 */
export default function DictionaryEntryList({
  items,
  ariaLabel,
}: DictionaryEntryListProps): ReactElement {
  return (
    <ul className={styles.list} aria-label={ariaLabel}>
      {items.map((item) => (
        <li key={item.key} className={styles.row}>
          <Link href={item.href} className={styles.itemLink}>
            <span className={styles.headword}>
              {item.swatch ? (
                <span
                  className={styles.swatch}
                  style={{ backgroundColor: item.swatch }}
                  aria-hidden="true"
                />
              ) : null}
              <span className={styles.name}>{item.name}</span>
              {item.reading ? (
                <span className={styles.reading}>{item.reading}</span>
              ) : null}
            </span>
            {item.note ? (
              <span className={styles.note}>{item.note}</span>
            ) : null}
            {/* NefudaGroup は空・空要素のみのとき null を返すため、ここでの空判定は不要。 */}
            {item.tags ? (
              <span className={styles.tags}>
                <NefudaGroup labels={item.tags} />
              </span>
            ) : null}
          </Link>
        </li>
      ))}
    </ul>
  );
}
