import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  PAPER,
  INK,
  INK_2,
  RULE,
  PAPER_DARK,
  INK_DARK,
  INK_2_DARK,
  RULE_DARK,
} from "@/lib/utsuwaHex";
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
 * 書体の並び（DESIGN.md §3）。この静的HTMLは Web フォントを読み込まないので、端末にある書体だけで組む。
 * 本文は globals.css の --font-ja-body、見出しは Zen Antique の代わりに組む --font-ja-heading-fallback と同じ並び。
 */
const BODY_STACK =
  "'BIZ UDPGothic','Hiragino Kaku Gothic ProN','Yu Gothic Medium','Noto Sans JP',sans-serif";
const HEADING_STACK =
  "'BIZ UDGothic','Hiragino Kaku Gothic ProN','Yu Gothic Medium','Noto Sans JP',sans-serif";

/** 上端・下端のリンク。React の Header・Footer と同じ組み方で、現在地を持たない（410 はナビの行き先でない）。 */
function frameLinks(links: readonly SiteLink[]): string {
  return links
    .map(
      (link) =>
        `<li><a class='link' href='${link.href}'>${link.label}</a></li>`,
    )
    .join("");
}

/**
 * 410 Gone ページのHTMLを生成する。
 * middlewareからはReactコンポーネントやCSSモジュールが使用できないため、
 * インラインスタイル付きの静的HTMLで構成する。
 *
 * どのページとも同じ枠（DESIGN.md §5 レイアウト）を持たせる。スキップのリンク・上端・中間・下端を置き、
 * コンテナの左右のボーダーを上端から下端まで通して、上端・下端の全幅の罫線と交わらせる。
 * 上端・下端の文字と行き先、AI 運営の告知は `@/lib/site-frame` から取り、ほかのページと食い違わせない。
 * 寸法は globals.css のトークン（§4・§5）と同じ値で書く。
 *
 * 色（DESIGN.md §2）は、トークンを読めないので器色 hex の SSoT `@/lib/utsuwaHex` から取る。
 * ここで hex を独自に書くと、globals.css を変えても 410 だけ古い値のまま残るため。
 * テーマはほかのページと同じく端末の設定に従う（§10）。
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
:root{color-scheme:light;--paper:${PAPER};--ink:${INK};--ink-2:${INK_2};--rule-2:${RULE};--box-padding:8px}
@media (prefers-color-scheme:dark){:root{color-scheme:dark;--paper:${PAPER_DARK};--ink:${INK_DARK};--ink-2:${INK_2_DARK};--rule-2:${RULE_DARK}}}
@media (min-width:45rem){:root{--box-padding:16px}}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html,body{background:var(--paper);color:var(--ink)}
body{display:flex;flex-direction:column;min-height:100vh;font-family:${BODY_STACK};font-size:1.0625rem;line-height:1.85;overflow-wrap:break-word}
a{color:var(--ink);text-decoration:underline;text-decoration-thickness:1px;text-underline-offset:0.15em}
a:visited{color:var(--ink-2)}
a:focus-visible{outline:3px solid var(--ink);outline-offset:3px}
.skip{position:fixed;top:8px;left:8px;transform:translateY(calc(-100% - 8px));z-index:1000;display:inline-flex;align-items:center;min-height:44px;padding:8px 16px;background:var(--paper);border:1px solid var(--ink);text-decoration:none}
.skip:focus{transform:translateY(0)}
.container{width:min(60rem,100% - 32px);margin-inline:auto;border-inline:3px solid var(--ink);padding-inline:var(--box-padding)}
header{border-bottom:3px solid var(--ink)}
header .container{display:flex;flex-wrap:wrap;align-items:center;column-gap:24px;padding-block:8px}
footer{border-top:3px solid var(--ink)}
footer .container{display:flex;flex-direction:column;gap:16px;padding-block:24px}
ul{list-style:none;display:flex;flex-wrap:wrap;column-gap:8px}
@media (min-width:45rem){ul{column-gap:16px}}
.link{position:relative;display:inline-flex;align-items:center;min-width:44px;min-height:44px}
.link::after{content:'';position:absolute;inset:0;border:1px solid transparent;pointer-events:none}
.link:hover::after{border-color:var(--rule-2)}
main{flex:1;display:flex;flex-direction:column;align-items:flex-start;gap:24px;padding-block:48px}
h1{font-family:${HEADING_STACK};font-size:2.08rem;font-weight:400;line-height:1.25;word-break:auto-phrase}
@media (min-width:45rem){h1{font-size:2.92rem}}
@media (min-width:64rem){h1{font-size:4.08rem}}
p{max-width:40rem}
</style>
</head>
<body>
<a class='skip' href='#${MAIN_CONTENT_ID}'>メインコンテンツへスキップ</a>
<header><div class='container'>
<a class='link' href='/'>${SITE_NAME}</a>
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
