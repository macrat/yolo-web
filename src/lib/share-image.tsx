/**
 * サイトの外に出る画像（OGP 画像と、来訪者が保存する結果の画像）を描く（DESIGN.md §10）。
 *
 * 枠と字の段は `share-image-frame.ts` から取る。中身は、上から補助情報・数字の結果・名前・読み・副題の順に、中身の
 * 左端に揃えて置く。色が主題のページでは、名前の左に色見本を1つ置く。
 *
 * 字の組み方:
 * - 書体は字の範囲で分ける。U+0000-007F は IBM Plex Sans、ほかは和文の書体で、名前と数字の結果は Zen Antique
 *   （Zen Antique に無い字を含むときは和文を丸ごと BIZ UDGothic）、補助情報・読み・副題は BIZ UDPGothic。
 *   Satori は書体の並びを渡すと字ごとに書体を選び分けないので、字の範囲で分けた書体のまとまりに書体を1つずつ渡す。
 * - 行は、ここで描くのと同じ書体のファイルの送り幅で測って決め、1行ずつ描く。どの字も、画面の見出しと同じ所で折る:
 *   文節の切れ目（splitIntoPhrases）・文節の中の空白の後ろ（ダッシュの前を除く）・閉じ括弧の直後。1行に収まらない
 *   単位だけを、割れない字の組（境で割っても禁則を破らない字の並び）を書体のまとまりごとに集めて分け、収まらない
 *   集まりは組に、それでも収まらない組は字に分ける（breakUnits）。文節の頭の空白は前の文節の終わりに移し、行の
 *   終わりの空白は描かない。行を決めてから描くので、名前の段を選ぶときに数えた行の数と、描いた行の数が同じになる。
 *
 * 書体を取れないときは例外を投げる。画像はビルドで書き出すので、違う書体の画像が出荷される前にビルドが止まる。
 */
import "server-only";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import { parse, type Font } from "opentype.js";
import { BASE_URL, SITE_NAME } from "@/lib/constants";
import {
  cannotEndLine,
  cannotStartLine,
  isClosingBracket,
  parenDepthAfter,
  splitIntoPhrases,
} from "@/lib/phrase-breaks";
import { canSetInZenAntique } from "@/lib/zen-antique-charset";
import { INK, INK_2, PAPER, RULE, RULE_2 } from "@/lib/token-hex";
import * as frame from "@/lib/share-image-frame";

/** 画像に書く中身。 */
export interface ShareImageContent {
  /** 補助情報。何の画像かを短く言う（「{診断名}の結果」「ブログ」「伝統色辞典」）。 */
  aux?: string;
  /**
   * 数字の結果（「10問中8問正解」「72点」）。1行に収まらないときに折ってよい所で分けた並び
   * （`["10問中", "8問正解"]`）で渡し、並びの1つの中では折らない。
   */
  numeric?: readonly string[];
  /** 名前。そのページの h1 と同じ出どころの字。 */
  name: string;
  /** 名前の読み。 */
  reading?: string;
  /** 副題。中身が枠の縦に収まらないときは、文節の切れ目で切って「…」で終える。 */
  subtitle?: string;
  /** 色見本の色（hex）。主題が色であるページだけが持つ。 */
  swatch?: string;
}

const SHARE_IMAGE_SIZE = {
  width: frame.SHARE_IMAGE_WIDTH,
  height: frame.SHARE_IMAGE_HEIGHT,
};

/** 画像の代替テキスト。画像に書いてある字を、書いてある順に言う。 */
export function shareImageAlt(content: ShareImageContent): string {
  return [
    SITE_NAME,
    content.aux,
    content.numeric?.join(""),
    content.name,
    content.reading,
    content.subtitle,
  ]
    .filter((part): part is string => part !== undefined && part !== "")
    .join(" ");
}

/** 値を、オブジェクトのキーを名前の順に並べた JSON にする。ビルドをまたいで同じ字になる。 */
function stableJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(",")}]`;
  if (value !== null && typeof value === "object") {
    return `{${Object.keys(value)
      .sort()
      .filter((key) => (value as Record<string, unknown>)[key] !== undefined)
      .map(
        (key) =>
          `${JSON.stringify(key)}:${stableJson((value as Record<string, unknown>)[key])}`,
      )
      .join(",")}}`;
  }
  return JSON.stringify(value);
}

/** 枠の寸法のモジュールの値（関数を除く）。版の値 SHARE_IMAGE_VERSION を含む。 */
const FRAME_VALUES = Object.fromEntries(
  Object.entries(frame).filter(([, value]) => typeof value !== "function"),
);

/**
 * 画像の URL に付ける版。中身と枠の寸法から作るので、名前や組み方の値を変えたページだけ URL が変わり、SNS が
 * 画像を取り直す。
 */
function shareImageVersion(content: ShareImageContent): string {
  return createHash("sha256")
    .update(stableJson(content) + stableJson(FRAME_VALUES))
    .digest("hex")
    .slice(0, 16);
}

/**
 * ページの画像の URL。画像はページの URL の下の Route Handler `opengraph-image` が描く。`og:image`・`twitter:image`・
 * 構造化データの `image` など、画像を指す所はどれもここから取る。pagePath はページの URL のパス
 * （`/blog/markdown-cheatsheet`）。
 */
export function shareImageUrl(
  pagePath: string,
  content: ShareImageContent,
): string {
  const base = pagePath === "/" ? "" : pagePath;
  return `${BASE_URL}${base}/opengraph-image?v=${shareImageVersion(content)}`;
}

/**
 * ページの `generateMetadata` が `openGraph.images` に渡す画像。画像の Route Handler と同じ中身から作るので、
 * 代替テキストが画像に書いた字と食い違わない。Next.js は `twitter:image` をこれから補う。
 */
export interface ShareOpenGraphImage {
  url: string;
  width: number;
  height: number;
  alt: string;
}

export function shareOpenGraphImage(
  pagePath: string,
  content: ShareImageContent,
): ShareOpenGraphImage {
  return {
    url: shareImageUrl(pagePath, content),
    width: frame.SHARE_IMAGE_WIDTH,
    height: frame.SHARE_IMAGE_HEIGHT,
    alt: shareImageAlt(content),
  };
}

// ---------------------------------------------------------------------------
// 書体
// ---------------------------------------------------------------------------

const PLEX = "IBM Plex Sans";
const ZEN_ANTIQUE = "Zen Antique";
const BIZ_UDP_GOTHIC = "BIZ UDPGothic";
const BIZ_UD_GOTHIC = "BIZ UDGothic";

type Family =
  | typeof PLEX
  | typeof ZEN_ANTIQUE
  | typeof BIZ_UDP_GOTHIC
  | typeof BIZ_UD_GOTHIC;

/** Google Fonts の CSS の URL。User-Agent を送らないと、分割されていない TrueType を1つ返す。 */
const GOOGLE_FONTS_CSS_URL = "https://fonts.googleapis.com/css2";

/** 画面と同じ `@ibm/plex-sans` 1.1.0 の WOFF（Satori は WOFF2 を読めない）。 */
const PLEX_REGULAR_PATH = path.join(
  process.cwd(),
  "src/fonts/ibm-plex-sans/IBMPlexSans-Regular.woff",
);

interface LoadedFont {
  data: ArrayBuffer;
  font: Font;
}

type LoadedFonts = Record<Family, LoadedFont>;

const TRUETYPE_MAGIC = [0x00, 0x01, 0x00, 0x00];

async function fetchGoogleFont(family: string): Promise<ArrayBuffer> {
  const cssUrl = `${GOOGLE_FONTS_CSS_URL}?family=${family.replaceAll(" ", "+")}`;
  const cssResponse = await fetch(cssUrl);
  if (!cssResponse.ok) {
    throw new Error(`${family}: ${cssUrl} returned ${cssResponse.status}`);
  }
  const css = await cssResponse.text();
  const urls = [...css.matchAll(/url\((https:[^)]+\.ttf)\)/g)].map((m) => m[1]);
  if (urls.length !== 1) {
    throw new Error(
      `${family}: expected one TrueType file in ${cssUrl}, got ${urls.length}`,
    );
  }
  const fontResponse = await fetch(urls[0]);
  if (!fontResponse.ok) {
    throw new Error(`${family}: ${urls[0]} returned ${fontResponse.status}`);
  }
  const data = await fontResponse.arrayBuffer();
  const head = new Uint8Array(data, 0, Math.min(4, data.byteLength));
  if (!TRUETYPE_MAGIC.every((byte, index) => head[index] === byte)) {
    throw new Error(`${family}: ${urls[0]} is not a TrueType file`);
  }
  return data;
}

async function readPlex(): Promise<ArrayBuffer> {
  const buffer = await readFile(PLEX_REGULAR_PATH);
  return buffer.buffer.slice(
    buffer.byteOffset,
    buffer.byteOffset + buffer.byteLength,
  ) as ArrayBuffer;
}

function toLoaded(data: ArrayBuffer): LoadedFont {
  return { data, font: parse(data) };
}

let fontsPromise: Promise<LoadedFonts> | undefined;

/** 描くのに使う4つの書体。ビルド（またはサーバー）の中で1度だけ取り、失敗したら次の呼び出しで取り直す。 */
function loadFonts(): Promise<LoadedFonts> {
  fontsPromise ??= Promise.all([
    readPlex(),
    fetchGoogleFont(ZEN_ANTIQUE),
    fetchGoogleFont(BIZ_UDP_GOTHIC),
    fetchGoogleFont(BIZ_UD_GOTHIC),
  ]).then(
    ([plex, zen, udp, ud]) => ({
      [PLEX]: toLoaded(plex),
      [ZEN_ANTIQUE]: toLoaded(zen),
      [BIZ_UDP_GOTHIC]: toLoaded(udp),
      [BIZ_UD_GOTHIC]: toLoaded(ud),
    }),
    (error: unknown) => {
      fontsPromise = undefined;
      throw error;
    },
  );
  return fontsPromise;
}

// ---------------------------------------------------------------------------
// 行を決める
// ---------------------------------------------------------------------------

/** 書体のまとまり。字の範囲で分けた字の並びで、1つの書体で組む。 */
interface Run {
  text: string;
  family: Family;
}

/** 1行。描く字（行の頭と終わりに空白を持たない）と、その幅。 */
interface Line {
  runs: Run[];
  width: number;
}

/** 字の書体を選ぶ規則。和文の字に使う書体を持つ。 */
interface TextStyle {
  jaFamily: Family;
  size: number;
}

const PLEX_LAST_CODE_POINT = 0x7f;
const LEADING_SPACES = /^\s+/u;
const TRAILING_SPACES = /\s+$/u;

const graphemeSegmenter = new Intl.Segmenter("ja", {
  granularity: "grapheme",
});

function graphemes(text: string): string[] {
  return [...graphemeSegmenter.segment(text)].map(({ segment }) => segment);
}

function toRuns(text: string, jaFamily: Family): Run[] {
  const runs: Run[] = [];
  for (const char of text) {
    const family =
      char.codePointAt(0)! <= PLEX_LAST_CODE_POINT ? PLEX : jaFamily;
    const last = runs.at(-1);
    if (last && last.family === family) last.text += char;
    else runs.push({ text: char, family });
  }
  return runs;
}

function measure(text: string, style: TextStyle, fonts: LoadedFonts): number {
  return toRuns(text, style.jaFamily).reduce(
    (sum, run) =>
      sum + fonts[run.family].font.getAdvanceWidth(run.text, style.size),
    0,
  );
}

/** 文節の頭の空白を、前の文節の終わりに移す。行の頭に空白が出ない。 */
function moveLeadingSpaces(phrases: readonly string[]): string[] {
  const moved: string[] = [];
  for (const phrase of phrases) {
    const leading = phrase.match(LEADING_SPACES)?.[0] ?? "";
    if (leading !== "" && moved.length > 0) {
      moved[moved.length - 1] += leading;
      moved.push(phrase.slice(leading.length));
    } else {
      moved.push(phrase);
    }
  }
  return moved.filter((phrase) => phrase !== "");
}

/**
 * 文節を、画面の見出しが文節の中でも折る所で分ける。空白の後ろと、閉じ括弧の直後。ただし、丸括弧の一続きの中と、
 * 行の頭に置かない字（ダッシュを含む。画面の見出しはダッシュの前の空白を折れない空白にする）の前と、行の終わりに
 * 置かない字（開き括弧）の後ろでは割らない（§4）。depth は、文節の前までに閉じていない丸括弧の数。
 */
function splitAtInnerBreaks(phrase: string, depth: number): string[] {
  const pieces: string[] = [];
  let current = "";
  let parenDepth = depth;
  const chars = [...phrase];
  chars.forEach((char, index) => {
    current += char;
    parenDepth = parenDepthAfter(parenDepth, char);
    const rest = chars.slice(index + 1).join("");
    // 空白は前の単位の終わりに付けるので、空白の前では割らない。
    const breaksAfter =
      (/\s/u.test(char) || isClosingBracket(char)) && !/^\s/u.test(rest);
    if (
      breaksAfter &&
      parenDepth === 0 &&
      rest !== "" &&
      !cannotStartLine(rest) &&
      !cannotEndLine(current.trimEnd())
    ) {
      pieces.push(current);
      current = "";
    }
  });
  if (current !== "") pieces.push(current);
  return pieces;
}

/**
 * 文を、画面の見出しが折る所（DESIGN.md §4）で分けた単位。文節の切れ目・文節の中の空白の後ろ・閉じ括弧の直後で、
 * 丸括弧の一続きの中は割らない。文節の頭の空白は前の単位の終わりに付く。
 */
export function lineBreakUnits(text: string): string[] {
  let depth = 0;
  return moveLeadingSpaces(splitIntoPhrases(text)).flatMap((phrase) => {
    const pieces = splitAtInnerBreaks(phrase, depth);
    depth = parenDepthAfter(depth, phrase);
    return pieces;
  });
}

/**
 * text を、割れない字の組に分ける。組の境で割れば、行の頭と終わりの禁則（§4）を破らない。行の頭に置かない字と
 * 空白は前の字に付け、行の終わりに置かない字（空白を除いた終わりで見る）の後ろの字はその字に付ける。空白は行の頭に
 * 来ても描かないので、空白の前で割る意味は無い。
 */
function unbreakableClusters(text: string): string[] {
  const clusters: string[] = [];
  for (const char of graphemes(text)) {
    const last = clusters.at(-1);
    if (
      last !== undefined &&
      (/\s/u.test(char) ||
        cannotStartLine(char) ||
        cannotEndLine(last.trimEnd()))
    ) {
      clusters[clusters.length - 1] = last + char;
    } else {
      clusters.push(char);
    }
  }
  return clusters;
}

/**
 * 行に詰める単位。1行に収まる単位はそのまま使う。収まらない単位は、割れない字の組を書体のまとまりごとに集め、
 * 1行に収まる集まりはそのまま、収まらない集まりは組に、それでも収まらない組は字に分ける。どの切れ端も1行に収まる。
 * 組を字に分けるのは、行の頭に置かない字が1行より長く続くときだけで、画面の見出しも、ほかに折り所が無ければ禁則の
 * 字の前で折って枠に収める。
 */
function breakUnits(
  units: readonly string[],
  style: TextStyle,
  maxWidth: number,
  fonts: LoadedFonts,
): string[] {
  const fits = (text: string) =>
    measure(text.replace(TRAILING_SPACES, ""), style, fonts) <= maxWidth;
  return units.flatMap((unit) => {
    if (fits(unit)) return [unit];
    // 各組を、その頭の字が属する書体のまとまりの集まりに入れる。
    const runOfOffset: number[] = [];
    toRuns(unit, style.jaFamily).forEach(({ text }, runIndex) => {
      for (let i = 0; i < text.length; i++) runOfOffset.push(runIndex);
    });
    const groups: string[][] = [];
    let offset = 0;
    let groupRun = -1;
    for (const cluster of unbreakableClusters(unit)) {
      const run = runOfOffset[offset];
      if (run === groupRun) groups[groups.length - 1].push(cluster);
      else groups.push([cluster]);
      groupRun = run;
      offset += cluster.length;
    }
    return groups.flatMap((clusters) => {
      const joined = clusters.join("");
      if (fits(joined)) return [joined];
      return clusters.flatMap((cluster) =>
        fits(cluster) ? [cluster] : graphemes(cluster),
      );
    });
  });
}

/** 単位を、前から順に1行に収まるだけ詰める。 */
function fillLines(
  units: readonly string[],
  style: TextStyle,
  maxWidth: number,
  fonts: LoadedFonts,
): Line[] {
  const texts: string[] = [];
  let current = "";
  for (const unit of units) {
    const candidate = current + unit;
    if (
      current !== "" &&
      measure(candidate.replace(TRAILING_SPACES, ""), style, fonts) > maxWidth
    ) {
      texts.push(current);
      current = unit.replace(LEADING_SPACES, "");
    } else {
      current = candidate;
    }
  }
  if (current !== "") texts.push(current);
  return texts
    .map((text) => text.replace(TRAILING_SPACES, ""))
    .filter((text) => text !== "")
    .map((text) => ({
      runs: toRuns(text, style.jaFamily),
      width: measure(text, style, fonts),
    }));
}

/** 文のどの単位（lineBreakUnits）も、幅 maxWidth の1行に収まるか。 */
function everyUnitFits(
  text: string,
  style: TextStyle,
  maxWidth: number,
  fonts: LoadedFonts,
): boolean {
  return lineBreakUnits(text).every(
    (unit) => measure(unit.trim(), style, fonts) <= maxWidth,
  );
}

/** 文を、画面の見出しと同じ折り所で、幅 maxWidth の行に折る。 */
function breakText(
  text: string,
  style: TextStyle,
  maxWidth: number,
  fonts: LoadedFonts,
): Line[] {
  return fillLines(
    breakUnits(lineBreakUnits(text), style, maxWidth, fonts),
    style,
    maxWidth,
    fonts,
  );
}

/** 見出しの書体で組む字の和文の書体。Zen Antique に無い字を含むときは、和文を丸ごと BIZ UDGothic で組む。 */
function headingFamily(text: string): Family {
  return canSetInZenAntique(text) ? ZEN_ANTIQUE : BIZ_UD_GOTHIC;
}

// ---------------------------------------------------------------------------
// 中身を組む
// ---------------------------------------------------------------------------

type BlockKind = "aux" | "numeric" | "name" | "reading" | "subtitle";

/** 中身の1段。 */
export interface Block {
  kind: BlockKind;
  size: number;
  lineHeight: number;
  color: string;
  lines: Line[];
}

/** 描く前に決めた中身の組み。 */
export interface ShareImageLayout {
  /** 選んだ名前の段。 */
  nameSize: number;
  /** 補助情報。見本を持つときも、見本の上に中身の左端から置く。 */
  aux?: Block;
  /** 補助情報より下の段（見本を持つときは見本の右に置く）。 */
  column: Block[];
  /** 色見本の色。 */
  swatch?: string;
  /** 副題を切ったか。 */
  subtitleTruncated: boolean;
  /** 中身の高さ。 */
  height: number;
}

/** 前の段から次の段までのあいだ。 */
const GAP_AFTER: Record<BlockKind, number> = {
  aux: frame.GAP_AFTER_AUX,
  numeric: frame.GAP_AFTER_NUMERIC,
  name: frame.GAP_AFTER_NAME,
  reading: frame.GAP_AFTER_READING,
  subtitle: 0,
};

function blocksHeight(blocks: readonly Block[]): number {
  return blocks.reduce(
    (sum, block, index) =>
      sum +
      (index > 0 ? GAP_AFTER[blocks[index - 1].kind] : 0) +
      block.lines.length * block.lineHeight,
    0,
  );
}

function auxBlock(
  kind: BlockKind,
  text: string,
  maxWidth: number,
  fonts: LoadedFonts,
): Block {
  return {
    kind,
    size: frame.AUX_SIZE,
    lineHeight: frame.AUX_LINE_HEIGHT,
    color: INK_2,
    lines: breakText(
      text,
      { jaFamily: BIZ_UDP_GOTHIC, size: frame.AUX_SIZE },
      maxWidth,
      fonts,
    ),
  };
}

/** 数字の結果の段。渡された区切りのあいだでだけ折る。 */
function numericBlock(
  segments: readonly string[],
  maxWidth: number,
  fonts: LoadedFonts,
): Block {
  const style = {
    jaFamily: headingFamily(segments.join("")),
    size: frame.NUMERIC_SIZE,
  };
  return {
    kind: "numeric",
    size: frame.NUMERIC_SIZE,
    lineHeight: frame.NUMERIC_LINE_HEIGHT,
    color: INK,
    lines: fillLines(segments, style, maxWidth, fonts),
  };
}

function nameBlock(
  name: string,
  size: number,
  maxWidth: number,
  fonts: LoadedFonts,
): Block {
  return {
    kind: "name",
    size,
    lineHeight: frame.nameLineHeight(size),
    color: INK,
    lines: breakText(
      name,
      { jaFamily: headingFamily(name), size },
      maxWidth,
      fonts,
    ),
  };
}

const ELLIPSIS = "…";

/**
 * 副題を、残りの高さに収まるだけの文節で切り、「…」で終える。1行も収まらないときは副題を置かない。
 */
function truncatedSubtitle(
  subtitle: string,
  maxLines: number,
  maxWidth: number,
  fonts: LoadedFonts,
): Block | undefined {
  const phrases = splitIntoPhrases(subtitle);
  for (let count = phrases.length - 1; count > 0 && maxLines > 0; count--) {
    const text =
      phrases.slice(0, count).join("").replace(TRAILING_SPACES, "") + ELLIPSIS;
    const block = auxBlock("subtitle", text, maxWidth, fonts);
    if (block.lines.length <= maxLines) return block;
  }
  return undefined;
}

/**
 * 中身の組みを決める。名前の段は、名前が3行以内に収まり、中身が枠の縦に収まるいちばん大きい段。そのうち、折り所の
 * どの単位も1行に収まる段があればそれを選び、単位の中で折るのは、どの段でも収まらない単位があるときだけにする（§4）。
 * いちばん下の段でも3行を超えるときは、いちばん下の段のまま行を増やす。いちばん下の段でも枠の縦に収まらないときは、
 * 副題を切る。
 */
function layoutShareImage(
  content: ShareImageContent,
  fonts: LoadedFonts,
): ShareImageLayout {
  const columnWidth = content.swatch
    ? frame.CONTENT_WIDTH - frame.SWATCH_SIZE - frame.SWATCH_GAP
    : frame.CONTENT_WIDTH;
  const aux = content.aux
    ? auxBlock("aux", content.aux, frame.CONTENT_WIDTH, fonts)
    : undefined;
  const numeric = content.numeric?.length
    ? numericBlock(content.numeric, columnWidth, fonts)
    : undefined;
  const reading = content.reading
    ? auxBlock("reading", content.reading, columnWidth, fonts)
    : undefined;
  const subtitle = content.subtitle
    ? auxBlock("subtitle", content.subtitle, columnWidth, fonts)
    : undefined;

  const heightOf = (column: readonly Block[]) => {
    const columnHeight = content.swatch
      ? Math.max(frame.SWATCH_SIZE, blocksHeight(column))
      : blocksHeight(column);
    return aux
      ? aux.lines.length * aux.lineHeight + frame.GAP_AFTER_AUX + columnHeight
      : columnHeight;
  };
  const columnOf = (name: Block, sub: Block | undefined) =>
    [numeric, name, reading, sub].filter(
      (block): block is Block => block !== undefined,
    );

  const nameStyle = (size: number) => ({
    jaFamily: headingFamily(content.name),
    size,
  });
  const candidates = frame.NAME_SIZES.map((size) =>
    nameBlock(content.name, size, columnWidth, fonts),
  );
  const fitsFrame = (name: Block) =>
    name.lines.length <= frame.NAME_MAX_LINES &&
    heightOf(columnOf(name, subtitle)) <= frame.CONTENT_MAX_HEIGHT;
  const name =
    candidates.find(
      (candidate) =>
        fitsFrame(candidate) &&
        everyUnitFits(
          content.name,
          nameStyle(candidate.size),
          columnWidth,
          fonts,
        ),
    ) ??
    candidates.find(fitsFrame) ??
    candidates[candidates.length - 1];

  let sub = subtitle;
  let subtitleTruncated = false;
  if (sub && heightOf(columnOf(name, sub)) > frame.CONTENT_MAX_HEIGHT) {
    const withoutSubtitle = heightOf(columnOf(name, undefined));
    const spare =
      frame.CONTENT_MAX_HEIGHT -
      withoutSubtitle -
      GAP_AFTER[reading ? "reading" : "name"];
    sub = truncatedSubtitle(
      content.subtitle!,
      Math.floor(spare / frame.AUX_LINE_HEIGHT),
      columnWidth,
      fonts,
    );
    subtitleTruncated = true;
  }

  const column = columnOf(name, sub);
  return {
    nameSize: name.size,
    aux,
    column,
    swatch: content.swatch,
    subtitleTruncated,
    height: heightOf(column),
  };
}

// ---------------------------------------------------------------------------
// 描く
// ---------------------------------------------------------------------------

/**
 * 中身の箱。Satori の flex の子は既定で縮むので、組みで決めた高さのまま置くよう縮めない。
 */
const BOX = { display: "flex", flexShrink: 0 } as const;

function renderBlock(block: Block) {
  return (
    <div style={{ ...BOX, flexDirection: "column", color: block.color }}>
      {block.lines.map((line, index) => (
        <div
          key={index}
          style={{
            ...BOX,
            height: block.lineHeight,
          }}
        >
          {line.runs.map((run, runIndex) => (
            <span
              key={runIndex}
              style={{
                fontFamily: run.family,
                fontSize: block.size,
                lineHeight: `${block.lineHeight}px`,
                whiteSpace: "pre",
              }}
            >
              {run.text}
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}

function renderColumn(blocks: readonly Block[]) {
  return (
    <div style={{ ...BOX, flexDirection: "column" }}>
      {blocks.map((block, index) => (
        <div
          key={block.kind}
          style={{
            ...BOX,
            marginTop: index > 0 ? GAP_AFTER[blocks[index - 1].kind] : 0,
          }}
        >
          {renderBlock(block)}
        </div>
      ))}
    </div>
  );
}

function rule(style: {
  left: number;
  top: number;
  width: number;
  height: number;
}) {
  return (
    <div
      style={{
        position: "absolute",
        display: "flex",
        backgroundColor: RULE,
        ...style,
      }}
    />
  );
}

/** 組みを決めた中身を、枠の中に描く。 */
function ShareImage({ layout }: { layout: ShareImageLayout }) {
  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        width: frame.SHARE_IMAGE_WIDTH,
        height: frame.SHARE_IMAGE_HEIGHT,
        backgroundColor: PAPER,
        color: INK,
      }}
    >
      {rule({
        left: frame.LEFT_RULE_X,
        top: 0,
        width: frame.THICK_RULE,
        height: frame.SHARE_IMAGE_HEIGHT,
      })}
      {rule({
        left: frame.RIGHT_RULE_X,
        top: 0,
        width: frame.THICK_RULE,
        height: frame.SHARE_IMAGE_HEIGHT,
      })}
      {rule({
        left: 0,
        top: frame.TOP_RULE_Y,
        width: frame.SHARE_IMAGE_WIDTH,
        height: frame.THICK_RULE,
      })}
      {rule({
        left: 0,
        top: frame.BOTTOM_RULE_Y,
        width: frame.SHARE_IMAGE_WIDTH,
        height: frame.THICK_RULE,
      })}
      <div
        style={{
          position: "absolute",
          left: frame.CONTENT_LEFT,
          top: frame.SITE_NAME_TOP,
          height: frame.SITE_NAME_HEIGHT,
          display: "flex",
          alignItems: "center",
        }}
      >
        <span
          style={{
            fontFamily: PLEX,
            fontSize: frame.SITE_NAME_SIZE,
            lineHeight: 1,
            color: INK,
          }}
        >
          {SITE_NAME}
        </span>
      </div>
      <div
        style={{
          position: "absolute",
          left: frame.CONTENT_LEFT,
          top: frame.CONTENT_TOP,
          width: frame.CONTENT_WIDTH,
          height: frame.CONTENT_HEIGHT,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        {layout.aux && (
          <div style={{ ...BOX, marginBottom: frame.GAP_AFTER_AUX }}>
            {renderBlock(layout.aux)}
          </div>
        )}
        {layout.swatch ? (
          <div style={{ ...BOX, alignItems: "flex-start" }}>
            <div
              style={{
                ...BOX,
                width: frame.SWATCH_SIZE,
                height: frame.SWATCH_SIZE,
                marginRight: frame.SWATCH_GAP,
                backgroundColor: layout.swatch,
                border: `${frame.THIN_RULE}px solid ${RULE_2}`,
              }}
            />
            {renderColumn(layout.column)}
          </div>
        ) : (
          renderColumn(layout.column)
        )}
      </div>
    </div>
  );
}

/** 描いた画像と、その組み（テストが見積もりと描いた画像を突き合わせるため）。 */
export async function renderShareImage(content: ShareImageContent): Promise<{
  response: ImageResponse;
  layout: ShareImageLayout;
}> {
  const fonts = await loadFonts();
  const layout = layoutShareImage(content, fonts);
  const response = new ImageResponse(<ShareImage layout={layout} />, {
    ...SHARE_IMAGE_SIZE,
    fonts: (Object.keys(fonts) as Family[]).map((name) => ({
      name,
      data: fonts[name].data,
      weight: 400,
      style: "normal",
    })),
  });
  return { response, layout };
}

/** 画像のルートの既定の export が返す画像。 */
export async function createShareImageResponse(
  content: ShareImageContent,
): Promise<ImageResponse> {
  return (await renderShareImage(content)).response;
}
