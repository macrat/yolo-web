import { describe, test, expect, beforeAll } from "vitest";
import {
  parseFrontmatter,
  markdownToHtml,
  estimateReadingTime,
  generateHeadingId,
} from "@/lib/markdown";

// Shiki's `bundle/full` highlighter loads ~200 grammars on first use (~5s in
// vitest). Warm it up once so each test below doesn't pay that cost — and
// crucially, doesn't blow vitest's default 5 s testTimeout.
beforeAll(async () => {
  await markdownToHtml("```text\nwarmup\n```");
}, 60000);

describe("parseFrontmatter", () => {
  test("parses quoted string values", async () => {
    const raw = `---
title: "Hello World"
slug: "hello-world"
---

Content here.`;

    const result = parseFrontmatter<{ title: string; slug: string }>(raw);
    expect(result.data.title).toBe("Hello World");
    expect(result.data.slug).toBe("hello-world");
    expect(result.content.trim()).toBe("Content here.");
  });

  test("parses boolean values", async () => {
    const raw = `---
draft: false
public: true
---

Body.`;

    const result = parseFrontmatter<{ draft: boolean; public: boolean }>(raw);
    expect(result.data.draft).toBe(false);
    expect(result.data.public).toBe(true);
  });

  test("parses null values", async () => {
    const raw = `---
reply_to: null
---

Body.`;

    const result = parseFrontmatter<{ reply_to: null }>(raw);
    expect(result.data.reply_to).toBeNull();
  });

  test("parses inline arrays", async () => {
    const raw = `---
tags: ["tag1", "tag2", "tag3"]
---

Body.`;

    const result = parseFrontmatter<{ tags: string[] }>(raw);
    expect(result.data.tags).toEqual(["tag1", "tag2", "tag3"]);
  });

  test("parses block arrays", async () => {
    const raw = `---
tags:
  - tag1
  - tag2
---

Body.`;

    const result = parseFrontmatter<{ tags: string[] }>(raw);
    expect(result.data.tags).toEqual(["tag1", "tag2"]);
  });

  test("parses empty inline arrays", async () => {
    const raw = `---
tags: []
---

Body.`;

    const result = parseFrontmatter<{ tags: string[] }>(raw);
    expect(result.data.tags).toEqual([]);
  });

  test("handles escaped quotes in strings", async () => {
    const raw = `---
subject: "Hello \\"World\\""
---

Body.`;

    const result = parseFrontmatter<{ subject: string }>(raw);
    expect(result.data.subject).toBe('Hello "World"');
  });

  test("returns empty data when no frontmatter", async () => {
    const raw = "Just some content without frontmatter.";
    const result = parseFrontmatter<Record<string, unknown>>(raw);
    expect(result.data).toEqual({});
    expect(result.content).toBe(raw);
  });
});

describe("markdownToHtml", () => {
  test("converts headings", async () => {
    const { html } = await markdownToHtml("## Hello\n\n### World");
    expect(html).toContain("<h2");
    expect(html).toContain("Hello");
    expect(html).toContain("<h3");
    expect(html).toContain("World");
  });

  test("converts bold and italic", async () => {
    const { html } = await markdownToHtml("**bold** and *italic*");
    expect(html).toContain("<strong>bold</strong>");
    expect(html).toContain("<em>italic</em>");
  });

  test("converts code blocks with Shiki dual-theme highlighting", async () => {
    const { html } = await markdownToHtml("```typescript\nconst x = 1;\n```");
    // Shiki wraps highlighted output in <pre class="shiki shiki-themes ...">
    expect(html).toContain("<pre");
    expect(html).toContain("shiki");
    expect(html).toContain("vitesse-light");
    expect(html).toContain("vitesse-dark");
    // Dual-theme mode emits the dark color as a --shiki-dark CSS custom property
    expect(html).toContain("--shiki-dark");
    // Code text is preserved (escaped by Shiki itself)
    expect(html).toContain("const");
    expect(html).toContain("x");
    expect(html).toContain("1");
  });

  test("unknown language falls back to plain text without throwing", async () => {
    const { html } = await markdownToHtml(
      "```not-a-real-lang\nhello world\n```",
    );
    expect(html).toContain("<pre");
    expect(html).toContain("shiki");
    expect(html).toContain("hello world");
  });

  test("fenced code block with no language is rendered as text", async () => {
    const { html } = await markdownToHtml("```\nplain content\n```");
    expect(html).toContain("<pre");
    expect(html).toContain("shiki");
    expect(html).toContain("plain content");
  });

  test('mermaid code block is preserved as <div class="mermaid">', async () => {
    const { html } = await markdownToHtml("```mermaid\ngraph TD; A-->B;\n```");
    expect(html).toContain('<div class="mermaid">');
    expect(html).toContain("graph TD; A--&gt;B;");
    // mermaid blocks must not be syntax-highlighted (no shiki wrapper)
    expect(html).not.toMatch(/<pre class="shiki/);
  });

  test("code block content is HTML-escaped", async () => {
    const { html } = await markdownToHtml(
      "```html\n<script>alert(1)</script>\n```",
    );
    // The literal "<script>" tag must not appear unescaped — Shiki escapes
    // angle brackets even when they get tokenized into separate <span>s.
    expect(html).not.toContain("<script>");
    expect(html).not.toContain("</script>");
    expect(html).not.toContain("alert(1)</script>");
    // Each angle bracket appears escaped (possibly split across token spans)
    expect(html).toContain("&lt;");
    expect(html).toContain("&gt;");
    expect(html).toContain("script");
    expect(html).toContain("alert");
  });

  test("converts lists", async () => {
    const { html } = await markdownToHtml("- item 1\n- item 2");
    expect(html).toContain("<ul>");
    expect(html).toContain("<li>");
    expect(html).toContain("item 1");
  });

  test("converts links", async () => {
    const { html } = await markdownToHtml("[link](https://example.com)");
    expect(html).toContain('<a href="https://example.com"');
    expect(html).toContain("link");
  });

  test("converts GFM tables", async () => {
    const md = "| A | B |\n|---|---|\n| 1 | 2 |";
    const { html } = await markdownToHtml(md);
    expect(html).toContain("<table>");
    expect(html).toContain("<th>");
    expect(html).toContain("<td>");
  });

  /*
   * 表を横スクロール面に載せる拡張の回帰テスト。
   *
   * この包みが外れると、狭い画面で列が内容の最小幅（日本語は1文字）まで潰れ、
   * セルが1文字ずつ縦に折れる状態に戻る。CSS 側の min-width だけでは逃がし先が
   * 無く、はみ出しは html/body の overflow-x: clip に食われて到達できなくなる。
   * 見た目の不具合なので型検査でもビルドでも捕まらない。ここで固定する。
   */
  test("wraps tables in a horizontal scroll container with a hint", async () => {
    const md = "| A | B |\n|---|---|\n| 1 | 2 |";
    const { html } = await markdownToHtml(md);
    expect(html).toContain('<div class="table-wrap"');
    expect(html).toContain('<div class="table-scroll"><table>');
    expect(html).toContain(
      '<p class="table-scroll-hint" aria-hidden="true">横にスクロールできます →</p>',
    );
    /*
     * 案内は表より「前」に出す。後ろに置くと、背の高い表（360px で最大 2337px）
     * では読者がスクロールし切るまで横に切れていることを知らせられない。
     */
    expect(html.indexOf("table-wrap")).toBeLessThan(
      html.indexOf("table-scroll-hint"),
    );
    expect(html.indexOf("table-scroll-hint")).toBeLessThan(
      html.indexOf("<table>"),
    );
  });

  /*
   * 床（min-width）の高さを決める材料。CSS 側は列ごとに
   * `min(6.8em, この値 + パディング + 罫)` を床にする。値が出なくなると全列が
   * 6.8em の床になり、セルが1〜2文字しかない表（カレンダー等）が横スクロールに落ちる。
   */
  test("emits a natural width per column on the wrapper", async () => {
    const md = "| 日 | 月 |\n|---|---|\n| 1 | 2 |";
    const { html } = await markdownToHtml(md);
    // 「日」「月」が全角15px、"1"/"2" は数字8.4px。列ごとの最大は 15px ずつ
    /*
     * em で出す（px ではない）。CSS 側のキャップが 6.8em なので、px で出すと
     * 読者がブラウザの既定フォントサイズを上げたときに床だけが置き去りになり、
     * 1文字折れが戻る（実測: 20px で74セル・24px で128セル）。
     * 0.4em は字種平均のずれを吸収する遊び。
     */
    expect(html).toContain('style="--table-col-1:1.4em;--table-col-2:1.4em"');
  });

  test("measures the widest cell in each column, not the first row", async () => {
    const md = "| a | b |\n|---|---|\n| あいうえお | c |";
    const { html } = await markdownToHtml(md);
    // 1列目は「あいうえお」= 15×5 = 75px。列ごとに出すので、長い列の幅が
    // 短い列の床に化けない
    // 2列目の見出し "b" は th の太字ぶん広い（0.493em × 1.10 ＋ 遊び0.4em）
    expect(html).toContain('style="--table-col-1:5.4em;--table-col-2:0.943em"');
  });

  /*
   * `<br>` で改行する表があるので、区切って最も長い行を採る。
   * 先頭が最長の例だけだと「先頭を採るだけ」の実装でも通るので、
   * 後ろが最長の例も入れる。
   */
  test.each([
    ["ああ<br>あ", "2.4em"],
    ["あ<br>ああ", "2.4em"],
  ])(
    "splits cells on <br> and takes the longest line (%s)",
    async (cell, expected) => {
      const { html } = await markdownToHtml(`| x |\n|---|\n| ${cell} |`);
      expect(html).toContain(`style="--table-col-1:${expected}"`);
    },
  );

  /*
   * 見積もりの内訳。ここが崩れても表は描画されるので、目で見ても気づけない。
   * それぞれ「これを外すと何px ずれるか」を括弧に書いてある——ずれは床の出し分けを
   * 反転させ、収まる表に床が敷かれたり、1文字折れが戻ったりする。
   */
  test.each([
    // 装飾記号は描画されないので落とす（落とさないと `*`×4 = 20px 過大）
    ["strips emphasis markers", "| x |\n|---|\n| **ああ** |", "2.4em"],
    // リンクは表示文字だけ数える（落とさないと URL のぶん数十px 過大）
    [
      "strips link syntax",
      "| x |\n|---|\n| [ああ](https://example.com) |",
      "2.4em",
    ],
    // `°` は狭い（other の 8.5px で数えると 2.5px 過大・1セルに何度も出る）
    ["counts degree signs as narrow", "| x |\n|---|\n| 0° |", "1.36em"],
    // `→` は全角送り（other の 8.5px で数えると 6.5px 過小）
    ["counts arrows as full width", "| x |\n|---|\n| a→b |", "2.387em"],
    // インラインコードの座布団（落とすと 9px 過小）
    ["adds the inline code chip padding", "| x |\n|---|\n| `ab` |", "2.027em"],
    // コード内の全角は等幅でも全角送り（半角扱いだと 5.3px 過小）
    ["counts full width inside code", "| x |\n|---|\n| `あ` |", "1.867em"],
    // 大文字10.2 ×4 ＋ 空白4.2 ＝ 45px ＝ 3.0em（本文セルなので太字は掛からない）
    // ＋ 遊び0.4em → 3.4em
    ["counts uppercase and spaces", "| x |\n|---|\n| AB CD |", "3.4em"],
    // ASCII 約物（`.` = 5px）。ここが other(8.5) に落ちると 0.4em ずれる
    ["counts ascii punctuation", "| x |\n|---|\n| a.b.c |", "2.547em"],
    // 全角の読点・句点（U+3000-303F）。このレンジが抜けると半角幅で数えてしまう
    [
      "counts CJK punctuation as full width",
      "| x |\n|---|\n| あ、い。 |",
      "4.4em",
    ],
    // 全角の括弧・約物（U+FF00-FF60）。本文の表に頻出するのでレンジ落ちが痛い
    [
      "counts fullwidth forms as full width",
      "| x |\n|---|\n| （あ） |",
      "3.4em",
    ],
    // GFM の表でセル内パイプに使うバックスラッシュエスケープ
    ["strips backslash escapes", "| x |\n|---|\n| a\\|b |", "1.72em"],
    [
      "strips image syntax",
      "| x |\n|---|\n| ![ああ](https://e.com/a.png) |",
      "2.4em",
    ],
    ["strips strikethrough", "| x |\n|---|\n| ~~ああ~~ |", "2.4em"],
    ["strips single emphasis", "| x |\n|---|\n| *ああ* |", "2.4em"],
    // `′` は狭い記号（6px）。NARROW_SYMBOLS から漏れると other(8.5) になる
    ["counts prime as narrow", "| x |\n|---|\n| 0′ |", "1.36em"],
    /*
     * 見出し行は font-weight: 600 でラテンが広がる（小文字は実測1.097倍）。
     * 太字を見ないと見出しの列だけ床が足りず、`app/` のような語が2行に割れる。
     */
    [
      "widens latin in the header row",
      "| abcdefghij |\n|---|\n| x |",
      "5.827em",
    ],
  ])("%s", async (_name, md, expected) => {
    const { html } = await markdownToHtml(md);
    expect(html).toContain(`style="--table-col-1:${expected}"`);
  });

  /*
   * tabindex は「実際に溢れている表」にだけ TableScrollHint が後から付ける。
   * 静的 HTML に焼き込むと、溢れていない表にも矢印キーで何も起きないタブ停止が
   * 増える（表が最も多い記事で11個。1280px で溢れる表は既存203個中2個だけ）。
   */
  test("does not bake tabindex into the table markup", async () => {
    const md = "| A | B |\n|---|---|\n| 1 | 2 |";
    const { html } = await markdownToHtml(md);
    expect(html).not.toContain("tabindex");
  });

  test("converts blockquotes", async () => {
    const { html } = await markdownToHtml("> quote text");
    expect(html).toContain("<blockquote>");
    expect(html).toContain("quote text");
  });

  test("converts inline code", async () => {
    const { html } = await markdownToHtml("use `const` keyword");
    expect(html).toContain("<code>const</code>");
  });

  test("converts mermaid code blocks to div with mermaid class", async () => {
    const md = "```mermaid\ngraph TD;\n  A-->B;\n```";
    const { html } = await markdownToHtml(md);
    expect(html).toContain('<div class="mermaid">');
    expect(html).toContain("graph TD;");
    expect(html).toContain("A--&gt;B;");
    expect(html).not.toContain("<pre>");
    expect(html).not.toContain("<code");
  });

  test("does not affect non-mermaid code blocks", async () => {
    const md = "```javascript\nconst x = 1;\n```";
    const { html } = await markdownToHtml(md);
    // After Shiki integration, non-mermaid blocks render as <pre class="shiki ...">
    expect(html).toContain("<pre");
    expect(html).toContain("shiki");
    expect(html).toContain("<code");
    expect(html).not.toContain("mermaid");
  });

  test("escapes HTML in mermaid blocks", async () => {
    const md =
      '```mermaid\ngraph TD;\n  A["<script>alert(1)</script>"]-->B;\n```';
    const { html } = await markdownToHtml(md);
    expect(html).toContain("&lt;script&gt;");
    expect(html).not.toContain("<script>");
  });

  test("assigns id attributes to headings", async () => {
    const { html } = await markdownToHtml("## Hello World\n\n### Sub Section");
    expect(html).toContain('<h2 id="hello-world">Hello World</h2>');
    expect(html).toContain('<h3 id="sub-section">Sub Section</h3>');
  });

  test("assigns id attributes to Japanese headings", async () => {
    const { html } = await markdownToHtml("## はじめに\n\n### 概要");
    expect(html).toContain('id="はじめに"');
    expect(html).toContain('id="概要"');
  });

  test("assigns suffixed ids to duplicate headings", async () => {
    const md = "## Section\n\nText.\n\n## Section\n\nText.\n\n## Section";
    const { html } = await markdownToHtml(md);
    expect(html).toContain('<h2 id="section">Section</h2>');
    expect(html).toContain('<h2 id="section-1">Section</h2>');
    expect(html).toContain('<h2 id="section-2">Section</h2>');
  });

  test("resets heading id counter between parse calls", async () => {
    const md = "## Same";
    const { html: html1 } = await markdownToHtml(md);
    const { html: html2 } = await markdownToHtml(md);
    // Both should get the same id (no suffix) because the counter resets
    expect(html1).toContain('id="same"');
    expect(html2).toContain('id="same"');
  });

  test("converts GFM Alert [!NOTE] to note admonition", async () => {
    const md = "> [!NOTE]\n> これはノートです。";
    const { html } = await markdownToHtml(md);
    expect(html).toContain("markdown-alert-note");
    expect(html).toContain("これはノートです。");
    expect(html).not.toContain("<blockquote>");
  });

  test("converts GFM Alert [!TIP] to tip admonition", async () => {
    const md = "> [!TIP]\n> これはヒントです。";
    const { html } = await markdownToHtml(md);
    expect(html).toContain("markdown-alert-tip");
    expect(html).toContain("これはヒントです。");
  });

  test("converts GFM Alert [!IMPORTANT] to important admonition", async () => {
    const md = "> [!IMPORTANT]\n> これは重要事項です。";
    const { html } = await markdownToHtml(md);
    expect(html).toContain("markdown-alert-important");
    expect(html).toContain("これは重要事項です。");
  });

  test("converts GFM Alert [!WARNING] to warning admonition", async () => {
    const md = "> [!WARNING]\n> これは警告です。";
    const { html } = await markdownToHtml(md);
    expect(html).toContain("markdown-alert-warning");
    expect(html).toContain("これは警告です。");
  });

  test("converts GFM Alert [!CAUTION] to caution admonition", async () => {
    const md = "> [!CAUTION]\n> これは注意です。";
    const { html } = await markdownToHtml(md);
    expect(html).toContain("markdown-alert-caution");
    expect(html).toContain("これは注意です。");
  });

  test("does not convert regular blockquote to admonition", async () => {
    const md = "> これは通常の引用です。";
    const { html } = await markdownToHtml(md);
    expect(html).toContain("<blockquote>");
    expect(html).not.toContain("markdown-alert");
    expect(html).toContain("これは通常の引用です。");
  });

  test("includes markdown-alert-title in admonition output", async () => {
    const md = "> [!NOTE]\n> ノートの内容。";
    const { html } = await markdownToHtml(md);
    expect(html).toContain("markdown-alert-title");
    expect(html).toContain("ノートの内容。");
  });

  test("sanitizes script tags from markdown output", async () => {
    // Markdown with inline HTML containing a script tag
    const md = "Hello <script>alert(1)</script> world";
    const { html } = await markdownToHtml(md);
    expect(html).not.toContain("<script>");
    expect(html).not.toContain("alert(1)");
    expect(html).toContain("Hello");
    expect(html).toContain("world");
  });

  test("sanitizes javascript: links from markdown output", async () => {
    const md = '<a href="javascript:alert(1)">click me</a>';
    const { html } = await markdownToHtml(md);
    expect(html).not.toContain("javascript:");
    expect(html).toContain("click me");
  });

  test("converts GFM task list and preserves checkbox attributes", async () => {
    const md = "- [x] done\n- [ ] todo";
    const { html } = await markdownToHtml(md);
    // Should contain input checkboxes with type, checked, and disabled attributes
    expect(html).toContain("<input");
    expect(html).toContain('type="checkbox"');
    // The checked item should have the checked attribute
    expect(html).toMatch(/checked/);
    // Both items should have the disabled attribute
    expect(html).toMatch(/disabled/);
    expect(html).toContain("done");
    expect(html).toContain("todo");
  });
});

describe("generateHeadingId", () => {
  test("converts text to lowercase slug", async () => {
    expect(generateHeadingId("Hello World")).toBe("hello-world");
  });

  test("preserves Japanese characters", async () => {
    expect(generateHeadingId("はじめに")).toBe("はじめに");
  });

  test("removes special characters", async () => {
    expect(generateHeadingId("Hello! World?")).toBe("hello-world");
  });

  test("collapses multiple spaces into a single dash", async () => {
    expect(generateHeadingId("a   b")).toBe("a-b");
  });

  test("collapses spaces around dashes", async () => {
    // "a - - b" -> spaces become dashes -> "a-----b" -> collapse -> "a-b"
    expect(generateHeadingId("a - - b")).toBe("a-b");
  });

  test("trims leading and trailing dashes", async () => {
    expect(generateHeadingId("!hello!")).toBe("hello");
  });
});

describe("markdownToHtml headings (table of contents)", () => {
  test("extracts h2 and h3 headings", async () => {
    const md =
      "## Heading 1\n\nSome text.\n\n### Sub-heading\n\nMore text.\n\n## Heading 2";
    const { headings } = await markdownToHtml(md);
    expect(headings).toHaveLength(3);
    expect(headings[0]).toEqual({
      level: 2,
      text: "Heading 1",
      id: "heading-1",
    });
    expect(headings[1]).toEqual({
      level: 3,
      text: "Sub-heading",
      id: "sub-heading",
    });
  });

  test("skips headings inside code blocks", async () => {
    const md =
      "## Real heading\n\n```\n## Not a heading\n```\n\n## Another real heading";
    const { headings } = await markdownToHtml(md);
    expect(headings).toHaveLength(2);
  });

  test("strips inline formatting from heading text", async () => {
    const md = "## **Bold** heading";
    const { headings } = await markdownToHtml(md);
    expect(headings[0].text).toBe("Bold heading");
  });

  test("handles Japanese headings", async () => {
    const md = "## はじめに";
    const { headings } = await markdownToHtml(md);
    expect(headings[0].text).toBe("はじめに");
    expect(headings[0].id).toBe("はじめに");
  });

  test("assigns suffixed ids to duplicate headings", async () => {
    const md =
      "## 何が起きたか\n\nText.\n\n## 何が起きたか\n\nText.\n\n## 何が起きたか";
    const { headings } = await markdownToHtml(md);
    expect(headings).toHaveLength(3);
    expect(headings[0].id).toBe("何が起きたか");
    expect(headings[1].id).toBe("何が起きたか-1");
    expect(headings[2].id).toBe("何が起きたか-2");
  });

  test("assigns unique ids to duplicate headings (all unique keys)", async () => {
    const md =
      "## 何が起きたか\n\n## どう解決したか\n\n## 何が起きたか\n\n## どう解決したか";
    const { headings } = await markdownToHtml(md);
    const ids = headings.map((h) => h.id);
    // All IDs should be unique
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).toEqual([
      "何が起きたか",
      "どう解決したか",
      "何が起きたか-1",
      "どう解決したか-1",
    ]);
  });

  test("strips inline link syntax from heading text", async () => {
    const md = "### [文字数カウント](/tools/char-count)";
    const { headings } = await markdownToHtml(md);
    expect(headings[0].text).toBe("文字数カウント");
    expect(headings[0].id).toBe("文字数カウント");
  });

  test("strips numbered inline link syntax from heading text", async () => {
    const md = "### 1. [文字数カウント](/tools/char-count)";
    const { headings } = await markdownToHtml(md);
    expect(headings[0].text).toBe("1. 文字数カウント");
  });

  test("strips image syntax from heading text", async () => {
    const md = "## ![アイコン](icon.png) セクション";
    const { headings } = await markdownToHtml(md);
    // Image syntax is fully removed (not preserving alt text) to match
    // the rendered heading where the <img> tag is stripped for id/text.
    expect(headings[0].text).toBe("セクション");
  });

  test("strips HTML tags from heading text", async () => {
    const md = "## テスト<br>改行";
    const { headings } = await markdownToHtml(md);
    expect(headings[0].text).toBe("テスト改行");
  });

  test("strips nested formatting in links", async () => {
    const md = "## [**太字リンク**](url)";
    const { headings } = await markdownToHtml(md);
    expect(headings[0].text).toBe("太字リンク");
  });
});

describe("heading id single-source-of-truth (SSoT)", () => {
  // The core guarantee of the fix: the id in the returned headings and the id
  // on the rendered <h*> element are produced by the same code path, so they
  // must always agree — this is what makes TOC anchors jump correctly.
  const expectHeadingIdsMatchHtml = (
    headings: { id: string }[],
    html: string,
  ) => {
    for (const heading of headings) {
      expect(html).toContain(`id="${heading.id}"`);
    }
  };

  test("inline code with angle brackets: TOC id matches rendered heading id", async () => {
    const md = "## 罠1: `<body>` の style";
    const { html, headings } = await markdownToHtml(md);
    expect(headings).toHaveLength(1);
    // The mangled "ltbodygt" id must NOT appear; a clean slug containing "body"
    // is used instead, identically in the returned headings and the HTML.
    expect(headings[0].id).toContain("body");
    expect(headings[0].id).not.toContain("lt");
    expect(headings[0].id).not.toContain("gt");
    expect(html).toContain(`<h2 id="${headings[0].id}">`);
    expectHeadingIdsMatchHtml(headings, html);
  });

  test("inline code with angle brackets: TOC text keeps the code content", async () => {
    const md = "## 罠1: `<body>` の style";
    const { headings } = await markdownToHtml(md);
    // Previously the code content was dropped, leaving a blank-ish label.
    expect(headings[0].text).toContain("<body>");
    expect(headings[0].text).toBe("罠1: <body> の style");
  });

  test("plain inline code heading id is unchanged (no regression)", async () => {
    const md = "### カスタムフック `useRegexWorker` の設計";
    const { html, headings } = await markdownToHtml(md);
    expect(headings[0].id).toBe("カスタムフック-useregexworker-の設計");
    expect(html).toContain('<h3 id="カスタムフック-useregexworker-の設計">');
  });

  test("raw special characters (&) stay consistent between text and id", async () => {
    const md = "## 設計 & 実装";
    const { html, headings } = await markdownToHtml(md);
    // The ampersand is preserved (decoded) in the display text...
    expect(headings[0].text).toBe("設計 & 実装");
    // ...and dropped from the slug, consistently on both sides.
    expect(headings[0].id).toBe("設計-実装");
    expect(html).toContain('<h2 id="設計-実装">');
    expectHeadingIdsMatchHtml(headings, html);
  });

  test("duplicate headings get a -1 suffix in a single consistent pass", async () => {
    const md = "## 重複\n\nText.\n\n## 重複";
    const { html, headings } = await markdownToHtml(md);
    expect(headings.map((h) => h.id)).toEqual(["重複", "重複-1"]);
    expectHeadingIdsMatchHtml(headings, html);
  });

  test("mixed headings all resolve to ids present in the HTML", async () => {
    const md =
      "## Introduction\n\nText.\n\n### 詳細 `<div>` の扱い\n\n## Conclusion\n\n## Introduction";
    const { html, headings } = await markdownToHtml(md);
    expect(headings.map((h) => h.id)).toEqual([
      "introduction",
      "詳細-div-の扱い",
      "conclusion",
      "introduction-1",
    ]);
    expectHeadingIdsMatchHtml(headings, html);
  });
});

describe("markdownToHtml concurrency (per-call state isolation)", () => {
  // Regression guard for a race that shared heading-collection state across
  // in-flight markdownToHtml calls. Next.js runs generateMetadata, the page
  // body and opengraph-image (all calling getBlogPostBySlug, which is NOT
  // deduped) concurrently, so two markdownToHtml calls can interleave: the
  // reset -> await parse -> collect window let one call's heading renderer
  // push into another call's shared array, yielding {html, headings} that
  // disagree. Each returned headings[i].id MUST exist in its own html, and a
  // document's headings MUST NOT contain another document's headings.
  const assertSelfConsistent = (result: {
    html: string;
    headings: { id: string }[];
  }) => {
    for (const h of result.headings) {
      expect(result.html).toContain(`id="${h.id}"`);
    }
  };

  test("heterogeneous documents parsed concurrently stay self-consistent", async () => {
    const docs = [
      "## Alpha\n\n### Alpha Detail `<body>`\n\n## Alpha Conclusion",
      "## ベータ\n\n### ベータの詳細 `useRegexWorker`\n\n## ベータのまとめ",
      "## Gamma & Delta\n\n### Gamma Sub\n\n## Gamma End",
      "## 罠1: `<div>` の style\n\n### 罠2\n\n## 罠3",
    ];
    const expectedTexts = [
      ["Alpha", "Alpha Detail <body>", "Alpha Conclusion"],
      ["ベータ", "ベータの詳細 useRegexWorker", "ベータのまとめ"],
      ["Gamma & Delta", "Gamma Sub", "Gamma End"],
      ["罠1: <div> の style", "罠2", "罠3"],
    ];

    // Run many rounds concurrently to make interleaving overwhelmingly likely.
    const rounds = 25;
    const jobs: Promise<{
      docIndex: number;
      result: { html: string; headings: { text: string; id: string }[] };
    }>[] = [];
    for (let round = 0; round < rounds; round++) {
      docs.forEach((md, docIndex) => {
        jobs.push(markdownToHtml(md).then((result) => ({ docIndex, result })));
      });
    }

    const results = await Promise.all(jobs);

    for (const { docIndex, result } of results) {
      // Every returned id must be present as an anchor in the SAME html.
      assertSelfConsistent(result);
      // headings must be exactly this document's own headings (no bleed-in
      // from a concurrently-parsed document, no missing entries).
      expect(result.headings.map((h) => h.text)).toEqual(
        expectedTexts[docIndex],
      );
    }
  });

  test("identical documents parsed concurrently are not cross-polluted with duplicate suffixes", async () => {
    // If duplicate-id state leaked across calls, concurrent parses of the same
    // document would spuriously gain "-1"/"-2" suffixes.
    const md = "## 見出し\n\n### 子見出し\n\n## まとめ";
    const results = await Promise.all(
      Array.from({ length: 30 }, () => markdownToHtml(md)),
    );
    for (const result of results) {
      assertSelfConsistent(result);
      expect(result.headings.map((h) => h.id)).toEqual([
        "見出し",
        "子見出し",
        "まとめ",
      ]);
    }
  });
});

describe("estimateReadingTime", () => {
  test("returns at least 1 minute", async () => {
    expect(estimateReadingTime("short")).toBe(1);
  });

  test("estimates Japanese text at ~500 chars/min", async () => {
    const text = "あ".repeat(1000);
    expect(estimateReadingTime(text)).toBe(2);
  });

  test("estimates English text at ~200 words/min", async () => {
    const text = Array(400).fill("word").join(" ");
    expect(estimateReadingTime(text)).toBe(2);
  });

  test("handles mixed content", async () => {
    const text = "テスト".repeat(250) + " " + Array(100).fill("word").join(" ");
    const time = estimateReadingTime(text);
    expect(time).toBeGreaterThanOrEqual(2);
  });
});
