import { describe, test, expect } from "vitest";
import { Marked } from "marked";
import {
  alertExtension,
  createTableExtension,
} from "@/lib/markdown-extensions";

function render(md: string, options = {}): string {
  return new Marked(createTableExtension(options), alertExtension).parse(md, {
    async: false,
  });
}

describe("createTableExtension", () => {
  test("表を .table-scroll で包み、セルは折り所を持たない", () => {
    expect(render("| 新しい値の参照 |\n|---|\n| 1 |")).toBe(
      '<div class="table-scroll"><table>\n<thead>\n<tr>\n<th>新しい値の参照</th>\n</tr>\n</thead>\n<tbody><tr>\n<td>1</td>\n</tr>\n</tbody></table>\n</div>\n',
    );
  });

  test("記事の側から、枠の印とセルの折り所を差し込める", () => {
    const html = render("| a | b |\n|:-:|---|\n| x | y |", {
      frameClass: "table-phrased",
      breakCell: (cell: string) => `[${cell}]`,
    });
    expect(html).toContain('<div class="table-scroll table-phrased">');
    expect(html).toContain('<th align="center">[a]</th>');
    expect(html).toContain("<td>[y]</td>");
  });
});

describe("alertExtension", () => {
  test.each([
    ["NOTE", "note", "補足"],
    ["TIP", "tip", "ヒント"],
    ["IMPORTANT", "important", "重要"],
    ["WARNING", "warning", "注意"],
    ["CAUTION", "caution", "警告"],
  ])("[!%s] を種類の語だけを1行目に置く注記にする", (type, variant, word) => {
    expect(render(`> [!${type}]\n> 内容。`)).toBe(
      `<div class="markdown-alert markdown-alert-${variant}">\n<p class="markdown-alert-title">${word}</p>\n<p>内容。</p>\n</div>\n`,
    );
  });

  test("注記の中の箇条書きを本文と同じく組む", () => {
    expect(render("> [!NOTE]\n> - 一つ目\n> - 二つ目")).toContain(
      "<ul>\n<li>一つ目</li>\n<li>二つ目</li>\n</ul>",
    );
  });
});
