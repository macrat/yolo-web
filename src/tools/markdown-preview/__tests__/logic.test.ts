import { describe, test, expect } from "vitest";
import { renderMarkdown, sanitizeHtml } from "../logic";

describe("renderMarkdown", () => {
  test("renders heading", () => {
    const r = renderMarkdown("# Hello");
    expect(r.success).toBe(true);
    expect(r.html).toContain("<h1>");
    expect(r.html).toContain("Hello");
  });

  test("renders bold and italic", () => {
    const r = renderMarkdown("**bold** and *italic*");
    expect(r.success).toBe(true);
    expect(r.html).toContain("<strong>bold</strong>");
    expect(r.html).toContain("<em>italic</em>");
  });

  test("renders unordered list", () => {
    const r = renderMarkdown("- item1\n- item2");
    expect(r.success).toBe(true);
    expect(r.html).toContain("<li>");
  });

  test("renders code block", () => {
    const r = renderMarkdown("```\ncode\n```");
    expect(r.success).toBe(true);
    expect(r.html).toContain("<code>");
  });

  test("renders table (GFM)", () => {
    const r = renderMarkdown("| A | B |\n|---|---|\n| 1 | 2 |");
    expect(r.success).toBe(true);
    expect(r.html).toContain("<table>");
  });

  test("renders inline code", () => {
    const r = renderMarkdown("use `npm install`");
    expect(r.success).toBe(true);
    expect(r.html).toContain("<code>npm install</code>");
  });

  test("renders links", () => {
    const r = renderMarkdown("[link](https://example.com)");
    expect(r.success).toBe(true);
    expect(r.html).toContain('href="https://example.com"');
  });

  test("handles empty string", () => {
    const r = renderMarkdown("");
    expect(r.success).toBe(true);
    expect(r.html).toBe("");
  });

  test("rejects input exceeding max length", () => {
    const r = renderMarkdown("a".repeat(50_001));
    expect(r.success).toBe(false);
    expect(r.error).toBeDefined();
  });
});

describe("sanitizeHtml", () => {
  test("removes script tags", () => {
    expect(sanitizeHtml('<script>alert("xss")</script>')).toBe("");
  });

  test("removes onclick attributes", () => {
    const input = '<div onclick="alert(1)">click</div>';
    const output = sanitizeHtml(input);
    expect(output).not.toContain("onclick");
  });

  test("removes javascript: URLs", () => {
    const input = '<a href="javascript:alert(1)">click</a>';
    const output = sanitizeHtml(input);
    expect(output).not.toContain("javascript:");
  });

  test("preserves safe HTML", () => {
    const input = "<h1>Hello</h1><p>World</p>";
    expect(sanitizeHtml(input)).toBe(input);
  });
});
