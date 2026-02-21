import { describe, test, expect } from "vitest";
import {
  parseFrontmatter,
  markdownToHtml,
  extractHeadings,
  estimateReadingTime,
  generateHeadingId,
} from "@/lib/markdown";

describe("parseFrontmatter", () => {
  test("parses quoted string values", () => {
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

  test("parses boolean values", () => {
    const raw = `---
draft: false
public: true
---

Body.`;

    const result = parseFrontmatter<{ draft: boolean; public: boolean }>(raw);
    expect(result.data.draft).toBe(false);
    expect(result.data.public).toBe(true);
  });

  test("parses null values", () => {
    const raw = `---
reply_to: null
---

Body.`;

    const result = parseFrontmatter<{ reply_to: null }>(raw);
    expect(result.data.reply_to).toBeNull();
  });

  test("parses inline arrays", () => {
    const raw = `---
tags: ["tag1", "tag2", "tag3"]
---

Body.`;

    const result = parseFrontmatter<{ tags: string[] }>(raw);
    expect(result.data.tags).toEqual(["tag1", "tag2", "tag3"]);
  });

  test("parses block arrays", () => {
    const raw = `---
tags:
  - tag1
  - tag2
---

Body.`;

    const result = parseFrontmatter<{ tags: string[] }>(raw);
    expect(result.data.tags).toEqual(["tag1", "tag2"]);
  });

  test("parses empty inline arrays", () => {
    const raw = `---
tags: []
---

Body.`;

    const result = parseFrontmatter<{ tags: string[] }>(raw);
    expect(result.data.tags).toEqual([]);
  });

  test("handles escaped quotes in strings", () => {
    const raw = `---
subject: "Hello \\"World\\""
---

Body.`;

    const result = parseFrontmatter<{ subject: string }>(raw);
    expect(result.data.subject).toBe('Hello "World"');
  });

  test("returns empty data when no frontmatter", () => {
    const raw = "Just some content without frontmatter.";
    const result = parseFrontmatter<Record<string, unknown>>(raw);
    expect(result.data).toEqual({});
    expect(result.content).toBe(raw);
  });
});

describe("markdownToHtml", () => {
  test("converts headings", () => {
    const html = markdownToHtml("## Hello\n\n### World");
    expect(html).toContain("<h2");
    expect(html).toContain("Hello");
    expect(html).toContain("<h3");
    expect(html).toContain("World");
  });

  test("converts bold and italic", () => {
    const html = markdownToHtml("**bold** and *italic*");
    expect(html).toContain("<strong>bold</strong>");
    expect(html).toContain("<em>italic</em>");
  });

  test("converts code blocks", () => {
    const html = markdownToHtml("```typescript\nconst x = 1;\n```");
    expect(html).toContain("<code");
    expect(html).toContain("const x = 1;");
  });

  test("converts lists", () => {
    const html = markdownToHtml("- item 1\n- item 2");
    expect(html).toContain("<ul>");
    expect(html).toContain("<li>");
    expect(html).toContain("item 1");
  });

  test("converts links", () => {
    const html = markdownToHtml("[link](https://example.com)");
    expect(html).toContain('<a href="https://example.com"');
    expect(html).toContain("link");
  });

  test("converts GFM tables", () => {
    const md = "| A | B |\n|---|---|\n| 1 | 2 |";
    const html = markdownToHtml(md);
    expect(html).toContain("<table>");
    expect(html).toContain("<th>");
    expect(html).toContain("<td>");
  });

  test("converts blockquotes", () => {
    const html = markdownToHtml("> quote text");
    expect(html).toContain("<blockquote>");
    expect(html).toContain("quote text");
  });

  test("converts inline code", () => {
    const html = markdownToHtml("use `const` keyword");
    expect(html).toContain("<code>const</code>");
  });

  test("converts mermaid code blocks to div with mermaid class", () => {
    const md = "```mermaid\ngraph TD;\n  A-->B;\n```";
    const html = markdownToHtml(md);
    expect(html).toContain('<div class="mermaid">');
    expect(html).toContain("graph TD;");
    expect(html).toContain("A--&gt;B;");
    expect(html).not.toContain("<pre>");
    expect(html).not.toContain("<code");
  });

  test("does not affect non-mermaid code blocks", () => {
    const md = "```javascript\nconst x = 1;\n```";
    const html = markdownToHtml(md);
    expect(html).toContain("<pre>");
    expect(html).toContain("<code");
    expect(html).not.toContain("mermaid");
  });

  test("escapes HTML in mermaid blocks", () => {
    const md =
      '```mermaid\ngraph TD;\n  A["<script>alert(1)</script>"]-->B;\n```';
    const html = markdownToHtml(md);
    expect(html).toContain("&lt;script&gt;");
    expect(html).not.toContain("<script>");
  });

  test("assigns id attributes to headings", () => {
    const html = markdownToHtml("## Hello World\n\n### Sub Section");
    expect(html).toContain('<h2 id="hello-world">Hello World</h2>');
    expect(html).toContain('<h3 id="sub-section">Sub Section</h3>');
  });

  test("assigns id attributes to Japanese headings", () => {
    const html = markdownToHtml("## はじめに\n\n### 概要");
    expect(html).toContain('id="はじめに"');
    expect(html).toContain('id="概要"');
  });

  test("assigns suffixed ids to duplicate headings", () => {
    const md = "## Section\n\nText.\n\n## Section\n\nText.\n\n## Section";
    const html = markdownToHtml(md);
    expect(html).toContain('<h2 id="section">Section</h2>');
    expect(html).toContain('<h2 id="section-1">Section</h2>');
    expect(html).toContain('<h2 id="section-2">Section</h2>');
  });

  test("resets heading id counter between parse calls", () => {
    const md = "## Same";
    const html1 = markdownToHtml(md);
    const html2 = markdownToHtml(md);
    // Both should get the same id (no suffix) because the counter resets
    expect(html1).toContain('id="same"');
    expect(html2).toContain('id="same"');
  });
});

describe("generateHeadingId", () => {
  test("converts text to lowercase slug", () => {
    expect(generateHeadingId("Hello World")).toBe("hello-world");
  });

  test("preserves Japanese characters", () => {
    expect(generateHeadingId("はじめに")).toBe("はじめに");
  });

  test("removes special characters", () => {
    expect(generateHeadingId("Hello! World?")).toBe("hello-world");
  });

  test("collapses multiple spaces into a single dash", () => {
    expect(generateHeadingId("a   b")).toBe("a-b");
  });

  test("collapses spaces around dashes", () => {
    // "a - - b" -> spaces become dashes -> "a-----b" -> collapse -> "a-b"
    expect(generateHeadingId("a - - b")).toBe("a-b");
  });

  test("trims leading and trailing dashes", () => {
    expect(generateHeadingId("!hello!")).toBe("hello");
  });
});

describe("extractHeadings", () => {
  test("extracts h2 and h3 headings", () => {
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

  test("skips headings inside code blocks", () => {
    const md =
      "## Real heading\n\n```\n## Not a heading\n```\n\n## Another real heading";
    const headings = extractHeadings(md);
    expect(headings).toHaveLength(2);
  });

  test("strips inline formatting from heading text", () => {
    const md = "## **Bold** heading";
    const headings = extractHeadings(md);
    expect(headings[0].text).toBe("Bold heading");
  });

  test("handles Japanese headings", () => {
    const md = "## はじめに";
    const headings = extractHeadings(md);
    expect(headings[0].text).toBe("はじめに");
    expect(headings[0].id).toBe("はじめに");
  });

  test("assigns suffixed ids to duplicate headings", () => {
    const md =
      "## 何が起きたか\n\nText.\n\n## 何が起きたか\n\nText.\n\n## 何が起きたか";
    const headings = extractHeadings(md);
    expect(headings).toHaveLength(3);
    expect(headings[0].id).toBe("何が起きたか");
    expect(headings[1].id).toBe("何が起きたか-1");
    expect(headings[2].id).toBe("何が起きたか-2");
  });

  test("assigns unique ids to duplicate headings (all unique keys)", () => {
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

  test("strips inline link syntax from heading text", () => {
    const md = "### [文字数カウント](/tools/char-count)";
    const headings = extractHeadings(md);
    expect(headings[0].text).toBe("文字数カウント");
    expect(headings[0].id).toBe("文字数カウント");
  });

  test("strips numbered inline link syntax from heading text", () => {
    const md = "### 1. [文字数カウント](/tools/char-count)";
    const headings = extractHeadings(md);
    expect(headings[0].text).toBe("1. 文字数カウント");
  });

  test("strips image syntax from heading text", () => {
    const md = "## ![アイコン](icon.png) セクション";
    const headings = extractHeadings(md);
    // Image syntax is fully removed (not preserving alt text) to match
    // markdownToHtml behavior where <img> tags are completely stripped
    expect(headings[0].text).toBe("セクション");
  });

  test("strips HTML tags from heading text", () => {
    const md = "## テスト<br>改行";
    const headings = extractHeadings(md);
    expect(headings[0].text).toBe("テスト改行");
  });

  test("strips nested formatting in links", () => {
    const md = "## [**太字リンク**](url)";
    const headings = extractHeadings(md);
    expect(headings[0].text).toBe("太字リンク");
  });
});

describe("markdownToHtml and extractHeadings ID consistency", () => {
  test("heading IDs match between markdownToHtml and extractHeadings", () => {
    const md =
      "## Introduction\n\nText.\n\n### Details\n\nMore text.\n\n## Conclusion";
    const headings = extractHeadings(md);
    const html = markdownToHtml(md);

    for (const heading of headings) {
      expect(html).toContain(`id="${heading.id}"`);
    }
  });

  test("duplicate heading IDs match between markdownToHtml and extractHeadings", () => {
    const md =
      "## Section\n\nText.\n\n### Sub\n\nText.\n\n## Section\n\nText.\n\n### Sub";
    const headings = extractHeadings(md);
    const html = markdownToHtml(md);

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

  test("Japanese duplicate heading IDs match", () => {
    const md =
      "## はじめに\n\nText.\n\n## 本題\n\nText.\n\n## はじめに\n\nText.";
    const headings = extractHeadings(md);
    const html = markdownToHtml(md);

    for (const heading of headings) {
      expect(html).toContain(`id="${heading.id}"`);
    }
    expect(headings.map((h) => h.id)).toEqual([
      "はじめに",
      "本題",
      "はじめに-1",
    ]);
  });

  test("link heading IDs match between markdownToHtml and extractHeadings", () => {
    const md =
      "### 1. [文字数カウント](/tools/char-count)\n\nテキスト\n\n### 2. [バイト数計算](/tools/byte-counter)";
    const headings = extractHeadings(md);
    const html = markdownToHtml(md);
    for (const heading of headings) {
      expect(html).toContain(`id="${heading.id}"`);
    }
  });

  test("image heading IDs match between markdownToHtml and extractHeadings", () => {
    const md = "## ![アイコン](icon.png) セクション";
    const headings = extractHeadings(md);
    const html = markdownToHtml(md);
    for (const heading of headings) {
      expect(html).toContain(`id="${heading.id}"`);
    }
  });

  test("HTML tag heading IDs match between markdownToHtml and extractHeadings", () => {
    const md = "## テスト<br>改行";
    const headings = extractHeadings(md);
    const html = markdownToHtml(md);
    for (const heading of headings) {
      expect(html).toContain(`id="${heading.id}"`);
    }
  });
});

describe("estimateReadingTime", () => {
  test("returns at least 1 minute", () => {
    expect(estimateReadingTime("short")).toBe(1);
  });

  test("estimates Japanese text at ~500 chars/min", () => {
    const text = "あ".repeat(1000);
    expect(estimateReadingTime(text)).toBe(2);
  });

  test("estimates English text at ~200 words/min", () => {
    const text = Array(400).fill("word").join(" ");
    expect(estimateReadingTime(text)).toBe(2);
  });

  test("handles mixed content", () => {
    const text = "テスト".repeat(250) + " " + Array(100).fill("word").join(" ");
    const time = estimateReadingTime(text);
    expect(time).toBeGreaterThanOrEqual(2);
  });
});
