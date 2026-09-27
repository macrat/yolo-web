/**
 * 記事の図（DESIGN.md §5 の図）の色・大きさ・gantt の組み方・最初に見せる位置の決め方。描画から切り離して、
 * 単体で試せる形にする。
 */

/** 図の中の字の下限。§4 の補助情報の大きさ（rem）。 */
export const FIGURE_TEXT_MIN_REM = 0.875;

type Matrix = readonly [
  readonly [number, number, number],
  readonly [number, number, number],
  readonly [number, number, number],
];

function multiply(matrix: Matrix, vector: readonly number[]): number[] {
  return matrix.map(
    (row) => row[0] * vector[0] + row[1] * vector[1] + row[2] * vector[2],
  );
}

/** CSS Color 4 の D50 の白色点。 */
const D50_WHITE = [0.3457 / 0.3585, 1, (1 - 0.3457 - 0.3585) / 0.3585];

/** XYZ（D50）から XYZ（D65）への Bradford の変換。 */
const D50_TO_D65: Matrix = [
  [0.955473421488075, -0.02309845494876471, 0.06325924320057072],
  [-0.0283697093338637, 1.0099953980813041, 0.021041441191917323],
  [0.012314014864481998, -0.020507649298898964, 1.330365926242124],
];

/** XYZ（D65）から線形の sRGB への変換。 */
const XYZ_TO_LINEAR_SRGB: Matrix = [
  [3.2409699419045226, -1.537383177570094, -0.4986107602930034],
  [-0.9692436362808796, 1.8759675015077202, 0.04155505740717559],
  [0.05563007969699366, -0.20397695888897652, 1.0569715142428786],
];

/** OKLab の LMS の立方根から線形の sRGB への変換。 */
const OKLAB_TO_LMS: Matrix = [
  [1, 0.3963377774, 0.2158037573],
  [1, -0.1055613458, -0.0638541728],
  [1, -0.0894841775, -1.291485548],
];

const LMS_TO_LINEAR_SRGB: Matrix = [
  [4.0767416621, -3.3077115913, 0.2309699292],
  [-1.2684380046, 2.6097574011, -0.3413193965],
  [-0.0041960863, -0.7034186147, 1.707614701],
];

/** CIE Lab の定数（κ と ε）。 */
const LAB_KAPPA = 24389 / 27;
const LAB_EPSILON = 216 / 24389;

function labToLinearSrgb(l: number, a: number, b: number): number[] {
  const fy = (l + 16) / 116;
  const fx = fy + a / 500;
  const fz = fy - b / 200;
  const inverse = (f: number) =>
    f ** 3 > LAB_EPSILON ? f ** 3 : (116 * f - 16) / LAB_KAPPA;
  const xyz = [
    inverse(fx) * D50_WHITE[0],
    (l > LAB_KAPPA * LAB_EPSILON ? fy ** 3 : l / LAB_KAPPA) * D50_WHITE[1],
    inverse(fz) * D50_WHITE[2],
  ];
  return multiply(XYZ_TO_LINEAR_SRGB, multiply(D50_TO_D65, xyz));
}

function oklabToLinearSrgb(l: number, a: number, b: number): number[] {
  const lms = multiply(OKLAB_TO_LMS, [l, a, b]).map((value) => value ** 3);
  return multiply(LMS_TO_LINEAR_SRGB, lms);
}

function encodeSrgb(linear: number): number {
  const clamped = Math.min(1, Math.max(0, linear));
  const encoded =
    clamped <= 0.0031308
      ? 12.92 * clamped
      : 1.055 * Math.pow(clamped, 1 / 2.4) - 0.055;
  return Math.round(encoded * 255);
}

/** 8ビットの sRGB の成分を hex の色に直す。 */
export function toHexColor(red: number, green: number, blue: number): string {
  return (
    "#" +
    [red, green, blue]
      .map((channel) => channel.toString(16).padStart(2, "0"))
      .join("")
  );
}

const NUMBER = String.raw`([-+]?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?)(%?)`;
const FUNCTION_PATTERN = new RegExp(
  String.raw`^(lab|oklab|oklch|rgba?)\(\s*${NUMBER}[\s,]+${NUMBER}[\s,]+${NUMBER}(?:deg)?\s*(?:[,/][^)]*)?\)$`,
  "i",
);

/**
 * CSS の色の値（hex・rgb()・lab()・oklab()・oklch()）を、sRGB の hex に数で直す。mermaid が色の計算に使う
 * khroma は hex・rgb・hsl・色の名前しか読まず、トークンの値（oklch と、ビルドが直した lab）を読まない。
 * sRGB の外の色は、成分ごとに sRGB の中に詰める。読めない値は null。
 */
export function cssColorToHex(value: string): string | null {
  const text = value.trim();
  const hex = /^#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i.exec(text);
  if (hex) {
    const digits =
      hex[1].length <= 4
        ? Array.from(hex[1].slice(0, 3), (digit) => digit + digit).join("")
        : hex[1].slice(0, 6);
    return `#${digits.toLowerCase()}`;
  }
  const match = FUNCTION_PATTERN.exec(text);
  if (!match) return null;
  const kind = match[1].toLowerCase();
  const read = (index: number, percentScale: number) =>
    match[index + 1]
      ? (parseFloat(match[index]) * percentScale) / 100
      : parseFloat(match[index]);
  if (kind === "rgb" || kind === "rgba") {
    const channels = [2, 4, 6].map((index) =>
      Math.round(Math.min(255, Math.max(0, read(index, 255)))),
    );
    return toHexColor(channels[0], channels[1], channels[2]);
  }
  let linear: number[];
  if (kind === "lab") {
    linear = labToLinearSrgb(read(2, 100), read(4, 125), read(6, 125));
  } else if (kind === "oklab") {
    linear = oklabToLinearSrgb(read(2, 1), read(4, 0.4), read(6, 0.4));
  } else {
    const chroma = read(4, 0.4);
    const hue = (parseFloat(match[6]) * Math.PI) / 180;
    linear = oklabToLinearSrgb(
      read(2, 1),
      chroma * Math.cos(hue),
      chroma * Math.sin(hue),
    );
  }
  const [red, green, blue] = linear.map(encodeSrgb);
  return toHexColor(red, green, blue);
}

/** 図の描き方。 */
export interface FigurePlan {
  /** 図を描く倍率。 */
  scale: number;
  /** コンテンツ幅に収まるか。収まらない図は、ボックスの中で横に送る。 */
  fits: boolean;
}

/**
 * 図を描く倍率を決める。naturalWidth は図の元の幅、available はコンテンツ幅、smallestText は図の中のいちばん
 * 小さい字の元の大きさ、minText は字の下限（px）。
 * 収まる図は元の大きさで描く。収まらない図は、字が下限を下回らない所まで縮め、それでも収まらなければ下限の
 * 大きさのまま横に送る。元の大きさより大きくはしない（字の大きさは図を描く設定が決める）。
 */
export function planFigure(
  naturalWidth: number,
  available: number,
  smallestText: number,
  minText: number,
): FigurePlan {
  const fitScale = available / naturalWidth;
  const floor = Math.min(1, minText / smallestText);
  const scale = Math.max(Math.min(1, fitScale), floor);
  return { scale, fits: scale <= fitScale };
}

/** 横に送る図で、最初に見せる図の始まり。 */
export type FigureStart = "left" | "right" | "top" | "bottom";

/**
 * 図の始まりの位置を、図の元の文から決める。流れ図は向きの指定（TB・TD は上、BT は下、RL は右、LR は左）の
 * 端から描き始まり、向きを書かない流れ図は上から描かれる。順序図・gantt など、流れ図でない図は左から始まる。
 */
export function figureStart(source: string): FigureStart {
  const header = /^\s*(?:flowchart|graph)\b[ \t]*(TB|TD|BT|RL|LR)?/im.exec(
    source.replace(/^\s*%%.*$/gm, ""),
  );
  if (!header) return "left";
  switch (header[1]?.toUpperCase()) {
    case "BT":
      return "bottom";
    case "RL":
      return "right";
    case "LR":
      return "left";
    default:
      return "top";
  }
}

/**
 * 横に送る図の最初の送り位置。center は見せたい所（図の始まり）の、送る範囲の左端からの位置で、そこを見える
 * 幅の真ん中に置く。送れる範囲の外には出さない。
 */
export function startScrollLeft(
  center: number,
  viewport: number,
  scrollWidth: number,
): number {
  const max = Math.max(0, scrollWidth - viewport);
  return Math.min(max, Math.max(0, Math.round(center - viewport / 2)));
}

/** gantt の目盛りの間隔の候補（mermaid の tickInterval の書き方と、その長さ）。短い順。 */
const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const GANTT_TICK_INTERVALS: readonly (readonly [string, number])[] = [
  ["1minute", MINUTE],
  ["5minute", 5 * MINUTE],
  ["10minute", 10 * MINUTE],
  ["15minute", 15 * MINUTE],
  ["30minute", 30 * MINUTE],
  ["1hour", HOUR],
  ["2hour", 2 * HOUR],
  ["3hour", 3 * HOUR],
  ["6hour", 6 * HOUR],
  ["12hour", 12 * HOUR],
  ["1day", DAY],
  ["2day", 2 * DAY],
  ["1week", 7 * DAY],
  ["2week", 14 * DAY],
  ["1month", 30 * DAY],
  ["3month", 91 * DAY],
  ["6month", 182 * DAY],
];

/**
 * 目盛りの字が重ならない、いちばん細かい目盛りの間隔を選ぶ。spanMs は時間の軸の長さ、axisWidth は軸の幅、
 * pitch は目盛りの字1つが要る幅（字の幅と字どうしのあき）。どの候補でも重なるときは、いちばん粗い間隔。
 */
export function chooseTickInterval(
  spanMs: number,
  axisWidth: number,
  pitch: number,
): string {
  for (const [interval, length] of GANTT_TICK_INTERVALS) {
    if ((axisWidth * length) / spanMs >= pitch) return interval;
  }
  return GANTT_TICK_INTERVALS[GANTT_TICK_INTERVALS.length - 1][0];
}

/** gantt の横の組み方（mermaid の gantt の設定の値）。 */
export interface GanttLayout {
  /** 図の幅。 */
  useWidth: number;
  /** 区分の名前を置く、左の余白。 */
  leftPadding: number;
  /** 右の余白。 */
  rightPadding: number;
  /** 目盛りの間隔。 */
  tickInterval?: string;
}

/** 描いた gantt の字や帯の横の範囲（図の元の座標）。 */
export interface TextSpan {
  left: number;
  right: number;
}

/** 帯の名前と、その帯（組にできたとき）。 */
export interface TaskLabel extends TextSpan {
  bar?: TextSpan;
}

/** 描いた gantt を測った値。 */
export interface GanttMeasure {
  /** 時間の軸の長さ（ミリ秒）。 */
  spanMs: number;
  /** 目盛りの字。 */
  ticks: TextSpan[];
  /** 区分の名前のいちばん右の端。 */
  sectionRight: number;
  /** 帯の名前の字と、その帯。 */
  labels: TaskLabel[];
}

/** 時間の軸を広げるときの、いちばん小さい倍率。 */
const GANTT_WIDEN_STEP = 1.25;

/**
 * gantt を描き直す組み方を決める。gantt は渡された幅に時間の軸を詰めて描くので、次の順に1つずつ決め、決めた
 * 組み方で描き直してから次へ進む。
 * 1. 左の余白は区分の名前の右端から gap の所まで、右の余白は軸の右の端からはみ出す字（最後の目盛りの字の半分・
 *    帯の右に置かれた名前）が収まる所までにする。図の幅は変えないので、図の右の外に出る名前は、軸を細くして
 *    図の中に入れる。
 * 2. 目盛りの字が重なるときは、重ならない所まで目盛りを間引く。
 * 3. それでも目盛りの字が重なるか、帯の名前が区分の名前に掛かるときだけ、時間の軸を広げる。
 *    長さを持つ帯の名前は、その帯の中に収まる所まで一度に広げる。
 * 時間の軸は、目盛りの字を2つ並べられる幅より細くしない。組み方が変わらなければ null。
 */
export function planGantt(
  layout: GanttLayout,
  measure: GanttMeasure,
  gap: number,
): GanttLayout | null {
  const axisEnd = layout.useWidth - layout.rightPadding;
  let overhang = 0;
  for (const text of [...measure.ticks, ...measure.labels]) {
    overhang = Math.max(overhang, text.right - axisEnd);
  }
  const sorted = measure.ticks.slice().sort((a, b) => a.left - b.left);
  let ticksCrowd = false;
  let widest = 0;
  for (let i = 0; i < sorted.length; i++) {
    widest = Math.max(widest, sorted[i].right - sorted[i].left);
    if (i > 0 && sorted[i].left - sorted[i - 1].right < gap) ticksCrowd = true;
  }
  const pitch = widest + gap;
  const minAxis = Math.ceil(pitch * 2);
  const withAxis = (
    leftPadding: number,
    rightPadding: number,
    axis: number,
    thin: boolean,
  ): GanttLayout => ({
    useWidth: leftPadding + axis + rightPadding,
    leftPadding,
    rightPadding,
    tickInterval: thin
      ? chooseTickInterval(measure.spanMs, axis, pitch)
      : undefined,
  });

  const leftPadding = Math.ceil(measure.sectionRight + gap);
  const rightPadding = Math.ceil(overhang + gap / 2);
  if (
    leftPadding !== layout.leftPadding ||
    rightPadding !== layout.rightPadding
  ) {
    const axis = Math.max(
      minAxis,
      layout.useWidth - leftPadding - rightPadding,
    );
    return withAxis(
      leftPadding,
      rightPadding,
      axis,
      layout.tickInterval !== undefined,
    );
  }

  const axis = layout.useWidth - leftPadding - rightPadding;
  if (
    ticksCrowd &&
    chooseTickInterval(measure.spanMs, axis, pitch) !== layout.tickInterval
  ) {
    return withAxis(leftPadding, rightPadding, axis, true);
  }
  const crowded = measure.labels.filter(
    (label) => label.left < measure.sectionRight + gap / 2,
  );
  if (ticksCrowd || crowded.length > 0) {
    let stretch = GANTT_WIDEN_STEP;
    for (const label of crowded) {
      const bar = label.bar ? label.bar.right - label.bar.left : 0;
      if (bar > 0) {
        stretch = Math.max(stretch, (label.right - label.left + gap) / bar);
      }
    }
    return withAxis(
      leftPadding,
      rightPadding,
      Math.ceil(Math.max(axis, minAxis) * stretch),
      layout.tickInterval !== undefined || ticksCrowd,
    );
  }
  return null;
}

/** 行の頭に置かない字（§4 の禁則。閉じ括弧・句読点・！？・…・中点・小書きの仮名・長音符・繰り返し記号）。 */
const LINE_START_FORBIDDEN =
  /^[)）\]］」』】〕〉》〙〗、。，．,.!！?？…‥・：:；;ぁぃぅぇぉっゃゅょゎゕゖァィゥェォッャュョヮヵヶㇰ-ㇿーｰ々〻ゝゞヽヾ]/;

/** 行の終わりに置かない字（開き括弧）。 */
const LINE_END_FORBIDDEN = /[(（\[［「『【〔〈《〘〖]$/;

/** 語の中の字（英数字と、ファイル名や命令の名前をつなぐ記号）。 */
const WORD_CHARACTER = /[A-Za-z0-9_.\-/<>]/;

/** 折り返した文の行の、読みにくい折れの数。 */
export interface LineProblems {
  /** 1字だけの行。 */
  single: number;
  /** 行の頭か終わりの禁則の破れ。 */
  forbidden: number;
  /** 英数字の語の中の折れ（ファイル名・命令の名前が割れる）。 */
  splitWords: number;
}

/**
 * 1つの文（改行で区切った1かたまり）を折り返した行を調べる。1行だけの文は、折れが無いので数えない。
 */
export function lineProblems(lines: readonly string[]): LineProblems {
  const problems: LineProblems = { single: 0, forbidden: 0, splitWords: 0 };
  if (lines.length < 2) return problems;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (Array.from(line).length === 1) problems.single++;
    if (
      (i > 0 && LINE_START_FORBIDDEN.test(line)) ||
      (i < lines.length - 1 && LINE_END_FORBIDDEN.test(line))
    ) {
      problems.forbidden++;
    }
    if (i > 0) {
      const before = lines[i - 1].slice(-1);
      const after = lines[i].charAt(0);
      if (WORD_CHARACTER.test(before) && WORD_CHARACTER.test(after)) {
        problems.splitWords++;
      }
    }
  }
  return problems;
}

/** 箱の中の文の折り返しの幅を1つ試して描いた結果。 */
export interface WrapTrial {
  /** 折り返しの幅。 */
  wrap: number;
  /** その幅で描いた図が、コンテンツ幅に収まるか（planFigure の fits）。 */
  fits: boolean;
  /** 図の元の幅。 */
  width: number;
  /** 読みにくい折れ（1字だけの行・禁則の破れ・語の中の折れ）と、字の重なりの数の合計。 */
  flaws: number;
}

/**
 * 描いて試した組み方から、図を描く組み方を選ぶ。読みにくい折れと重なりの無いものだけを候補にし（どれにもあるときは
 * いちばん少ないものを候補にする）、収まるものがあれば、そのうち折り返しの幅がいちばん広いものにする（語を割らな
 * い）。収まるものが無ければ、元の幅がいちばん狭くなるものにする（横に送る量を減らす）。同じなら先に試したもの。
 */
export function chooseWrap<T extends WrapTrial>(trials: readonly T[]): T {
  const fewest = Math.min(...trials.map((trial) => trial.flaws));
  const clean = trials.filter((trial) => trial.flaws === fewest);
  const fitting = clean.filter((trial) => trial.fits);
  if (fitting.length > 0) {
    return fitting.reduce((best, trial) =>
      trial.wrap > best.wrap ? trial : best,
    );
  }
  return clean.reduce((best, trial) =>
    trial.width < best.width ? trial : best,
  );
}

/**
 * 流れ図の箱の中の文の折り返しの幅の候補を、箱の文の長さから決める。広い順。widths は、折り返さずに描いたときの
 * 文のかたまり（書き手の改行で区切ったもの）の幅。どの候補も、それより短いかたまりを1行のまま残し、長いかたまり
 * だけを折る幅にする（文の長さと関係の無い幅で折ると、最後の1字だけが次の行に落ちやすい）。いちばん狭い候補は
 * min で、max 以上の候補は持たない。
 */
export function wrapCandidates(
  widths: readonly number[],
  min: number,
  max: number,
): number[] {
  const candidates = new Set<number>();
  for (const width of widths) {
    const wrap = Math.ceil(width) + 1;
    if (wrap > min && wrap < max) candidates.add(wrap);
  }
  candidates.add(min);
  return [...candidates].sort((a, b) => b - a);
}
