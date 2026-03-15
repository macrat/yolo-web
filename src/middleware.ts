import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

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
 * 410 Gone ページのHTMLを生成する。
 * middlewareからはReactコンポーネントやCSSモジュールが使用できないため、
 * インラインスタイル付きの静的HTMLで構成する。
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
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f8fafc;color:#1e293b;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:1rem}
.container{max-width:560px;width:100%;text-align:center}
.icon{font-size:3rem;margin-bottom:1.5rem}
h1{font-size:1.75rem;font-weight:800;color:#2563eb;margin-bottom:1rem}
p{font-size:1rem;color:#64748b;line-height:1.8;margin-bottom:2rem}
a{display:inline-block;padding:0.75rem 2rem;background:#2563eb;color:#fff;text-decoration:none;border-radius:0.5rem;font-weight:600;transition:background 0.2s}
a:hover{background:#1d4ed8}
</style>
</head>
<body>
<div class='container'>
<div class='icon'>📄</div>
<h1>このコンテンツは終了しました</h1>
<p>お探しのページはすでに削除されており、現在はご覧いただけません。</p>
<a href='/'>トップページへ</a>
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
