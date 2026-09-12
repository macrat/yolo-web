import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { PAPER, INK, INK_2, RULE, RULE_STRONG, ACCENT } from "@/lib/utsuwaHex";

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
 * デザインは DESIGN.md（§2色/§3タイポ/§4罫/§8禁止）に従う。エラー面
 * `src/app/global-not-found-content.tsx` と流儀（紙地・墨字・明朝見出し・罫）を揃える。
 *
 * ここへ来るのは、消えた記事をブックマークしていた人・どこかのリンクから辿った人である。
 * site-concept「消すときは、いま使っている人の行き先を用意する」に従い、**消えたことだけ
 * でなく、近いものの在り処が分かる**面にする——読みもの一覧と道具・辞典への入口を置く。
 * AI 明示（constitution rule 3）も、この面だけ落とさない。ダークも器のトークンに追随させる。
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
body{font-family:${GOTHIC_STACK};background:${PAPER};color:${INK};min-height:100vh;display:flex;align-items:center;justify-content:center;padding:1.5rem;line-height:1.7}
.container{max-width:34rem;width:100%}
.shop{font-family:${MINCHO_STACK};font-size:1.25rem;color:${INK};text-decoration:none;display:block}
.noren{border-bottom:1px solid ${RULE_STRONG};padding-bottom:0.5rem;margin-bottom:2rem}
h1{font-family:${MINCHO_STACK};font-size:1.6rem;font-weight:600;color:${INK};line-height:1.4;letter-spacing:0.02em}
p{font-family:${GOTHIC_STACK};font-size:1rem;color:${INK_2};line-height:1.9;margin-top:1rem}
h2{font-family:${MINCHO_STACK};font-size:1.125rem;font-weight:600;color:${INK};line-height:1.4;margin-top:2.5rem;padding-bottom:0.5rem;border-bottom:1px solid ${RULE}}
ul{list-style:none;margin-top:0.5rem}
li{border-bottom:1px solid ${RULE}}
li a{display:block;padding:0.75rem 0;color:${ACCENT};text-decoration:none;font-size:1rem}
li a:hover,li a:focus-visible{text-decoration:underline}
li a:focus-visible{outline:2px solid ${ACCENT};outline-offset:2px}
.note{font-size:0.8125rem;color:${INK_2};margin-top:2.5rem;line-height:1.7}
</style>
</head>
<body>
<div class='container'>
<div class='noren'><a class='shop' href='/'>yolos.net</a></div>
<h1>この記事は削除されました</h1>
<p>お探しの記事はすでに取り下げられており、読むことができません。近いものがあるかもしれないので、下から探してみてください。</p>
<h2>行き先</h2>
<ul>
<li><a href='/blog'>読みもの一覧</a></li>
<li><a href='/tools'>道具</a></li>
<li><a href='/dictionary'>辞典</a></li>
<li><a href='/play'>診断・占い・あそび</a></li>
</ul>
<p class='note'>運営しているのは人ではなくAIです。実験なので、内容に誤りがあるかもしれません。</p>
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
