/**
 * 見出しを文節で折るための区切り（DESIGN.md §4）。
 *
 * 文節は BudouX の日本語のモデルで分け、そのうえで行の頭と終わりに置けない字の所、数字の後ろ、丸括弧の中の
 * 区切りを外す。
 * BudouX の分け方の表は大きいので、クライアントのバンドルに入れないよう、区切りはサーバーで作る。
 * クライアントの部品から読み込むとビルドが止まる（server-only）。クライアントの部品が描く見出しには、
 * サーバーの page.tsx がここで作った区切りを props で渡す。
 * 区切りを組むのは PhrasedText の部品。
 */
import "server-only";
import { loadDefaultJapaneseParser } from "budoux";

/** 行の頭に置かない字。閉じ括弧・句読点・感嘆符と疑問符・リーダ・中点類・小書きの仮名・長音符・繰り返し記号。 */
const NO_LINE_START =
  /^[)\]}）］｝〕〉》」』】〙〗〟’”»、。，．,.！？!?‼⁇⁈⁉…‥・：；:;ぁぃぅぇぉっゃゅょゎゕゖァィゥェォッャュョヮヵヶㇰ-ㇿーゝゞヽヾ々〻]/u;

/** 行の終わりに置かない字。開き括弧。 */
const NO_LINE_END = /[(\[{（［｛〔〈《「『【〘〖〝‘“«]$/u;

const ENDS_WITH_DIGIT = /[0-9０-９]$/u;
const STARTS_WITH_SPACE = /^\s/u;

/**
 * 丸括弧。読み仮名（「和顔愛語（わがんあいご）」）や添えた数（「部首（198）」）を囲み、中は1つのまとまりとして
 * 読まれるので、中では折らない。鉤括弧は文を引き、中にも文節があるので含めない。
 */
const OPEN_PAREN = /[(（]/u;
const CLOSE_PAREN = /[)）]/u;

let parser: ReturnType<typeof loadDefaultJapaneseParser> | undefined;

/**
 * 文節の境を置けない所か。行の頭と終わりに置けない字の所と、数字とそれに続く字（「3秒後に」「10年」の助数詞）の
 * あいだでは折らない。
 */
function isUnbreakable(before: string, after: string): boolean {
  return (
    NO_LINE_START.test(after) ||
    NO_LINE_END.test(before) ||
    (ENDS_WITH_DIGIT.test(before) && !STARTS_WITH_SPACE.test(after))
  );
}

/** text の中で閉じていない丸括弧の数を、depth から数え進める。 */
function parenDepthAfter(depth: number, text: string): number {
  let next = depth;
  for (const ch of text) {
    if (OPEN_PAREN.test(ch)) next += 1;
    else if (CLOSE_PAREN.test(ch)) next = Math.max(0, next - 1);
  }
  return next;
}

const graphemes = new Intl.Segmenter("ja", { granularity: "grapheme" });

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

/**
 * 最初の文節を、字の種類が変わって漢字か片仮名の語が始まる所（「チューリング|型思考者」「ことわざ|ビギナー」）で
 * さらに分ける。最初の文節は行の頭から始まるので、この折り所は文節が1行に収まらないときにしか使われない。
 * 収まらない文節をブラウザが字の所で割ると、「思考／者」のように1字の行や、行頭の長音符が出るので、代わりに語の
 * 切れ目で折れるようにする。
 * 分けるのは、切れ目の前後がどちらも2字以上の同じ字の種類の続きで、丸括弧の中でない所だけ。
 */
function splitFirstPhraseAtWords(phrase: string): string[] {
  const chars = toGraphemes(phrase);
  const pieces: string[] = [];
  let start = 0;
  let depth = 0;
  for (let index = 1; index < chars.length; index += 1) {
    depth = parenDepthAfter(depth, chars[index - 1]);
    const before = scriptOf(chars[index - 1]);
    const after = scriptOf(chars[index]);
    if (
      depth === 0 &&
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

/**
 * text を、見出しの行の切れ目にしてよい所で分けた並びを返す。並びをつなぐと text に戻る。
 * 区切りは文節の切れ目と、最初の文節の中の語の切れ目。最後の文節が1字なら前の文節につなぎ、見出しの最後の行を
 * 1字だけにしない。
 */
export function splitIntoPhrases(text: string): string[] {
  parser ??= loadDefaultJapaneseParser();
  const phrases: string[] = [];
  let parenDepth = 0;
  for (const chunk of parser.parse(text)) {
    const previous = phrases.at(-1);
    if (
      previous !== undefined &&
      (parenDepth > 0 || isUnbreakable(previous, chunk))
    ) {
      phrases[phrases.length - 1] = previous + chunk;
    } else {
      phrases.push(chunk);
    }
    parenDepth = parenDepthAfter(parenDepth, chunk);
  }
  const last = phrases.length > 1 ? phrases[phrases.length - 1] : undefined;
  if (last !== undefined && toGraphemes(last).length === 1) {
    phrases.pop();
    phrases[phrases.length - 1] += last;
  }
  if (phrases.length === 0) return phrases;
  return [...splitFirstPhraseAtWords(phrases[0]), ...phrases.slice(1)];
}
