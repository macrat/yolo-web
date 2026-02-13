export type ConvertMode = "toHalfwidth" | "toFullwidth";

export interface ConvertOptions {
  alphanumeric: boolean; // ASCII letters + digits
  katakana: boolean; // Katakana characters
  symbol: boolean; // Common symbols (space, punctuation)
}

const DEFAULT_OPTIONS: ConvertOptions = {
  alphanumeric: true,
  katakana: true,
  symbol: true,
};

// Fullwidth ASCII range: U+FF01 - U+FF5E maps to U+0021 - U+007E
// Fullwidth space: U+3000 maps to U+0020
// Halfwidth katakana: U+FF65 - U+FF9F

// Halfwidth katakana -> fullwidth katakana mapping
const HALFWIDTH_KATAKANA_MAP: Record<string, string> = {
  "\uFF66": "\u30F2",
  "\uFF67": "\u30A1",
  "\uFF68": "\u30A3",
  "\uFF69": "\u30A5",
  "\uFF6A": "\u30A7",
  "\uFF6B": "\u30A9",
  "\uFF6C": "\u30E3",
  "\uFF6D": "\u30E5",
  "\uFF6E": "\u30E7",
  "\uFF6F": "\u30C3",
  "\uFF70": "\u30FC",
  "\uFF71": "\u30A2",
  "\uFF72": "\u30A4",
  "\uFF73": "\u30A6",
  "\uFF74": "\u30A8",
  "\uFF75": "\u30AA",
  "\uFF76": "\u30AB",
  "\uFF77": "\u30AD",
  "\uFF78": "\u30AF",
  "\uFF79": "\u30B1",
  "\uFF7A": "\u30B3",
  "\uFF7B": "\u30B5",
  "\uFF7C": "\u30B7",
  "\uFF7D": "\u30B9",
  "\uFF7E": "\u30BB",
  "\uFF7F": "\u30BD",
  "\uFF80": "\u30BF",
  "\uFF81": "\u30C1",
  "\uFF82": "\u30C4",
  "\uFF83": "\u30C6",
  "\uFF84": "\u30C8",
  "\uFF85": "\u30CA",
  "\uFF86": "\u30CB",
  "\uFF87": "\u30CC",
  "\uFF88": "\u30CD",
  "\uFF89": "\u30CE",
  "\uFF8A": "\u30CF",
  "\uFF8B": "\u30D2",
  "\uFF8C": "\u30D5",
  "\uFF8D": "\u30D8",
  "\uFF8E": "\u30DB",
  "\uFF8F": "\u30DE",
  "\uFF90": "\u30DF",
  "\uFF91": "\u30E0",
  "\uFF92": "\u30E1",
  "\uFF93": "\u30E2",
  "\uFF94": "\u30E4",
  "\uFF95": "\u30E6",
  "\uFF96": "\u30E8",
  "\uFF97": "\u30E9",
  "\uFF98": "\u30EA",
  "\uFF99": "\u30EB",
  "\uFF9A": "\u30EC",
  "\uFF9B": "\u30ED",
  "\uFF9C": "\u30EF",
  "\uFF9D": "\u30F3",
  "\uFF9E": "\u309B",
  "\uFF9F": "\u309C",
};

// Dakuten / handakuten combos
const DAKUTEN_MAP: Record<string, string> = {
  "\u30AB": "\u30AC",
  "\u30AD": "\u30AE",
  "\u30AF": "\u30B0",
  "\u30B1": "\u30B2",
  "\u30B3": "\u30B4",
  "\u30B5": "\u30B6",
  "\u30B7": "\u30B8",
  "\u30B9": "\u30BA",
  "\u30BB": "\u30BC",
  "\u30BD": "\u30BE",
  "\u30BF": "\u30C0",
  "\u30C1": "\u30C2",
  "\u30C4": "\u30C5",
  "\u30C6": "\u30C7",
  "\u30C8": "\u30C9",
  "\u30CF": "\u30D0",
  "\u30D2": "\u30D3",
  "\u30D5": "\u30D6",
  "\u30D8": "\u30D9",
  "\u30DB": "\u30DC",
  "\u30A6": "\u30F4",
};

const HANDAKUTEN_MAP: Record<string, string> = {
  "\u30CF": "\u30D1",
  "\u30D2": "\u30D4",
  "\u30D5": "\u30D7",
  "\u30D8": "\u30DA",
  "\u30DB": "\u30DD",
};

// Reverse mappings for fullwidth -> halfwidth katakana
const FULLWIDTH_KATAKANA_MAP: Record<string, string> = {};
for (const [half, full] of Object.entries(HALFWIDTH_KATAKANA_MAP)) {
  if (!["\uFF9E", "\uFF9F"].includes(half)) {
    FULLWIDTH_KATAKANA_MAP[full] = half;
  }
}

// Add dakuten/handakuten reverse
for (const [base, combined] of Object.entries(DAKUTEN_MAP)) {
  FULLWIDTH_KATAKANA_MAP[combined] =
    (FULLWIDTH_KATAKANA_MAP[base] ?? base) + "\uFF9E";
}
for (const [base, combined] of Object.entries(HANDAKUTEN_MAP)) {
  FULLWIDTH_KATAKANA_MAP[combined] =
    (FULLWIDTH_KATAKANA_MAP[base] ?? base) + "\uFF9F";
}

function isFullwidthAlphanumeric(code: number): boolean {
  return code >= 0xff01 && code <= 0xff5e;
}

function isFullwidthSpace(code: number): boolean {
  return code === 0x3000;
}

function isHalfwidthAscii(code: number): boolean {
  return code >= 0x0021 && code <= 0x007e;
}

function isAlphanumericChar(ch: string): boolean {
  return /[A-Za-z0-9\uFF21-\uFF3A\uFF41-\uFF5A\uFF10-\uFF19]/.test(ch);
}

export function toHalfwidth(
  input: string,
  options: ConvertOptions = DEFAULT_OPTIONS,
): string {
  let result = "";
  for (let i = 0; i < input.length; i++) {
    const ch = input[i];
    const code = ch.charCodeAt(0);

    // Fullwidth ASCII -> halfwidth
    if (isFullwidthAlphanumeric(code)) {
      const halfChar = String.fromCharCode(code - 0xfee0);
      if (options.alphanumeric && isAlphanumericChar(halfChar)) {
        result += halfChar;
      } else if (options.symbol && !isAlphanumericChar(halfChar)) {
        result += halfChar;
      } else {
        result += ch;
      }
      continue;
    }

    // Fullwidth space -> halfwidth space
    if (isFullwidthSpace(code) && options.symbol) {
      result += " ";
      continue;
    }

    // Fullwidth katakana -> halfwidth katakana
    if (options.katakana && ch in FULLWIDTH_KATAKANA_MAP) {
      result += FULLWIDTH_KATAKANA_MAP[ch];
      continue;
    }

    result += ch;
  }
  return result;
}

export function toFullwidth(
  input: string,
  options: ConvertOptions = DEFAULT_OPTIONS,
): string {
  let result = "";
  for (let i = 0; i < input.length; i++) {
    const ch = input[i];
    const code = ch.charCodeAt(0);

    // Halfwidth ASCII -> fullwidth
    if (isHalfwidthAscii(code)) {
      const fullChar = String.fromCharCode(code + 0xfee0);
      const isAlphaNum = /[A-Za-z0-9]/.test(ch);
      if (options.alphanumeric && isAlphaNum) {
        result += fullChar;
      } else if (options.symbol && !isAlphaNum) {
        result += fullChar;
      } else {
        result += ch;
      }
      continue;
    }

    // Halfwidth space -> fullwidth space
    if (code === 0x0020 && options.symbol) {
      result += "\u3000";
      continue;
    }

    // Halfwidth katakana -> fullwidth katakana (with dakuten/handakuten handling)
    if (options.katakana && ch in HALFWIDTH_KATAKANA_MAP) {
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
      continue;
    }

    result += ch;
  }
  return result;
}

export function convert(
  input: string,
  mode: ConvertMode,
  options: ConvertOptions = DEFAULT_OPTIONS,
): string {
  return mode === "toHalfwidth"
    ? toHalfwidth(input, options)
    : toFullwidth(input, options);
}
