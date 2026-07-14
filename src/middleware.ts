import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { PAPER, INK, INK_2, RULE, ACCENT } from "@/lib/utsuwaHex";

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
 * 410 ページの器の色（DESIGN.md §2「紙・墨・朱」）は、器色 hex の SSoT である中立モジュール
 * `@/lib/utsuwaHex`（`PAPER`/`INK`/`INK_2`/`RULE`/`ACCENT` 等）から import する。utsuwaHex は
 * import ゼロの純粋な hex 定数モジュール（next/og 等に依存しない葉）なので、Edge 実行されうる
 * middleware からも安全に import できる。globals.css の light トークンを hex 化した値であり、
 * 乖離ガード（`src/lib/__tests__/wairoHex.test.ts` が globals.css の oklch と一致を検証）の対象。
 * ここで hex を独自に再定義すると器色の第3複製になり、globals.css を変えても 410 だけ旧値へ
 * 静かにドリフトするため、必ず SSoT を参照する。旧デザインの青（#2563eb 等）・冷色スレート
 * （#f8fafc/#1e293b）は §8-1/§10 違反のため撤去済み。
 */

/**
 * 見出しの明朝スタック（DESIGN §3「見出しは明朝」）。この静的HTMLは Web フォントを
 * 読み込まないため Noto Serif JP を先頭に置きつつシステム明朝へ素直にフォールバックする
 * （globals.css の --font-mincho フォールバック相当）。本文はシステムゴシックでよい。
 */
const MINCHO_STACK = "'Noto Serif JP','Hiragino Mincho ProN','Yu Mincho',serif";
const GOTHIC_STACK =
  "'Hiragino Kaku Gothic ProN','Yu Gothic Medium','Noto Sans JP',sans-serif";

/**
 * 410 Gone ページのHTMLを生成する。
 * middlewareからはReactコンポーネントやCSSモジュールが使用できないため、
 * インラインスタイル付きの静的HTMLで構成する。
 *
 * デザインは「店構え」（DESIGN.md §2色/§3タイポ/§4罫/§8禁止）。既に店構え化された
 * エラー面 `src/app/global-not-found-content.tsx` と流儀（紙地・墨字・明朝見出し・罫）を揃える。
 * 中央寄せの静かな告知として組み、操作（トップへ戻る導線）は §4「罫と墨で、装飾を足さない」に
 * 従い朱の文字＋罫囲みで表す（青ベタボタン・装飾絵文字・8px角丸は撤去済み）。
 */
export function build410Html(): string {
  return `<!DOCTYPE html>
<html lang='ja'>
<head>
<meta charset='utf-8' />
<meta name='viewport' content='width=device-width, initial-scale=1' />
<title>このコンテンツは終了しました | yolos.net</title>
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{font-family:${GOTHIC_STACK};background:${PAPER};color:${INK};min-height:100vh;display:flex;align-items:center;justify-content:center;padding:1.5rem}
.container{max-width:34rem;width:100%;text-align:center}
h1{font-family:${MINCHO_STACK};font-size:1.6rem;font-weight:600;color:${INK};line-height:1.5;letter-spacing:0.02em}
.rule{width:3rem;height:0;border-top:1px solid ${RULE};margin:1.25rem auto}
p{font-family:${GOTHIC_STACK};font-size:1rem;color:${INK_2};line-height:1.9;margin-bottom:2rem}
a.home{display:inline-block;padding:0.6rem 1.75rem;color:${ACCENT};text-decoration:none;border:1px solid ${RULE};border-radius:0;font-size:0.95rem;transition:border-color 0.2s}
a.home:hover,a.home:focus-visible{border-color:${ACCENT}}
a.home:focus-visible{outline:2px solid ${ACCENT};outline-offset:2px}
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
