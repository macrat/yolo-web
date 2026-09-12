import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  PAPER,
  INK,
  INK_2,
  RULE,
  RULE_STRONG,
  ACCENT,
  PAPER_DARK,
  INK_DARK,
  INK_2_DARK,
  RULE_DARK,
  RULE_STRONG_DARK,
  ACCENT_DARK,
} from "@/lib/utsuwaHex";

/**
 * 記事は残っているが URL が変わったもの。旧 URL から来た人を新しい URL へ送る。
 *
 * 中身が読める場所があるのに「削除されました」を見せるのは、来訪者にとって記事が
 * 失われたのと同じである（site-concept「消すときは、いま使っている人の行き先を
 * 用意する——代わりになる面があれば転送する」）。
 */
export const MOVED_BLOG_SLUGS: Readonly<Record<string, string>> = {
  "ai-agent-bias-and-context-engineering":
    "ai-agent-concept-rethink-1-bias-and-context-engineering",
  "forced-ideation-1728-combinations":
    "ai-agent-concept-rethink-2-forced-ideation-1728",
  "ai-agent-workflow-limits-when-4-skills-break":
    "ai-agent-concept-rethink-3-workflow-limits",
  // 同じ出来事を書き直したもの（いずれも旧記事と同日または同主題）
  "site-name-yolos-net": "site-rename-yolos-net",
  "tools-expansion-27": "tools-expansion-10-to-30",
  "traditional-colors-dictionary": "japanese-traditional-colors-dictionary",
  // 旧記事は next/dynamic のローディングフラッシュを扱っており、同日公開の
  // この記事が同じ主題を書き直したもの（スラッグの字面は似ていない）
  "nextjs-static-page-split-for-tools":
    "nextjs-dynamic-import-pitfalls-and-true-code-splitting",
} as const;

/**
 * 中身ごと無くなった記事のスラッグ。これらには HTTP 410 Gone を返す。
 * 行末の cycle 番号は、その記事を削除したサイクルを指す。
 */
export const DELETED_BLOG_SLUGS: readonly string[] = [
  "ai-agent-site-strategy-formulation", // cycle-66で3部作に置換
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
 * middleware からも安全に import できる。globals.css のトークンを hex 化した値であり、light も
 * dark も乖離ガード（`src/lib/__tests__/wairoHex.test.ts` が globals.css の oklch と一致を検証）
 * の対象。
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
 * でなく、近いものの在り処が分かる**面にする——AI試行錯誤ブログ・ツール・辞典・遊ぶの4つへ
 * 入口を置く。呼び名は着いた先の名前に揃える（DESIGN.md §6-4）。
 * AI 明示（constitution rule 3）も、この面だけ落とさない。ダークも器のトークンに追随させる。
 */
export function build410Html(): string {
  return `<!DOCTYPE html>
<html lang='ja'>
<head>
<meta charset='utf-8' />
<meta name='viewport' content='width=device-width, initial-scale=1' />
<title>この記事は削除されました | yolos.net</title>
<style>
:root{color-scheme:light dark;--paper:${PAPER};--ink:${INK};--ink-2:${INK_2};--rule:${RULE};--rule-strong:${RULE_STRONG};--accent:${ACCENT}}
@media (prefers-color-scheme:dark){:root{--paper:${PAPER_DARK};--ink:${INK_DARK};--ink-2:${INK_2_DARK};--rule:${RULE_DARK};--rule-strong:${RULE_STRONG_DARK};--accent:${ACCENT_DARK}}}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{font-family:${GOTHIC_STACK};background:var(--paper);color:var(--ink);min-height:100vh;display:flex;align-items:center;justify-content:center;padding:1.5rem;line-height:1.7}
.container{max-width:34rem;width:100%}
.shop{font-family:${MINCHO_STACK};font-size:1.25rem;color:var(--ink);text-decoration:none;display:block}
.noren{border-bottom:1px solid var(--rule-strong);padding-bottom:0.5rem;margin-bottom:2rem}
h1{font-family:${MINCHO_STACK};font-size:1.5625rem;font-weight:600;color:var(--ink);line-height:1.4;letter-spacing:0.02em}
p{font-family:${GOTHIC_STACK};font-size:1rem;color:var(--ink-2);line-height:1.9;margin-top:1rem}
h2{font-family:${MINCHO_STACK};font-size:1.25rem;font-weight:600;color:var(--ink);line-height:1.4;margin-top:2.5rem;padding-bottom:0.5rem;border-bottom:1px solid var(--rule)}
ul{list-style:none;margin-top:0.5rem}
li{border-bottom:1px solid var(--rule)}
li a{display:block;padding:0.75rem 0;color:var(--accent);text-decoration:none;font-size:1rem}
li a:hover,li a:focus-visible{text-decoration:underline}
li a:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
.note{font-size:0.8125rem;color:var(--ink-2);margin-top:2.5rem;line-height:1.7}
</style>
</head>
<body>
<div class='container'>
<div class='noren'><a class='shop' href='/'>yolos.net</a></div>
<h1>この記事は削除されました</h1>
<p>お探しの記事はすでに取り下げられており、読むことができません。近いものがあるかもしれないので、下から探してみてください。</p>
<h2>行き先</h2>
<ul>
<li><a href='/blog'>AI試行錯誤ブログ</a></li>
<li><a href='/tools'>ツール</a></li>
<li><a href='/dictionary'>辞典</a></li>
<li><a href='/play'>遊ぶ</a></li>
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
    // 記事が新しい URL で生きているなら、消えた告知でなく現物へ送る（308: 恒久）
    const movedTo = MOVED_BLOG_SLUGS[slug];
    if (movedTo) {
      const url = request.nextUrl.clone();
      url.pathname = `/blog/${movedTo}`;
      return NextResponse.redirect(url, 308);
    }
    if (isDeletedBlogSlug(slug)) {
      return new Response(build410Html(), {
        status: 410,
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          // 410 は既定で恒久的にキャッシュされうる。一度この面を開いた人には、
          // 後から転送を足しても届かなくなる（記事が復活しても古い墓標を見続ける）。
          "Cache-Control": "no-store",
        },
      });
    }
  }

  return NextResponse.next();
}

export const config = { matcher: "/blog/:path*" };
