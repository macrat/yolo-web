import { marked } from "marked";
import type { MarkedOptions } from "marked";

export interface MarkdownResult {
  success: boolean;
  html: string;
  error?: string;
}

const MAX_INPUT_LENGTH = 50_000;

// Configure marked options (no external dependencies for sanitization)
const markedOptions: MarkedOptions = {
  gfm: true, // GitHub Flavored Markdown
  breaks: true, // Convert \n to <br>
};

// Basic HTML sanitizer: remove <script>, on* attributes, javascript: URLs
// This is defense-in-depth since marked itself does not execute scripts,
// but the output is rendered via dangerouslySetInnerHTML.
export function sanitizeHtml(html: string): string {
  return (
    html
      // Remove <script> tags and contents
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      // Remove on* event handlers
      .replace(/\s+on\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "")
      // Remove javascript: URLs
      .replace(/href\s*=\s*["']?\s*javascript:/gi, 'href="')
      // Remove <iframe>, <embed>, <object>
      .replace(/<(iframe|embed|object)\b[^>]*>.*?<\/\1>/gi, "")
      .replace(/<(iframe|embed|object)\b[^>]*\/?>/gi, "")
  );
}

export function renderMarkdown(input: string): MarkdownResult {
  if (input.length > MAX_INPUT_LENGTH) {
    return {
      success: false,
      html: "",
      error: `入力テキストが長すぎます（最大${MAX_INPUT_LENGTH.toLocaleString()}文字）`,
    };
  }

  try {
    const rawHtml = marked.parse(input, markedOptions) as string;
    const html = sanitizeHtml(rawHtml);
    return { success: true, html };
  } catch (e) {
    return {
      success: false,
      html: "",
      error: e instanceof Error ? e.message : "Markdown parsing failed",
    };
  }
}
