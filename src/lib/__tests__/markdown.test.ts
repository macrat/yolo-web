import { describe, test, expect, beforeAll } from "vitest";
import {
  parseFrontmatter,
  markdownToHtml,
  extractHeadings,
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
    const html = await markdownToHtml("## Hello\n\n### World");
    expect(html).toContain("<h2");
    expect(html).toContain("Hello");
    expect(html).toContain("<h3");
    expect(html).toContain("World");
  });

  test("converts bold and italic", async () => {
    const html = await markdownToHtml("**bold** and *italic*");
    expect(html).toContain("<strong>bold</strong>");
    expect(html).toContain("<em>italic</em>");
  });

  test("converts code blocks with Shiki dual-theme highlighting", async () => {
    const html = await markdownToHtml("```typescript\nconst x = 1;\n```");
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
    const html = await markdownToHtml("```not-a-real-lang\nhello world\n```");
    expect(html).toContain("<pre");
    expect(html).toContain("shiki");
    expect(html).toContain("hello world");
  });

  test("fenced code block with no language is rendered as text", async () => {
    const html = await markdownToHtml("```\nplain content\n```");
    expect(html).toContain("<pre");
    expect(html).toContain("shiki");
    expect(html).toContain("plain content");
  });

  test('mermaid code block is preserved as <div class="mermaid">', async () => {
    const html = await markdownToHtml("```mermaid\ngraph TD; A-->B;\n```");
    expect(html).toContain('<div class="mermaid">');
    expect(html).toContain("graph TD; A--&gt;B;");
    // mermaid blocks must not be syntax-highlighted (no shiki wrapper)
    expect(html).not.toMatch(/<pre class="shiki/);
  });

  test("code block content is HTML-escaped", async () => {
    const html = await markdownToHtml(
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
    const html = await markdownToHtml("- item 1\n- item 2");
    expect(html).toContain("<ul>");
    expect(html).toContain("<li>");
    expect(html).toContain("item 1");
  });

  test("converts links", async () => {
    const html = await markdownToHtml("[link](https://example.com)");
    expect(html).toContain('<a href="https://example.com"');
    expect(html).toContain("link");
  });

  test("converts GFM tables", async () => {
    const md = "| A | B |\n|---|---|\n| 1 | 2 |";
    const html = await markdownToHtml(md);
    expect(html).toContain("<table>");
    expect(html).toContain("<th>");
    expect(html).toContain("<td>");
  });

  test("converts blockquotes", async () => {
    const html = await markdownToHtml("> quote text");
    expect(html).toContain("<blockquote>");
    expect(html).toContain("quote text");
  });

  test("converts inline code", async () => {
    const html = await markdownToHtml("use `const` keyword");
    expect(html).toContain("<code>const</code>");
  });

  test("converts mermaid code blocks to div with mermaid class", async () => {
    const md = "```mermaid\ngraph TD;\n  A-->B;\n```";
    const html = await markdownToHtml(md);
    expect(html).toContain('<div class="mermaid">');
    expect(html).toContain("graph TD;");
    expect(html).toContain("A--&gt;B;");
    expect(html).not.toContain("<pre>");
    expect(html).not.toContain("<code");
  });

  test("does not affect non-mermaid code blocks", async () => {
    const md = "```javascript\nconst x = 1;\n```";
    const html = await markdownToHtml(md);
    // After Shiki integration, non-mermaid blocks render as <pre class="shiki ...">
    expect(html).toContain("<pre");
    expect(html).toContain("shiki");
    expect(html).toContain("<code");
    expect(html).not.toContain("mermaid");
  });

  test("escapes HTML in mermaid blocks", async () => {
    const md =
      '```mermaid\ngraph TD;\n  A["<script>alert(1)</script>"]-->B;\n```';
    const html = await markdownToHtml(md);
    expect(html).toContain("&lt;script&gt;");
    expect(html).not.toContain("<script>");
  });

  test("assigns id attributes to headings", async () => {
    const html = await markdownToHtml("## Hello World\n\n### Sub Section");
    expect(html).toContain('<h2 id="hello-world">Hello World</h2>');
    expect(html).toContain('<h3 id="sub-section">Sub Section</h3>');
  });

  test("assigns id attributes to Japanese headings", async () => {
    const html = await markdownToHtml("## はじめに\n\n### 概要");
    expect(html).toContain('id="はじめに"');
    expect(html).toContain('id="概要"');
  });

  test("assigns suffixed ids to duplicate headings", async () => {
    const md = "## Section\n\nText.\n\n## Section\n\nText.\n\n## Section";
    const html = await markdownToHtml(md);
    expect(html).toContain('<h2 id="section">Section</h2>');
    expect(html).toContain('<h2 id="section-1">Section</h2>');
    expect(html).toContain('<h2 id="section-2">Section</h2>');
  });

  test("resets heading id counter between parse calls", async () => {
    const md = "## Same";
    const html1 = await markdownToHtml(md);
    const html2 = await markdownToHtml(md);
    // Both should get the same id (no suffix) because the counter resets
    expect(html1).toContain('id="same"');
    expect(html2).toContain('id="same"');
  });

  test("converts GFM Alert [!NOTE] to note admonition", async () => {
    const md = "> [!NOTE]\n> これはノートです。";
    const html = await markdownToHtml(md);
    expect(html).toContain("markdown-alert-note");
    expect(html).toContain("これはノートです。");
    expect(html).not.toContain("<blockquote>");
  });

  test("converts GFM Alert [!TIP] to tip admonition", async () => {
    const md = "> [!TIP]\n> これはヒントです。";
    const html = await markdownToHtml(md);
    expect(html).toContain("markdown-alert-tip");
    expect(html).toContain("これはヒントです。");
  });

  test("converts GFM Alert [!IMPORTANT] to important admonition", async () => {
    const md = "> [!IMPORTANT]\n> これは重要事項です。";
    const html = await markdownToHtml(md);
    expect(html).toContain("markdown-alert-important");
    expect(html).toContain("これは重要事項です。");
  });

  test("converts GFM Alert [!WARNING] to warning admonition", async () => {
    const md = "> [!WARNING]\n> これは警告です。";
    const html = await markdownToHtml(md);
    expect(html).toContain("markdown-alert-warning");
    expect(html).toContain("これは警告です。");
  });

  test("converts GFM Alert [!CAUTION] to caution admonition", async () => {
    const md = "> [!CAUTION]\n> これは注意です。";
    const html = await markdownToHtml(md);
    expect(html).toContain("markdown-alert-caution");
    expect(html).toContain("これは注意です。");
  });

  test("does not convert regular blockquote to admonition", async () => {
    const md = "> これは通常の引用です。";
    const html = await markdownToHtml(md);
    expect(html).toContain("<blockquote>");
    expect(html).not.toContain("markdown-alert");
    expect(html).toContain("これは通常の引用です。");
  });

  test("includes markdown-alert-title in admonition output", async () => {
    const md = "> [!NOTE]\n> ノートの内容。";
    const html = await markdownToHtml(md);
    expect(html).toContain("markdown-alert-title");
    expect(html).toContain("ノートの内容。");
  });

  test("sanitizes script tags from markdown output", async () => {
    // Markdown with inline HTML containing a script tag
    const md = "Hello <script>alert(1)</script> world";
    const html = await markdownToHtml(md);
    expect(html).not.toContain("<script>");
    expect(html).not.toContain("alert(1)");
    expect(html).toContain("Hello");
    expect(html).toContain("world");
  });

  test("sanitizes javascript: links from markdown output", async () => {
    const md = '<a href="javascript:alert(1)">click me</a>';
    const html = await markdownToHtml(md);
    expect(html).not.toContain("javascript:");
    expect(html).toContain("click me");
  });

  test("converts GFM task list and preserves checkbox attributes", async () => {
    const md = "- [x] done\n- [ ] todo";
    const html = await markdownToHtml(md);
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

describe("extractHeadings", () => {
  test("extracts h2 and h3 headings", async () => {
    const md =
      "## Heading 1\n\nSome text.\n\n### Sub-heading\n\nMore text.\n\n## Heading 2";
    const headings = extractHeadings(md);
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
    const headings = extractHeadings(md);
    expect(headings).toHaveLength(2);
  });

  test("strips inline formatting from heading text", async () => {
    const md = "## **Bold** heading";
    const headings = extractHeadings(md);
    expect(headings[0].text).toBe("Bold heading");
  });

  test("handles Japanese headings", async () => {
    const md = "## はじめに";
    const headings = extractHeadings(md);
    expect(headings[0].text).toBe("はじめに");
    expect(headings[0].id).toBe("はじめに");
  });

  test("assigns suffixed ids to duplicate headings", async () => {
    const md =
      "## 何が起きたか\n\nText.\n\n## 何が起きたか\n\nText.\n\n## 何が起きたか";
    const headings = extractHeadings(md);
    expect(headings).toHaveLength(3);
    expect(headings[0].id).toBe("何が起きたか");
    expect(headings[1].id).toBe("何が起きたか-1");
    expect(headings[2].id).toBe("何が起きたか-2");
  });

  test("assigns unique ids to duplicate headings (all unique keys)", async () => {
    const md =
      "## 何が起きたか\n\n## どう解決したか\n\n## 何が起きたか\n\n## どう解決したか";
    const headings = extractHeadings(md);
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
    const headings = extractHeadings(md);
    expect(headings[0].text).toBe("文字数カウント");
    expect(headings[0].id).toBe("文字数カウント");
  });

  test("strips numbered inline link syntax from heading text", async () => {
    const md = "### 1. [文字数カウント](/tools/char-count)";
    const headings = extractHeadings(md);
    expect(headings[0].text).toBe("1. 文字数カウント");
  });

  test("strips image syntax from heading text", async () => {
    const md = "## ![アイコン](icon.png) セクション";
    const headings = extractHeadings(md);
    // Image syntax is fully removed (not preserving alt text) to match
    // markdownToHtml behavior where <img> tags are completely stripped
    expect(headings[0].text).toBe("セクション");
  });

  test("strips HTML tags from heading text", async () => {
    const md = "## テスト<br>改行";
    const headings = extractHeadings(md);
    expect(headings[0].text).toBe("テスト改行");
  });

  test("strips nested formatting in links", async () => {
    const md = "## [**太字リンク**](url)";
    const headings = extractHeadings(md);
    expect(headings[0].text).toBe("太字リンク");
  });
});

describe("markdownToHtml and extractHeadings ID consistency", () => {
  test("heading IDs match between markdownToHtml and extractHeadings", async () => {
    const md =
      "## Introduction\n\nText.\n\n### Details\n\nMore text.\n\n## Conclusion";
    const headings = extractHeadings(md);
    const html = await markdownToHtml(md);

    for (const heading of headings) {
      expect(html).toContain(`id="${heading.id}"`);
    }
  });

  test("duplicate heading IDs match between markdownToHtml and extractHeadings", async () => {
    const md =
      "## Section\n\nText.\n\n### Sub\n\nText.\n\n## Section\n\nText.\n\n### Sub";
    const headings = extractHeadings(md);
    const html = await markdownToHtml(md);

    for (const heading of headings) {
      expect(html).toContain(`id="${heading.id}"`);
    }
    // Verify specific IDs
    expect(headings.map((h) => h.id)).toEqual([
      "section",
      "sub",
      "section-1",
      "sub-1",
    ]);
  });

  test("Japanese duplicate heading IDs match", async () => {
    const md =
      "## はじめに\n\nText.\n\n## 本題\n\nText.\n\n## はじめに\n\nText.";
    const headings = extractHeadings(md);
    const html = await markdownToHtml(md);

    for (const heading of headings) {
      expect(html).toContain(`id="${heading.id}"`);
    }
    expect(headings.map((h) => h.id)).toEqual([
      "はじめに",
      "本題",
      "はじめに-1",
    ]);
  });

  test("link heading IDs match between markdownToHtml and extractHeadings", async () => {
    const md =
      "### 1. [文字数カウント](/tools/char-count)\n\nテキスト\n\n### 2. [バイト数計算](/tools/byte-counter)";
    const headings = extractHeadings(md);
    const html = await markdownToHtml(md);
    for (const heading of headings) {
      expect(html).toContain(`id="${heading.id}"`);
    }
  });

  test("image heading IDs match between markdownToHtml and extractHeadings", async () => {
    const md = "## ![アイコン](icon.png) セクション";
    const headings = extractHeadings(md);
    const html = await markdownToHtml(md);
    for (const heading of headings) {
      expect(html).toContain(`id="${heading.id}"`);
    }
  });

  test("HTML tag heading IDs match between markdownToHtml and extractHeadings", async () => {
    const md = "## テスト<br>改行";
    const headings = extractHeadings(md);
    const html = await markdownToHtml(md);
    for (const heading of headings) {
      expect(html).toContain(`id="${heading.id}"`);
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
