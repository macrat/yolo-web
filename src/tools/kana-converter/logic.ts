export type KanaConvertMode =
  | "hiragana-to-katakana"
  | "katakana-to-hiragana"
  | "to-fullwidth-katakana"
  | "to-halfwidth-katakana";

// Halfwidth katakana -> fullwidth katakana base mapping
const HALFWIDTH_KATAKANA_MAP: Record<string, string> = {
  "\uFF66": "\u30F2", // ｦ -> ヲ
  "\uFF67": "\u30A1", // ｧ -> ァ
  "\uFF68": "\u30A3", // ｨ -> ィ
  "\uFF69": "\u30A5", // ｩ -> ゥ
  "\uFF6A": "\u30A7", // ｪ -> ェ
  "\uFF6B": "\u30A9", // ｫ -> ォ
  "\uFF6C": "\u30E3", // ｬ -> ャ
  "\uFF6D": "\u30E5", // ｭ -> ュ
  "\uFF6E": "\u30E7", // ｮ -> ョ
  "\uFF6F": "\u30C3", // ｯ -> ッ
  "\uFF70": "\u30FC", // ｰ -> ー
  "\uFF71": "\u30A2", // ｱ -> ア
  "\uFF72": "\u30A4", // ｲ -> イ
  "\uFF73": "\u30A6", // ｳ -> ウ
  "\uFF74": "\u30A8", // ｴ -> エ
  "\uFF75": "\u30AA", // ｵ -> オ
  "\uFF76": "\u30AB", // ｶ -> カ
  "\uFF77": "\u30AD", // ｷ -> キ
  "\uFF78": "\u30AF", // ｸ -> ク
  "\uFF79": "\u30B1", // ｹ -> ケ
  "\uFF7A": "\u30B3", // ｺ -> コ
  "\uFF7B": "\u30B5", // ｻ -> サ
  "\uFF7C": "\u30B7", // ｼ -> シ
  "\uFF7D": "\u30B9", // ｽ -> ス
  "\uFF7E": "\u30BB", // ｾ -> セ
  "\uFF7F": "\u30BD", // ｿ -> ソ
  "\uFF80": "\u30BF", // ﾀ -> タ
  "\uFF81": "\u30C1", // ﾁ -> チ
  "\uFF82": "\u30C4", // ﾂ -> ツ
  "\uFF83": "\u30C6", // ﾃ -> テ
  "\uFF84": "\u30C8", // ﾄ -> ト
  "\uFF85": "\u30CA", // ﾅ -> ナ
  "\uFF86": "\u30CB", // ﾆ -> ニ
  "\uFF87": "\u30CC", // ﾇ -> ヌ
  "\uFF88": "\u30CD", // ﾈ -> ネ
  "\uFF89": "\u30CE", // ﾉ -> ノ
  "\uFF8A": "\u30CF", // ﾊ -> ハ
  "\uFF8B": "\u30D2", // ﾋ -> ヒ
  "\uFF8C": "\u30D5", // ﾌ -> フ
  "\uFF8D": "\u30D8", // ﾍ -> ヘ
  "\uFF8E": "\u30DB", // ﾎ -> ホ
  "\uFF8F": "\u30DE", // ﾏ -> マ
  "\uFF90": "\u30DF", // ﾐ -> ミ
  "\uFF91": "\u30E0", // ﾑ -> ム
  "\uFF92": "\u30E1", // ﾒ -> メ
  "\uFF93": "\u30E2", // ﾓ -> モ
  "\uFF94": "\u30E4", // ﾔ -> ヤ
  "\uFF95": "\u30E6", // ﾕ -> ユ
  "\uFF96": "\u30E8", // ﾖ -> ヨ
  "\uFF97": "\u30E9", // ﾗ -> ラ
  "\uFF98": "\u30EA", // ﾘ -> リ
  "\uFF99": "\u30EB", // ﾙ -> ル
  "\uFF9A": "\u30EC", // ﾚ -> レ
  "\uFF9B": "\u30ED", // ﾛ -> ロ
  "\uFF9C": "\u30EF", // ﾜ -> ワ
  "\uFF9D": "\u30F3", // ﾝ -> ン
};

// Dakuten combos: base fullwidth katakana + dakuten -> combined
const DAKUTEN_MAP: Record<string, string> = {
  "\u30AB": "\u30AC", // カ -> ガ
  "\u30AD": "\u30AE", // キ -> ギ
  "\u30AF": "\u30B0", // ク -> グ
  "\u30B1": "\u30B2", // ケ -> ゲ
  "\u30B3": "\u30B4", // コ -> ゴ
  "\u30B5": "\u30B6", // サ -> ザ
  "\u30B7": "\u30B8", // シ -> ジ
  "\u30B9": "\u30BA", // ス -> ズ
  "\u30BB": "\u30BC", // セ -> ゼ
  "\u30BD": "\u30BE", // ソ -> ゾ
  "\u30BF": "\u30C0", // タ -> ダ
  "\u30C1": "\u30C2", // チ -> ヂ
  "\u30C4": "\u30C5", // ツ -> ヅ
  "\u30C6": "\u30C7", // テ -> デ
  "\u30C8": "\u30C9", // ト -> ド
  "\u30CF": "\u30D0", // ハ -> バ
  "\u30D2": "\u30D3", // ヒ -> ビ
  "\u30D5": "\u30D6", // フ -> ブ
  "\u30D8": "\u30D9", // ヘ -> ベ
  "\u30DB": "\u30DC", // ホ -> ボ
  "\u30A6": "\u30F4", // ウ -> ヴ
};

const HANDAKUTEN_MAP: Record<string, string> = {
  "\u30CF": "\u30D1", // ハ -> パ
  "\u30D2": "\u30D4", // ヒ -> ピ
  "\u30D5": "\u30D7", // フ -> プ
  "\u30D8": "\u30DA", // ヘ -> ペ
  "\u30DB": "\u30DD", // ホ -> ポ
};

// Reverse mapping: fullwidth katakana -> halfwidth katakana
const FULLWIDTH_TO_HALFWIDTH_MAP: Record<string, string> = {};
for (const [half, full] of Object.entries(HALFWIDTH_KATAKANA_MAP)) {
  FULLWIDTH_TO_HALFWIDTH_MAP[full] = half;
}

// Add dakuten/handakuten decompositions to reverse map
for (const [base, combined] of Object.entries(DAKUTEN_MAP)) {
  FULLWIDTH_TO_HALFWIDTH_MAP[combined] =
    (FULLWIDTH_TO_HALFWIDTH_MAP[base] ?? base) + "\uFF9E";
}
for (const [base, combined] of Object.entries(HANDAKUTEN_MAP)) {
  FULLWIDTH_TO_HALFWIDTH_MAP[combined] =
    (FULLWIDTH_TO_HALFWIDTH_MAP[base] ?? base) + "\uFF9F";
}

function hiraganaToKatakana(input: string): string {
  let result = "";
  for (let i = 0; i < input.length; i++) {
    const code = input.charCodeAt(i);
    // Hiragana range: U+3041 - U+3096
    if (code >= 0x3041 && code <= 0x3096) {
      result += String.fromCharCode(code + 0x60);
    } else {
      result += input[i];
    }
  }
  return result;
}

function katakanaToHiragana(input: string): string {
  let result = "";
  for (let i = 0; i < input.length; i++) {
    const code = input.charCodeAt(i);
    // Katakana range: U+30A1 - U+30F6
    // But some katakana-only chars (U+30F7-U+30FA: ヷヸヹヺ) have no hiragana equivalent
    if (code >= 0x30a1 && code <= 0x30f6) {
      result += String.fromCharCode(code - 0x60);
    } else {
      result += input[i];
    }
  }
  return result;
}

function toFullwidthKatakana(input: string): string {
  let result = "";
  for (let i = 0; i < input.length; i++) {
    const ch = input[i];
    if (ch in HALFWIDTH_KATAKANA_MAP) {
      // Check for dakuten (U+FF9E) or handakuten (U+FF9F) following
      const fullBase = HALFWIDTH_KATAKANA_MAP[ch];
      const next = input[i + 1];
      if (next === "\uFF9E" && fullBase in DAKUTEN_MAP) {
        result += DAKUTEN_MAP[fullBase];
        i++; // skip dakuten
      } else if (next === "\uFF9F" && fullBase in HANDAKUTEN_MAP) {
        result += HANDAKUTEN_MAP[fullBase];
        i++; // skip handakuten
      } else {
        result += fullBase;
      }
    } else if (ch === "\uFF9E" || ch === "\uFF9F") {
      // Standalone dakuten/handakuten (not combined)
      result += ch === "\uFF9E" ? "\u309B" : "\u309C";
    } else {
      result += ch;
    }
  }
  return result;
}

function toHalfwidthKatakana(input: string): string {
  let result = "";
  for (let i = 0; i < input.length; i++) {
    const ch = input[i];
    if (ch in FULLWIDTH_TO_HALFWIDTH_MAP) {
      result += FULLWIDTH_TO_HALFWIDTH_MAP[ch];
    } else {
      result += ch;
    }
  }
  return result;
}

export function convertKana(input: string, mode: KanaConvertMode): string {
  switch (mode) {
    case "hiragana-to-katakana":
      return hiraganaToKatakana(input);
    case "katakana-to-hiragana":
      return katakanaToHiragana(input);
    case "to-fullwidth-katakana":
      return toFullwidthKatakana(input);
    case "to-halfwidth-katakana":
      return toHalfwidthKatakana(input);
  }
}
