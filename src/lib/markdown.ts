/**
 * Shared markdown rendering utilities for the web application.
 *
 * This module parses frontmatter and renders markdown content for the web app's
 * build-time rendering.
 */

import { Marked, Renderer, type MarkedExtension, type Tokens } from "marked";
// GFM Alert構文（> [!NOTE]等）をadmonitionのHTMLに変換するため追加
import markedAlert from "marked-alert";
// XSS防止のためmarked出力をホワイトリスト方式でサニタイズ
import { sanitize } from "@/lib/sanitize";
// ビルド時シンタックスハイライト（クライアントでチラつかせないため）
import { highlight } from "@/lib/highlight";

/**
 * Custom marked extension for fenced code blocks.
 *
 * - `mermaid` → client-side mermaid rendering target (`<div class="mermaid">`)
 * - その他 → Shiki でビルド時にシンタックスハイライト済みの `<pre class="shiki">`
 *   を返す。クライアント側でハイライトを掛け直さないのでチラつかない。
 *
 * Shiki の `highlight()` は async なので、walkTokens フックで code トークンを
 * 先読みしてハイライト結果を WeakMap に保存しておき、同期 renderer はそこから
 * 取り出すだけにする。marked 単体は同期 renderer しかサポートしないため。
 */
const highlightedCodeCache = new WeakMap<Tokens.Code, string>();

const codeExtension: MarkedExtension = {
  async: true,
  async walkTokens(token) {
    if (token.type !== "code") return;
    const code = token as Tokens.Code;
    if (code.lang === "mermaid") return;
    highlightedCodeCache.set(code, await highlight(code.text, code.lang));
  },
  renderer: {
    code(token: Tokens.Code) {
      if (token.lang === "mermaid") {
        const escaped = token.text
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;");
        return `<div class="mermaid">${escaped}</div>\n`;
      }
      const cached = highlightedCodeCache.get(token);
      if (cached) return `${cached}\n`;
      // walkTokens は async なので markdownToHtml() を await した経路では必ず埋まる。
      // ここに来るのは per-call の instance.parse() を async モード経由で呼ばなかった
      // 場合の保険。素の <pre><code> にエスケープして渡す。
      const escaped = token.text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
      return `<pre><code>${escaped}</code></pre>\n`;
    },
  },
};

/**
 * Wrap every table in a horizontally scrollable container plus a scroll hint.
 *
 * `<table>` は `width: 100%` で読む幅に収まろうとするため、狭い画面では列幅が
 * 内容の最小幅（日本語は1文字）まで潰れ、セルが1文字ずつ縦に折れる。ラッパーに
 * `overflow-x: auto` を持たせておくと、CSS 側で「セルの最小幅」を与えたときに
 * はみ出し分を横スクロールへ逃がせる（page.module.css の `.table-scroll` 参照）。
 *
 * ただし横スクロールは、切れていること自体が読者に見えないと「表を最後まで読んだ」
 * と誤解させる。そこで案内文を静的な兄弟要素として一緒に出しておき、既定では
 * CSS で隠しておく。実際に溢れている表だけ `<TableScrollHint>`（クライアント）が
 * `data-scrollable` を立てて見せる。JS が動かなければ案内は出ないだけで、表の
 * 内容が失われることはない（偽の案内を出すより、出ないほうが害が小さい）。
 *
 * 案内を表の「前」に置くのは、表より後ろだと背の高い表で読者の目に入らないため。
 * 実測では 360px で最も高い表は 2337px あり、案内を後ろに置くと、表の先頭を
 * 読み始めてから 2337px スクロールするまで「横に切れている」ことを知らせられない。
 *
 * 案内は目で見るための飾りなので `aria-hidden`——スクリーンリーダーは表全体を
 * 視覚的なスクロール位置と無関係に読み上げられる。スクロール面のほうには
 * TableScrollHint が role と名前を与える。
 *
 * 表本体の描画は marked の既定 renderer をそのまま使い、外側に足すだけに留める
 * ——セル・整列・インライン記法の出力を自前で組み直すと差分が広がるため。
 * なお `Renderer.prototype` を直接呼ぶので、table を上書きする拡張をもう一つ
 * 足すとそちらは飛ばされる。現状 table に触る拡張は他にない。
 */
const tableExtension: MarkedExtension = {
  renderer: {
    table(token: Tokens.Table) {
      const table = Renderer.prototype.table.call(this, token);
      const columnWidths = estimateColumnTextWidths(token);
      const style = columnWidths
        .map((em, index) => `--table-col-${index + 1}:${em}em`)
        .join(";");
      return (
        `<div class="table-wrap" style="${style}">` +
        `<p class="table-scroll-hint" aria-hidden="true">横にスクロールできます →</p>` +
        `<div class="table-scroll">${table}</div>` +
        `</div>\n`
      );
    },
  },
};

/** 全角として数える文字の範囲（CJK・かな・全角約物）。 */
const FULL_WIDTH_PATTERN =
  /[\u3000-\u303f\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uff00-\uff60\uffe0-\uffe6]/;

/**
 * 本文の表のセル（15px）で字種ごとに測った、1文字あたりの送り幅（px）。
 *
 * この値は CI コンテナで測ったもので、実ユーザーの環境とは一致しない。
 * `--font-gothic` は Hiragino Kaku Gothic ProN → Yu Gothic → Noto Sans JP の順に
 * 解決されるが、計測環境にはどれも入っておらず、ラテン部分は DejaVu/Liberation
 * （Arial 相当）にフォールバックしている。全角＝1em＝15px は日本語フォントに共通なので
 * 大きくは崩れないが、ラテンの送り幅は環境ごとに数%変わる。
 * したがってこれは近似である。床は列ごとに `min(6.8em, その列が要る幅)` なので、
 * 誤差が効くのは1列の床が数px ずれるところまでで、表全体の見え方は反転しない
 * （`page.module.css` の nth-child の床を参照）。
 *
 * 計測値（この環境・同じ字を20回並べて平均）: 全角15 / 数字8.34 / 大文字10.16 /
 * 小文字7.34 / 空白4.17。ASCII約物は字ごとの差が大きく（`'` 2.86 〜 `&` 10.01。
 * とくに広い `@` と `%` は下の WIDE_SYMBOLS へ退避してある）、単純平均は 5.99 になる。
 * ここでは本文の表で実際にこのバケットへ来る文字だけを数えた頻度重み付き平均
 * （543文字で 4.87）に寄せて 5 を採っている。
 * 字種で分けているのは、半角を一律に見ると誤差が大きすぎるため——小文字ばかりの語を
 * 一律8.5pxで数えると、長い説明の列で数百pxずれる。
 */
const CHAR_WIDTH_PX = {
  fullWidth: 15,
  digit: 8.4,
  upper: 10.2,
  lower: 7.4,
  punct: 5,
  space: 4.2,
  narrowSymbol: 6,
  other: 8.5,
} as const;

/**
 * `other`（8.5px）から大きく外れる記号。ASCII の約物バケット（5px）や `other` に
 * 入れたままだと、1セルに何度も出る表で判定が数十px ずれる。
 *
 * 全角側（計測15px）: 矢印・約物の類は日本語フォントで全角送りになる。表の本文に
 * 実際に出るのは主に `→`（52行）。`↔` `○` `😀` も各1行あるがここには入れていない
 * ——いずれも該当列が 6.8em で頭打ちになるので、幅の差が床に効かないため。
 * `@`（15.2px）と `%`（13.3px）は ASCII だが約物
 * バケットの5pxとは開きすぎるので、ここで全角扱いに寄せる。
 * 狭い側（計測6px以下）: `°` は伝統色辞典の「0°〜15°」で1セルに何度も出る。
 *
 * `×`(8.76) `÷`(8.23) `±`(8.23) は `other` との差が1px未満なので入れない。
 */
const WIDE_SYMBOLS = new Set([
  "→",
  "←",
  "↑",
  "↓",
  "※",
  "…",
  "—",
  "―",
  "@",
  "%",
]);
const NARROW_SYMBOLS = new Set(["°", "′", "″"]);

/**
 * 見出し行（`th`）は font-weight: 600 なので、同じ字でもラテンだけ広くなる。
 * 実測の比（`th` / `td`）: 小文字1.097 / 大文字1.026 / `app/` 1.056。
 * 数字と全角は 1.000 で変わらない。ここを見ないと、見出しだけ床が足りなくなる
 * （実測: `app/` が2行に割れた）。
 */
const BOLD_FACTOR = {
  lower: 1.1,
  upper: 1.03,
  punct: 1.06,
  other: 1.06,
} as const;

/**
 * インラインコードは 0.85em の等幅（実測 1文字 7.65px）で、左右に座布団の
 * パディングが付く（実測 左右 4.4625px ずつで計 8.925px）。地の文と同じ幅では合わない。
 */
const CODE_CHAR_WIDTH_PX = 7.7;
const CODE_CHIP_PADDING_PX = 9;

/**
 * コードの中の全角（`# 見出し` のように日本語を含む記法の見本）は等幅でも
 * 全角のまま送られる（実測 13px）。半角と同じ幅で数えると、記法の早見表で
 * セルあたり十数px 足りなくなる。
 */
const CODE_FULL_WIDTH_PX = 13;

/**
 * 列ごとに「折り返さずに置いたら何文字ぶん要るか」を見積もり、em で返す。
 *
 * 列の中で最も幅を食うセルを採る。パディングと罫は画面幅によって変わる
 * （狭い画面で詰める）ので、ここには含めず CSS 側で足す。
 *
 * px ではなく em で出すのは、CSS 側のキャップが `6.8em` だから。px で出すと字が
 * 大きくなったときにキャップだけが伸び、見積もり側が置き去りになって `min()` が px を
 * 採り、床が文字に対して小さくなる。`html { font-size: 20px }` を注入して測ると、
 * px 版は 360px・全203表で 2文字/行以下のセルが 74個（24px 相当で128個）に戻ったのに対し、
 * em 版は 0個（24px 相当で10個）だった。
 *
 * ただしこの不具合に読者が到達する経路は、いまのところ無い。globals.css が
 * `html, body { font-size: 16px }` と px で固定しているため、ブラウザの既定フォント
 * サイズ設定は効かない（CDP の Page.setFontSizes でも --blink-settings でも `html` は
 * 16px のままであることを確認）。著者CSSを上書きできる「最小フォントサイズ」設定では
 * `em` も追随しない（em は指定 font-size で解決されるため）ので、そちらは em でも
 * 救えない。つまり em 化はいまのところ防御的な措置で、来訪者に届く不具合を
 * 直したわけではない。それでもコストが無く、`font-size: 16px` の固定が外れたときに
 * 効くので em を採る。
 *
 * 用途は床（min-width）の高さ。床は列ごとに `min(6.8em, その列が要る幅)` にする。
 * 列の自然幅で頭打ちにするので、床の合計はその表の自然幅とほぼ同じところに収まり、
 * 「表全体が収まるか」を判定する必要が無くなる。ただし丸めと下の遊びが乗るぶん、
 * 合計が自然幅を上回ることはある（実測: 280/360/375/390/720px で4個 / 1280px で1個・最大 +42px）。
 *
 * 見積もりは「多めに倒す」のではなく実描画に寄せる。装飾記号を落とし、字種ごとに
 * 測った送り幅で数える。誤差が残っても、効くのは1列の床が数pxずれるところまでで、
 * 表全体の見え方が反転することはない。
 */
function estimateColumnTextWidths(token: Tokens.Table): number[] {
  const rows = [token.header, ...token.rows];
  const columnWidths = new Array<number>(token.header.length).fill(0);
  rows.forEach((row, rowIndex) => {
    const isHeader = rowIndex === 0;
    row.forEach((cell, index) => {
      if (index >= columnWidths.length) return;
      columnWidths[index] = Math.max(
        columnWidths[index],
        estimateCellWidth(cell.text, isHeader),
      );
    });
  });
  return columnWidths.map((width) =>
    Number((width / BASE_FONT_PX + COLUMN_SLACK_EM).toFixed(3)),
  );
}

/** 見積もりの基準にしたセルの字送り（px）。font-size: 0.9375rem = 15px。 */
const BASE_FONT_PX = 15;

/**
 * 列ごとの見積もりに足す遊び（em）。0.4em ＝ 既定の字送りで 6px。
 *
 * 字種ごとの平均を使う以上、個々の字では必ずずれる。遊びが足りないと、床が上限に
 * 達していない列でも実幅に届かず、セルが不要に2行へ割れる（`Q04` は実描画 28.36px に
 * 対し見積もり 26.8px。`Q` の実幅 11.67px を大文字平均 10.2px で数えるため −1.47px。
 * `Phase C` も実描画 57.55px に対し 57.2px で 0.35px 足りず、同じ列で `Phase A` は
 * 1行・`Phase C` は2行というギザギザになっていた）。
 *
 * 「床が 6.8em の上限に達していない列は折り返さない」を全203表×6幅で測って値を決めた:
 *
 *   遊び    折り返す箇所（280/360/375/390/720/1280px）  横スクロールになる表
 *   0.2em   1 / 0 / 6 / 0 / 0 / 4                       158/71/59/53/2/2
 *   0.4em   1 / 0 / 0 / 0 / 0 / 0                       158/72/60/54/2/2
 *   0.5em   0 / 0 / 0 / 0 / 0 / 0                       158/72/61/54/2/2
 *
 * 0.5em にすれば全幅ゼロになるが、遊びは短いセルの表の床も押し上げるので、
 * 1月カレンダー（7列・全セル1〜2文字）が 320px で18px 溢れるようになる（0.4em なら
 * 8px で、案内を出す閾値の内側に収まる）。折り返しを1件残す代わりにカレンダーの
 * 一望性を保つほうを採って 0.4em にした。残る1件は 280px の "Windows" で、
 * 最も狭い幅の1セル。床は 6.8em で頭打ちなので、この遊びが効くのは「自然幅が
 * 6.8em に届かない短い列」だけ。
 */
const COLUMN_SLACK_EM = 0.4;

/**
 * セル1つの文字幅。`<br>` で改行される表があるので、区切って最も長い行を採る。
 *
 * markdown の装飾記号（``・リンクの `[]()` など）は描画されないので落とす。
 * 落とさないと、強調した数字が並ぶカレンダーのような表で数十px 過大になり、
 * 収まるはずの表に床が敷かれる。
 */
function estimateCellWidth(text: string, isHeader: boolean): number {
  const segments = text.split(/<br\s*\/?>/i);
  let widest = 0;
  for (const segment of segments) {
    widest = Math.max(widest, estimateSegmentWidth(segment, isHeader));
  }
  return widest;
}

/** `<br>` で区切った1行ぶんの幅。インラインコードだけ等幅＋座布団で数える。 */
function estimateSegmentWidth(segment: string, isHeader: boolean): number {
  let width = 0;
  // バッククォートで囲まれた部分をコードとして取り出し、残りを地の文として扱う
  const parts = segment.split(/(`+[^`]*`+)/);
  for (const part of parts) {
    if (!part) continue;
    const code = part.match(/^(`+)([\s\S]*?)\1$/);
    if (code) {
      width += estimateCodeWidth(code[2]) + CODE_CHIP_PADDING_PX;
      continue;
    }
    width += estimatePlainTextWidth(stripInlineMarkdown(part), isHeader);
  }
  return width;
}

/** インラインコード1つぶんの文字幅（座布団のパディングは含めない）。 */
function estimateCodeWidth(text: string): number {
  let width = 0;
  for (const char of text) {
    width += FULL_WIDTH_PATTERN.test(char)
      ? CODE_FULL_WIDTH_PX
      : CODE_CHAR_WIDTH_PX;
  }
  return width;
}

/** 描画されない markdown の記号を落とす（強調・リンク・画像・エスケープ）。 */
function stripInlineMarkdown(text: string): string {
  return text
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/(\*\*|__)(.*?)\1/g, "$2")
    .replace(/(\*|_)(.*?)\1/g, "$2")
    .replace(/~~(.*?)~~/g, "$1")
    .replace(/\\(.)/g, "$1");
}

/**
 * 地の文の幅。字種ごとの送り幅で数える。
 *
 * `isHeader` のときはラテンだけ太字ぶん広げる（見出し行は font-weight: 600）。
 * 数字と全角は太字でも送りが変わらないので掛けない。
 */
function estimatePlainTextWidth(text: string, isHeader: boolean): number {
  const bold = (base: number, factor: number) =>
    isHeader ? base * factor : base;
  let width = 0;
  for (const char of text) {
    if (FULL_WIDTH_PATTERN.test(char)) width += CHAR_WIDTH_PX.fullWidth;
    else if (char === " ") width += CHAR_WIDTH_PX.space;
    else if (char >= "0" && char <= "9") width += CHAR_WIDTH_PX.digit;
    else if (char >= "A" && char <= "Z")
      width += bold(CHAR_WIDTH_PX.upper, BOLD_FACTOR.upper);
    else if (char >= "a" && char <= "z")
      width += bold(CHAR_WIDTH_PX.lower, BOLD_FACTOR.lower);
    else if (WIDE_SYMBOLS.has(char)) width += CHAR_WIDTH_PX.fullWidth;
    else if (NARROW_SYMBOLS.has(char)) width += CHAR_WIDTH_PX.narrowSymbol;
    else if (/[!-/:-@[-`{-~]/.test(char))
      width += bold(CHAR_WIDTH_PX.punct, BOLD_FACTOR.punct);
    else width += bold(CHAR_WIDTH_PX.other, BOLD_FACTOR.other);
  }
  return width;
}

/**
 * Heading entry for the table of contents.
 *
 * Produced as a side-effect of rendering markdown to HTML so that the
 * `id` here is the *same string* assigned to the corresponding
 * `<h{level} id="...">` element — there is no second, independent id path.
 */
export interface Heading {
  level: number;
  text: string;
  id: string;
}

/**
 * Generate a URL-friendly heading ID from text.
 * Used by the heading renderer as the single source of truth for heading IDs.
 */
export function generateHeadingId(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Decode the HTML entities that marked emits when escaping inline content
 * (e.g. inline code containing angle brackets: `<body>` -> `&lt;body&gt;`).
 *
 * Applied to the tag-stripped heading text before it is used for both the
 * TOC display text and the id slug, so that code content like `<body>` is
 * preserved in the TOC instead of being dropped, and the id becomes a clean
 * slug ("body") rather than a mangled one ("ltbodygt").
 *
 * `&amp;` is decoded LAST to avoid double-decoding (so "&amp;lt;" does not
 * turn into "<").
 */
function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&");
}

/**
 * Create a heading renderer extension that assigns id attributes AND collects
 * the heading list for the table of contents in the same pass.
 *
 * This is the single source of truth for heading IDs: the id written to the
 * `<h{depth} id="...">` element and the id pushed into `headings` are produced
 * by the exact same code, so the TOC can never disagree with the DOM anchors.
 *
 * The duplicate-ID counter and the collected headings array are per-instance
 * closure state. A FRESH extension (and Marked instance) is created for every
 * markdownToHtml() call, so this state is never shared across concurrent
 * parses — see createMarkedInstance() / markdownToHtml().
 */
function createHeadingExtension(): {
  extension: MarkedExtension;
  getHeadings: () => Heading[];
} {
  const idCount = new Map<string, number>();
  const headings: Heading[] = [];

  const getHeadings = () => headings;

  const extension: MarkedExtension = {
    renderer: {
      heading({ tokens, depth }: Tokens.Heading) {
        // Use the built-in parser to render inline tokens to HTML.
        // This preserves marked's default HTML escaping behavior.
        const inner = this.parser.parseInline(tokens);
        // Strip HTML tags, then decode the entities marked produced so that
        // inline code content (e.g. `<body>`) survives in both text and id.
        // Trim surrounding whitespace left behind by removed tags (e.g. images).
        const text = decodeHtmlEntities(inner.replace(/<[^>]*>/g, "")).trim();
        const baseId = generateHeadingId(text);
        const count = idCount.get(baseId) || 0;
        idCount.set(baseId, count + 1);
        const id = count === 0 ? baseId : `${baseId}-${count}`;
        headings.push({ level: depth, text, id });
        return `<h${depth} id="${id}">${inner}</h${depth}>\n`;
      },
    },
  };

  return { extension, getHeadings };
}

/**
 * Build a fresh Marked instance with code/highlight, heading, and alert
 * extensions, plus a getter for the headings that instance collects.
 *
 * A NEW instance is created per markdownToHtml() call rather than reusing a
 * module-level singleton. The heading extension carries mutable per-parse state
 * (the duplicate-ID counter and the collected headings), and markdownToHtml()
 * awaits Shiki between reset and collection. A shared instance would let two
 * concurrent parses push into the same arrays and return {html, headings} that
 * disagree — a real risk because getBlogPostBySlug() is not deduped and Next.js
 * runs generateMetadata, the page body and opengraph-image concurrently for the
 * same slug. Per-call instances isolate this state structurally.
 *
 * This is cheap: Shiki's highlighter is globally cached in highlight.ts and
 * codeExtension's cache is a per-token WeakMap, so nothing heavy is rebuilt.
 * markedAlert() is included to support GFM Alert syntax (> [!NOTE], etc.).
 */
function createMarkedInstance(): {
  instance: Marked;
  getHeadings: () => Heading[];
} {
  const { extension: headingExtension, getHeadings } = createHeadingExtension();
  const instance = new Marked(
    codeExtension,
    tableExtension,
    headingExtension,
    markedAlert(),
  );
  return { instance, getHeadings };
}

/** Parse YAML frontmatter from a markdown string. Returns { data, content }. */
export function parseFrontmatter<T>(raw: string): { data: T; content: string } {
  const normalized = raw.replace(/\r\n/g, "\n");
  const match = normalized.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) {
    return { data: {} as T, content: normalized };
  }

  const yamlBlock = match[1];
  const content = match[2];
  const data = parseYamlBlock(yamlBlock) as T;

  return { data, content };
}

/**
 * Minimal YAML parser for frontmatter blocks.
 * Handles: quoted strings, unquoted strings, booleans, nulls, numbers,
 * inline arrays, and block arrays.
 */
function parseYamlBlock(yaml: string): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  const lines = yaml.split("\n");

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const keyMatch = line.match(/^([A-Za-z_][A-Za-z0-9_-]*):\s*(.*)/);
    if (!keyMatch) {
      i++;
      continue;
    }

    const key = keyMatch[1];
    const value = keyMatch[2].trim();

    // Inline array: ["a", "b"]
    if (value.startsWith("[")) {
      const arrayContent = value.slice(1, value.lastIndexOf("]"));
      if (arrayContent.trim() === "") {
        result[key] = [];
      } else {
        result[key] = arrayContent.split(",").map((s) =>
          s
            .trim()
            .replace(/^"(.*)"$/, "$1")
            .replace(/^'(.*)'$/, "$1"),
        );
      }
      i++;
      continue;
    }

    // Check for block array on following lines
    if (value === "" || value === "") {
      const items: string[] = [];
      let j = i + 1;
      while (j < lines.length) {
        const itemMatch = lines[j].match(/^\s+-\s+(.*)/);
        if (itemMatch) {
          items.push(
            itemMatch[1]
              .trim()
              .replace(/^"(.*)"$/, "$1")
              .replace(/^'(.*)'$/, "$1"),
          );
          j++;
        } else {
          break;
        }
      }
      if (items.length > 0) {
        result[key] = items;
        i = j;
        continue;
      }
    }

    // Scalar values
    result[key] = parseYamlScalar(value);
    i++;
  }

  return result;
}

function parseYamlScalar(value: string): unknown {
  // Quoted string
  if (value.startsWith('"') && value.endsWith('"')) {
    return value.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, "\\");
  }
  if (value.startsWith("'") && value.endsWith("'")) {
    return value.slice(1, -1);
  }

  // null
  if (value === "null" || value === "~" || value === "") {
    return null;
  }

  // boolean
  if (value === "true") return true;
  if (value === "false") return false;

  // number
  if (/^-?\d+(\.\d+)?$/.test(value)) {
    return Number(value);
  }

  // Unquoted string
  return value;
}

/**
 * Convert markdown to HTML using the `marked` library, returning both the
 * sanitized HTML and the collected heading list for the table of contents.
 *
 * The headings are gathered by the heading renderer as it assigns element ids,
 * making this the single source of truth: `headings[i].id` is guaranteed to be
 * the id on the matching `<h{level}>` in `html`.
 *
 * Async because Shiki's syntax highlighter is async-initialised once per
 * process. Subsequent calls reuse the cached highlighter, so the per-call
 * cost is just tokenization.
 */
export async function markdownToHtml(
  md: string,
): Promise<{ html: string; headings: Heading[] }> {
  // A fresh Marked instance per call keeps heading-collection state local, so
  // concurrent calls never cross-pollute each other's html/headings.
  const { instance, getHeadings } = createMarkedInstance();
  // `async: true` enables async walkTokens (used by codeExtension to call Shiki).
  const result = await instance.parse(md, {
    gfm: true,
    breaks: false,
    async: true,
  });
  // Sanitize to strip dangerous tags/attributes (XSS prevention)
  const html = sanitize(result);
  return { html, headings: getHeadings() };
}

/**
 * Estimate reading time in minutes.
 * Japanese: ~500 chars/min. English: ~200 words/min.
 * Uses a blended approach based on content composition.
 */
export function estimateReadingTime(text: string): number {
  // Count Japanese characters (CJK Unified Ideographs + Hiragana + Katakana)
  const japaneseChars = (
    text.match(/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]/g) || []
  ).length;
  // Count English words (sequences of Latin characters)
  const englishWords = (text.match(/[a-zA-Z]+/g) || []).length;

  const japaneseMinutes = japaneseChars / 500;
  const englishMinutes = englishWords / 200;

  return Math.max(1, Math.ceil(japaneseMinutes + englishMinutes));
}
