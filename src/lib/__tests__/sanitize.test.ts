import { describe, test, expect } from "vitest";
import { sanitize } from "@/lib/sanitize";

describe("sanitize", () => {
  test("removes script tags", () => {
    const result = sanitize("<script>alert(1)</script>");
    expect(result).not.toContain("<script>");
    expect(result).not.toContain("alert(1)");
  });

  test("removes onerror attribute from img tags", () => {
    const result = sanitize('<img src="x" onerror="alert(1)">');
    expect(result).not.toContain("onerror");
    expect(result).not.toContain("alert(1)");
  });

  test("removes javascript: protocol from links", () => {
    const result = sanitize('<a href="javascript:alert(1)">click</a>');
    expect(result).not.toContain("javascript:");
    // The link text should be preserved
    expect(result).toContain("click");
  });

  test("preserves normal markdown HTML elements", () => {
    const html =
      '<p>Text</p><h2 id="title">Title</h2><a href="https://example.com">link</a>';
    const result = sanitize(html);
    expect(result).toContain("<p>Text</p>");
    expect(result).toContain('<h2 id="title">Title</h2>');
    expect(result).toContain('<a href="https://example.com">link</a>');
  });

  test("preserves code blocks", () => {
    const html = '<pre><code class="language-js">const x = 1;</code></pre>';
    const result = sanitize(html);
    expect(result).toContain("<pre>");
    expect(result).toContain('<code class="language-js">');
    expect(result).toContain("const x = 1;");
  });

  test("preserves table elements", () => {
    const html =
      "<table><thead><tr><th>A</th></tr></thead><tbody><tr><td>1</td></tr></tbody></table>";
    const result = sanitize(html);
    expect(result).toContain("<table>");
    expect(result).toContain("<th>A</th>");
    expect(result).toContain("<td>1</td>");
  });

  test("preserves mermaid div class", () => {
    const html = '<div class="mermaid">graph TD; A--&gt;B;</div>';
    const result = sanitize(html);
    expect(result).toContain('<div class="mermaid">');
    expect(result).toContain("graph TD;");
  });

  test("preserves GFM Alert classes including title paragraph", () => {
    const html =
      '<div class="markdown-alert markdown-alert-note"><p class="markdown-alert-title"><svg class="octicon" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M0 8z"></path></svg>Note</p><p>Content</p></div>';
    const result = sanitize(html);
    expect(result).toContain("markdown-alert-note");
    expect(result).toContain("markdown-alert-title");
    expect(result).toContain("<svg");
    expect(result).toContain("<path");
  });

  test("removes all event handler attributes", () => {
    const html = '<div onmouseover="alert(1)" onclick="alert(2)">text</div>';
    const result = sanitize(html);
    expect(result).not.toContain("onmouseover");
    expect(result).not.toContain("onclick");
    expect(result).toContain("text");
  });

  test("removes data: protocol from img src", () => {
    const result = sanitize(
      '<img src="data:text/html,<script>alert(1)</script>" alt="xss">',
    );
    expect(result).not.toContain("data:");
    // The img tag may be preserved but without the dangerous src
  });

  test("preserves GFM task list input checkbox with type, checked, and disabled attributes", () => {
    const html =
      '<ul><li><input type="checkbox" checked="" disabled="" /> Done</li></ul>';
    const result = sanitize(html);
    expect(result).toContain("<input");
    expect(result).toContain('type="checkbox"');
    // checked and disabled are boolean attributes - sanitize-html may render them differently
    expect(result).toMatch(/checked/);
    expect(result).toMatch(/disabled/);
    expect(result).toContain("Done");
  });

  test("preserves unchecked GFM task list input checkbox", () => {
    const html = '<ul><li><input type="checkbox" disabled="" /> Todo</li></ul>';
    const result = sanitize(html);
    expect(result).toContain("<input");
    expect(result).toContain('type="checkbox"');
    expect(result).toMatch(/disabled/);
    expect(result).not.toMatch(/checked/);
    expect(result).toContain("Todo");
  });

  test("removes style tags", () => {
    const result = sanitize(
      "<style>body { display: none; }</style><p>text</p>",
    );
    expect(result).not.toContain("<style>");
    expect(result).toContain("<p>text</p>");
  });

  test("removes iframe tags", () => {
    const result = sanitize(
      '<iframe src="https://evil.com"></iframe><p>text</p>',
    );
    expect(result).not.toContain("<iframe>");
    expect(result).toContain("<p>text</p>");
  });

  test("removes object and embed tags", () => {
    const result = sanitize(
      '<object data="evil.swf"></object><embed src="evil.swf"><p>text</p>',
    );
    expect(result).not.toContain("<object>");
    expect(result).not.toContain("<embed>");
    expect(result).toContain("<p>text</p>");
  });

  test("preserves strong, em, del, and br tags", () => {
    const html =
      "<p><strong>bold</strong> <em>italic</em> <del>deleted</del><br />new line</p>";
    const result = sanitize(html);
    expect(result).toContain("<strong>bold</strong>");
    expect(result).toContain("<em>italic</em>");
    expect(result).toContain("<del>deleted</del>");
    expect(result).toContain("<br />");
  });

  test("preserves blockquote", () => {
    const html = "<blockquote><p>quoted text</p></blockquote>";
    const result = sanitize(html);
    expect(result).toContain("<blockquote>");
    expect(result).toContain("quoted text");
  });

  test("preserves details and summary elements", () => {
    const html =
      "<details><summary>Click to expand</summary><p>Hidden content</p></details>";
    const result = sanitize(html);
    expect(result).toContain("<details>");
    expect(result).toContain("<summary>");
    expect(result).toContain("Click to expand");
    expect(result).toContain("Hidden content");
  });

  test("preserves heading id attributes", () => {
    const html = '<h1 id="intro">Introduction</h1><h3 id="sub">Sub</h3>';
    const result = sanitize(html);
    expect(result).toContain('<h1 id="intro">');
    expect(result).toContain('<h3 id="sub">');
  });

  test("preserves img with https src and alt", () => {
    const html = '<img src="https://example.com/img.png" alt="photo">';
    const result = sanitize(html);
    expect(result).toContain('src="https://example.com/img.png"');
    expect(result).toContain('alt="photo"');
  });
});
