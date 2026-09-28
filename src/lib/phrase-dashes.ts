/**
 * ダッシュ（「—」「──」「--」）を前の語に付けて組む（DESIGN.md §4）。ブラウザはダッシュの前と「-」の後ろで折るので、
 * そのままではダッシュが行の頭に来るか、ダッシュだけの行や「-／-」ができる。
 *
 * 前の空白は折れない空白にし、空白の無いダッシュの前と、ダッシュの字どうしのあいだには語結合子（U+2060）を置く。
 * 語結合子は見えず、ページ内の検索も元の文で当たる。
 *
 * 文字列を受けて文字列を返すだけなので、サーバーでもブラウザでも動く。区切りを組む PhrasedText と、Markdown の
 * 見出しを HTML の文字列で組む所の両方が使う。
 */

/** ダッシュの前の空白。 */
const SPACE_BEFORE_DASH = /[ \t]+(?=[—―─]|--)/gu;
/** ダッシュの字の前（空白でない字の後ろ）と、ダッシュの字どうしのあいだ。 */
const INSIDE_OR_BEFORE_DASH =
  /(?<=[^\s])(?=[—―─])|(?<=[—―─])(?=[—―─])|(?<=[^\s-])(?=--)|(?<=-)(?=-)/gu;
const NO_BREAK_SPACE = " ";
const WORD_JOINER = "⁠";

/** ダッシュを前の語に付け、ダッシュの中で折れないようにした文を返す。 */
export function joinDashes(text: string): string {
  return text
    .replace(SPACE_BEFORE_DASH, NO_BREAK_SPACE)
    .replace(INSIDE_OR_BEFORE_DASH, WORD_JOINER);
}
