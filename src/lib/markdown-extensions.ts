/**
 * Markdown を記事の本文の組み方（DESIGN.md §5）に合わせて出す marked の拡張。
 * ブログの記事（src/lib/markdown.ts）と markdown-preview のプレビューが同じものを使い、
 * 同じ Markdown から同じ HTML を出す。ブラウザでも動くものだけを置く。
 */

import { Renderer, type MarkedExtension, type Tokens } from "marked";
import markedAlert from "marked-alert";

/**
 * GFM Alert（> [!NOTE] など）を注記のボックスにする。種類は、1行目に単独で置く日本語の語だけで
 * 言い、印（svg）を持たない（§5 注記）。
 */
export const alertExtension: MarkedExtension = markedAlert({
  variants: [
    { type: "note", icon: "", title: "補足" },
    { type: "tip", icon: "", title: "ヒント" },
    { type: "important", icon: "", title: "重要" },
    { type: "warning", icon: "", title: "注意" },
    { type: "caution", icon: "", title: "警告" },
  ],
});

const DIGIT_AT_END = /[0-9０-９]$/;
/** 解析が1字ずつの語に分けることのある字（平仮名・全角の英数字）。同じ種類どうしのあいだでは折らない。 */
const SPLIT_PRONE_SCRIPTS = [/\p{Script=Hiragana}/u, /[０-９Ａ-Ｚａ-ｚ]/u];

function sameSplitProneScript(before: string, after: string): boolean {
  const last = before.at(-1) ?? "";
  const first = after[0] ?? "";
  return SPLIT_PRONE_SCRIPTS.some((re) => re.test(last) && re.test(first));
}

/**
 * 文の、語と語のあいだに `<wbr>` を置く。表のセルは `word-break: keep-all` で組み、ここに置いた
 * 所でだけ折る。列が狭くても字が1字ずつ縦に折れず、語の途中で割れない（§5 表）。
 *
 * 語の切れ目は `Intl.Segmenter` の語の切れ目のうち、次の所を除いたもの。
 * - 数字とそれに続く字のあいだ（「4／バイト」）
 * - 平仮名どうし・全角の英数字どうしのあいだ。解析がこれらを1字ずつの語に分けることがあり、
 *   そこで折ると語が割れる
 * - 最後の語が1字のときの、その前（「戻り／値」）。1字だけが行に残ると、前の語から切り離されて読まれる
 */
function breakBetweenWords(text: string, segmenter: Intl.Segmenter): string {
  const segments = [...segmenter.segment(text)];
  const lastWord = segments.findLast((segment) => segment.isWordLike);
  let out = "";
  let previous: Intl.SegmentData | null = null;
  for (const segment of segments) {
    if (
      previous?.isWordLike &&
      segment.isWordLike &&
      !DIGIT_AT_END.test(previous.segment) &&
      !sameSplitProneScript(previous.segment, segment.segment) &&
      !(segment === lastWord && [...segment.segment].length === 1)
    ) {
      out += "<wbr>";
    }
    out += segment.segment;
    previous = segment;
  }
  return out;
}

/**
 * 組んだセルの HTML の、タグと文字参照の外の文に `<wbr>` を置く。コード片（`<code>`）の中は、
 * 字の並びそのものが中身なので触らない。
 */
function breakCellText(html: string, segmenter: Intl.Segmenter): string {
  let codeDepth = 0;
  return html
    .split(/(<[^>]*>)/)
    .map((part) => {
      if (part.startsWith("<")) {
        if (/^<code[\s>]/.test(part)) codeDepth++;
        else if (part === "</code>") codeDepth--;
        return part;
      }
      if (codeDepth > 0 || part === "") return part;
      return part
        .split(/(&[#\w]+;)/)
        .map((text) =>
          text.startsWith("&") ? text : breakBetweenWords(text, segmenter),
        )
        .join("");
    })
    .join("");
}

/**
 * 表を横に送れる枠（`.table-scroll`）で包み、セルの文に語の切れ目を置く。列がコンテンツ幅に
 * 収まらない表は、この枠の中で横に送る（§5 表）。
 */
export function createTableExtension(): MarkedExtension {
  const segmenter = new Intl.Segmenter("ja", { granularity: "word" });
  return {
    renderer: {
      table(token: Tokens.Table) {
        return `<div class="table-scroll">${Renderer.prototype.table.call(this, token)}</div>\n`;
      },
      tablecell(token: Tokens.TableCell) {
        return breakCellText(
          Renderer.prototype.tablecell.call(this, token),
          segmenter,
        );
      },
    },
  };
}
