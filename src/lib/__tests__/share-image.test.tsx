// @vitest-environment node
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import sharp from "sharp";
import { afterEach, beforeAll, describe, expect, test, vi } from "vitest";
import { CATEGORY_LABELS, getAllBlogPosts } from "@/blog/_lib/blog";
import { BASE_URL } from "@/lib/constants";
import {
  cannotEndLine,
  cannotStartLine,
  parenDepthAfter,
  splitIntoPhrases,
} from "@/lib/phrase-breaks";
import {
  lineBreakUnits,
  renderShareImage,
  shareImageAlt,
  shareOpenGraphImage,
  shareImageUrl,
  type Block,
  type ShareImageContent,
  type ShareImageLayout,
} from "@/lib/share-image";
import {
  AUX_SIZE,
  BOTTOM_RULE_Y,
  CONTENT_HEIGHT,
  CONTENT_LEFT,
  CONTENT_MAX_HEIGHT,
  CONTENT_TOP,
  CONTENT_WIDTH,
  CROP_BAND,
  GAP_AFTER_AUX,
  GAP_AFTER_NAME,
  GAP_AFTER_NUMERIC,
  GAP_AFTER_READING,
  LEFT_RULE_X,
  NAME_MAX_LINES,
  NAME_SIZES,
  NUMERIC_SIZE,
  RIGHT_RULE_X,
  SHARE_IMAGE_HEIGHT,
  SHARE_IMAGE_WIDTH,
  SWATCH_GAP,
  SWATCH_SIZE,
  THICK_RULE,
  TOP_RULE_Y,
} from "@/lib/share-image-frame";
import { INK, PAPER } from "@/lib/token-hex";

/**
 * 描いた PNG そのものを測る（frontend-design スキル「サイトの外に出る画像を確かめる」）。
 * 書体は Google Fonts から取るので、このテストはネットワークを使う。
 */

/** 組み方の難しい試しの入力。 */
const INPUTS: Record<string, ShareImageContent> = {
  /** ブログでいちばん長い題（69字）。欧文・空白・「--」を含む。 */
  longestBlogTitle: {
    aux: "ブログ",
    name: "Next.js複数root layoutで not-found.tsx が効かない -- global-not-found.js での解決",
    subtitle: "開発ノート",
  },
  /** ブログの題。最初の語「Gitコマンド」の後ろの空白で折れ、「Git」だけの行を作らない。 */
  gitCheatsheet: {
    aux: "ブログ",
    name: "Gitコマンド 早見表 — 用途別のコマンド一覧",
    subtitle: "ツールガイド",
  },
  /** ブログの題（67字）。文節の中の空白で折れる。 */
  seoBlogTitle: {
    aux: "ブログ",
    name: "Next.jsサイトのSEOメタデータ完全対策: OGP・canonical・Twitter Card・JSON-LDセキュリティまで",
    subtitle: "開発ノート",
  },
  /** ブログの題。1つの単位（「切り替えられるようになりました」）が 72px では1行に収まらない。 */
  unitLimitedTitle: {
    aux: "ブログ",
    name: "ダークモードを手動で切り替えられるようになりました",
    subtitle: "開発ノート",
  },
  /** character-personality でいちばん長いタイプ名（guardian-charger、35字）。 */
  longestTypeName: {
    aux: "あなたに似たキャラ診断の結果",
    name: "普段は後方で全員の顔色を確認しながら、本当に必要な時だけ前に出る守護者",
  },
  /** character-personality の、鉤括弧を含むタイプ名（30字）。 */
  typeNameWithBrackets: {
    aux: "あなたに似たキャラ診断の結果",
    name: "夢を語りながら「でもこれ普通じゃないよね」と逆張りする妄想家",
  },
  /** character-personality の、数字を含むタイプ名。 */
  typeNameWithNumber: {
    aux: "あなたに似たキャラ診断の結果",
    name: "締切1時間前に突然スイッチが入って傑作を叩き出す情熱の画家",
  },
  /** 1行に収まらない欧文の語。空白を含む補助情報・読み・副題。 */
  longWord: {
    aux: "イロドリ #212の結果",
    name: "とても長い語 Supercalifragilisticexpialidociousandevenlongerwordthatcannotfit のテスト",
    reading: "toki #eea9a9",
    subtitle: "テキストとBase64の相互変換 (UTF-8 対応)",
  },
  /** Zen Antique に無い字を含む名前。 */
  missingFromZenAntique: {
    aux: "伝統色辞典",
    name: "纁",
    reading: "sohi #b35c44",
    swatch: "#b35c44",
  },
  /** 「——」を持つ名前。 */
  dash: {
    aux: "動物性格診断の結果",
    name: "エゾシカ——北の大地を群れで駆ける繊細戦士",
  },
  /** 数字の結果と段位の名前。 */
  quizScore: {
    aux: "漢字力診断の結果",
    numeric: ["10問中", "8問正解"],
    name: "漢字マスター",
  },
  /** ゲームの合計点。 */
  gameScore: {
    aux: "イロドリ #212の結果",
    numeric: ["72点"],
    name: "Bランク",
  },
  /** 色見本と読み。 */
  swatch: {
    aux: "伝統色辞典",
    name: "鴇",
    reading: "toki #eea9a9",
    swatch: "#eea9a9",
  },
};

// ---------------------------------------------------------------------------
// PNG を読む
// ---------------------------------------------------------------------------

function hexToRgb(hex: string): [number, number, number] {
  const value = parseInt(hex.slice(1), 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}

const PAPER_RGB = hexToRgb(PAPER);
const INK_RGB = hexToRgb(INK);

interface Png {
  width: number;
  height: number;
  pixel(x: number, y: number): [number, number, number];
  /** 地の色から離れた画素（字・線・見本）か。 */
  marked(x: number, y: number): boolean;
}

async function decode(response: Response): Promise<Png> {
  const { data, info } = await sharp(Buffer.from(await response.arrayBuffer()))
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const marks = new Uint8Array(info.width * info.height);
  for (let index = 0; index < marks.length; index++) {
    marks[index] = PAPER_RGB.some(
      (channel, offset) => Math.abs(data[index * 3 + offset] - channel) > 24,
    )
      ? 1
      : 0;
  }
  return {
    width: info.width,
    height: info.height,
    pixel(x, y) {
      const offset = (y * info.width + x) * 3;
      return [data[offset], data[offset + 1], data[offset + 2]];
    },
    marked(x, y) {
      return marks[y * info.width + x] === 1;
    },
  };
}

function isMarked(png: Png, x: number, y: number): boolean {
  return png.marked(x, y);
}

function isInk(png: Png, x: number, y: number): boolean {
  return png.pixel(x, y).every((channel, index) => channel === INK_RGB[index]);
}

/** 条件に当たる画素の座標。多すぎると読めないので、はじめの5つだけを返す。 */
function pixelsWhere(
  png: Png,
  predicate: (x: number, y: number) => boolean,
): string[] {
  const found: string[] = [];
  for (let y = 0; y < png.height && found.length < 5; y++) {
    for (let x = 0; x < png.width && found.length < 5; x++) {
      if (predicate(x, y)) found.push(`(${x}, ${y})`);
    }
  }
  return found;
}

interface Box {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

/** 箱の中の印のある画素の外接矩形。無ければ undefined。 */
function inkBounds(png: Png, box: Box): Box | undefined {
  let bounds: Box | undefined;
  for (
    let y = Math.max(0, Math.floor(box.top));
    y < Math.min(png.height, box.bottom);
    y++
  ) {
    for (
      let x = Math.max(0, Math.floor(box.left));
      x < Math.min(png.width, box.right);
      x++
    ) {
      if (!isMarked(png, x, y)) continue;
      bounds = bounds
        ? {
            left: Math.min(bounds.left, x),
            top: Math.min(bounds.top, y),
            right: Math.max(bounds.right, x + 1),
            bottom: Math.max(bounds.bottom, y + 1),
          }
        : { left: x, top: y, right: x + 1, bottom: y + 1 };
    }
  }
  return bounds;
}

// ---------------------------------------------------------------------------
// 組みから、描かれるはずの位置を出す
// ---------------------------------------------------------------------------

const GAP_AFTER: Record<Block["kind"], number> = {
  aux: GAP_AFTER_AUX,
  numeric: GAP_AFTER_NUMERIC,
  name: GAP_AFTER_NAME,
  reading: GAP_AFTER_READING,
  subtitle: 0,
};

interface PlacedLine {
  block: Block;
  text: string;
  box: Box;
}

/** 組みの行を、中身の枠の中で上下の中央に置いたときの位置に並べる。 */
function placeLines(layout: ShareImageLayout): PlacedLine[] {
  const placed: PlacedLine[] = [];
  // Satori は箱を画素の格子に丸めて置く。
  let y = CONTENT_TOP + Math.round((CONTENT_HEIGHT - layout.height) / 2);
  const place = (block: Block, left: number) => {
    for (const line of block.lines) {
      placed.push({
        block,
        text: line.runs.map((run) => run.text).join(""),
        box: {
          left,
          top: y,
          right: left + line.width,
          bottom: y + block.lineHeight,
        },
      });
      y += block.lineHeight;
    }
  };
  if (layout.aux) {
    place(layout.aux, CONTENT_LEFT);
    y += GAP_AFTER_AUX;
  }
  const columnLeft = layout.swatch
    ? CONTENT_LEFT + SWATCH_SIZE + SWATCH_GAP
    : CONTENT_LEFT;
  layout.column.forEach((block, index) => {
    if (index > 0) y += GAP_AFTER[layout.column[index - 1].kind];
    place(block, columnLeft);
  });
  return placed;
}

function swatchBox(layout: ShareImageLayout): Box | undefined {
  if (!layout.swatch) return undefined;
  const top =
    CONTENT_TOP +
    Math.round((CONTENT_HEIGHT - layout.height) / 2) +
    (layout.aux
      ? layout.aux.lines.length * layout.aux.lineHeight + GAP_AFTER_AUX
      : 0);
  return {
    left: CONTENT_LEFT,
    top,
    right: CONTENT_LEFT + SWATCH_SIZE,
    bottom: top + SWATCH_SIZE,
  };
}

/** サイト名を置く帯。 */
const SITE_NAME_BOX: Box = {
  left: CONTENT_LEFT,
  top: CROP_BAND,
  right: CONTENT_LEFT + 200,
  bottom: TOP_RULE_Y,
};

const RULE_BOXES: Box[] = [
  {
    left: 0,
    top: TOP_RULE_Y,
    right: SHARE_IMAGE_WIDTH,
    bottom: TOP_RULE_Y + THICK_RULE,
  },
  {
    left: 0,
    top: BOTTOM_RULE_Y,
    right: SHARE_IMAGE_WIDTH,
    bottom: BOTTOM_RULE_Y + THICK_RULE,
  },
  {
    left: LEFT_RULE_X,
    top: 0,
    right: LEFT_RULE_X + THICK_RULE,
    bottom: SHARE_IMAGE_HEIGHT,
  },
  {
    left: RIGHT_RULE_X,
    top: 0,
    right: RIGHT_RULE_X + THICK_RULE,
    bottom: SHARE_IMAGE_HEIGHT,
  },
];

/** 字の形は行の箱の外へ少しはみ出して描かれうる（字の側面のはみ出し・アンチエイリアス）。 */
const GLYPH_TOLERANCE = 4;

function inside(box: Box, x: number, y: number, tolerance = 0): boolean {
  return (
    x >= box.left - tolerance &&
    x < box.right + tolerance &&
    y >= box.top - tolerance &&
    y < box.bottom + tolerance
  );
}

// ---------------------------------------------------------------------------

interface Rendered {
  png: Png;
  layout: ShareImageLayout;
  lines: PlacedLine[];
}

/** 描いた中身の CPU の時間を測る回数。ほかのプロセスとの取り合いと GC の揺れを、いちばん短い値で外す。 */
const TIMING_RUNS = 3;

async function cpuMillisecondsToDraw(
  content: ShareImageContent,
): Promise<number> {
  const times: number[] = [];
  for (let run = 0; run < TIMING_RUNS; run++) {
    const start = process.cpuUsage();
    const { response } = await renderShareImage(content);
    await response.arrayBuffer();
    const { user, system } = process.cpuUsage(start);
    times.push((user + system) / 1000);
  }
  return Math.min(...times);
}

async function render(content: ShareImageContent): Promise<Rendered> {
  const { response, layout } = await renderShareImage(content);
  const png = await decode(response);
  return { png, layout, lines: placeLines(layout) };
}

const rendered: Record<string, Rendered> = {};
/** 試しの入力ごとの、1枚を PNG に書き出すまでの CPU の時間（数回描いたうちのいちばん短い値）。 */
const cpuMilliseconds: Record<string, number> = {};

/**
 * 描く時間を測る前に描く1枚。書体を取る時間と、4つの書体と、補助情報・数字の結果・名前・読み・副題・色見本のどの段も
 * 初めて通す時間を、測る入力に背負わせない。
 */
const WARM_UP: ShareImageContent = {
  aux: "イロドリ #212の結果",
  numeric: ["10問中", "8問正解"],
  name: "纁 Plex",
  reading: "toki #eea9a9",
  subtitle: "テキストとBase64の相互変換 (UTF-8 対応)",
  swatch: "#eea9a9",
};

beforeAll(async () => {
  await (await renderShareImage(WARM_UP)).response.arrayBuffer();
  // 名前を Zen Antique で組む道も通す（上の名前は Zen Antique に無い字を含み、BIZ UDGothic で組む）。
  await (
    await renderShareImage({ name: "漢字マスター" })
  ).response.arrayBuffer();
  for (const [key, content] of Object.entries(INPUTS)) {
    rendered[key] = await render(content);
    cpuMilliseconds[key] = await cpuMillisecondsToDraw(content);
  }
}, 180_000);

const cases = () => Object.entries(INPUTS).map(([key]) => key);

describe("枠", () => {
  test.each(cases())("%s: 大きさが 1200×630", (key) => {
    const { png } = rendered[key];
    expect([png.width, png.height]).toEqual([
      SHARE_IMAGE_WIDTH,
      SHARE_IMAGE_HEIGHT,
    ]);
  });

  test.each(cases())(
    "%s: 横の罫線が x=0〜1199 の全幅で、縦の線が y=0〜629 の全高で途切れない",
    (key) => {
      const { png } = rendered[key];
      const onRule = (x: number, y: number) =>
        RULE_BOXES.some((box) => inside(box, x, y));
      expect(
        pixelsWhere(png, (x, y) => onRule(x, y) && !isInk(png, x, y)),
      ).toEqual([]);
    },
  );

  test.each(cases())(
    "%s: 上下 15px には縦の線のほかに何も無い（2:1 の切り取り）",
    (key) => {
      const { png } = rendered[key];
      const onVerticalRule = (x: number) =>
        (x >= LEFT_RULE_X && x < LEFT_RULE_X + THICK_RULE) ||
        (x >= RIGHT_RULE_X && x < RIGHT_RULE_X + THICK_RULE);
      const inCropBand = (y: number) =>
        y < CROP_BAND || y >= SHARE_IMAGE_HEIGHT - CROP_BAND;
      expect(
        pixelsWhere(
          png,
          (x, y) => inCropBand(y) && !onVerticalRule(x) && isMarked(png, x, y),
        ),
      ).toEqual([]);
    },
  );

  test.each(cases())("%s: 色見本の中のほかに彩度のある画素が無い", (key) => {
    const { png, layout } = rendered[key];
    const swatch = swatchBox(layout);
    const saturated = (x: number, y: number) => {
      const [r, g, b] = png.pixel(x, y);
      return Math.max(r, g, b) - Math.min(r, g, b) > 2;
    };
    expect(
      pixelsWhere(
        png,
        (x, y) => !(swatch && inside(swatch, x, y)) && saturated(x, y),
      ),
    ).toEqual([]);
  });

  test("サイト名が上端の帯に描かれている", () => {
    const bounds = inkBounds(rendered.quizScore.png, SITE_NAME_BOX);
    expect(bounds).toBeDefined();
    expect(bounds!.left - CONTENT_LEFT).toBeLessThan(GLYPH_TOLERANCE);
  });
});

describe("中身", () => {
  test.each(cases())(
    "%s: 組みで決めた行の箱と見本とサイト名と罫線のほかに、字も線も無い（はみ出しと、見積もりに無い行が無い）",
    (key) => {
      const { png, layout, lines } = rendered[key];
      const swatch = swatchBox(layout);
      const allowed = (x: number, y: number) =>
        RULE_BOXES.some((box) => inside(box, x, y)) ||
        inside(SITE_NAME_BOX, x, y) ||
        (swatch !== undefined && inside(swatch, x, y)) ||
        lines.some((line) => inside(line.box, x, y, GLYPH_TOLERANCE));
      expect(
        pixelsWhere(png, (x, y) => isMarked(png, x, y) && !allowed(x, y)),
      ).toEqual([]);
    },
  );

  test.each(cases())(
    "%s: 見積もりのどの行にも字が描かれていて、字は中身の枠の中にある（見積もりと PNG の行の数が同じ）",
    (key) => {
      const { png, lines } = rendered[key];
      for (const line of lines) {
        const bounds = inkBounds(png, {
          left: CONTENT_LEFT - GLYPH_TOLERANCE,
          top: line.box.top,
          right: CONTENT_LEFT + CONTENT_WIDTH + GLYPH_TOLERANCE,
          bottom: line.box.bottom,
        });
        expect(bounds, line.text).toBeDefined();
        expect(bounds!.right, line.text).toBeLessThanOrEqual(
          CONTENT_LEFT + CONTENT_WIDTH,
        );
      }
    },
  );

  test.each(cases())("%s: 中身が枠の縦に収まる", (key) => {
    expect(rendered[key].layout.height).toBeLessThanOrEqual(CONTENT_MAX_HEIGHT);
  });

  test.each(cases())("%s: 行の頭と終わりに空白が無い", (key) => {
    // 描いた行は組みの行と同じ（上の2つのテスト）なので、組みの行の字で確かめる。
    for (const line of rendered[key].lines) {
      expect(line.text).toBe(line.text.trim());
    }
  });

  test.each(cases())(
    "%s: 描き終えるまでが CPU の時間で1秒を超えない",
    (key) => {
      expect(cpuMilliseconds[key]).toBeLessThan(1000);
    },
  );
});

describe("名前", () => {
  /**
   * 画面の見出しが折る所（DESIGN.md §4）の、元の文の中の位置。文節の頭（頭の空白を前の文節に移したあと）・空白の
   * 後ろ（ダッシュの前を除く）・閉じ括弧の直後。
   */
  function screenBreaks(text: string): Set<number> {
    const breaks = new Set<number>();
    let offset = 0;
    for (const phrase of splitIntoPhrases(text)) {
      breaks.add(offset + (phrase.length - phrase.trimStart().length));
      offset += phrase.length;
    }
    let depth = 0;
    for (let index = 1; index < text.length; index++) {
      const before = text[index - 1];
      const rest = text.slice(index);
      depth = parenDepthAfter(depth, before);
      if (depth > 0) continue;
      if (
        /\s/u.test(before) &&
        /^\S/u.test(rest) &&
        !/^(?:[—―─]|--)/u.test(rest)
      ) {
        breaks.add(index);
      }
      if (/[」』）)]/u.test(before)) breaks.add(index);
    }
    return breaks;
  }

  /** 名前の2行目からの各行が、元の文のどこから始まるか。 */
  function lineStarts(name: string, block: Block): number[] {
    const starts: number[] = [];
    let offset = 0;
    block.lines.forEach((line, index) => {
      const text = line.runs.map((run) => run.text).join("");
      offset = name.indexOf(text, offset);
      if (index > 0) starts.push(offset);
      offset += text.length;
    });
    return starts;
  }

  const nameBlock = (layout: ShareImageLayout) =>
    layout.column.find((block) => block.kind === "name")!;
  const lineTexts = (block: Block) =>
    block.lines.map((line) => line.runs.map((run) => run.text).join(""));

  test.each(cases().filter((key) => key !== "longWord"))(
    "%s: 画面の見出しが折る所（文節の切れ目・空白の後ろ・閉じ括弧の直後）でだけ折れる",
    (key) => {
      const { name } = INPUTS[key];
      const breaks = screenBreaks(name);
      for (const start of lineStarts(name, nameBlock(rendered[key].layout))) {
        expect(breaks.has(start), `${name} を ${start} で折った`).toBe(true);
      }
    },
  );

  test("1行に収まらない語の中でだけ、画面の折り所でない所で折れる", () => {
    const { name } = INPUTS.longWord;
    const word =
      "Supercalifragilisticexpialidociousandevenlongerwordthatcannotfit";
    const wordStart = name.indexOf(word);
    const breaks = screenBreaks(name);
    const starts = lineStarts(name, nameBlock(rendered.longWord.layout));
    expect(starts.length).toBeGreaterThan(0);
    for (const start of starts) {
      const insideWord = start > wordStart && start < wordStart + word.length;
      expect(breaks.has(start) || insideWord, `${start}`).toBe(true);
    }
    expect(
      starts.some(
        (start) => start > wordStart && start < wordStart + word.length,
      ),
    ).toBe(true);
  });

  test.each([
    ["テキストとBase64の相互変換 (UTF-8 対応)", "(UTF-8 対応)"],
    [
      "AIエージェントの思考バイアスとコンテキストエンジニアリング（コンセプト再策定記 1/3）",
      "（コンセプト再策定記 1/3）",
    ],
  ])("丸括弧の中の空白では単位を割らない: %s", (text, group) => {
    const units = lineBreakUnits(text);
    expect(units.join("")).toBe(text);
    expect(units.some((unit) => unit.includes(group))).toBe(true);
  });

  test("丸括弧の外の空白と閉じ括弧の直後では単位を割る", () => {
    expect(lineBreakUnits("Gitコマンド 早見表")).toContain("コマンド ");
    const units = lineBreakUnits("テキスト (UTF-8 対応) の変換");
    expect(units.some((unit) => unit.endsWith("対応) "))).toBe(true);
  });

  test("最初の語を割らず、画面の h1 と同じく空白の後ろで折る（「Git」だけの行を作らない）", () => {
    const lines = lineTexts(nameBlock(rendered.gitCheatsheet.layout));
    expect(lines[0].startsWith("Gitコマンド")).toBe(true);
    expect(lines.every((line) => line !== "Git")).toBe(true);
  });

  /** 名前を1行で組んだときの幅（字の大きさ 1px あたり）。 */
  async function emWidth(text: string): Promise<number> {
    const { layout } = await renderShareImage({ name: text });
    const block = nameBlock(layout);
    return block.lines.reduce((sum, line) => sum + line.width, 0) / block.size;
  }

  test("折り所のどの単位も1行に収まる段のうち、いちばん大きい段を選ぶ（1段上では単位の中で折ることになる）", async () => {
    const { layout } = rendered.unitLimitedTitle;
    const widths = await Promise.all(
      lineBreakUnits(INPUTS.unitLimitedTitle.name).map((unit) =>
        emWidth(unit.trim()),
      ),
    );
    const widest = Math.max(...widths);
    const chosen = NAME_SIZES.indexOf(
      layout.nameSize as (typeof NAME_SIZES)[number],
    );
    expect(chosen).toBeGreaterThan(0);
    expect(widest * layout.nameSize).toBeLessThanOrEqual(CONTENT_WIDTH);
    expect(widest * NAME_SIZES[chosen - 1]).toBeGreaterThan(CONTENT_WIDTH);
  });

  test.each(cases())(
    "%s: 名前は3行以内で、画像の段のどれかで組まれている",
    (key) => {
      const block = nameBlock(rendered[key].layout);
      expect(NAME_SIZES).toContain(block.size);
      expect(block.lines.length).toBeLessThanOrEqual(NAME_MAX_LINES);
    },
  );

  test("短い名前はいちばん上の段で組まれる", () => {
    expect(rendered.swatch.layout.nameSize).toBe(NAME_SIZES[0]);
    expect(rendered.quizScore.layout.nameSize).toBe(NAME_SIZES[0]);
  });

  test("Zen Antique に無い字を含む名前は、和文を丸ごと BIZ UDGothic で組む", () => {
    const families = nameBlock(
      rendered.missingFromZenAntique.layout,
    ).lines.flatMap((line) => line.runs.map((run) => run.family));
    expect(new Set(families)).toEqual(new Set(["BIZ UDGothic"]));
    const zenFamilies = nameBlock(rendered.dash.layout).lines.flatMap((line) =>
      line.runs.map((run) => run.family),
    );
    expect(new Set(zenFamilies)).toEqual(new Set(["Zen Antique"]));
  });

  test("「——」は1本の線につながる", () => {
    const { png, lines } = rendered.dash;
    const line = lines.find((placed) => placed.text.includes("——"))!;
    let longestRun = 0;
    for (let y = Math.round(line.box.top); y < line.box.bottom; y++) {
      let run = 0;
      for (let x = line.box.left; x < line.box.right; x++) {
        run = isMarked(png, x, y) ? run + 1 : 0;
        longestRun = Math.max(longestRun, run);
      }
    }
    // 全角のダッシュ2字ぶんの幅。隙間があると1字ぶんずつの2本に分かれる。
    expect(longestRun).toBeGreaterThan(line.block.size * 1.8);
  });
});

describe("字で割るときの禁則", () => {
  const lineTextsOf = (block: Block) =>
    block.lines.map((line) => line.runs.map((run) => run.text).join(""));

  /** 補助情報の1行に「カ」が何字入るか。 */
  async function katakanaPerAuxLine(): Promise<number> {
    const { layout } = await renderShareImage({
      aux: "カ".repeat(200),
      name: "x",
    });
    return lineTextsOf(layout.aux!)[0].length;
  }

  test.each(["？", "、", "」", "ー"])(
    "補助情報の1行を「カ」で満たした直後の「%s」を、次の行の頭に置かない",
    async (tail) => {
      const perLine = await katakanaPerAuxLine();
      const { layout } = await renderShareImage({
        aux: "カ".repeat(perLine) + tail + "です",
        name: "x",
      });
      const lines = lineTextsOf(layout.aux!);
      expect(lines.length).toBeGreaterThan(1);
      expect(lines.join("")).toBe("カ".repeat(perLine) + tail + "です");
      for (const line of lines) {
        expect(cannotStartLine(line), line).toBe(false);
        expect(cannotEndLine(line), line).toBe(false);
      }
    },
  );

  test("名前の中で字で割られる欧文の語の後ろの「!?」を、行の頭に置かない", async () => {
    // いちばん下の段で1行に入る「x」の数を数え、3行ちょうどを「x」で満たした直後に「!?」を置く。
    const probe = await renderShareImage({ name: "x".repeat(400) });
    const probeName = probe.layout.column.find((b) => b.kind === "name")!;
    expect(probeName.size).toBe(NAME_SIZES[NAME_SIZES.length - 1]);
    const perLine = lineTextsOf(probeName)[0].length;
    const name = "x".repeat(perLine * 3) + "!?";
    const { layout } = await renderShareImage({ name });
    const block = layout.column.find((b) => b.kind === "name")!;
    const lines = lineTextsOf(block);
    expect(lines.join("")).toBe(name);
    for (const line of lines) {
      expect(cannotStartLine(line), line).toBe(false);
    }
  });

  test("開き括弧で行を終えない", async () => {
    const perLine = await katakanaPerAuxLine();
    const aux = "カ".repeat(perLine - 1) + "「カ」です";
    const { layout } = await renderShareImage({ aux, name: "x" });
    const lines = lineTextsOf(layout.aux!);
    expect(lines.join("")).toBe(aux);
    for (const line of lines) {
      expect(cannotEndLine(line), line).toBe(false);
      expect(cannotStartLine(line), line).toBe(false);
    }
  });
});

describe("数字の結果", () => {
  const lineOf = (key: string, kind: Block["kind"]) =>
    rendered[key].lines.find((line) => line.block.kind === kind)!;
  const inkHeight = (key: string, kind: Block["kind"]) => {
    const bounds = inkBounds(rendered[key].png, lineOf(key, kind).box);
    return bounds!.bottom - bounds!.top;
  };

  test("補助情報の下、名前の上に、決まった大きさの1行で組まれる", () => {
    const { layout } = rendered.quizScore;
    expect(layout.column.map((block) => block.kind)).toEqual([
      "numeric",
      "name",
    ]);
    expect(layout.column[0].size).toBe(NUMERIC_SIZE);
    expect(layout.column[0].lines).toHaveLength(1);
    expect(lineOf("quizScore", "numeric").box.bottom).toBeLessThanOrEqual(
      lineOf("quizScore", "name").box.top,
    );
  });

  test("名前がいちばん上の段（96px）でも、字の高さが名前の約1.4倍ある", () => {
    expect(rendered.quizScore.layout.nameSize).toBe(96);
    const ratio =
      inkHeight("quizScore", "numeric") / inkHeight("quizScore", "name");
    expect(ratio).toBeGreaterThan(1.3);
    expect(ratio).toBeLessThan(1.5);
  });

  test("「72点」も同じ大きさで描かれる", () => {
    expect(rendered.gameScore.layout.column[0].size).toBe(NUMERIC_SIZE);
    const ratio =
      inkHeight("gameScore", "numeric") / inkHeight("quizScore", "numeric");
    expect(ratio).toBeGreaterThan(0.9);
    expect(ratio).toBeLessThan(1.1);
  });

  test("1行に収まらないときは、渡した区切りのあいだでだけ折れる", async () => {
    const { layout } = await renderShareImage({
      aux: "漢字力診断の結果",
      numeric: ["1000問中", "1000問正解"],
      name: "漢字マスター",
    });
    const numeric = layout.column[0];
    expect(
      numeric.lines.map((line) => line.runs.map((run) => run.text).join("")),
    ).toEqual(["1000問中", "1000問正解"]);
  });
});

describe("空白", () => {
  /** 行の字の左端から右端までの幅。 */
  async function inkWidth(content: ShareImageContent, kind: Block["kind"]) {
    const result = await render(content);
    const line = result.lines.find((placed) => placed.block.kind === kind)!;
    const bounds = inkBounds(result.png, {
      ...line.box,
      right: CONTENT_LEFT + CONTENT_WIDTH + GLYPH_TOLERANCE,
    })!;
    return { width: bounds.right - bounds.left, size: line.block.size };
  }

  // 同じ文を空白を抜いて描き、空白の数だけ字の幅が広がることを測る。空白が落ちると幅は変わらない。
  test.each([
    ["name", { name: "layoutで not-found" }],
    ["aux", { aux: "イロドリ #212の結果", name: "Bランク" }],
    ["reading", { name: "鴇", reading: "toki #eea9a9" }],
    [
      "subtitle",
      { name: "Base64", subtitle: "テキストとBase64の相互変換 (UTF-8 対応)" },
    ],
  ] as const)("%s の空白が PNG に残る", async (kind, content) => {
    const text = content[kind as keyof typeof content] as string;
    const spaces = text.split(" ").length - 1;
    const withSpaces = await inkWidth(content, kind);
    const withoutSpaces = await inkWidth(
      { ...content, [kind]: text.replaceAll(" ", "") },
      kind,
    );
    expect(withSpaces.width - withoutSpaces.width).toBeGreaterThan(
      spaces * withSpaces.size * 0.15,
    );
  });
});

describe("書体", () => {
  test("欧文の字は IBM Plex Sans で組まれる（Plex だけで描いた字と幅が合う）", async () => {
    const text = "Markdown GFM";
    const { png, lines } = await render({ name: text });
    const line = lines.find((placed) => placed.block.kind === "name")!;
    const inImage = inkBounds(png, {
      ...line.box,
      right: CONTENT_LEFT + CONTENT_WIDTH,
    })!;

    const plex = readFileSync(
      join(process.cwd(), "src/fonts/ibm-plex-sans/IBMPlexSans-Regular.woff"),
    );
    const alone = await decode(
      new ImageResponse(
        <div
          style={{
            display: "flex",
            width: "100%",
            height: "100%",
            backgroundColor: PAPER,
          }}
        >
          <span
            style={{
              fontFamily: "Plex",
              fontSize: line.block.size,
              color: INK,
              whiteSpace: "pre",
            }}
          >
            {text}
          </span>
        </div>,
        {
          width: SHARE_IMAGE_WIDTH,
          height: SHARE_IMAGE_HEIGHT,
          fonts: [{ name: "Plex", data: plex, weight: 400, style: "normal" }],
        },
      ),
    );
    const plexAlone = inkBounds(alone, {
      left: 0,
      top: 0,
      right: SHARE_IMAGE_WIDTH,
      bottom: SHARE_IMAGE_HEIGHT,
    })!;
    expect(
      Math.abs(
        inImage.right - inImage.left - (plexAlone.right - plexAlone.left),
      ),
    ).toBeLessThanOrEqual(1);
  });
});

describe("副題", () => {
  test("中身が枠の縦に収まらないときは、副題を文節の切れ目で切って「…」で終える", async () => {
    const subtitle =
      "性格診断と占い、漢字・四字熟語・伝統色の辞典、漢字・四字熟語・言葉・色の毎日のパズル、文字数カウントなどの道具36本。".repeat(
        3,
      );
    const content = {
      aux: "yolos.net について",
      name: INPUTS.longestBlogTitle.name,
      reading: "ねくすとじぇいえす",
      subtitle,
    };
    const { layout } = await renderShareImage(content);
    expect(layout.subtitleTruncated).toBe(true);
    expect(layout.height).toBeLessThanOrEqual(CONTENT_MAX_HEIGHT);
    const sub = layout.column.find((block) => block.kind === "subtitle")!;
    const text = sub.lines
      .map((line) => line.runs.map((run) => run.text).join(""))
      .join("");
    expect(text.endsWith("…")).toBe(true);
    expect(
      splitIntoPhrases(subtitle).join("").startsWith(text.slice(0, -1)),
    ).toBe(true);
    const name = layout.column.find((block) => block.kind === "name")!;
    const nameText = name.lines
      .map((line) => line.runs.map((run) => run.text).join(""))
      .join("");
    expect(nameText.replaceAll(" ", "")).toBe(content.name.replaceAll(" ", ""));
  });

  test("補助情報の大きさで組む字は 36px", () => {
    const { layout } = rendered.longWord;
    expect(layout.aux!.size).toBe(AUX_SIZE);
    for (const block of layout.column.filter((b) => b.kind !== "name")) {
      expect(block.size).toBe(AUX_SIZE);
    }
  });
});

describe("ブログのすべての題", () => {
  // 組みだけを見るので PNG は読まない。記事の画像のルートと同じ中身で組む。
  test.each(getAllBlogPosts().map((post) => [post.slug, post] as const))(
    "%s: 名前が3行以内で、中身が枠の縦に収まり、副題を切らない",
    async (_, post) => {
      const { layout } = await renderShareImage({
        aux: "ブログ",
        name: post.title,
        subtitle: CATEGORY_LABELS[post.category],
      });
      const name = layout.column.find((block) => block.kind === "name")!;
      expect(name.lines.length).toBeLessThanOrEqual(NAME_MAX_LINES);
      expect(layout.height).toBeLessThanOrEqual(CONTENT_MAX_HEIGHT);
      expect(layout.subtitleTruncated).toBe(false);
    },
  );
});

describe("代替テキスト・URL", () => {
  test("代替テキストは画像に書いてある字を、書いてある順に言う", () => {
    expect(
      shareImageAlt({
        aux: "動物性格診断の結果",
        name: "エゾシカ——北の大地を群れで駆ける繊細戦士",
      }),
    ).toBe(
      "yolos.net 動物性格診断の結果 エゾシカ——北の大地を群れで駆ける繊細戦士",
    );
    expect(shareImageAlt(INPUTS.quizScore)).toBe(
      "yolos.net 漢字力診断の結果 10問中8問正解 漢字マスター",
    );
    expect(shareImageAlt(INPUTS.swatch)).toBe(
      "yolos.net 伝統色辞典 鴇 toki #eea9a9",
    );
  });

  const post = {
    aux: "ブログ",
    name: "Gitコマンド 早見表",
    subtitle: "ツールガイド",
  };

  test("画像の URL は、ページの URL の下の opengraph-image に版（?v=）を付けたもの", () => {
    expect(shareImageUrl("/blog/x", post)).toMatch(
      new RegExp(`^${BASE_URL}/blog/x/opengraph-image\\?v=[0-9a-f]{16}$`),
    );
    expect(shareImageUrl("/", post)).toMatch(
      new RegExp(`^${BASE_URL}/opengraph-image\\?v=[0-9a-f]{16}$`),
    );
  });

  test("版は、中身を変えたときだけ変わる（キーの順には依らない）", () => {
    const version = (content: ShareImageContent) =>
      shareImageUrl("/blog/x", content).split("?v=")[1];
    expect(version(post)).toBe(version({ ...post }));
    expect(version(post)).toBe(
      version({ subtitle: post.subtitle, name: post.name, aux: post.aux }),
    );
    expect(version({ ...post, name: "Gitコマンド 早見表 — 用途別" })).not.toBe(
      version(post),
    );
    expect(version({ ...post, subtitle: "開発ノート" })).not.toBe(
      version(post),
    );
  });

  test("openGraph.images に渡す画像は、URL・大きさ・画像に書いた字の代替テキストを持つ", () => {
    expect(shareOpenGraphImage("/blog/x", post)).toEqual({
      url: shareImageUrl("/blog/x", post),
      width: 1200,
      height: 630,
      alt: "yolos.net ブログ Gitコマンド 早見表 ツールガイド",
    });
  });
});

describe("書体を取れないとき", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  test("Google Fonts が失敗を返すと、描かずに例外を投げる（ビルドが止まる）", async () => {
    vi.resetModules();
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("", { status: 404 })),
    );
    const { renderShareImage: renderFresh } = await import("@/lib/share-image");
    await expect(renderFresh({ name: "x" })).rejects.toThrow(/returned 404/);
  });

  test("TrueType でない書体を返すと、描かずに例外を投げる", async () => {
    vi.resetModules();
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string) =>
        String(url).includes("css2")
          ? new Response("src: url(https://fonts.gstatic.com/x.ttf)")
          : new Response(new Uint8Array([0x77, 0x4f, 0x46, 0x32])),
      ),
    );
    const { renderShareImage: renderFresh } = await import("@/lib/share-image");
    await expect(renderFresh({ name: "x" })).rejects.toThrow(/not a TrueType/);
  });
});
