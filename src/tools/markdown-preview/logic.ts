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

// Whitelist of allowed tags for DOMParser-based sanitizer
const ALLOWED_TAGS = new Set([
  "p",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "ul",
  "ol",
  "li",
  "a",
  "strong",
  "em",
  "code",
  "pre",
  "blockquote",
  "table",
  "thead",
  "tbody",
  "tr",
  "th",
  "td",
  "br",
  "hr",
  "img",
  "del",
  "input",
]);

// Tags that should be completely removed including all their content
const STRIP_ENTIRELY_TAGS = new Set([
  "script",
  "style",
  "noscript",
  "template",
]);

// Whitelist of allowed attributes per tag
const ALLOWED_ATTRIBUTES: Record<string, Set<string>> = {
  a: new Set(["href", "title"]),
  img: new Set(["src", "alt", "title"]),
  input: new Set(["type", "checked", "disabled"]),
  td: new Set(["align"]),
  th: new Set(["align"]),
};

// Check if a URL is safe (only http/https protocols, plus data:image for img)
function isSafeUrl(url: string, isImgSrc: boolean): boolean {
  const trimmed = url.replace(/[\s\u0000-\u001f]/g, "").toLowerCase();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return true;
  }
  if (isImgSrc && trimmed.startsWith("data:image/")) {
    return true;
  }
  // Reject everything else (javascript:, vbscript:, data:text/html, etc.)
  return false;
}

// Sanitize a single element: filter attributes based on whitelist
function sanitizeElement(el: Element): void {
  const tagName = el.tagName.toLowerCase();
  const allowed = ALLOWED_ATTRIBUTES[tagName];

  // Remove all attributes not in the whitelist
  const attrs = Array.from(el.attributes);
  for (const attr of attrs) {
    const attrName = attr.name.toLowerCase();
    if (!allowed || !allowed.has(attrName)) {
      el.removeAttribute(attr.name);
      continue;
    }

    // Validate specific attributes
    if (attrName === "href") {
      if (!isSafeUrl(attr.value, false)) {
        el.removeAttribute(attr.name);
      }
    } else if (attrName === "src") {
      if (!isSafeUrl(attr.value, true)) {
        el.removeAttribute(attr.name);
      }
    } else if (tagName === "input" && attrName === "type") {
      if (attr.value.toLowerCase() !== "checkbox") {
        el.removeAttribute(attr.name);
      }
    }
  }
}

// Walk the DOM tree and sanitize using a whitelist approach.
// Only allowed tags are kept; disallowed tags are replaced by their text content.
function walkAndSanitize(node: Node, doc: Document): Node | null {
  if (node.nodeType === 3 /* TEXT_NODE */) {
    return doc.createTextNode(node.textContent || "");
  }

  if (node.nodeType !== 1 /* ELEMENT_NODE */) {
    return null;
  }

  const el = node as Element;
  const tagName = el.tagName.toLowerCase();

  // Dangerous tags: strip entirely including all content
  if (STRIP_ENTIRELY_TAGS.has(tagName)) {
    return null;
  }

  if (!ALLOWED_TAGS.has(tagName)) {
    // Disallowed tag: return a document fragment with sanitized children
    const fragment = doc.createDocumentFragment();
    for (const child of Array.from(el.childNodes)) {
      const sanitized = walkAndSanitize(child, doc);
      if (sanitized) {
        fragment.appendChild(sanitized);
      }
    }
    return fragment;
  }

  // Allowed tag: clone without children, sanitize attributes, recurse children
  const clone = doc.createElement(tagName);

  // Copy and sanitize attributes
  for (const attr of Array.from(el.attributes)) {
    clone.setAttribute(attr.name, attr.value);
  }
  sanitizeElement(clone);

  // Recurse into children
  for (const child of Array.from(el.childNodes)) {
    const sanitized = walkAndSanitize(child, doc);
    if (sanitized) {
      clone.appendChild(sanitized);
    }
  }

  return clone;
}

// DOMParser-based HTML sanitizer using a whitelist approach.
// Parses the HTML, walks the DOM tree, and only allows whitelisted tags/attributes.
export function sanitizeHtml(html: string): string {
  if (!html) return "";

  const parser = new DOMParser();
  const doc = parser.parseFromString(`<body>${html}</body>`, "text/html");
  const body = doc.body;

  const resultDoc = parser.parseFromString("<body></body>", "text/html");
  const resultBody = resultDoc.body;

  for (const child of Array.from(body.childNodes)) {
    const sanitized = walkAndSanitize(child, resultDoc);
    if (sanitized) {
      resultBody.appendChild(sanitized);
    }
  }

  return resultBody.innerHTML;
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
