/**
 * 共有のボタンと、結果を持ち帰るボタンの面と読み上げの名前。これらのボタンを持つ部品はどれもここから取り、同じ
 * 操作をどの面でも同じ言葉で言う。
 *
 * 面は文節で分けた区切りの並びで持ち、Button の phrases に渡す（DESIGN.md §4 のコントロールの名前の折り方）。
 * 並びは followsPhraseRules（@/lib/phrase-breaks）の禁則を満たす。
 *
 * 新しいタブで外部のサイトを開くボタンだけが、読み上げの名前でそのことを予告する。押した先で画面が
 * 替わったことに、見えない来訪者も戸惑わないようにするため。名前は見える文言で始め、声で操作する
 * 来訪者が見えている文言で押せるようにする。コピー・画像の保存と共有・端末の共有シートは、いまのページの
 * 上で済むので予告しない。
 */

export interface ShareLabel {
  /** ボタンの面。文節で分けた区切りの並び。 */
  phrases: readonly string[];
  /** 読み上げの名前。見える文言と同じなら持たない。 */
  ariaLabel?: string;
}

const NEW_TAB_NOTICE = "外部サイト・新しいタブで開く";

/** 新しいタブで外部のサイトを開くボタン。読み上げの名前は、見える文言に予告を添えたもの。 */
function opensNewTab(
  phrases: readonly string[],
  notice: string = NEW_TAB_NOTICE,
): ShareLabel {
  return { phrases, ariaLabel: `${phrases.join("")}（${notice}）` };
}

export const SHARE_LABELS = {
  x: opensNewTab(["X で", "シェア"]),
  line: opensNewTab(["LINE で", "シェア"]),
  // 「はてブ」は略称なので、読み上げでは正式な名前を添える。
  hatena: opensNewTab(
    ["はてブに", "追加"],
    `はてなブックマーク・${NEW_TAB_NOTICE}`,
  ),
  copyUrl: { phrases: ["URLを", "コピー"] },
  copyResult: { phrases: ["結果を", "コピー"] },
  webShare: { phrases: ["この", "結果を", "シェア"] },
  saveImage: { phrases: ["画像を", "保存"] },
  shareImage: { phrases: ["画像を", "共有"] },
} satisfies Record<string, ShareLabel>;
