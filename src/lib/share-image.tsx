/**
 * サイトの外に出る画像（OGP 画像と、来訪者が保存する結果の画像）を描く（DESIGN.md §10）。
 *
 * 枠と字の段は `share-image-frame.ts` から取る。中身は、上から補助情報・数字の結果・名前・読み・副題の順に、中身の
 * 左端に揃えて置く。色が主題のページでは、名前の左に色見本を1つ置く。
 *
 * 字の組み方:
 * - 書体は字の範囲で分ける。U+0000-007F は IBM Plex Sans、ほかは和文の書体で、名前と数字の結果は Zen Antique
 *   （Zen Antique に無い字を含むときは和文を丸ごと BIZ UDGothic）、補助情報・読み・副題は BIZ UDPGothic。
 *   Satori は書体の並びを渡すと字ごとに書体を選び分けないので、字の範囲ごとのまとまりに書体を1つずつ渡す。
 * - 行は、ここで描くのと同じ書体のファイルの送り幅で測って決め、1行ずつ描く。どの字も、見出しと同じ文節の区切り
 *   （splitIntoPhrases）で折る。1行に収まらない文節だけを、字の範囲のまとまりで分け、それでも収まらないまとまりを
 *   字の所で折る。文節の頭の空白は前の文節の終わりに移し、行の終わりの空白は描かない。行を決めてから描くので、
 *   名前の段を選ぶときに数えた行の数と、描いた行の数が同じになる。
 *
 * 書体を取れないときは例外を投げる。画像はビルドで書き出すので、違う書体の画像が出荷される前にビルドが止まる。
 */
import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import { parse, type Font } from "opentype.js";
import { BASE_URL, SITE_NAME } from "@/lib/constants";
import { splitIntoPhrases } from "@/lib/phrase-breaks";
import { canSetInZenAntique } from "@/lib/zen-antique-charset";
import { INK, INK_2, PAPER, RULE, RULE_2 } from "@/lib/token-hex";
import {
  AUX_LINE_HEIGHT,
  AUX_SIZE,
  BOTTOM_RULE_Y,
  CONTENT_HEIGHT,
  CONTENT_LEFT,
  CONTENT_MAX_HEIGHT,
  CONTENT_TOP,
  CONTENT_WIDTH,
  GAP_AFTER_AUX,
  GAP_AFTER_NAME,
  GAP_AFTER_NUMERIC,
  GAP_AFTER_READING,
  LEFT_RULE_X,
  NAME_MAX_LINES,
  NAME_SIZES,
  NUMERIC_LINE_HEIGHT,
  NUMERIC_SIZE,
  RIGHT_RULE_X,
  SHARE_IMAGE_HEIGHT,
  SHARE_IMAGE_WIDTH,
  SITE_NAME_HEIGHT,
  SITE_NAME_SIZE,
  SITE_NAME_TOP,
  SWATCH_GAP,
  SWATCH_SIZE,
  THICK_RULE,
  THIN_RULE,
  TOP_RULE_Y,
  nameLineHeight,
} from "@/lib/share-image-frame";

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

export const SHARE_IMAGE_SIZE = {
  width: SHARE_IMAGE_WIDTH,
  height: SHARE_IMAGE_HEIGHT,
};
export const SHARE_IMAGE_CONTENT_TYPE = "image/png";

/**
 * 画像の代替テキスト。画像に書いてある字を、書いてある順に言う。1ページだけを描く画像のルート（道具・トップなど）は、
 * これを `alt` に書き出す。
 */
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

/**
 * 動的なセグメントの画像のルート（1つのファイルが多くのページの画像を描くもの）の代替テキスト。画像の種類を言う
 * （「ブログの記事の題と yolos.net を書いた画像」）。what は、画像に書いた名前が何の名前かを言う語。
 *
 * 規約のファイルの `alt` はファイルごとに1つの文しか出せない。ページごとの文を出す `generateImageMetadata` は、
 * 動的なセグメントの下では画像の URL に id のセグメントを足し、Next.js 16.3 はそのルートの親の
 * パラメータを列挙しないので、画像をビルドで書き出せず、最初の要求のときに描くことになる。画像をビルドで書き出し、
 * 書体を取れないときにビルドで止めるほうを取り、代替テキストは画像の種類を言う文にする。
 */
export function shareImageAltByKind(what: string): string {
  return `${what}と ${SITE_NAME} を書いた画像`;
}

/**
 * ページの画像の URL。`og:image` と同じ URL で、構造化データの `image` など、画像を指す所はどれもここから取る。
 * pagePath はページの URL のパス（`/blog/markdown-cheatsheet`）。
 */
export function shareImageUrl(pagePath: string): string {
  const base = pagePath === "/" ? "" : pagePath;
  return `${BASE_URL}${base}/opengraph-image`;
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

/** 字の範囲で分けたまとまり。1つの書体で組む。 */
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
 * 行に詰める単位。1行に収まる文節はそのまま、収まらない文節は字の範囲のまとまりに、それでも収まらないまとまりは字に
 * 分ける。
 */
function breakUnits(
  pieces: readonly string[],
  style: TextStyle,
  maxWidth: number,
  fonts: LoadedFonts,
): string[] {
  const fits = (text: string) =>
    measure(text.replace(TRAILING_SPACES, ""), style, fonts) <= maxWidth;
  return pieces.flatMap((phrase) => {
    if (fits(phrase)) return [phrase];
    return toRuns(phrase, style.jaFamily).flatMap(({ text }) =>
      fits(text) ? [text] : graphemes(text),
    );
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

/** 文のどの文節も、幅 maxWidth の1行に収まるか。 */
function everyPhraseFits(
  text: string,
  style: TextStyle,
  maxWidth: number,
  fonts: LoadedFonts,
): boolean {
  return splitIntoPhrases(text).every(
    (phrase) => measure(phrase.trim(), style, fonts) <= maxWidth,
  );
}

/** 文を、見出しと同じ文節の区切りで、幅 maxWidth の行に折る。 */
function breakText(
  text: string,
  style: TextStyle,
  maxWidth: number,
  fonts: LoadedFonts,
): Line[] {
  const phrases = moveLeadingSpaces(splitIntoPhrases(text));
  return fillLines(
    breakUnits(phrases, style, maxWidth, fonts),
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
  aux: GAP_AFTER_AUX,
  numeric: GAP_AFTER_NUMERIC,
  name: GAP_AFTER_NAME,
  reading: GAP_AFTER_READING,
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
    size: AUX_SIZE,
    lineHeight: AUX_LINE_HEIGHT,
    color: INK_2,
    lines: breakText(
      text,
      { jaFamily: BIZ_UDP_GOTHIC, size: AUX_SIZE },
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
    size: NUMERIC_SIZE,
  };
  return {
    kind: "numeric",
    size: NUMERIC_SIZE,
    lineHeight: NUMERIC_LINE_HEIGHT,
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
    lineHeight: nameLineHeight(size),
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
 * 中身の組みを決める。名前の段は、名前が3行以内に収まり、中身が枠の縦に収まるいちばん大きい段。そのうち、どの文節も
 * 1行に収まる段があればそれを選び、文節の中で折るのは、どの段でも収まらない文節があるときだけにする（§4）。
 * いちばん下の段でも3行を超えるときは、いちばん下の段のまま行を増やす。いちばん下の段でも枠の縦に収まらないときは、
 * 副題を切る。
 */
function layoutShareImage(
  content: ShareImageContent,
  fonts: LoadedFonts,
): ShareImageLayout {
  const columnWidth = content.swatch
    ? CONTENT_WIDTH - SWATCH_SIZE - SWATCH_GAP
    : CONTENT_WIDTH;
  const aux = content.aux
    ? auxBlock("aux", content.aux, CONTENT_WIDTH, fonts)
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
      ? Math.max(SWATCH_SIZE, blocksHeight(column))
      : blocksHeight(column);
    return aux
      ? aux.lines.length * aux.lineHeight + GAP_AFTER_AUX + columnHeight
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
  const candidates = NAME_SIZES.map((size) =>
    nameBlock(content.name, size, columnWidth, fonts),
  );
  const fitsFrame = (name: Block) =>
    name.lines.length <= NAME_MAX_LINES &&
    heightOf(columnOf(name, subtitle)) <= CONTENT_MAX_HEIGHT;
  const name =
    candidates.find(
      (candidate) =>
        fitsFrame(candidate) &&
        everyPhraseFits(
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
  if (sub && heightOf(columnOf(name, sub)) > CONTENT_MAX_HEIGHT) {
    const withoutSubtitle = heightOf(columnOf(name, undefined));
    const spare =
      CONTENT_MAX_HEIGHT -
      withoutSubtitle -
      GAP_AFTER[reading ? "reading" : "name"];
    sub = truncatedSubtitle(
      content.subtitle!,
      Math.floor(spare / AUX_LINE_HEIGHT),
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
        width: SHARE_IMAGE_WIDTH,
        height: SHARE_IMAGE_HEIGHT,
        backgroundColor: PAPER,
        color: INK,
      }}
    >
      {rule({
        left: LEFT_RULE_X,
        top: 0,
        width: THICK_RULE,
        height: SHARE_IMAGE_HEIGHT,
      })}
      {rule({
        left: RIGHT_RULE_X,
        top: 0,
        width: THICK_RULE,
        height: SHARE_IMAGE_HEIGHT,
      })}
      {rule({
        left: 0,
        top: TOP_RULE_Y,
        width: SHARE_IMAGE_WIDTH,
        height: THICK_RULE,
      })}
      {rule({
        left: 0,
        top: BOTTOM_RULE_Y,
        width: SHARE_IMAGE_WIDTH,
        height: THICK_RULE,
      })}
      <div
        style={{
          position: "absolute",
          left: CONTENT_LEFT,
          top: SITE_NAME_TOP,
          height: SITE_NAME_HEIGHT,
          display: "flex",
          alignItems: "center",
        }}
      >
        <span
          style={{
            fontFamily: PLEX,
            fontSize: SITE_NAME_SIZE,
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
          left: CONTENT_LEFT,
          top: CONTENT_TOP,
          width: CONTENT_WIDTH,
          height: CONTENT_HEIGHT,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        {layout.aux && (
          <div style={{ ...BOX, marginBottom: GAP_AFTER_AUX }}>
            {renderBlock(layout.aux)}
          </div>
        )}
        {layout.swatch ? (
          <div style={{ ...BOX, alignItems: "flex-start" }}>
            <div
              style={{
                ...BOX,
                width: SWATCH_SIZE,
                height: SWATCH_SIZE,
                marginRight: SWATCH_GAP,
                backgroundColor: layout.swatch,
                border: `${THIN_RULE}px solid ${RULE_2}`,
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
