/**
 * イロドリの結果を持ち帰る・共有するもの。共有の文と、保存する結果の画像（DESIGN.md §10）。
 *
 * 結果の画像は、来訪者の端末の Canvas で、OGP 画像と同じ枠（`share-image-frame.ts` の寸法）に描く。中身は画面の
 * 結果のボックスの要約で、左の列に補助情報「イロドリ #{番号}の結果」・合計点（数字の結果）・ランクとその言葉を、右に
 * 問ごとの点数の表（問・お題・回答・点数。画面の表と同じ形）を置く。表は中身の枠の縦いっぱいに組み、見本の1辺は
 * 問の数から決めるので、どの問も画像の中に入る。
 *
 * 書体は画面と同じ並び（`--font-heading`・`--font-body` と、その和文の並び）を、ページの CSS の変数から読む。Canvas は
 * 字を測るときと描くときに Web フォントの読み込みを起こすが、読み終えるのを待たず、まだ読み終えていない書体の字は並びの
 * 次の書体で描く。そのため、描く字を書体ごとに渡して読み込みを待ってから、字の幅を測って描く。読み込めなかった書体の
 * 字は、並びの次の書体で描かれる（Zen Antique を読み込めないときの見出しの字は、§3 の仮名を全角で組む並び）。
 */
import type { IrodoriGameState } from "./types";
import {
  calculateTotalScore,
  getRank,
  getRankLabel,
  type IrodoriRank,
} from "./engine";
import { hslToHex } from "./color-utils";
import { SITE_NAME } from "@/lib/constants";
import { INK, INK_2, PAPER, RULE, RULE_2 } from "@/lib/token-hex";
import * as frame from "@/lib/share-image-frame";

/**
 * 共有の文。ページの URL は共有の先ごとに ShareButtons が足すので、文には入れない。2行目は問ごとの点数で、
 * 結果の画面と同じ数を並べる。
 *
 *   イロドリ #42 スコア: 87/100 (Aランク)
 *   94 90 76 60 40
 *   #イロドリ #yolosnet
 */
export function generateShareText(state: IrodoriGameState): string {
  const scores = state.rounds.map((r) => r.score ?? 0);
  const totalScore = calculateTotalScore(scores);
  const rank = getRank(totalScore);

  return `イロドリ #${state.puzzleNumber} スコア: ${totalScore}/100 (${rank}ランク)\n${scores.join(" ")}\n#イロドリ #yolosnet`;
}

// ---------------------------------------------------------------------------
// 結果の画像の組み
// ---------------------------------------------------------------------------

/** 字の書体の並び。heading は見出しの並び、body は本文の並び（§3）。 */
export type TextRole = "heading" | "body";

/** 字の幅を決める組み方。 */
export interface TextFont {
  role: TextRole;
  size: number;
  bold: boolean;
}

/** 1行の字。x は align が left なら左端、right なら右端。top は行の箱の上端。 */
export interface ImageText extends TextFont {
  text: string;
  x: number;
  top: number;
  lineHeight: number;
  align: "left" | "right";
  color: string;
}

/** 塗る矩形（線と色見本）。border を持つものは、その太さの線を矩形の内側に沿って引く。 */
export interface ImageRect {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  border?: { width: number; color: string };
}

/** 描く前に決めた画像の組み。 */
export interface ResultImageLayout {
  rects: ImageRect[];
  /** 問ごとのお題と回答の見本。rects にも含まれる。 */
  swatches: ImageRect[];
  texts: ImageText[];
}

/** 字の幅を測る関数。描くのと同じ書体で測る。 */
export type MeasureText = (text: string, font: TextFont) => number;

/** 補助情報の大きさで組む字（補助情報・ランクの言葉・表の字）。 */
const TEXT_SIZE = frame.AUX_SIZE;
const TEXT_LINE_HEIGHT = frame.AUX_LINE_HEIGHT;

/** 表のセルの余白。細い罫線を挟んだ字どうしを離し、表の外側の縁では持たない（§5）。 */
const CELL_PADDING_X = 16;
const CELL_PADDING_Y = 8;

/** 左の列と表のあいだ。 */
const COLUMN_GAP = 48;

const NO_ANSWER = "記録なし";
const TABLE_HEADINGS = ["問", "お題", "回答", "点数"] as const;

/** ランクとその言葉の文を、文節で分けた並び。1行に収まらないときは、この区切りで折る。 */
export function rankPhrases(rank: IrodoriRank): string[] {
  return [`${rank}ランク、`, `${getRankLabel(rank)}です。`];
}

/** 区切りの並びを、前から順に幅 maxWidth の1行に収まるだけ詰める。 */
function fillLines(
  phrases: readonly string[],
  font: TextFont,
  maxWidth: number,
  measure: MeasureText,
): string[] {
  const lines: string[] = [];
  for (const phrase of phrases) {
    const last = lines.at(-1);
    if (last !== undefined && measure(last + phrase, font) <= maxWidth) {
      lines[lines.length - 1] = last + phrase;
    } else {
      lines.push(phrase);
    }
  }
  return lines;
}

/** 枠の罫線。OGP 画像（`share-image.tsx`）と同じ位置と太さ。 */
function frameRules(): ImageRect[] {
  const vertical = (x: number) => ({
    x,
    y: 0,
    width: frame.THICK_RULE,
    height: frame.SHARE_IMAGE_HEIGHT,
    color: RULE,
  });
  const horizontal = (y: number) => ({
    x: 0,
    y,
    width: frame.SHARE_IMAGE_WIDTH,
    height: frame.THICK_RULE,
    color: RULE,
  });
  return [
    vertical(frame.LEFT_RULE_X),
    vertical(frame.RIGHT_RULE_X),
    horizontal(frame.TOP_RULE_Y),
    horizontal(frame.BOTTOM_RULE_Y),
  ];
}

/**
 * 結果の画像の組みを決める。表の行の高さは見本の1辺で、見本の1辺は、見出しの行と問の数だけの行が中身の枠の縦に
 * 収まるいちばん大きい値。列の幅は、その列のいちばん広い字か見本で決め、表を中身の右端に揃える。左の列は、表の左の
 * 残りの幅に組み、ランクの文が1行に収まらないときは文節の区切りで折る。
 */
export function layoutResultImage(
  state: IrodoriGameState,
  measure: MeasureText,
): ResultImageLayout {
  const scores = state.rounds.map((round) => round.score ?? 0);
  const totalScore = calculateTotalScore(scores);
  const rank = getRank(totalScore);
  const regular: TextFont = { role: "body", size: TEXT_SIZE, bold: false };
  const bold: TextFont = { role: "body", size: TEXT_SIZE, bold: true };
  const numeric: TextFont = {
    role: "heading",
    size: frame.NUMERIC_SIZE,
    bold: false,
  };

  const rows = state.rounds.map((round, index) => ({
    number: String(index + 1),
    target: round.target.hex,
    answer: round.answer
      ? hslToHex(round.answer.h, round.answer.s, round.answer.l)
      : null,
    score: `${round.score ?? 0}点`,
  }));
  const rowCount = rows.length;

  // 表の縦: 見出しの行、そのあと行ごとに「余白・細い罫線・余白・行」。
  const rowStep = CELL_PADDING_Y * 2 + frame.THIN_RULE;
  const swatchSize = Math.floor(
    (frame.CONTENT_MAX_HEIGHT - TEXT_LINE_HEIGHT - rowStep * rowCount) /
      rowCount,
  );
  const tableHeight = TEXT_LINE_HEIGHT + rowCount * (rowStep + swatchSize);

  // 列の幅は画素の整数に上げ、見本と罫線を画素の境に置く（見本の縁がにじまない）。
  const widest = (texts: readonly string[], font: TextFont) =>
    Math.max(...texts.map((text) => measure(text, font)));
  const columnWidths = [
    Math.max(
      measure(TABLE_HEADINGS[0], bold),
      widest(
        rows.map((row) => row.number),
        bold,
      ),
    ),
    Math.max(measure(TABLE_HEADINGS[1], bold), swatchSize),
    Math.max(
      measure(TABLE_HEADINGS[2], bold),
      swatchSize,
      rows.some((row) => row.answer === null) ? measure(NO_ANSWER, regular) : 0,
    ),
    Math.max(
      measure(TABLE_HEADINGS[3], bold),
      widest(
        rows.map((row) => row.score),
        regular,
      ),
    ),
  ].map(Math.ceil);
  const columnStep = CELL_PADDING_X * 2 + frame.THIN_RULE;
  const tableWidth =
    columnWidths.reduce((sum, width) => sum + width, 0) +
    columnStep * (columnWidths.length - 1);
  const tableLeft = frame.CONTENT_LEFT + frame.CONTENT_WIDTH - tableWidth;
  const columnLefts = columnWidths.map(
    (_, index) =>
      tableLeft +
      columnWidths.slice(0, index).reduce((sum, width) => sum + width, 0) +
      columnStep * index,
  );

  // 左の列: 補助情報・合計点・ランクの文。
  const leftWidth = tableLeft - COLUMN_GAP - frame.CONTENT_LEFT;
  const rankLines = fillLines(rankPhrases(rank), regular, leftWidth, measure);
  const leftHeight =
    TEXT_LINE_HEIGHT +
    frame.GAP_AFTER_AUX +
    frame.NUMERIC_LINE_HEIGHT +
    frame.GAP_AFTER_NUMERIC +
    rankLines.length * TEXT_LINE_HEIGHT;

  const top =
    frame.CONTENT_TOP +
    Math.round((frame.CONTENT_HEIGHT - Math.max(leftHeight, tableHeight)) / 2);

  const texts: ImageText[] = [];
  const text = (
    value: string,
    font: TextFont,
    x: number,
    lineTop: number,
    lineHeight: number,
    color: string,
    align: "left" | "right" = "left",
  ) => {
    texts.push({
      ...font,
      text: value,
      x,
      top: lineTop,
      lineHeight,
      align,
      color,
    });
  };

  text(
    SITE_NAME,
    { role: "body", size: frame.SITE_NAME_SIZE, bold: false },
    frame.CONTENT_LEFT,
    frame.SITE_NAME_TOP + (frame.SITE_NAME_HEIGHT - frame.SITE_NAME_SIZE) / 2,
    frame.SITE_NAME_SIZE,
    INK,
  );

  text(
    `イロドリ #${state.puzzleNumber}の結果`,
    regular,
    frame.CONTENT_LEFT,
    top,
    TEXT_LINE_HEIGHT,
    INK_2,
  );
  const numericTop = top + TEXT_LINE_HEIGHT + frame.GAP_AFTER_AUX;
  text(
    `${totalScore}点`,
    numeric,
    frame.CONTENT_LEFT,
    numericTop,
    frame.NUMERIC_LINE_HEIGHT,
    INK,
  );
  const rankTop =
    numericTop + frame.NUMERIC_LINE_HEIGHT + frame.GAP_AFTER_NUMERIC;
  rankLines.forEach((line, index) =>
    text(
      line,
      regular,
      frame.CONTENT_LEFT,
      rankTop + index * TEXT_LINE_HEIGHT,
      TEXT_LINE_HEIGHT,
      INK,
    ),
  );

  // 表。見出しの行と問の番号は太字、点数の列は右揃え（画面の表と同じ）。
  const scoreRight = columnLefts[3] + columnWidths[3];
  TABLE_HEADINGS.forEach((heading, index) =>
    index === 3
      ? text(heading, bold, scoreRight, top, TEXT_LINE_HEIGHT, INK, "right")
      : text(heading, bold, columnLefts[index], top, TEXT_LINE_HEIGHT, INK),
  );

  const rects: ImageRect[] = frameRules();
  const swatches: ImageRect[] = [];
  const swatch = (x: number, y: number, color: string) => {
    const rect = {
      x,
      y,
      width: swatchSize,
      height: swatchSize,
      color,
      border: { width: frame.THIN_RULE, color: RULE_2 },
    };
    swatches.push(rect);
    rects.push(rect);
  };

  rows.forEach((row, index) => {
    const ruleY =
      top + TEXT_LINE_HEIGHT + index * (rowStep + swatchSize) + CELL_PADDING_Y;
    rects.push({
      x: tableLeft,
      y: ruleY,
      width: tableWidth,
      height: frame.THIN_RULE,
      color: RULE_2,
    });
    const rowTop = ruleY + frame.THIN_RULE + CELL_PADDING_Y;
    const lineTop = rowTop + (swatchSize - TEXT_LINE_HEIGHT) / 2;
    text(row.number, bold, columnLefts[0], lineTop, TEXT_LINE_HEIGHT, INK);
    swatch(columnLefts[1], rowTop, row.target);
    if (row.answer) {
      swatch(columnLefts[2], rowTop, row.answer);
    } else {
      text(
        NO_ANSWER,
        regular,
        columnLefts[2],
        lineTop,
        TEXT_LINE_HEIGHT,
        INK_2,
      );
    }
    text(
      row.score,
      regular,
      scoreRight,
      lineTop,
      TEXT_LINE_HEIGHT,
      INK,
      "right",
    );
  });

  // 列どうしの細い罫線。表の上端から下端まで引く。
  columnLefts.slice(1).forEach((left) =>
    rects.push({
      x: left - CELL_PADDING_X - frame.THIN_RULE,
      y: top,
      width: frame.THIN_RULE,
      height: tableHeight,
      color: RULE_2,
    }),
  );

  return { rects, swatches, texts };
}

// ---------------------------------------------------------------------------
// 結果の画像を描く
// ---------------------------------------------------------------------------

/**
 * 字の役割ごとの書体の並び。all は字を描く並び（欧文の基本範囲を IBM Plex Sans が組み、ほかの字は和文の書体へ
 * 落ちる）、ja はその和文の書体の並び。
 */
export type FontFamilies = Record<TextRole, { all: string; ja: string }>;

const PLEX_LAST_CODE_POINT = 0x7f;

/**
 * 字を、書体の並びのどの書体が組むかで分ける。欧文の基本範囲（U+0000-007F）の字は和文の並びより前の書体
 * （IBM Plex Sans）が、ほかの字は和文の並びが組む。書体を読み込むときと、行の基線を決めるときの両方がこれを使う。
 */
export function splitByFontRange(text: string): { latin: string; ja: string } {
  let latin = "";
  let ja = "";
  for (const char of text) {
    if (char.codePointAt(0)! <= PLEX_LAST_CODE_POINT) latin += char;
    else ja += char;
  }
  return { latin, ja };
}

function cssFont(font: TextFont, family: string): string {
  return `${font.bold ? 700 : 400} ${font.size}px ${family}`;
}

function familyNames(list: string): string[] {
  return list.split(",").map((family) => family.trim());
}

/** 読み込む書体（CSS の font の値）と、その書体で組む字。 */
export interface FontLoadRequest {
  font: string;
  text: string;
}

/**
 * 描く字の書体の読み込みの並び。並びの書体を1つずつ、その書体で組む字だけと組にする。書体に組まない字を渡すと、
 * 字の範囲ごとに分けた書体（Zen Antique）は、描かない字のファイルまで取りに行く。
 */
export function fontLoadRequests(
  texts: readonly ImageText[],
  families: FontFamilies,
): FontLoadRequest[] {
  const textsByFont = new Map<string, { font: TextFont; text: string }>();
  for (const item of texts) {
    const key = `${item.role} ${item.bold} ${item.size}`;
    const entry = textsByFont.get(key);
    if (entry) entry.text += item.text;
    else textsByFont.set(key, { font: item, text: item.text });
  }
  return [...textsByFont.values()].flatMap(({ font, text }) => {
    const { latin, ja } = splitByFontRange(text);
    const jaFamilies = familyNames(families[font.role].ja);
    const latinFamilies = familyNames(families[font.role].all).filter(
      (family) => !jaFamilies.includes(family),
    );
    const requests = (names: readonly string[], chars: string) =>
      chars === ""
        ? []
        : names.map((family) => ({ font: cssFont(font, family), text: chars }));
    return [...requests(latinFamilies, latin), ...requests(jaFamilies, ja)];
  });
}

/** ページの書体の並び。ルートのレイアウトが置く CSS の変数から読む。 */
function pageFontFamilies(): FontFamilies {
  const style = getComputedStyle(document.documentElement);
  const read = (...names: string[]) =>
    names
      .map((name) => style.getPropertyValue(name).trim())
      .filter((value) => value !== "")
      .join(", ") || "sans-serif";
  return {
    heading: {
      all: read("--font-heading"),
      ja: read("--font-zen-antique", "--font-ja-heading-fallback"),
    },
    body: { all: read("--font-body"), ja: read("--font-ja-body") },
  };
}

/**
 * 描く字の書体を読み込み、どれも読み込み終えるか読み込めないと分かるまで待つ。並びを1度に渡すと、並びのどれか1つが
 * 読み込めないと分かった時点で、ほかの書体の読み込みを待たずに終わるので、書体を1つずつ読み込む。読み込めなかった
 * 書体の字は、並びの次の書体で描かれる。
 */
async function loadFonts(
  texts: readonly ImageText[],
  families: FontFamilies,
): Promise<void> {
  if (!document.fonts) return;
  await Promise.allSettled(
    fontLoadRequests(texts, families).map(({ font, text }) =>
      document.fonts.load(font, text),
    ),
  );
}

function drawRect(ctx: CanvasRenderingContext2D, rect: ImageRect): void {
  ctx.fillStyle = rect.color;
  ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
  if (!rect.border) return;
  const { width, color } = rect.border;
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.strokeRect(
    rect.x + width / 2,
    rect.y + width / 2,
    rect.width - width,
    rect.height - width,
  );
}

/**
 * 1行の字を描く。OGP 画像と同じく、欧文の基本範囲の字と和文の字をそれぞれの書体の箱として並べた行に置く: 各書体の
 * 箱は、行の高さから書体の上下の高さを引いた残りを上下に等しく分け、行の基線は、基線より上がいちばん高い箱に合わせる。
 */
function drawText(
  ctx: CanvasRenderingContext2D,
  item: ImageText,
  families: FontFamilies,
): void {
  const { latin, ja } = splitByFontRange(item.text);
  // 書体の上下の高さは、その書体で組む字だけで測る（ほかの字を渡すと、描かない字のファイルまで取りに行く）。
  const boxes = [
    { chars: latin, list: families[item.role].all },
    { chars: ja, list: families[item.role].ja },
  ].filter(({ chars }) => chars !== "");
  const aboveBaseline = Math.max(
    ...boxes.map(({ chars, list }) => {
      ctx.font = cssFont(item, list);
      const metrics = ctx.measureText(chars);
      const ascent = metrics.fontBoundingBoxAscent;
      const descent = metrics.fontBoundingBoxDescent;
      return (item.lineHeight - (ascent + descent)) / 2 + ascent;
    }),
  );
  ctx.font = cssFont(item, families[item.role].all);
  ctx.fillStyle = item.color;
  ctx.textAlign = item.align;
  ctx.textBaseline = "alphabetic";
  ctx.fillText(item.text, item.x, item.top + aboveBaseline);
}

/**
 * 結果の画像を描き、PNG の data URL を返す。Canvas を使えないときは null。
 */
export async function generateResultImage(
  state: IrodoriGameState,
): Promise<string | null> {
  if (typeof document === "undefined") return null;

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  canvas.width = frame.SHARE_IMAGE_WIDTH;
  canvas.height = frame.SHARE_IMAGE_HEIGHT;

  const families = pageFontFamilies();
  const measure: MeasureText = (text, font) => {
    ctx.font = cssFont(font, families[font.role].all);
    return ctx.measureText(text).width;
  };
  // 描く字が決まってから書体を読み込み、読み込んだ書体で字の幅を測り直して組む。
  await loadFonts(layoutResultImage(state, measure).texts, families);
  const layout = layoutResultImage(state, measure);

  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  for (const rect of layout.rects) drawRect(ctx, rect);
  for (const item of layout.texts) drawText(ctx, item, families);

  try {
    return canvas.toDataURL("image/png");
  } catch {
    return null;
  }
}

/** data URL を、名前を付けたファイルとして落とす。 */
export function downloadImage(dataUrl: string, filename: string): void {
  if (typeof document === "undefined") return;
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
