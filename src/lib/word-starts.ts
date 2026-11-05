/**
 * 見出しと名前の中の語の頭（DESIGN.md §4）。見出しの広い文節と名前を語の切れ目で分ける所（phrase-breaks.ts）と、
 * 組んだ見出しの折れが語の切れ目か語の中かを測る所（.claude/skills/frontend-design/SKILL.md の測り方）が、同じ語の頭を
 * 使う。語の辞書（Intl.Segmenter）だけで決まり、ほかのモジュールを読み込まないので、測るスクリプトは Node から
 * このファイルを直に読み込める（`node --experimental-strip-types`）。
 */

const graphemes = new Intl.Segmenter("ja", { granularity: "grapheme" });
const words = new Intl.Segmenter("ja", { granularity: "word" });

/** text を字（書記素）に分ける。語の頭の位置は、この字の番号で数える。 */
export function toGraphemes(text: string): string[] {
  return Array.from(graphemes.segment(text), ({ segment }) => segment);
}

export type Script = "han" | "katakana" | "hiragana" | "other";

export function scriptOf(grapheme: string): Script {
  if (/^[\p{Script=Katakana}ー]/u.test(grapheme)) return "katakana";
  if (/^[\p{Script=Han}々〻]/u.test(grapheme)) return "han";
  if (/^\p{Script=Hiragana}/u.test(grapheme)) return "hiragana";
  return "other";
}

export interface Word {
  start: number;
  end: number;
  text: string;
}

/** text を Intl.Segmenter で語に刻み、字の番号で返す。 */
export function wordsOf(text: string): Word[] {
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
 * 片仮名の続きを刻んだ切れ端を、それだけで1つの語とみなす字の数の下限。語の辞書は、辞書に無い外来語を短い切れ端に
 * 刻む（「バリ|デー|ター」）。辞書にある語の頭や終わりを刻むこともあり（「アク|セ|スト|ラッカー」の「ト」）、
 * 短い語そのもの（「ハッシュ|タグ」の「タグ」）もある。どれか見分けられないので、これより短い切れ端は、となりどうしで
 * つないだものを1つの語とみなす。
 */
const MIN_KATAKANA_WORD = 3;

/**
 * 欠片をつないだものを、1つの語とみなす字の数の下限。つないだものは、辞書の語に続く外来語の終わりの4字までの
 * 切れ端（「プログラマ|テ|ィ|ッ|ク」の「ティック」）でもありうるので、それより長いときだけ1つの語とする。
 */
const MIN_JOINED_KATAKANA_WORD = 5;

/**
 * 欠片をつないだ語の前の辞書の語の字の数の下限。語の辞書は、辞書に無い外来語の頭の4字までを辞書の語として刻み、
 * 残りを欠片にする（「フレンド|リー」「トレーサ|ビリ|テ|ィ」「リュウ|グ|ウノ|ツ|カイ」）。辞書が語の境目をずらして
 * 刻むこともある（「ホバート|ラン|ジ|ション」「フロート|ラ|フ|ィ|ッ|ク」）。どちらも欠片が次の語とつながると、語の
 * 中に語の頭が置かれるので、前の語がそれより長いときだけ、あいだを語の切れ目とする。
 */
const MIN_KATAKANA_WORD_BEFORE_JOINED = 5;

/**
 * 英語の語尾（-ing・-tion）を写した3字。語の辞書は、辞書に無い外来語の終わりのこの3字を、同じ形の語として刻む
 * （「フィルタ|リング」「チャン|キング」「パーティ|ション」）ので、前の切れ端に付けて語の頭にしない。「リング」
 * 「キング」が語そのもの（ring・king）のときも見分けられないので、同じく前に付ける（「フォーカスリング」は分けない）。
 */
const LOANWORD_SUFFIX = /^(?:リング|キング|ション)$/u;

/** 語の頭に来ない字（撥音）。この字で始まる切れ端は、前の切れ端の続きとする（「デザイン|トーク|ン」）。 */
const NO_WORD_START = /^ン/u;

/** 小書きの仮名で始まる切れ端。前の1字の欠片と1つの音を作る（「ジ|ェ」）。 */
const SMALL_KANA = /^[ァィゥェォッャュョヮヵヶ]/u;

interface Unit {
  start: number;
  length: number;
  /** 欠片をつないだ語か。 */
  joined: boolean;
  /** 頭が2字以上の切れ端か、小書きの仮名と音を作る1字か。 */
  firmHead: boolean;
}

/**
 * 片仮名の続きを刻んだ語（words）を、語の単位に組み直す。英語の語尾の3字（LOANWORD_SUFFIX）と撥音で始まる
 * 切れ端は前の切れ端に付け（「フィルタ|リング」→「フィルタリング」、「トーク|ン」→「トークン」）、となり合う欠片
 * （MIN_KATAKANA_WORD より短い切れ端）はつないで1つの語にする（「バリ|デー|ター」→「バリデーター」）。
 */
function katakanaUnits(words: Word[]): Unit[] {
  const units: Unit[] = [];
  for (const [index, word] of words.entries()) {
    const length = word.end - word.start;
    const joined = length < MIN_KATAKANA_WORD;
    const last = units.at(-1);
    if (
      last &&
      (LOANWORD_SUFFIX.test(word.text) ||
        NO_WORD_START.test(word.text) ||
        (joined && last.joined))
    ) {
      last.length += length;
    } else {
      units.push({
        start: word.start,
        length,
        joined,
        firmHead: length >= 2 || SMALL_KANA.test(words[index + 1]?.text ?? ""),
      });
    }
  }
  return units;
}

/**
 * 片仮名の続きを刻んだ語（words）のうち、語の頭として採る位置。語を単位に組み直し（katakanaUnits）、どの単位も
 * 1つの語と決められるときだけ、単位の頭を語の頭にする（「メールアドレス|バリデーター」「フィルタリング|パイプライン」
 * 「デザイン|トークン」）。単位が1つなら、続きの中に語の頭は無く（「レン|ダ|リング」→「レンダリング」）、単位の頭
 * （続きの頭か、続きの前からかかる語との境目「省エネ|モード」）だけを返す。
 * 欠片をつないだ語は、辞書の語の頭や終わりを取り込みうる（「アク|セ|スト|ラッカー」をつなぐと「アクセスト」になる）。
 * それでも1つの語とみなすのは、続きの終わりにあり、MIN_JOINED_KATAKANA_WORD 字以上で、前の辞書の語が
 * MIN_KATAKANA_WORD_BEFORE_JOINED 字以上で、頭が確かなとき（firmHead）だけである。頭が1字の欠片で、小書きの仮名と
 * 音を作らないときは、その字が前の語の終わりか、前の語に頭を取られた語の残りでありうる（「サプライ|ズ|ガ|ッ|コウ」
 * 「シングルス|ケ|ー|ラ|ブル」）。つないだ語が続きの途中や頭にあるか（「リ|ファクタ|リング」「アク|セ|スト|ラッカー」）、
 * 短いか、前の語が短いか（「フレンド|リー|バリ|デー|ター」「リュウ|グ|ウノ|ツ|カイ」）、頭が確かでなければ、どこまでが
 * 1つの語かを決められないので、続きの中には語の頭を置かない。
 * この決め方は、辞書の語が辞書に無い外来語の頭で、残りが次の語とつながって長くなると見分けられず、語の中に語の頭を
 * 置く（「プログラマ|テ|ィ|ッ|ク」に語が続く「プログラマ|ティックジェネレーター」）。
 */
function katakanaWordStarts(words: Word[]): number[] {
  const units = katakanaUnits(words);
  if (units.length <= 1) return units.map((unit) => unit.start);
  const settled = units.every(
    (unit, index) =>
      !unit.joined ||
      (index === units.length - 1 &&
        unit.firmHead &&
        unit.length >= MIN_JOINED_KATAKANA_WORD &&
        units[index - 1].length >= MIN_KATAKANA_WORD_BEFORE_JOINED),
  );
  return settled ? units.map((unit) => unit.start) : [];
}

/**
 * text の語の頭の位置（字の番号。0 は含めない）。Intl.Segmenter の語の境目を採り、片仮名の続きの中の境目は
 * katakanaWordStarts で選ぶ。
 */
export function wordStartsOf(text: string): Set<number> {
  const chars = toGraphemes(text);
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
    const kept = new Set(
      katakanaWordStarts(
        all.filter((word) => word.start >= run && word.end <= end),
      ),
    );
    for (let index = run + 1; index < end; index += 1) {
      if (!kept.has(index)) starts.delete(index);
    }
    run = end;
  }
  return starts;
}
