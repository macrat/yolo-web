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
  /** 該当が0件のときに「絞り込みを外す」で呼ぶ。渡さなければボタンを出さない。 */
  onClear?: () => void;
  /** 件数の行の要素。ページを送ったあとに、ここへフォーカスを移す。 */
  ref?: Ref<HTMLParagraphElement>;
}

/**
 * 件数の行（DESIGN.md §7「件数と備え」）。全体の件数をいつも言い、絞っている間は該当の件数も言う。
 *
 * role="status" にして、絞り込みで変わった件数を読み上げにも伝える（§8）。「絞り込みを外す」のボタンは
 * ライブリージョンの外に置き、件数が変わるたびにボタンの名前まで読み上げさせない。tabIndex={-1} は、
 * ページを送ったあとに一覧の頭としてフォーカスを受けるため。
 */
export default function ListStatus({
  total,
  matched,
  filtering,
  unit,
  range,
  sortLabel,
  onClear,
  ref,
}: ListStatusProps) {
  const empty = filtering && matched === 0;
  return (
    <div className={styles.status}>
      <p ref={ref} role="status" tabIndex={-1} className={styles.text}>
        {statusText({ total, matched, filtering, unit, range, sortLabel })}
      </p>
      {empty && onClear ? (
        <Button onClick={onClear}>絞り込みを外す</Button>
      ) : null}
    </div>
  );
}
