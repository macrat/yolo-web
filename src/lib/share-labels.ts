/**
 * 共有のボタンの文言と読み上げの名前。共有のボタンを持つ部品はどれもここから取り、同じ共有先を
 * どの面でも同じ言葉で言う。
 *
 * 新しいタブで外部のサイトを開くボタンだけが、読み上げの名前でそのことを予告する。押した先で画面が
 * 替わったことに、見えない来訪者も戸惑わないようにするため。名前は見える文言で始め、声で操作する
 * 来訪者が見えている文言で押せるようにする。コピー・画像の保存・端末の共有シートは、いまのページの
 * 上で済むので予告しない。
 */

export interface ShareLabel {
  /** ボタンに見える文言。 */
  text: string;
  /** 読み上げの名前。見える文言と同じなら持たない。 */
  ariaLabel?: string;
}

const NEW_TAB_NOTICE = "外部サイト・新しいタブで開く";

export const SHARE_LABELS = {
  x: {
    text: "X でシェア",
    ariaLabel: `X でシェア（${NEW_TAB_NOTICE}）`,
  },
  line: {
    text: "LINE でシェア",
    ariaLabel: `LINE でシェア（${NEW_TAB_NOTICE}）`,
  },
  // 「はてブ」は略称なので、読み上げでは正式な名前を添える。
  hatena: {
    text: "はてブに追加",
    ariaLabel: `はてブに追加（はてなブックマーク・${NEW_TAB_NOTICE}）`,
  },
} as const satisfies Record<string, ShareLabel>;
