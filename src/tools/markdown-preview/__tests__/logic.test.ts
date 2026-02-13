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
  test("preserves safe HTML", () => {
    const input = "<h1>Hello</h1><p>World</p>";
    expect(sanitizeHtml(input)).toBe(input);
  });

  test("preserves links with https", () => {
    const input = '<a href="https://example.com">link</a>';
    expect(sanitizeHtml(input)).toBe(input);
  });

  test("preserves links with http", () => {
    const input = '<a href="http://example.com">link</a>';
    expect(sanitizeHtml(input)).toBe(input);
  });

  test("preserves img with https src", () => {
    const input = '<img src="https://example.com/img.png" alt="test">';
    const output = sanitizeHtml(input);
    expect(output).toContain('src="https://example.com/img.png"');
    expect(output).toContain('alt="test"');
  });

  test("preserves img with data:image src", () => {
    const input = '<img src="data:image/png;base64,abc123" alt="test">';
    const output = sanitizeHtml(input);
    expect(output).toContain("data:image/png;base64,abc123");
  });

  test("preserves table structure", () => {
    const input =
      "<table><thead><tr><th>A</th></tr></thead><tbody><tr><td>1</td></tr></tbody></table>";
    const output = sanitizeHtml(input);
    expect(output).toContain("<table>");
    expect(output).toContain("<th>");
    expect(output).toContain("<td>");
  });

  test("preserves GFM checkbox input", () => {
    const input = '<input type="checkbox" checked="" disabled="">';
    const output = sanitizeHtml(input);
    expect(output).toContain("input");
    expect(output).toContain("checkbox");
  });

  test("handles empty string", () => {
    expect(sanitizeHtml("")).toBe("");
  });

  // --- XSS vector tests ---

  test("XSS: removes script tags with closing tag", () => {
    const input = "<script>alert(1)</script>";
    const output = sanitizeHtml(input);
    expect(output).not.toContain("<script");
    expect(output).not.toContain("alert");
  });

  test("XSS: removes script tags without closing tag", () => {
    const input = "<script>alert(1)";
    const output = sanitizeHtml(input);
    expect(output).not.toContain("<script");
    expect(output).not.toContain("alert");
  });

  test("XSS: removes self-closing script tags", () => {
    const input = '<script src="evil.js"/>';
    const output = sanitizeHtml(input);
    expect(output).not.toContain("<script");
    expect(output).not.toContain("evil.js");
  });

  test("XSS: removes javascript: URL in img src", () => {
    const input = '<img src="javascript:alert(1)">';
    const output = sanitizeHtml(input);
    expect(output).not.toContain("javascript:");
    expect(output).not.toContain("alert");
  });

  test("XSS: removes javascript: URL in href", () => {
    const input = '<a href="javascript:alert(1)">x</a>';
    const output = sanitizeHtml(input);
    expect(output).not.toContain("javascript:");
    expect(output).not.toContain("alert");
  });

  test("XSS: removes vbscript: URL in href", () => {
    const input = '<a href="vbscript:alert(1)">x</a>';
    const output = sanitizeHtml(input);
    expect(output).not.toContain("vbscript:");
    expect(output).not.toContain("alert");
  });

  test("XSS: removes data:text/html URL in href", () => {
    const input =
      '<a href="data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==">x</a>';
    const output = sanitizeHtml(input);
    expect(output).not.toContain("data:text/html");
  });

  test("XSS: removes onmouseover event handler", () => {
    const input = '<div onmouseover="alert(1)">x</div>';
    const output = sanitizeHtml(input);
    expect(output).not.toContain("onmouseover");
    expect(output).not.toContain("alert");
    // div is not in the whitelist, so the text content should be preserved
    expect(output).toContain("x");
  });

  test("XSS: removes onerror event handler", () => {
    const input = '<img onerror="alert(1)" src="x">';
    const output = sanitizeHtml(input);
    expect(output).not.toContain("onerror");
    expect(output).not.toContain("alert");
  });

  test("XSS: removes form with javascript action", () => {
    const input = '<form action="javascript:alert(1)">';
    const output = sanitizeHtml(input);
    expect(output).not.toContain("<form");
    expect(output).not.toContain("javascript:");
  });

  test("XSS: removes button with formaction", () => {
    const input = '<button formaction="javascript:alert(1)">click</button>';
    const output = sanitizeHtml(input);
    expect(output).not.toContain("<button");
    expect(output).not.toContain("javascript:");
    // Text content should be preserved
    expect(output).toContain("click");
  });

  test("XSS: removes meta tag with refresh", () => {
    const input =
      '<meta http-equiv="refresh" content="0;url=javascript:alert(1)">';
    const output = sanitizeHtml(input);
    expect(output).not.toContain("<meta");
    expect(output).not.toContain("javascript:");
  });

  test("XSS: removes iframe tags", () => {
    const input = '<iframe src="evil.com"></iframe>';
    const output = sanitizeHtml(input);
    expect(output).not.toContain("<iframe");
  });

  test("XSS: removes embed tags", () => {
    const input = '<embed src="evil.swf">';
    const output = sanitizeHtml(input);
    expect(output).not.toContain("<embed");
  });

  test("XSS: removes object tags", () => {
    const input = '<object data="evil.swf"></object>';
    const output = sanitizeHtml(input);
    expect(output).not.toContain("<object");
  });

  test("XSS: removes style tags", () => {
    const input =
      "<style>body { background: url('javascript:alert(1)') }</style>";
    const output = sanitizeHtml(input);
    expect(output).not.toContain("<style");
  });

  test("XSS: strips non-whitelisted attributes from allowed tags", () => {
    const input = '<p style="color:red" class="foo" id="bar">text</p>';
    const output = sanitizeHtml(input);
    expect(output).not.toContain("style");
    expect(output).not.toContain("class");
    expect(output).not.toContain("id");
    expect(output).toContain("<p>text</p>");
  });

  test("XSS: handles nested dangerous elements", () => {
    const input =
      '<div><script>alert(1)</script><p>safe</p><img onerror="alert(2)" src="x"></div>';
    const output = sanitizeHtml(input);
    expect(output).not.toContain("<script");
    expect(output).not.toContain("alert");
    expect(output).not.toContain("onerror");
    expect(output).toContain("<p>safe</p>");
  });

  test("XSS: handles mixed case script tags", () => {
    const input = "<ScRiPt>alert(1)</ScRiPt>";
    const output = sanitizeHtml(input);
    expect(output).not.toContain("alert");
  });

  test("XSS: rejects input type other than checkbox", () => {
    const input = '<input type="text" value="xss">';
    const output = sanitizeHtml(input);
    // type should be removed since it's not "checkbox"
    expect(output).not.toContain("text");
    expect(output).not.toContain("value");
  });
});
