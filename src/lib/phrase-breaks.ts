/**
 * 見出しを文節で折るための区切り（DESIGN.md §4）。
 *
 * 文節は BudouX の日本語のモデルで分け、そのうえで行の頭と終わりに置けない字の所と、数字の後ろの区切りを外す。
 * BudouX の分け方の表は大きいので、クライアントのバンドルに入れないよう、区切りはサーバーで作る。
 * クライアントの部品が描く見出しには、サーバーの page.tsx がここで作った区切りを props で渡す。
 * 区切りを組むのは PhrasedText の部品。
 */
import { loadDefaultJapaneseParser } from "budoux";

/** 行の頭に置かない字。閉じ括弧・句読点・感嘆符と疑問符・リーダ・中点類・小書きの仮名・長音符・繰り返し記号。 */
const NO_LINE_START =
  /^[)\]}）］｝〕〉》」』】〙〗〟’”»、。，．,.！？!?‼⁇⁈⁉…‥・：；:;ぁぃぅぇぉっゃゅょゎゕゖァィゥェォッャュョヮヵヶㇰ-ㇿーゝゞヽヾ々〻]/u;

/** 行の終わりに置かない字。開き括弧。 */
const NO_LINE_END = /[(\[{（［｛〔〈《「『【〘〖〝‘“«]$/u;

const ENDS_WITH_DIGIT = /[0-9０-９]$/u;
const STARTS_WITH_SPACE = /^\s/u;

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

const graphemes = new Intl.Segmenter("ja", { granularity: "grapheme" });

function isSingleCharacter(phrase: string): boolean {
  const iterator = graphemes.segment(phrase)[Symbol.iterator]();
  return !iterator.next().done && iterator.next().done === true;
}

/**
 * text を、見出しの行の切れ目にしてよい所で分けた文節の並びを返す。並びをつなぐと text に戻る。
 * 最後の文節が1字なら前の文節につなぎ、見出しの最後の行を1字だけにしない。
 */
export function splitIntoPhrases(text: string): string[] {
  parser ??= loadDefaultJapaneseParser();
  const phrases: string[] = [];
  for (const chunk of parser.parse(text)) {
    const previous = phrases.at(-1);
    if (previous !== undefined && isUnbreakable(previous, chunk)) {
      phrases[phrases.length - 1] = previous + chunk;
    } else {
      phrases.push(chunk);
    }
  }
  const last = phrases.length > 1 ? phrases[phrases.length - 1] : undefined;
  if (last !== undefined && isSingleCharacter(last)) {
    phrases.pop();
    phrases[phrases.length - 1] += last;
  }
  return phrases;
}
