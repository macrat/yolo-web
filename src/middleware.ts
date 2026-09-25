import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { PAPER, PAPER_DARK } from "@/lib/utsuwaHex";
import { SITE_NAME } from "@/lib/constants";
import {
  AI_NOTICE,
  FOOTER_LINKS,
  HEADER_NAV_ITEMS,
  MAIN_CONTENT_ID,
  type SiteLink,
} from "@/lib/site-frame";

/**
 * 削除済みブログ記事のスラッグ一覧。
 * これらのURLに対して HTTP 410 Gone を返す。
 * cycle番号はそのスラッグが削除された際のサイクルを示す。
 */
export const DELETED_BLOG_SLUGS: readonly string[] = [
  "ai-agent-site-strategy-formulation", // cycle-66で3部作に置換
  "ai-agent-bias-and-context-engineering", // cycle-68でスラッグ変更
  "forced-ideation-1728-combinations", // cycle-68でスラッグ変更
  "ai-agent-workflow-limits-when-4-skills-break", // cycle-68でスラッグ変更
  "nextjs-static-page-split-for-tools", // cycle-84で削除、改良版記事あり
  "achievement-system-multi-agent-incidents", // cycle-84で削除
  "character-fortune-text-art", // cycle-84で削除
  "music-personality-design", // cycle-84で削除
  "q43-humor-fortune-portal", // cycle-84で削除
  "password-security-guide", // cycle-88で削除
  "hash-generator-guide", // cycle-88で削除
  "unit-converter-guide", // cycle-89で削除
  "rss-feed", // cycle-89で削除
  "html-sql-cheatsheets", // cycle-89で削除
  "web-developer-tools-guide", // cycle-90で削除
  "quality-improvement-and-restructure-design", // cycle-15で短期間公開後削除
  "site-name-yolos-net", // 短期間公開後削除
  "tools-expansion-27", // 短期間公開後削除
  "traditional-colors-dictionary", // 短期間公開後削除
] as const;

// 高速検索のためSetに変換
const DELETED_BLOG_SLUGS_SET: ReadonlySet<string> = new Set(DELETED_BLOG_SLUGS);

/**
 * 指定スラッグが削除済みかどうかを判定する。
 */
export function isDeletedBlogSlug(slug: string): boolean {
  return DELETED_BLOG_SLUGS_SET.has(slug);
}

/**
 * 410 のページが使う globals.css のトークン（DESIGN.md §2〜§5）。middleware は globals.css を読めないので、
 * 同じ名前・同じ値をここに持つ。一致は __tests__/middleware-gone-slugs.test.ts が globals.css と照らして確かめる。
 * 書体の並びだけは、Web フォント（--font-plex-sans・--font-zen-antique）を除いた並びにする。このページは
 * Web フォントを読み込まないので、ほかのページが Web フォントを読み込む前と同じ書体で組む。
 */
export const GONE_PAGE_TOKENS = {
  root: {
    "color-scheme": "light",
    "--paper": "oklch(0.99 0 0)",
    "--ink": "oklch(0.15 0 0)",
    "--ink-2": "oklch(0.44 0 0)",
    "--rule": "var(--ink)",
    "--rule-2": "oklch(0.62 0 0)",
    "--rule-w": "3px",
    "--rule-w-hair": "1px",
    "--space-8": "8px",
    "--space-16": "16px",
    "--space-24": "24px",
    "--space-48": "48px",
    "--measure": "40rem",
    "--max-width": "60rem",
    "--box-padding": "var(--space-8)",
    "--container-width": "min(var(--max-width), 100% - 2 * var(--space-16))",
    "--text-body": "1.0625rem",
    "--text-step-3": "2.08rem",
    "--text-step-4": "2.92rem",
    "--text-step-5": "4.08rem",
    "--text-heading-main": "var(--text-step-3)",
    "--leading-body": "1.85",
    "--leading-heading": "1.25",
    "--font-ja-body":
      '"BIZ UDPGothic", "Hiragino Kaku Gothic ProN", "Yu Gothic Medium", "Noto Sans JP", sans-serif',
    "--font-ja-heading-fallback":
      '"BIZ UDGothic", "Hiragino Kaku Gothic ProN", "Yu Gothic Medium", "Noto Sans JP", sans-serif',
    "--font-heading":
      '"IBM Plex Sans Fallback", var(--font-ja-heading-fallback)',
    "--font-body": '"IBM Plex Sans Fallback", var(--font-ja-body)',
  },
  "(min-width: 45rem)": {
    "--box-padding": "var(--space-16)",
    "--text-heading-main": "var(--text-step-4)",
  },
  "(min-width: 64rem)": {
    "--text-heading-main": "var(--text-step-5)",
  },
  "(prefers-color-scheme: dark)": {
    "color-scheme": "dark",
    "--paper": "oklch(0.18 0 0)",
    "--ink": "oklch(0.97 0 0)",
    "--ink-2": "oklch(0.74 0 0)",
    "--rule-2": "oklch(0.53 0 0)",
  },
} as const satisfies Record<string, Record<string, string>>;

/** IBM Plex Sans の代わりの書体。globals.css の同じ @font-face と同じ記述で、一致は試験が確かめる。 */
export const GONE_PAGE_FALLBACK_FONT_FACE = {
  "font-family": '"IBM Plex Sans Fallback"',
  src: 'local("Arial")',
  "size-adjust": "101.13%",
  "ascent-override": "101.35%",
  "descent-override": "27.19%",
  "line-gap-override": "0%",
  "unicode-range": "U+0000-007F",
} as const;

function declarations(decls: Readonly<Record<string, string>>): string {
  return Object.entries(decls)
    .map(([prop, value]) => `${prop}:${value}`)
    .join(";");
}

function tokenRules(): string {
  const { root, ...media } = GONE_PAGE_TOKENS;
  return [
    `@font-face{${declarations(GONE_PAGE_FALLBACK_FONT_FACE)}}`,
    `:root{${declarations(root)}}`,
    ...Object.entries(media).map(
      ([query, decls]) => `@media ${query}{:root{${declarations(decls)}}}`,
    ),
  ].join("\n");
}

/**
 * 上端・下端のリンク。React の FrameLink と同じ組み方で、現在地を持たない（410 はナビの行き先でない）。
 */
function frameLink(link: SiteLink, extraClass = ""): string {
  const className = extraClass ? `link ${extraClass}` : "link";
  return `<a class='${className}' href='${link.href}'><span class='label' data-label='${link.label}'>${link.label}</span></a>`;
}

function frameLinks(links: readonly SiteLink[]): string {
  return links.map((link) => `<li>${frameLink(link)}</li>`).join("");
}

/**
 * 410 Gone ページのHTMLを生成する。
 * middlewareからはReactコンポーネントやCSSモジュールが使用できないため、
 * インラインスタイル付きの静的HTMLで構成する。
 *
 * どのページとも同じ枠（DESIGN.md §5 レイアウト）を持たせる。スキップのリンク・上端・中間・下端を置き、
 * コンテナの左右のボーダーを上端から下端まで通して、上端・下端の全幅の罫線と交わらせる。
 * 規則は SiteFrame・SkipLink・Header・Footer・FrameLink の CSS と同じ宣言で書き、トークンは
 * GONE_PAGE_TOKENS から取る。上端・下端の文字と行き先、AI 運営の告知は `@/lib/site-frame` から取る。
 * テーマはほかのページと同じく端末の設定に従う（§10）。theme-color の値は、meta が CSS のトークンを
 * 読めないので `@/lib/utsuwaHex` から取る。
 */
export function build410Html(): string {
  return `<!DOCTYPE html>
<html lang='ja'>
<head>
<meta charset='utf-8' />
<meta name='viewport' content='width=device-width, initial-scale=1' />
<meta name='theme-color' media='(prefers-color-scheme: light)' content='${PAPER}' />
<meta name='theme-color' media='(prefers-color-scheme: dark)' content='${PAPER_DARK}' />
<title>このコンテンツは終了しました | ${SITE_NAME}</title>
<style>
${tokenRules()}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html,body{max-width:100vw;overflow-x:clip;background:var(--paper);color:var(--ink)}
body{display:flex;flex-direction:column;min-height:100vh;font-family:var(--font-body);font-size:var(--text-body);line-height:var(--leading-body);overflow-wrap:break-word}
a{color:var(--ink);text-decoration:underline;text-decoration-thickness:var(--rule-w-hair);text-underline-offset:0.15em}
a:visited{color:var(--ink-2)}
.skip{position:fixed;top:var(--space-8);left:var(--space-8);transform:translateY(calc(-100% - var(--space-8)));z-index:1000;display:inline-flex;align-items:center;min-height:44px;padding-inline:var(--space-8);background:var(--paper);border:var(--rule-w) solid var(--paper)}
.skip:focus{transform:none}
.skip:focus-visible{outline:var(--rule-w) solid var(--ink);outline-offset:0}
.container{width:var(--container-width);margin-inline:auto;border-inline:var(--rule-w) solid var(--rule);padding-inline:var(--box-padding)}
header{border-bottom:var(--rule-w) solid var(--rule)}
header .container{display:flex;flex-wrap:wrap;align-items:center;column-gap:var(--space-24);padding-block:var(--space-8)}
footer{border-top:var(--rule-w) solid var(--rule)}
footer .container{display:flex;flex-direction:column;gap:var(--space-16);padding-block:var(--space-24)}
ul{list-style:none;display:flex;flex-wrap:wrap;column-gap:var(--space-8)}
@media (min-width:45rem){ul{column-gap:var(--space-16)}}
.link{position:relative;display:inline-flex;align-items:center;min-height:44px}
.link::after{content:'';position:absolute;inset-block:0;left:50%;width:max(100%,44px);transform:translateX(-50%);border:var(--rule-w-hair) solid transparent}
.link:hover::after{border-color:var(--rule-2)}
.link:focus-visible{outline:none}
.link:focus-visible::after{outline:var(--rule-w) solid var(--ink);outline-offset:var(--rule-w)}
.label{display:grid}
.label::after{content:attr(data-label);height:0;overflow:hidden;visibility:hidden;font-weight:700}
.site-name{font-family:var(--font-heading);font-size:var(--text-body)}
main{flex:1;display:flex;flex-direction:column;gap:var(--space-24);padding-block:var(--space-48)}
main:focus{outline:none}
main .link{align-self:flex-start}
h1{font-family:var(--font-heading);font-size:var(--text-heading-main);font-weight:400;line-height:var(--leading-heading);word-break:auto-phrase}
p{max-width:var(--measure)}
</style>
</head>
<body>
<a class='skip' href='#${MAIN_CONTENT_ID}'>メインコンテンツへスキップ</a>
<header><div class='container'>
${frameLink({ label: SITE_NAME, href: "/" }, "site-name")}
<nav aria-label='メインナビゲーション'><ul>${frameLinks(HEADER_NAV_ITEMS)}</ul></nav>
</div></header>
<main id='${MAIN_CONTENT_ID}' tabindex='-1' class='container'>
<h1>このコンテンツは終了しました</h1>
<p>お探しのページはすでに削除されており、現在はご覧いただけません。</p>
<a class='link' href='/'>トップページへ</a>
</main>
<footer><div class='container'>
<p>${AI_NOTICE}</p>
<nav aria-label='サイトの案内'><ul>${frameLinks(FOOTER_LINKS)}</ul></nav>
</div></footer>
</body>
</html>`;
}

export function middleware(request: NextRequest): NextResponse | Response {
  const { pathname } = request.nextUrl;

  // /blog/<slug> 形式のパスを検証する
  const blogPathMatch = /^\/blog\/([^/]+)$/.exec(pathname);
  if (blogPathMatch) {
    const slug = blogPathMatch[1];
    if (isDeletedBlogSlug(slug)) {
      return new Response(build410Html(), {
        status: 410,
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    }
  }

  return NextResponse.next();
}

export const config = { matcher: "/blog/:path*" };
