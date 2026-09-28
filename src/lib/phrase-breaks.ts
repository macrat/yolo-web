/**
 * 見出しと表のセルを文節で折るための区切り（DESIGN.md §4）。
 *
 * 文節は BudouX の日本語のモデルで分け、そのうえで行の頭と終わりに置けない字の所、数の後ろ、丸括弧の中の
 * 区切りを外す。見出しでは、語の切れ目の折り所をさらに次のように足し引きする。
 * - 中点で並べた語（「ひらがな・カタカナ」）の後ろと、英字を含む語が漢字か片仮名の語に移る所（「Base64|エンコード」）に
 *   折り所を足し、中点で並べた平仮名の語の中の折り所を外す。
 * - 閉じ括弧の後ろに2字までの続きがある文節は、続きを次の文節の頭に移す。閉じ括弧の直後はブラウザが折るので、
 *   続きだけで行を作らない。
 * - 最初の文節の、最初の空白より前には、字の種類が変わって語が始まる所の折り所を足す。この部分は行の頭から始まるので、
 *   この折り所は、この部分が1行に収まらないときの代わりにだけ使われる。
 * - 見出しの狭い行に収まらない幅の文節には、語と語の切れ目（漢字・片仮名・英字の語の頭と、「〜する」の頭）の折り所を
 *   足す。
 *   収まらない文節をブラウザが字の所で割ると、1字の行や行頭の約物が出るので、代わりに語の切れ目で折れるようにする。
 *   <wbr> の折り所に優先の順は無く、文節が1行に収まる広い行でも行の終わりに来れば使われるので、語の中には置かない。
 * BudouX の分け方の表は大きいので、クライアントのバンドルに入れないよう、区切りはサーバーで作る。
 * クライアントの部品から読み込むとビルドが止まる（server-only）。クライアントの部品が描く見出しには、
 * サーバーの page.tsx がここで作った区切りを props で渡す。
 * 区切りを組むのは PhrasedText の部品。
 */
import "server-only";
import { jaModel, loadDefaultJapaneseParser } from "budoux";

/** 行の頭に置かない字。閉じ括弧・句読点・感嘆符と疑問符・リーダ・中点類・小書きの仮名・長音符・繰り返し記号。 */
const NO_LINE_START =
  /^[)\]}）］｝〕〉》」』】〙〗〟’”»、。，．,.！？!?‼⁇⁈⁉…‥・：；:;ぁぃぅぇぉっゃゅょゎゕゖァィゥェォッャュョヮヵヶㇰ-ㇿーゝゞヽヾ々〻]/u;

/** 行の終わりに置かない字。開き括弧。 */
const NO_LINE_END = /[(\[{（［｛〔〈《「『【〘〖〝‘“«]$/u;

/** 数で終わる文。英字に続く数字（「Base64」）は語の一部で、数ではない。 */
const ENDS_WITH_NUMBER = /(?:^|[^A-Za-z0-9０-９])[0-9０-９]+$/u;
const STARTS_WITH_SPACE = /^\s/u;

/** ダッシュ（「—」「──」「--」）で始まる文。ダッシュは行の頭に置かず、前の語に付ける。 */
const STARTS_WITH_DASH = /^(?:[—―─]|--)/u;
const DASH_CHAR = /^[—―─-]$/u;

/**
 * 丸括弧。読み仮名（「藍色(あいいろ)」）や添えた数（「部首（198）」）を囲み、中は1つのまとまりとして
 * 読まれるので、中では折らない。鉤括弧は文を引き、中にも文節があるので含めない。
 */
const OPEN_PAREN = /[(（]/u;
const CLOSE_PAREN = /[)）]/u;

/** 直後でブラウザが折る閉じ括弧（Unicode の改行の規則。`word-break: keep-all` でも折れる）。 */
const CLOSING_BRACKET = /[」』）)]/u;

const MIDDLE_DOT = "・";

/** 英字・数字と、語の中に入る記号の続き。 */
const LATIN_WORD_CHAR = /^[A-Za-z0-9./+#-]$/u;
const LATIN_LETTER = /[A-Za-z]/u;

/**
 * 見出しの行が既定の文字サイズで収める幅（全角の字の数）のうち、いちばん狭いもの。記事の主見出しを 320px の画面で
 * 組んだ行に、全角の字が6字余り入る。これより広い文節は、この行に収まらずに文節の中で折れうる。
 */
const NARROWEST_HEADING_LINE = 6;

/** 続きだけの行を作らないよう、閉じ括弧の後ろから次の文節へ移す続きの字の数の上限。 */
const SHORT_TAIL = 2;

let parser: ReturnType<typeof loadDefaultJapaneseParser> | undefined;

/** text を行の頭に置けないか。行の頭に置かない字か、ダッシュで始まる。 */
export function cannotStartLine(text: string): boolean {
  return NO_LINE_START.test(text) || STARTS_WITH_DASH.test(text);
}

/** text で行を終えられないか。行の終わりに置かない字（開き括弧）で終わる。 */
export function cannotEndLine(text: string): boolean {
  return NO_LINE_END.test(text);
}

/** char が、直後でブラウザが見出しの文節の中でも折る閉じ括弧か。 */
export function isClosingBracket(char: string): boolean {
  return CLOSING_BRACKET.test(char);
}

/**
 * 文節の境を置けない所か。行の頭と終わりに置けない字の所と、数とそれに続く字（「3秒後に」「10年」の助数詞）の
 * あいだでは折らない。
 */
function isUnbreakable(before: string, after: string): boolean {
  const head = after.trimStart();
  return (
    cannotStartLine(head) ||
    cannotEndLine(before) ||
    (ENDS_WITH_NUMBER.test(before) && !STARTS_WITH_SPACE.test(after))
  );
}

/**
 * text の中で閉じていない丸括弧の数を、depth から数え進める。丸括弧の一続きの中では折らない（§4）ので、見出しの
 * 折り所を別の組み方で足すところ（サーバーで描く画像の字の組み方）も、これで丸括弧の中かどうかを数える。
 */
export function parenDepthAfter(depth: number, text: string): number {
  let next = depth;
  for (const ch of text) {
    if (OPEN_PAREN.test(ch)) next += 1;
    else if (CLOSE_PAREN.test(ch)) next = Math.max(0, next - 1);
  }
  return next;
}

const graphemes = new Intl.Segmenter("ja", { granularity: "grapheme" });
const words = new Intl.Segmenter("ja", { granularity: "word" });

function toGraphemes(text: string): string[] {
  return Array.from(graphemes.segment(text), ({ segment }) => segment);
}

type Script = "han" | "katakana" | "hiragana" | "other";

function scriptOf(grapheme: string): Script {
  if (/^[\p{Script=Katakana}ー]/u.test(grapheme)) return "katakana";
  if (/^[\p{Script=Han}々〻]/u.test(grapheme)) return "han";
  if (/^\p{Script=Hiragana}/u.test(grapheme)) return "hiragana";
  return "other";
}

/** chars[from] から同じ字の種類が続く字数。step が -1 なら前へ数える。 */
function scriptRunLength(chars: string[], from: number, step: 1 | -1): number {
  const script = scriptOf(chars[from]);
  let length = 0;
  for (
    let index = from;
    index >= 0 && index < chars.length && scriptOf(chars[index]) === script;
    index += step
  ) {
    length += 1;
  }
  return length;
}

/** 字の並びを、境目の位置（字の番号）で分ける。 */
function cut(chars: string[], offsets: Iterable<number>): string[] {
  const pieces: string[] = [];
  let start = 0;
  for (const offset of [...offsets].sort((a, b) => a - b)) {
    if (offset <= start || offset >= chars.length) continue;
    pieces.push(chars.slice(start, offset).join(""));
    start = offset;
  }
  pieces.push(chars.slice(start).join(""));
  return pieces;
}

/** 境目の位置（字の番号）。 */
function offsetsOf(pieces: string[]): number[] {
  const offsets: number[] = [];
  let offset = 0;
  for (const piece of pieces.slice(0, -1)) {
    offset += toGraphemes(piece).length;
    offsets.push(offset);
  }
  return offsets;
}

/** chars の各位置の前で閉じていない丸括弧の数。 */
function parenDepths(chars: string[]): number[] {
  const depths: number[] = [];
  let depth = 0;
  for (const ch of chars) {
    depths.push(depth);
    depth = parenDepthAfter(depth, ch);
  }
  return depths;
}

/** chars[index] を含む英字・数字の語が英字を含むか。 */
function isLatinWordAt(chars: string[], index: number): boolean {
  let start = index;
  while (start > 0 && LATIN_WORD_CHAR.test(chars[start - 1])) start -= 1;
  let end = index;
  while (end < chars.length - 1 && LATIN_WORD_CHAR.test(chars[end + 1]))
    end += 1;
  return LATIN_LETTER.test(chars.slice(start, end + 1).join(""));
}

/** chars[index] を含む平仮名の続きが、中点に接するか（中点で並べた平仮名の語）。 */
function isListedHiraganaWord(chars: string[], index: number): boolean {
  let start = index;
  while (start > 0 && scriptOf(chars[start - 1]) === "hiragana") start -= 1;
  let end = index;
  while (end < chars.length - 1 && scriptOf(chars[end + 1]) === "hiragana")
    end += 1;
  return chars[start - 1] === MIDDLE_DOT || chars[end + 1] === MIDDLE_DOT;
}

interface Word {
  start: number;
  end: number;
  text: string;
}

/** 片仮名の続きを語に刻んだ切れ端の字の数の下限。これより短い切れ端があれば、その続きの刻みを信じない。 */
const MIN_KATAKANA_WORD = 3;

/** text を Intl.Segmenter で語に刻み、字の番号で返す。 */
function wordsOf(text: string): Word[] {
  const out: Word[] = [];
  let start = 0;
  for (const { segment } of words.segment(text)) {
    const length = toGraphemes(segment).length;
    out.push({ start, end: start + length, text: segment });
    start += length;
  }
  return out;
}

/**
 * 語の頭の位置（字の番号）。Intl.Segmenter の語の境目のうち、片仮名の続きの中の境目は、その続きのどの切れ端も
 * 3字以上のときだけ採る。辞書に無い外来語は短い切れ端に刻まれる（「リ|ファクタ|リング」「デザイン|トーク|ン」）ので、
 * その続きの中は語の頭にしない。
 */
function wordStartsOf(chars: string[], text: string): Set<number> {
  const all = wordsOf(text);
  const starts = new Set(all.map((word) => word.start).filter((i) => i > 0));
  let run = 0;
  while (run < chars.length) {
    if (scriptOf(chars[run]) !== "katakana") {
      run += 1;
      continue;
    }
    let end = run;
    while (end < chars.length && scriptOf(chars[end]) === "katakana") end += 1;
    const inside = all.filter((word) => word.start >= run && word.end <= end);
    if (inside.some((word) => word.end - word.start < MIN_KATAKANA_WORD)) {
      for (let index = run + 1; index < end; index += 1) starts.delete(index);
    }
    run = end;
  }
  return starts;
}

/** 漢字か片仮名を含む語の中の位置か（BudouX が語の中に置く境目「見た|目」「切り|替え」を見分ける）。 */
function isInsideWord(words: Word[], index: number): boolean {
  return words.some(
    (word) =>
      word.start < index &&
      index < word.end &&
      /[\p{Script=Han}\p{Script=Katakana}]/u.test(word.text),
  );
}

/**
 * BudouX の分け方を、見出しの語の切れ目で直す。漢字か片仮名を含む語の中の境目（「見た|目」「切り|替え」）と、
 * 中点で並べた平仮名の語の中の境目を外し（BudouX は「ひらが|な・カタカナ」と割る）、ダッシュの後ろ（「ガイド──|シェア」。
 * ダッシュは前の語に付けて組むので、後ろに折り所が無いと前後の語がまるごと1つになる）と、中点の後ろと、英字を含む語から漢字か片仮名の語に移る所に境目を足す。丸括弧の中には足さない。
 */
function refineAtWords(chunks: string[]): string[] {
  const text = chunks.join("");
  const chars = toGraphemes(text);
  const depths = parenDepths(chars);
  const segments = wordsOf(text);
  const offsets = new Set(
    offsetsOf(chunks).filter(
      (offset) =>
        !isInsideWord(segments, offset) &&
        !(
          scriptOf(chars[offset - 1]) === "hiragana" &&
          scriptOf(chars[offset]) === "hiragana" &&
          isListedHiraganaWord(chars, offset)
        ),
    ),
  );
  for (let index = 1; index < chars.length; index += 1) {
    if (depths[index] > 0) continue;
    const before = chars[index - 1];
    const after = chars[index];
    const afterDot =
      before === MIDDLE_DOT &&
      index >= 2 &&
      !STARTS_WITH_SPACE.test(chars[index - 2]) &&
      !STARTS_WITH_SPACE.test(after);
    const latinToJapanese =
      LATIN_WORD_CHAR.test(before) &&
      (scriptOf(after) === "han" || scriptOf(after) === "katakana") &&
      isLatinWordAt(chars, index - 1);
    const afterDash =
      DASH_CHAR.test(before) &&
      !DASH_CHAR.test(after) &&
      !STARTS_WITH_SPACE.test(after) &&
      (before !== "-" || chars[index - 2] === "-");
    if (afterDot || latinToJapanese || afterDash) offsets.add(index);
  }
  return cut(chars, offsets);
}

/**
 * 閉じ括弧の後ろに2字までの続きがある文節（「「yolos.net」に」）は、続きを次の文節の頭に移す。閉じ括弧の直後は
 * ブラウザが折るので、そのままでは続きの字（「に」）だけで行ができうる。
 */
function moveTailsAfterClosingBrackets(phrases: string[]): string[] {
  const moved = [...phrases];
  for (let index = 0; index < moved.length - 1; index += 1) {
    const chars = toGraphemes(moved[index]);
    const bracket = chars.findLastIndex((ch) => CLOSING_BRACKET.test(ch));
    if (bracket <= 0 || bracket === chars.length - 1) continue;
    const head = chars.slice(0, bracket + 1).join("");
    const tail = chars.slice(bracket + 1).join("");
    if (
      chars.length - bracket - 1 > SHORT_TAIL ||
      parenDepthAfter(0, head) > 0 ||
      isUnbreakable(head, tail)
    ) {
      continue;
    }
    moved[index] = head;
    moved[index + 1] = tail + moved[index + 1];
  }
  return moved;
}

/**
 * 最初の文節を、字の種類が変わって漢字か片仮名の語が始まる所（「チューリング|型思考者」「ことわざ|ビギナー」）で
 * さらに分ける。収まらない文節をブラウザが字の所で割ると、「思考／者」のように1字の行や、行頭の長音符が出るので、
 * 代わりに語の切れ目で折れるようにする。
 * 分けるのは、最初の空白より前で、切れ目の前後がどちらも2字以上の同じ字の種類の続きで、丸括弧の中でない所だけ
 * （丸括弧の中でも折る指定のときは、丸括弧の中も分ける）。
 * 最初の空白より前は行の頭から始まるので、この折り所は、そこが1行に収まらないときにしか使われない。空白の後ろは
 * ブラウザが空白で折れば行の途中から始まりうるので、分けると次の行に丸ごと入る語まで割る（「Unix タイムスタンプ／
 * 変換ツール」）。
 */
function splitFirstPhraseAtWords(
  phrase: string,
  breakInParens: boolean,
): string[] {
  const chars = toGraphemes(phrase);
  const pieces: string[] = [];
  let start = 0;
  let depth = 0;
  const firstSpace = chars.findIndex((grapheme) =>
    STARTS_WITH_SPACE.test(grapheme),
  );
  const end = firstSpace === -1 ? chars.length : firstSpace;
  for (let index = 1; index < end; index += 1) {
    depth = parenDepthAfter(depth, chars[index - 1]);
    const before = scriptOf(chars[index - 1]);
    const after = scriptOf(chars[index]);
    if (
      (breakInParens || depth === 0) &&
      (after === "han" || after === "katakana") &&
      before !== "other" &&
      before !== after &&
      scriptRunLength(chars, index - 1, -1) >= 2 &&
      scriptRunLength(chars, index, 1) >= 2 &&
      !isUnbreakable(chars.slice(start, index).join(""), chars[index])
    ) {
      pieces.push(chars.slice(start, index).join(""));
      start = index;
    }
  }
  pieces.push(chars.slice(start).join(""));
  return pieces;
}

/** 全角の字を1とした幅。半角の字は 0.5 とする。 */
function widthOf(chars: string[]): number {
  return chars.reduce(
    (width, ch) =>
      width +
      ((ch.codePointAt(0) ?? 0) < 0x1100 || /^[\uFF61-\uFF9F]/u.test(ch)
        ? 0.5
        : 1),
    0,
  );
}

/**
 * 空白で区切った続きのうち、いちばん広いものの幅。空白ではブラウザが折る。ダッシュの前の空白は、PhrasedText が
 * 折れない空白にしてダッシュを前の語に付けるので、区切りに数えない。
 */
function widestRunWidth(chars: string[]): number {
  let widest = 0;
  let run: string[] = [];
  const tail = [...chars, " "];
  tail.forEach((ch, index) => {
    const breaks =
      STARTS_WITH_SPACE.test(ch) &&
      !STARTS_WITH_DASH.test(tail.slice(index).join("").trimStart());
    if (breaks) {
      widest = Math.max(widest, widthOf(run));
      run = [];
    } else {
      run.push(ch);
    }
  });
  return widest;
}

/**
 * 行を1つで作ってよい切れ端か。文字（約物を除く）が2字以上で、平仮名だけなら3字以上（「た:」「から」「なら、」
 * だけの行を作らない）。
 */
function canStandAlone(chars: string[]): boolean {
  const letters = chars.filter((ch) => /^[\p{L}\p{N}]/u.test(ch));
  if (letters.length < 2) return false;
  return (
    letters.length >= 3 || !letters.every((ch) => scriptOf(ch) === "hiragana")
  );
}

/** サ変の動詞の頭（「リリース|しました」「表示|されない」）。 */
const SURU_VERB = /^[しさすせ]/u;

/**
 * 文節の中の語の頭（wordStartsOf）の、折り所としての順位。数の小さいほうを先に使う。折り所にしない所は undefined。
 * 0: 漢字・片仮名・英字の語が始まる所（「思考|バイアス」「マルチ|エージェント」「プログラマティック|SEO」）。漢字どうしの
 *    所（「漢字|力」）と、英字の語の中は除く。
 * 1: 漢字か片仮名の語からサ変の動詞に移る所（「リリース|しました」）。
 * どちらも語と語の切れ目なので、文節が1行に収まる広い行で使われても語を割らない（`<wbr>` には優先の順が無く、
 * 行の終わりに来た折り所は幅によらず使われる）。語の中と、助詞や送り仮名の前には置かない。語が1行に入らないときは、
 * ブラウザがその語の中で折る。
 */
function wordBreakRank(before: string, after: string): number | undefined {
  const left = scriptOf(before);
  const right = LATIN_LETTER.test(after) ? "latin" : scriptOf(after);
  if (right === "han" && left !== "han") return 0;
  if (right === "katakana") return 0;
  if (right === "latin" && left !== "other") return 0;
  if (
    right === "hiragana" &&
    (left === "han" || left === "katakana") &&
    SURU_VERB.test(after)
  ) {
    return 1;
  }
  return undefined;
}

let scorer: ((sentence: string) => number[]) | undefined;

/**
 * BudouX の日本語のモデルが、文の各位置（1 から）を文節の境目とみなす度合い。parse は 0 を超える所だけを境目に
 * するが、ここでは境目に満たない所どうしを比べるために値そのものを返す。
 */
export function boundaryScores(sentence: string): number[] {
  if (!scorer) {
    const model = new Map(
      Object.entries(jaModel).map(([name, table]) => [
        name,
        new Map(Object.entries(table as Record<string, number>)),
      ]),
    );
    const base =
      -0.5 *
      [...model.values()]
        .flatMap((table) => [...table.values()])
        .reduce((sum, value) => sum + value, 0);
    const features: [string, number, number][] = [
      ["UW1", -3, -2],
      ["UW2", -2, -1],
      ["UW3", -1, 0],
      ["UW4", 0, 1],
      ["UW5", 1, 2],
      ["UW6", 2, 3],
      ["BW1", -2, 0],
      ["BW2", -1, 1],
      ["BW3", 0, 2],
      ["TW1", -3, 0],
      ["TW2", -2, 1],
      ["TW3", -1, 2],
      ["TW4", 0, 3],
    ];
    scorer = (text) => {
      const scores = [0];
      for (let index = 1; index < text.length; index += 1) {
        let score = base;
        for (const [name, from, to] of features) {
          score +=
            model.get(name)?.get(text.substring(index + from, index + to)) ?? 0;
        }
        scores.push(score);
      }
      return scores;
    };
  }
  return scorer(sentence);
}

/**
 * 見出しの狭い行（NARROWEST_HEADING_LINE）に収まらない幅の文節を、語の切れ目で収まるまで分ける（「思考|バイアスと」
 * 「リリース|しました:」）。収まらない切れ端ごとに、語の切れ目のうち、禁則を満たし、丸括弧の中でなく、分けた切れ端の
 * どちらもが1行を作ってよい所（canStandAlone）から、順位（wordBreakRank）、BudouX の度合いの順にいちばん良い所で
 * 分ける。どの切れ端も、分けられる所が無ければそのまま残す。
 * 語の頭は wordStartsOf で見る。分けられる所が無い語はそのまま残し、1行に入らなければブラウザがその中で折る。
 */
function splitWidePhraseAtWords(phrase: string): string[] {
  const chars = toGraphemes(phrase);
  const depths = parenDepths(chars);
  const unitOffsets: number[] = [];
  let unit = 0;
  for (const ch of chars) {
    unitOffsets.push(unit);
    unit += ch.length;
  }
  const scores = boundaryScores(phrase);
  const candidates: { index: number; rank: number; score: number }[] = [];
  for (const index of wordStartsOf(chars, phrase)) {
    if (depths[index] > 0) continue;
    const rank = wordBreakRank(chars[index - 1], chars[index]);
    if (rank !== undefined) {
      candidates.push({ index, rank, score: scores[unitOffsets[index]] });
    }
  }
  const split = (from: number, to: number): number[] => {
    const piece = chars.slice(from, to);
    if (widestRunWidth(piece) <= NARROWEST_HEADING_LINE) return [];
    const best = candidates
      .filter(
        ({ index }) =>
          index > from &&
          index < to &&
          canStandAlone(chars.slice(from, index)) &&
          canStandAlone(chars.slice(index, to)) &&
          !isUnbreakable(
            chars.slice(from, index).join(""),
            chars.slice(index, to).join(""),
          ),
      )
      .sort((a, b) => a.rank - b.rank || b.score - a.score)[0];
    if (!best) return [];
    return [...split(from, best.index), best.index, ...split(best.index, to)];
  };
  return cut(chars, split(0, chars.length));
}

interface PhraseOptions {
  /**
   * 組む先が表のセルか（DESIGN.md §4）。表のセルは丸括弧の中も文節で折る。表のセルの括弧は読み仮名や数でなく説明を
   * 囲み、中にも文節がある。開き括弧の直後と閉じ括弧の直前で折らない禁則は残る。列の幅はいちばん長い文節で決まるので、
   * 見出しだけのための足し引き（中点・英字の語の後ろ、閉じ括弧の後ろの続き、広い文節の中の語の切れ目）はしない。
   * 最初の文節の字の種類の変わり目の折り所は、見出しと同じく置く。
   */
  tableCell?: boolean;
}

/**
 * text を、行の切れ目にしてよい所で分けた並びを返す。並びをつなぐと text に戻る。
 * 区切りは文節の切れ目と、見出しでは語の切れ目（ファイルの頭の説明）。最後の文節が1字なら前の文節につなぎ、
 * 最後の行を1字だけにしない。
 */
export function splitIntoPhrases(
  text: string,
  { tableCell = false }: PhraseOptions = {},
): string[] {
  if (text === "") return [];
  parser ??= loadDefaultJapaneseParser();
  const chunks = parser.parse(text);
  let phrases: string[] = [];
  let parenDepth = 0;
  for (const chunk of tableCell ? chunks : refineAtWords(chunks)) {
    const previous = phrases.at(-1);
    if (
      previous !== undefined &&
      ((!tableCell && parenDepth > 0) || isUnbreakable(previous, chunk))
    ) {
      phrases[phrases.length - 1] = previous + chunk;
    } else {
      phrases.push(chunk);
    }
    parenDepth = parenDepthAfter(parenDepth, chunk);
  }
  if (!tableCell) phrases = moveTailsAfterClosingBrackets(phrases);
  const last = phrases.length > 1 ? phrases[phrases.length - 1] : undefined;
  if (last !== undefined && toGraphemes(last).length === 1) {
    phrases.pop();
    phrases[phrases.length - 1] += last;
  }
  phrases = [
    ...splitFirstPhraseAtWords(phrases[0], tableCell),
    ...phrases.slice(1),
  ];
  return tableCell ? phrases : phrases.flatMap(splitWidePhraseAtWords);
}

/**
 * 手で区切った見出しの並び（コードに書いた決まった文。PhrasedText の約束）が、splitIntoPhrases と同じ禁則を
 * 満たすか。行の頭と終わりに置けない字の所・数とそれに続く字のあいだ・丸括弧の中に区切りが無く、最後の文節が
 * 1字でないこと。
 */
export function followsPhraseRules(phrases: readonly string[]): boolean {
  let depth = 0;
  for (const [index, phrase] of phrases.entries()) {
    if (phrase === "") return false;
    if (index > 0 && (depth > 0 || isUnbreakable(phrases[index - 1], phrase))) {
      return false;
    }
    depth = parenDepthAfter(depth, phrase);
  }
  const last = phrases.at(-1);
  return !(phrases.length > 1 && last && toGraphemes(last).length === 1);
}
