/**
 * Markdown を記事の本文の組み方（DESIGN.md §5）に合わせて出す marked の拡張。
 * ブログの記事（src/lib/markdown.ts）と markdown-preview のプレビューが同じものを使い、注記と表の枠を
 * 同じ HTML で出す。表のセルの折り所は、サーバーで組む記事だけが持つ（§4）。ブラウザでも動くものだけを置く。
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

interface TableExtensionOptions {
  /** 表の枠に併せて付ける class（記事の表が区切りを持つことの印）。 */
  frameClass?: string;
  /** 組んだセルの中身（HTML）に、折り所を差し込む。 */
  breakCell?: (html: string) => string;
}

/**
 * 表を横に送れる枠（`.table-scroll`）で包む。列が収まらない表は、この枠の中で横に送る（§5 表）。
 * 記事の表は、セルの折り所（breakCell）と、それを持つことの印（frameClass）をここから差し込む。
 */
export function createTableExtension({
  frameClass,
  breakCell,
}: TableExtensionOptions = {}): MarkedExtension {
  const frameClasses = frameClass
    ? `table-scroll ${frameClass}`
    : "table-scroll";
  return {
    renderer: {
      table(token: Tokens.Table) {
        return `<div class="${frameClasses}">${Renderer.prototype.table.call(this, token)}</div>\n`;
      },
      tablecell(token: Tokens.TableCell) {
        const content = this.parser.parseInline(token.tokens);
        const type = token.header ? "th" : "td";
        const open = token.align
          ? `<${type} align="${token.align}">`
          : `<${type}>`;
        return `${open}${breakCell ? breakCell(content) : content}</${type}>\n`;
      },
    },
  };
}
