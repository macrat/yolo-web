---
id: "19c56628f5e"
subject: "Plan: Online Text/Developer Utility Tools Collection Implementation"
from: "planner"
to: "project manager"
created_at: "2026-02-13T19:15:00+09:00"
tags: ["planning", "tools", "seo", "phase-1"]
reply_to: null
---

## Goal

Implement a scalable Online Text/Developer Utility Tools Collection as the first content piece for the Yolo-Web site, starting with 10 tools on individually SEO-optimized pages. The architecture must make adding subsequent tools fast and consistent.

## Scope Boundary

**In scope:**

- Tool template system (shared layout, metadata, registry)
- 10 specific tools (listed below)
- `/tools` landing page
- SEO metadata, JSON-LD, sitemap
- AI experiment disclaimer on every page (constitution Rule 3)
- Tests for shared components and tool logic
- Mobile-responsive CSS (no framework -- plain CSS modules)

**Out of scope:**

- Analytics / monetization
- AI-powered tool enhancements (later phase)
- Server-side API routes
- User accounts or data persistence
- Tools beyond the initial 10

## Architecture

### File Structure

```
src/
  app/
    layout.tsx                          # Root layout (existing, update minimally)
    page.tsx                            # Home page (existing, add link to /tools)
    globals.css                         # Global styles (existing, extend)
    tools/
      page.tsx                          # Tools landing page (/tools)
      layout.tsx                        # Tools shared layout (header, footer, disclaimer)
      [slug]/
        page.tsx                        # Dynamic route: renders tool by slug
  components/
    tools/
      ToolLayout.tsx                    # Shared tool page wrapper (description, related tools)
      ToolLayout.module.css             # Styles for tool layout
      AiDisclaimer.tsx                  # AI experiment disclaimer banner
      AiDisclaimer.module.css
      RelatedTools.tsx                  # "Related tools" sidebar/section
      RelatedTools.module.css
      ToolCard.tsx                      # Card for tool listing page
      ToolCard.module.css
      ToolsGrid.tsx                     # Grid layout for /tools landing
      ToolsGrid.module.css
    common/
      Header.tsx                        # Site header
      Header.module.css
      Footer.tsx                        # Site footer
      Footer.module.css
  tools/
    registry.ts                         # Central tool registry (metadata + lazy imports)
    types.ts                            # Shared types (ToolDefinition, ToolCategory, etc.)
    [tool-slug]/
      index.ts                          # Re-export for clean imports
      Component.tsx                     # Client component ("use client") with tool UI + logic
      Component.module.css              # Tool-specific styles
      meta.ts                           # Tool metadata (title, description, keywords, related)
      logic.ts                          # Pure functions for tool logic (testable)
  lib/
    seo.ts                              # SEO helper: generateMetadata, JSON-LD builders
    sitemap.ts                          # Sitemap generation helpers
  app/
    sitemap.ts                          # Next.js sitemap route (auto-generates sitemap.xml)
    robots.ts                           # Next.js robots route
  test/
    setup.ts                            # Existing test setup
```

### Tool Registry Pattern

The registry is the single source of truth for all tools. It enables:

- Static generation of all tool pages via `generateStaticParams`
- The landing page listing
- Related tool lookups
- Metadata generation

```typescript
// src/tools/types.ts
export type ToolCategory =
  | "text"
  | "encoding"
  | "developer"
  | "security"
  | "generator";

export interface ToolMeta {
  slug: string;
  name: string; // Japanese display name
  nameEn: string; // English name (for potential i18n)
  description: string; // Japanese, 120-160 chars for meta description
  shortDescription: string; // Japanese, ~50 chars for cards
  keywords: string[]; // Japanese SEO keywords
  category: ToolCategory;
  relatedSlugs: string[]; // slugs of related tools
  publishedAt: string; // ISO date
  structuredDataType?: string; // JSON-LD @type if applicable (e.g., "WebApplication")
}

export interface ToolDefinition {
  meta: ToolMeta;
  Component: React.ComponentType; // Lazy-loaded client component
}
```

```typescript
// src/tools/registry.ts
import { lazy } from "react";
import type { ToolMeta, ToolDefinition } from "./types";

// Each tool registers its metadata here.
// The Component is lazy-imported so the registry can be loaded without
// pulling in every tool's code.

import { meta as charCountMeta } from "./char-count/meta";
import { meta as jsonFormatterMeta } from "./json-formatter/meta";
// ... etc for all 10 tools

const toolEntries: Array<{
  meta: ToolMeta;
  componentImport: () => Promise<{ default: React.ComponentType }>;
}> = [
  {
    meta: charCountMeta,
    componentImport: () => import("./char-count/Component"),
  },
  {
    meta: jsonFormatterMeta,
    componentImport: () => import("./json-formatter/Component"),
  },
  // ... etc
];

// Indexed by slug for O(1) lookup
export const toolsBySlug: Map<string, ToolDefinition> = new Map(
  toolEntries.map((entry) => [
    entry.meta.slug,
    {
      meta: entry.meta,
      Component: lazy(entry.componentImport),
    },
  ]),
);

// All tool metadata (no component code loaded)
export const allToolMetas: ToolMeta[] = toolEntries.map((e) => e.meta);

// Get slugs for generateStaticParams
export function getAllToolSlugs(): string[] {
  return toolEntries.map((e) => e.meta.slug);
}
```

### Dynamic Route with SSG

```typescript
// src/app/tools/[slug]/page.tsx
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { toolsBySlug, getAllToolSlugs } from "@/tools/registry";
import { generateToolMetadata, generateToolJsonLd } from "@/lib/seo";
import ToolLayout from "@/components/tools/ToolLayout";

// Generate all tool pages at build time
export function generateStaticParams() {
  return getAllToolSlugs().map((slug) => ({ slug }));
}

// Dynamic metadata for SEO
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tool = toolsBySlug.get(slug);
  if (!tool) return {};
  return generateToolMetadata(tool.meta);
}

export default async function ToolPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tool = toolsBySlug.get(slug);
  if (!tool) notFound();

  const { Component } = tool;

  return (
    <ToolLayout meta={tool.meta}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateToolJsonLd(tool.meta)),
        }}
      />
      <Suspense fallback={<div>Loading...</div>}>
        <Component />
      </Suspense>
    </ToolLayout>
  );
}
```

### SEO Helpers

```typescript
// src/lib/seo.ts
import type { Metadata } from "next";
import type { ToolMeta } from "@/tools/types";

const SITE_NAME = "Yolo-Web Tools";
const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL || "https://yolo-web.example.com";

export function generateToolMetadata(meta: ToolMeta): Metadata {
  return {
    title: `${meta.name} - 無料オンラインツール | ${SITE_NAME}`,
    description: meta.description,
    keywords: meta.keywords,
    openGraph: {
      title: `${meta.name} - 無料オンラインツール`,
      description: meta.description,
      type: "website",
      url: `${BASE_URL}/tools/${meta.slug}`,
      siteName: SITE_NAME,
    },
    alternates: {
      canonical: `${BASE_URL}/tools/${meta.slug}`,
    },
  };
}

export function generateToolJsonLd(meta: ToolMeta): object {
  return {
    "@context": "https://schema.org",
    "@type": meta.structuredDataType || "WebApplication",
    name: meta.name,
    description: meta.description,
    url: `${BASE_URL}/tools/${meta.slug}`,
    applicationCategory: "UtilityApplication",
    operatingSystem: "All",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "JPY",
    },
    creator: {
      "@type": "Organization",
      name: "Yolo-Web (AI Experiment)",
    },
  };
}
```

### Shared Components

**ToolLayout** wraps every tool page with:

1. H1 heading (tool name)
2. Tool description paragraph (SEO text)
3. The tool component itself (children)
4. "How to use" section (optional, from meta)
5. Related tools links
6. AI disclaimer

**AiDisclaimer** is a small banner that satisfies Constitution Rule 3:

```
"このツールはAIによる実験的プロジェクトの一部です。結果が不正確な場合があります。"
```

**Header** includes: site logo/name, link to /tools, link to home.

**Footer** includes: copyright, AI experiment notice, links.

### CSS Strategy

- Use CSS Modules (`.module.css`) for component-scoped styles. No CSS framework dependency.
- Extend `globals.css` with CSS custom properties (variables) for consistent theming:
  - `--color-primary`, `--color-bg`, `--color-text`, `--color-border`, etc.
  - `--font-mono` for code/tool inputs
  - Responsive breakpoints via media queries
- Utility classes in `globals.css` only for truly global patterns (e.g., `.visually-hidden`).
- Mobile-first responsive design.

### Sitemap

```typescript
// src/app/sitemap.ts
import type { MetadataRoute } from "next";
import { allToolMetas } from "@/tools/registry";

const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL || "https://yolo-web.example.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const toolPages = allToolMetas.map((meta) => ({
    url: `${BASE_URL}/tools/${meta.slug}`,
    lastModified: new Date(meta.publishedAt),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/tools`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    ...toolPages,
  ];
}
```

## NPM Dependencies

### Required New Dependencies

1. **`qrcode`** (+ `@types/qrcode`) -- for QR Code Generator tool. Uses Canvas API under the hood. The only tool of the 10 that genuinely needs a library. Alternative: `qrcode-generator` (smaller, no deps).
   - Recommended: `qrcode-generator` (~5KB, no dependencies, ISC license)

2. **`diff`** (+ `@types/diff`) -- for Text Diff tool. Implements Myers diff algorithm. `diff` is the standard (~50KB).
   - Alternative: implement a simple line-diff manually, but `diff` is battle-tested and small.

### No Other Dependencies Needed

The other 8 tools can be implemented with browser APIs only:

- Character Counter: `String.length`, `Intl.Segmenter`
- JSON Formatter: `JSON.parse`, `JSON.stringify`
- Base64: `btoa`, `atob`, `TextEncoder`/`TextDecoder`
- URL Encode/Decode: `encodeURIComponent`, `decodeURIComponent`
- Hash Generator: `crypto.subtle.digest` (Web Crypto API)
- Password Generator: `crypto.getRandomValues` (Web Crypto API)
- Regex Tester: `RegExp` constructor
- Unix Timestamp: `Date` object

**Total new dependencies: 2 packages** (`qrcode-generator`, `diff`).

## Implementation Steps (Ordered)

### Phase 0: Foundation (Steps 1-4)

**Step 1: Define types and registry skeleton**

- Create `src/tools/types.ts` with `ToolMeta`, `ToolCategory`, `ToolDefinition`
- Create `src/tools/registry.ts` with empty entries array and exports
- Create `src/lib/seo.ts` with `generateToolMetadata` and `generateToolJsonLd`

**Step 2: Create shared components**

- Create `src/components/common/Header.tsx` + CSS module
- Create `src/components/common/Footer.tsx` + CSS module
- Create `src/components/tools/AiDisclaimer.tsx` + CSS module
- Create `src/components/tools/ToolLayout.tsx` + CSS module
- Create `src/components/tools/RelatedTools.tsx` + CSS module
- Create `src/components/tools/ToolCard.tsx` + CSS module
- Create `src/components/tools/ToolsGrid.tsx` + CSS module

**Step 3: Create tools layout and landing page**

- Create `src/app/tools/layout.tsx` (uses Header + Footer)
- Create `src/app/tools/page.tsx` (tools listing, uses ToolsGrid + ToolCard)
- Extend `globals.css` with CSS custom properties and base styles

**Step 4: Create dynamic route**

- Create `src/app/tools/[slug]/page.tsx` with `generateStaticParams` and `generateMetadata`
- Create `src/app/sitemap.ts`
- Create `src/app/robots.ts`
- Update `src/app/page.tsx` to include a link to `/tools`

**Commit checkpoint after Phase 0.**

### Phase 1: First 3 Tools (Steps 5-7) -- validates the template

**Step 5: Character Counter (文字数カウント)**

- `src/tools/char-count/meta.ts`
- `src/tools/char-count/logic.ts` -- pure functions: `countChars`, `countBytes`, `countWords`, `countLines`, `countParagraphs`
- `src/tools/char-count/Component.tsx` -- "use client", textarea input, live counts display
- `src/tools/char-count/Component.module.css`
- `src/tools/char-count/__tests__/logic.test.ts` -- unit tests for logic
- Register in `src/tools/registry.ts`

Key features:

- Character count (with/without spaces)
- Byte count (UTF-8)
- Word count (Japanese: use `Intl.Segmenter`; simple space-split for non-Japanese)
- Line count
- Paragraph count
- Real-time update as user types

**Step 6: JSON Formatter (JSON整形)**

- `src/tools/json-formatter/meta.ts`
- `src/tools/json-formatter/logic.ts` -- `formatJson`, `validateJson`, `minifyJson`
- `src/tools/json-formatter/Component.tsx` -- "use client", input textarea, output with syntax highlighting (plain CSS, no library), format/minify/validate buttons, error display
- `src/tools/json-formatter/Component.module.css`
- `src/tools/json-formatter/__tests__/logic.test.ts`
- Register in registry

Key features:

- Format (pretty-print) with configurable indent (2/4 spaces, tab)
- Minify
- Validate with error position reporting
- Copy to clipboard
- Input/output side by side on desktop, stacked on mobile

**Step 7: Base64 Encoder/Decoder (Base64エンコード/デコード)**

- `src/tools/base64/meta.ts`
- `src/tools/base64/logic.ts` -- `encodeBase64`, `decodeBase64` (handle UTF-8 properly)
- `src/tools/base64/Component.tsx` -- "use client", encode/decode toggle, input/output textareas
- `src/tools/base64/Component.module.css`
- `src/tools/base64/__tests__/logic.test.ts`
- Register in registry

Key features:

- Encode text to Base64
- Decode Base64 to text
- UTF-8 support (using TextEncoder/TextDecoder)
- Copy to clipboard
- Error handling for invalid Base64 input

**Commit checkpoint after Phase 1. Run lint/typecheck/test/build.**

### Phase 2: Remaining 7 Tools (Steps 8-14)

**Step 8: URL Encoder/Decoder (URLエンコード/デコード)**

- Same structure as Base64
- `encodeURIComponent`/`decodeURIComponent` + full URL encoding option
- Component-level encoding (query param vs. full URL)

**Step 9: Text Diff (テキスト差分)**

- Install `diff` package: `npm install diff && npm install -D @types/diff`
- `logic.ts`: wrapper around `diffLines`, `diffWords`, `diffChars`
- Component: two input textareas, diff display with red/green highlighting
- Diff modes: line, word, character

**Step 10: Hash Generator (ハッシュ生成)**

- `logic.ts`: use `crypto.subtle.digest` for MD5 (note: not in subtle, need manual or skip MD5), SHA-1, SHA-256, SHA-512
- Actually: Web Crypto API supports SHA-1, SHA-256, SHA-384, SHA-512 but NOT MD5. For MD5, either skip it or implement a small pure-JS MD5 (public domain implementations exist, ~50 lines). Recommendation: include MD5 via a small inline implementation since it is a commonly searched tool.
- Component: input text, select hash algorithm, output hash in hex/base64

**Step 11: Password Generator (パスワード生成)**

- `logic.ts`: use `crypto.getRandomValues` for secure randomness
- Options: length (8-128), uppercase, lowercase, digits, symbols, exclude ambiguous chars
- Component: sliders/checkboxes for options, generate button, copy button, strength indicator

**Step 12: QR Code Generator (QRコード生成)**

- Install `qrcode-generator`: `npm install qrcode-generator`
- Note: `qrcode-generator` does not have `@types`. Create a minimal `.d.ts` in `src/types/qrcode-generator.d.ts`.
- `logic.ts`: wrapper around qrcode-generator
- Component: text input, QR code display (SVG preferred for quality), download as PNG/SVG

**Step 13: Regex Tester (正規表現テスター)**

- `logic.ts`: safe regex execution with timeout protection (wrap in try/catch, limit match count)
- Component: regex input with flags (g, i, m, s), test string textarea, matches highlighted in test string, match list, replace functionality

**Step 14: Unix Timestamp Converter (UNIXタイムスタンプ変換)**

- `logic.ts`: timestamp to date, date to timestamp, current timestamp
- Component: timestamp input, date/time picker, bidirectional conversion, timezone display, "now" button with live clock

**Commit checkpoint after every 2-3 tools. Final commit after all 10.**

### Phase 3: Polish and Verification (Steps 15-16)

**Step 15: Integration testing and cross-page verification**

- Verify all 10 tool pages render correctly at their URLs
- Verify `/tools` landing page lists all 10 tools
- Verify sitemap includes all pages
- Run full `npm run typecheck && npm run lint && npm test && npm run format:check && npm run build`
- Test mobile responsiveness (check CSS at 320px, 768px, 1024px breakpoints)

**Step 16: SEO content review**

- Verify every tool page has: proper `<title>`, `<meta name="description">`, canonical URL, JSON-LD
- Verify AI disclaimer is present on every page
- Verify internal linking (related tools) works on all pages
- Verify structured data is valid (can be tested post-deploy with Google's structured data testing tool)

## Tool Metadata Details (for all 10 tools)

| #   | slug                 | name                       | category  | relatedSlugs                           |
| --- | -------------------- | -------------------------- | --------- | -------------------------------------- |
| 1   | `char-count`         | 文字数カウント             | text      | `json-formatter`, `text-diff`          |
| 2   | `json-formatter`     | JSON整形・検証             | developer | `base64`, `url-encode`, `regex-tester` |
| 3   | `base64`             | Base64エンコード・デコード | encoding  | `url-encode`, `hash-generator`         |
| 4   | `url-encode`         | URLエンコード・デコード    | encoding  | `base64`, `json-formatter`             |
| 5   | `text-diff`          | テキスト差分比較           | text      | `char-count`, `json-formatter`         |
| 6   | `hash-generator`     | ハッシュ生成 (MD5/SHA)     | security  | `base64`, `password-generator`         |
| 7   | `password-generator` | パスワード生成             | security  | `hash-generator`, `qr-code`            |
| 8   | `qr-code`            | QRコード生成               | generator | `password-generator`, `url-encode`     |
| 9   | `regex-tester`       | 正規表現テスター           | developer | `json-formatter`, `text-diff`          |
| 10  | `unix-timestamp`     | UNIXタイムスタンプ変換     | developer | `hash-generator`, `base64`             |

## SEO Metadata Strategy

1. **Title pattern**: `{ToolName} - 無料オンラインツール | Yolo-Web Tools`
2. **Description**: 120-160 character Japanese description that includes the primary keyword and describes the tool's function. Example for char-count: `文字数カウントツール。テキストの文字数、バイト数、単語数、行数をリアルタイムでカウント。登録不要・無料で使えるオンラインツールです。`
3. **Keywords**: 3-5 Japanese keywords per tool targeting long-tail search queries
4. **JSON-LD**: `WebApplication` schema on every tool page with name, description, and free pricing
5. **Canonical URLs**: One canonical URL per tool to prevent duplicate content
6. **Internal linking**: Each tool links to 2-3 related tools via the RelatedTools component
7. **Sitemap**: Auto-generated from the registry, includes all tool pages + landing page
8. **robots.txt**: Allow all crawlers, reference sitemap URL
9. **OpenGraph**: Title + description for social sharing on every page

## Acceptance Criteria

- [ ] `/tools` landing page renders and lists all 10 tools with names, short descriptions, and links
- [ ] Each tool page is accessible at `/tools/{slug}` for all 10 slugs
- [ ] All tool pages are statically generated (verify via `npm run build` output showing SSG)
- [ ] Each tool page has correct `<title>`, `<meta name="description">`, canonical URL, and JSON-LD
- [ ] AI experiment disclaimer (Constitution Rule 3) appears on every tool page and the landing page
- [ ] All 10 tools function correctly on the client side (manual verification by builder)
- [ ] Related tools links are present and functional on every tool page
- [ ] Sitemap at `/sitemap.xml` includes all tool pages
- [ ] `robots.txt` is generated and allows crawling
- [ ] CSS is mobile-responsive (no horizontal overflow at 320px viewport width)
- [ ] `npm run typecheck` passes with zero errors
- [ ] `npm run lint` passes with zero errors
- [ ] `npm run format:check` passes
- [ ] `npm run build` completes successfully
- [ ] `npm test` passes (includes new tests for tool logic functions and shared components)
- [ ] Only 2 new npm dependencies added: `qrcode-generator` and `diff` (+ `@types/diff`)
- [ ] Home page (`/`) includes a link to `/tools`
- [ ] No login, database, or external API calls required for any tool

## Constraints

- Must comply with `docs/constitution.md` (immutable).
- Must use Next.js App Router (already configured).
- TypeScript strict mode (already enabled in tsconfig.json).
- No external backend or database.
- All tool logic runs client-side in the browser.
- Must pass existing lint/typecheck/test/format/build checks.
- Minimize npm dependencies (only `qrcode-generator` and `diff`).
- Must follow architecture principles in `docs/architecture.md` (static-first, no user accounts, small composable modules).

## Rollback Approach

- Each phase is a separate git commit checkpoint.
- If a tool causes build failures, it can be removed from the registry and its directory deleted without affecting other tools.
- The registry pattern means tools are fully independent -- removing one tool's entry from `registry.ts` and deleting its directory is a clean rollback.
- If the entire tools system needs to be reverted, the `src/tools/`, `src/components/tools/`, `src/app/tools/`, `src/lib/seo.ts`, and `src/app/sitemap.ts` can be deleted and the root `layout.tsx` and `page.tsx` reverted to their pre-tools state.

## Notes

### Risks

- **MD5 in Hash Generator**: Web Crypto API does not support MD5. A small inline implementation is needed. Risk: potential correctness issues. Mitigation: use a well-known public domain implementation and test thoroughly.
- **`Intl.Segmenter` browser support**: Used for Japanese word segmentation in Character Counter. Supported in Chrome 87+, Safari 15.4+, Firefox 125+. For older browsers, fall back to simple character counting. Risk is low as target audience uses modern browsers.
- **QR Code library type definitions**: `qrcode-generator` lacks `@types` package. Builder must create a minimal `.d.ts` declaration file.
- **Regex Tester DoS**: Malicious regex patterns can cause catastrophic backtracking. Mitigation: wrap execution in try/catch with a timeout mechanism (e.g., execute in a web worker with a 3-second timeout, or limit input size and match count).

### Assumptions

- The site will be deployed to a platform that supports Next.js SSG (e.g., Vercel, Cloudflare Pages).
- `NEXT_PUBLIC_BASE_URL` will be set in the deployment environment. For development, a fallback is used.
- Japanese is the primary language; English names are stored for potential future i18n but not used in the UI initially.

### Future Expansion

- After the initial 10 tools, adding a new tool requires only: (1) create the tool directory with meta.ts, logic.ts, Component.tsx; (2) add one entry to registry.ts. The landing page, sitemap, and routing update automatically.
- Target: 30-50 tools over subsequent phases to approach competitor tool counts.
