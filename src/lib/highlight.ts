/**
 * Markdown のコードのブロックを、ビルドの時にコードのボックスの HTML にする。
 *
 * コードの字は `--ink` で組み、注釈（コメント）だけを `--ink-2` にする（DESIGN.md §5 コード）。
 * 字の種類を色で分けないので、Shiki には注釈を見分けることだけをさせる。注釈にだけ印の色を持つ
 * テーマで字を分け、その色の字を `<span class="code-comment">` で包む。色そのものは HTML に書かず、
 * 記事の本文の CSS がトークンで塗るので、ダークでもトークンのダークの値に替わるだけになる。
 *
 * Shiki の `bundle/full` を使い、Shiki が持つすべての言語を読めるようにする（書き手が使う言語を
 * 一覧で追わなくてよい）。Shiki はサーバーだけで動き、来訪者に配る JS には入らない。
 *
 * `createHighlighter` は非同期なので、最初の `highlight()` の呼び出しで作る。モジュールの頭で
 * 待たないので、`blog.ts → markdown.ts → highlight.ts` を tsx の CJS のローダーで読んでも、
 * top-level await で止まらない。
 */

import type {
  BundledLanguage,
  Highlighter,
  SpecialLanguage,
  ThemeRegistration,
} from "shiki/bundle/full";

const COMMENT_MARK = "#000001";

const commentOnlyTheme: ThemeRegistration = {
  name: "comment-only",
  type: "light",
  colors: {
    "editor.foreground": "#000000",
    "editor.background": "#ffffff",
  },
  tokenColors: [
    {
      scope: ["comment", "punctuation.definition.comment", "string.comment"],
      settings: { foreground: COMMENT_MARK },
    },
  ],
};

let highlighterPromise: Promise<Highlighter> | null = null;

async function getHighlighter(): Promise<Highlighter> {
  if (!highlighterPromise) {
    highlighterPromise = (async () => {
      const { createHighlighter, bundledLanguages } =
        await import("shiki/bundle/full");
      return createHighlighter({
        themes: [commentOnlyTheme],
        langs: Object.keys(bundledLanguages),
      });
    })();
  }
  return highlighterPromise;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * コードをコードのボックスの HTML（`<pre><code>`）にする。Shiki が知らない `lang` は、
 * 注釈を持たない文として組む。
 */
export async function highlight(code: string, lang?: string): Promise<string> {
  const highlighter = await getHighlighter();
  const normalized = (lang || "").toLowerCase().trim();
  const loaded = new Set([
    ...highlighter.getLoadedLanguages(),
    // Shiki がいつも受け付ける文の言語。getLoadedLanguages() には出てこない。
    "text",
    "plain",
    "plaintext",
    "txt",
  ]);
  const useLang = (loaded.has(normalized) ? normalized : "text") as
    BundledLanguage | SpecialLanguage;

  const lines = highlighter.codeToTokensBase(code, {
    lang: useLang,
    theme: commentOnlyTheme,
  });
  const body = lines
    .map((tokens) =>
      tokens
        .map((token) =>
          token.color?.toLowerCase() === COMMENT_MARK
            ? `<span class="code-comment">${escapeHtml(token.content)}</span>`
            : escapeHtml(token.content),
        )
        .join(""),
    )
    .join("\n");
  return `<pre><code>${body}</code></pre>`;
}
