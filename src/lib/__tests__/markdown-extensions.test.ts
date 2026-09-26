import { describe, test, expect } from "vitest";
import { Marked } from "marked";
import {
  alertExtension,
  createTableExtension,
} from "@/lib/markdown-extensions";

function render(md: string): string {
  return new Marked(createTableExtension(), alertExtension).parse(md, {
    async: false,
  });
}

function cells(md: string): string[] {
  return [...render(md).matchAll(/<t[dh]>([\s\S]*?)<\/t[dh]>/g)].map(
    (m) => m[1],
  );
}

describe("createTableExtension", () => {
  test("表を .table-scroll で包む", () => {
    expect(render("| A |\n|---|\n| 1 |")).toMatch(
      /^<div class="table-scroll"><table>[\s\S]*<\/table>\n<\/div>\n$/,
    );
  });

  test("セルの語と語のあいだに <wbr> を置く", () => {
    expect(cells("| 新しい値の参照 |\n|---|\n| x |")[0]).toBe(
      "新しい<wbr>値<wbr>の<wbr>参照",
    );
  });

  test("数字とそれに続く字のあいだ、平仮名どうしのあいだ、記号の前後には置かない", () => {
    expect(
      cells("| 4バイト（サロゲートペア） |\n|---|\n| ひらがな・カタカナ |"),
    ).toEqual(["4バイト（サロゲートペア）", "ひらがな・カタカナ"]);
  });

  test("全角の英数字どうしのあいだと、最後の1字の語の前には置かない", () => {
    expect(cells("| ＡＢＣ と 戻り値 |\n|---|\n| x |")[0]).toBe(
      "ＡＢＣ と 戻り値",
    );
  });

  test("コード片・タグ・文字参照の中には置かない", () => {
    const [cell] = cells(
      "| `新しい値` と [新しい値の参照](https://example.com) の 値&amp;値 |\n|---|\n| x |",
    );
    expect(cell).toBe(
      '<code>新しい値</code> と <a href="https://example.com">新しい<wbr>値<wbr>の<wbr>参照</a> の 値&amp;値',
    );
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
