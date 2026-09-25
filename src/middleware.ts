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

/**
 * 410 Gone ページのHTMLを生成する。
 * middlewareからはReactコンポーネントやCSSモジュールが使用できないため、
 * インラインスタイル付きの静的HTMLで構成する。
 *
 * エラー面 `src/app/global-not-found-content.tsx` と流儀（紙地・墨字・見出しの書体・罫）を揃える。
 * 中央寄せの静かな告知として組み、トップへ戻る導線は文字と罫囲みで表す。
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
<title>このコンテンツは終了しました | yolos.net</title>
<style>
:root{color-scheme:light;--paper:${PAPER};--ink:${INK};--ink-2:${INK_2};--rule-2:${RULE}}
@media (prefers-color-scheme:dark){:root{color-scheme:dark;--paper:${PAPER_DARK};--ink:${INK_DARK};--ink-2:${INK_2_DARK};--rule-2:${RULE_DARK}}}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{font-family:${BODY_STACK};background:var(--paper);color:var(--ink);min-height:100vh;display:flex;align-items:center;justify-content:center;padding:1.5rem}
.container{max-width:34rem;width:100%;text-align:center}
h1{font-family:${HEADING_STACK};font-size:1.6rem;font-weight:400;color:var(--ink);line-height:1.5;letter-spacing:0.02em}
.rule{width:3rem;height:0;border-top:1px solid var(--rule-2);margin:1.25rem auto}
p{font-family:${BODY_STACK};font-size:1rem;color:var(--ink-2);line-height:1.9;margin-bottom:2rem}
a.home{display:inline-block;padding:0.6rem 1.75rem;color:var(--ink);text-decoration:none;border:1px solid var(--rule-2);border-radius:0;font-size:0.95rem;transition:border-color 0.2s}
a.home:hover,a.home:focus-visible{border-color:var(--ink)}
a.home:focus-visible{outline:2px solid var(--ink);outline-offset:2px}
</style>
</head>
<body>
<div class='container'>
<h1>このコンテンツは終了しました</h1>
<div class='rule'></div>
<p>お探しのページはすでに削除されており、現在はご覧いただけません。</p>
<a class='home' href='/'>トップページへ</a>
</div>
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
