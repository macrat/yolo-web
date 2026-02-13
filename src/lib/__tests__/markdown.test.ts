import { describe, test, expect } from "vitest";
import {
  parseFrontmatter,
  markdownToHtml,
  extractHeadings,
  estimateReadingTime,
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
