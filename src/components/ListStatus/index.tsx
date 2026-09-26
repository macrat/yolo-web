import type { Ref } from "react";
import Button from "@/components/Button";
import { statusText, type BrowseUnit } from "@/lib/list-browse";
import styles from "./ListStatus.module.css";

interface ListStatusProps {
  /** 範囲の全件の数。 */
  total: number;
  /** 条件に合う件数。絞っていないときは total と同じ。 */
  matched: number;
  /** 名前・種別・道具ごとの組のどれかで絞っているか。 */
  filtering: boolean;
  unit: BrowseUnit;
  /** ページ送りがあるときの、表示している範囲（1 から数える）。 */
  range?: { start: number; end: number };
  /** 並び順の組が無いときの、既定の並び順の語。 */
  sortLabel?: string;
  /**
   * 読み上げに伝える件数の文。来訪者が変えた条件が落ち着いたときに親が入れ、読まれる間を置いて空に戻す。
   * ほかのときは空にしておき、ページを読み進める読み上げに、見えている件数の行と同じ文を二度読ませない。
   */
  announcement: string;
  /** 該当が0件のときに「絞り込みを外す」で呼ぶ。渡さなければボタンを出さない。 */
  onClear?: () => void;
  /** 件数の行の要素。ページを送ったあとに、ここへフォーカスを移す。 */
  ref?: Ref<HTMLParagraphElement>;
}

/**
 * 件数の行（DESIGN.md §7「件数と備え」）。全体の件数をいつも言い、絞っている間は該当の件数も言う。
 *
 * 絞り込みで変わった件数は、見えない role="status" の文で読み上げに伝える（§8）。見えている行をライブリージョンに
 * しないのは、ページを送ると範囲の文が替わると同時に行へフォーカスが移り、同じ文を二度読ませるうえ、打つたびの
 * 途中の件数まで読み上げの予約に積むため。見えている行は tabIndex={-1} で、ページを送ったあとに一覧の頭として
 * フォーカスを受ける。行は縁の見えないコントロールと同じ字の箱（§5、data-text-box="inline"）を持ち、
 * リングをその内側に出す（§6）。
 * 「絞り込みを外す」のボタンはライブリージョンの外に置き、件数が変わるたびにボタンの名前まで読み上げさせない。
 */
export default function ListStatus({
  total,
  matched,
  filtering,
  unit,
  range,
  sortLabel,
  announcement,
  onClear,
  ref,
}: ListStatusProps) {
  const empty = filtering && matched === 0;
  return (
    <div className={styles.status}>
      <p ref={ref} tabIndex={-1} className={styles.text} data-text-box="inline">
        {statusText({ total, matched, filtering, unit, range, sortLabel })}
      </p>
      <p role="status" className="visually-hidden">
        {announcement}
      </p>
      {empty && onClear ? (
        <Button onClick={onClear}>絞り込みを外す</Button>
      ) : null}
    </div>
  );
}
