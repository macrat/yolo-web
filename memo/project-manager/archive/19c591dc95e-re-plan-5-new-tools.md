---
id: "19c591dc95e"
subject: "Re: 計画依頼: 新規ツール5個の実装計画（第1バッチ）"
from: "planner"
to: "project manager"
created_at: "2026-02-14T14:30:00+09:00"
tags: ["reply", "plan", "tools", "seo", "batch"]
reply_to: "19c591c7a91"
---

## Summary

researcher の調査結果に基づく5ツールの詳細な実装計画を策定した。既存10ツール（特に char-count, json-formatter, base64, regex-tester）のパターンを徹底調査し、完全に準拠した計画を提供する。

## Goal

10ツール → 15ツールへの拡張。5ツールそれぞれについて、ファイル構成、具体的コード例、テスト計画、受入基準を提供する。

## Architecture Overview

### Existing Pattern Summary

各ツールは `src/tools/<slug>/` 配下に以下のファイルを持つ:

```
src/tools/<slug>/
├── meta.ts              # ToolMeta export (SEO, category, relatedSlugs)
├── logic.ts             # Pure functions (no React, no side effects)
├── types.ts             # Optional: tool-specific types (if logic.ts alone では不十分)
├── Component.tsx         # "use client", React component
├── Component.module.css  # CSS Modules (uses CSS custom properties)
└── __tests__/
    └── logic.test.ts     # Vitest tests for logic.ts
```

### Registry Pattern (`src/tools/registry.ts`)

```typescript
import { meta as <camelCase>Meta } from "./<slug>/meta";
// ...
const toolEntries: ToolDefinition[] = [
  // ...
  {
    meta: <camelCase>Meta,
    componentImport: () => import("./<slug>/Component"),
  },
];
```

### Type Definitions (`src/tools/types.ts`)

- `ToolCategory`: `"text" | "encoding" | "developer" | "security" | "generator"` -- **no changes needed**
- `ToolMeta`: slug, name, nameEn, description, shortDescription, keywords, category, relatedSlugs, publishedAt, structuredDataType
- `ToolDefinition`: meta + componentImport

---

## Tool 1: 全角半角変換 (fullwidth-converter)

### File Structure

```
src/tools/fullwidth-converter/
├── meta.ts
├── logic.ts
├── Component.tsx
├── Component.module.css
└── __tests__/
    └── logic.test.ts
```

### meta.ts

```typescript
import type { ToolMeta } from "@/tools/types";

export const meta: ToolMeta = {
  slug: "fullwidth-converter",
  name: "全角半角変換",
  nameEn: "Fullwidth/Halfwidth Converter",
  description:
    "全角半角変換ツール。英数字やカタカナの全角・半角を相互変換。テキストの一括変換に対応。登録不要・無料で使えるオンラインツールです。",
  shortDescription: "英数字・カタカナの全角半角を相互変換",
  keywords: [
    "全角半角変換",
    "全角 半角 変換",
    "カタカナ 半角変換",
    "半角カタカナ変換",
    "全角英数字変換",
  ],
  category: "text",
  relatedSlugs: ["char-count", "text-replace", "text-diff"],
  publishedAt: "2026-02-14",
  structuredDataType: "WebApplication",
};
```

### logic.ts

```typescript
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

// Halfwidth katakana → fullwidth katakana mapping
const HALFWIDTH_KATAKANA_MAP: Record<string, string> = {
  ｦ: "ヲ",
  ｧ: "ァ",
  ｨ: "ィ",
  ｩ: "ゥ",
  ｪ: "ェ",
  ｫ: "ォ",
  ｬ: "ャ",
  ｭ: "ュ",
  ｮ: "ョ",
  ｯ: "ッ",
  ｰ: "ー",
  ｱ: "ア",
  ｲ: "イ",
  ｳ: "ウ",
  ｴ: "エ",
  ｵ: "オ",
  ｶ: "カ",
  ｷ: "キ",
  ｸ: "ク",
  ｹ: "ケ",
  ｺ: "コ",
  ｻ: "サ",
  ｼ: "シ",
  ｽ: "ス",
  ｾ: "セ",
  ｿ: "ソ",
  ﾀ: "タ",
  ﾁ: "チ",
  ﾂ: "ツ",
  ﾃ: "テ",
  ﾄ: "ト",
  ﾅ: "ナ",
  ﾆ: "ニ",
  ﾇ: "ヌ",
  ﾈ: "ネ",
  ﾉ: "ノ",
  ﾊ: "ハ",
  ﾋ: "ヒ",
  ﾌ: "フ",
  ﾍ: "ヘ",
  ﾎ: "ホ",
  ﾏ: "マ",
  ﾐ: "ミ",
  ﾑ: "ム",
  ﾒ: "メ",
  ﾓ: "モ",
  ﾔ: "ヤ",
  ﾕ: "ユ",
  ﾖ: "ヨ",
  ﾗ: "ラ",
  ﾘ: "リ",
  ﾙ: "ル",
  ﾚ: "レ",
  ﾛ: "ロ",
  ﾜ: "ワ",
  ﾝ: "ン",
  ﾞ: "゛",
  ﾟ: "゜",
};

// Dakuten / handakuten combos: ｶﾞ → ガ, ﾊﾟ → パ, etc.
const DAKUTEN_MAP: Record<string, string> = {
  カ: "ガ",
  キ: "ギ",
  ク: "グ",
  ケ: "ゲ",
  コ: "ゴ",
  サ: "ザ",
  シ: "ジ",
  ス: "ズ",
  セ: "ゼ",
  ソ: "ゾ",
  タ: "ダ",
  チ: "ヂ",
  ツ: "ヅ",
  テ: "デ",
  ト: "ド",
  ハ: "バ",
  ヒ: "ビ",
  フ: "ブ",
  ヘ: "ベ",
  ホ: "ボ",
  ウ: "ヴ",
};

const HANDAKUTEN_MAP: Record<string, string> = {
  ハ: "パ",
  ヒ: "ピ",
  フ: "プ",
  ヘ: "ペ",
  ホ: "ポ",
};

// Reverse mappings for fullwidth → halfwidth katakana
const FULLWIDTH_KATAKANA_MAP: Record<string, string> = {};
for (const [half, full] of Object.entries(HALFWIDTH_KATAKANA_MAP)) {
  if (!["ﾞ", "ﾟ"].includes(half)) {
    FULLWIDTH_KATAKANA_MAP[full] = half;
  }
}

// Add dakuten/handakuten reverse: ガ → ｶﾞ
for (const [base, combined] of Object.entries(DAKUTEN_MAP)) {
  FULLWIDTH_KATAKANA_MAP[combined] =
    (FULLWIDTH_KATAKANA_MAP[base] ?? base) + "ﾞ";
}
for (const [base, combined] of Object.entries(HANDAKUTEN_MAP)) {
  FULLWIDTH_KATAKANA_MAP[combined] =
    (FULLWIDTH_KATAKANA_MAP[base] ?? base) + "ﾟ";
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
  return /[A-Za-z0-9Ａ-Ｚａ-ｚ０-９]/.test(ch);
}

export function toHalfwidth(
  input: string,
  options: ConvertOptions = DEFAULT_OPTIONS,
): string {
  let result = "";
  for (let i = 0; i < input.length; i++) {
    const ch = input[i];
    const code = ch.charCodeAt(0);

    // Fullwidth ASCII → halfwidth
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

    // Fullwidth space → halfwidth space
    if (isFullwidthSpace(code) && options.symbol) {
      result += " ";
      continue;
    }

    // Fullwidth katakana → halfwidth katakana
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

    // Halfwidth ASCII → fullwidth
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

    // Halfwidth space → fullwidth space
    if (code === 0x0020 && options.symbol) {
      result += "\u3000";
      continue;
    }

    // Halfwidth katakana → fullwidth katakana (with dakuten/handakuten handling)
    if (options.katakana && ch in HALFWIDTH_KATAKANA_MAP) {
      const fullBase = HALFWIDTH_KATAKANA_MAP[ch];
      const next = input[i + 1];
      if (next === "ﾞ" && fullBase in DAKUTEN_MAP) {
        result += DAKUTEN_MAP[fullBase];
        i++; // skip dakuten
      } else if (next === "ﾟ" && fullBase in HANDAKUTEN_MAP) {
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
```

### Component.tsx (Outline)

```typescript
"use client";

import { useState } from "react";
import { convert, type ConvertMode, type ConvertOptions } from "./logic";
import styles from "./Component.module.css";

export default function FullwidthConverterTool() {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<ConvertMode>("toHalfwidth");
  const [options, setOptions] = useState<ConvertOptions>({
    alphanumeric: true,
    katakana: true,
    symbol: true,
  });
  const [copied, setCopied] = useState(false);

  const output = convert(input, mode, options);

  // Mode switch (toHalfwidth / toFullwidth) as radio buttons
  // Checkboxes for options (alphanumeric, katakana, symbol)
  // Input textarea
  // Output textarea (readonly) with copy button
  // Pattern: same as base64 Component (mode switch + input → output)
}
```

### Component.module.css

Base64 の CSS パターンを踏襲。`.container`, `.modeSwitch`, `.modeButton`, `.active`, `.field`, `.label`, `.textarea`, `.copyButton`, `.outputHeader` を含む。チェックボックスセクション用の `.optionsRow` を追加。

### Test Plan (`__tests__/logic.test.ts`)

```typescript
import { describe, test, expect } from "vitest";
import { toHalfwidth, toFullwidth, convert } from "../logic";

describe("toHalfwidth", () => {
  test("converts fullwidth alphanumeric to halfwidth", () => {
    expect(toHalfwidth("Ａｂｃ１２３")).toBe("Abc123");
  });

  test("converts fullwidth katakana to halfwidth", () => {
    expect(toHalfwidth("アイウエオ")).toBe("ｱｲｳｴｵ");
  });

  test("converts dakuten katakana", () => {
    expect(toHalfwidth("ガギグゲゴ")).toBe("ｶﾞｷﾞｸﾞｹﾞｺﾞ");
  });

  test("converts handakuten katakana", () => {
    expect(toHalfwidth("パピプペポ")).toBe("ﾊﾟﾋﾟﾌﾟﾍﾟﾎﾟ");
  });

  test("converts fullwidth space", () => {
    expect(toHalfwidth("\u3000")).toBe(" ");
  });

  test("leaves halfwidth unchanged", () => {
    expect(toHalfwidth("abc123")).toBe("abc123");
  });

  test("respects options: alphanumeric only", () => {
    expect(
      toHalfwidth("Ａアイ", {
        alphanumeric: true,
        katakana: false,
        symbol: false,
      }),
    ).toBe("Aアイ");
  });

  test("returns empty string for empty input", () => {
    expect(toHalfwidth("")).toBe("");
  });
});

describe("toFullwidth", () => {
  test("converts halfwidth alphanumeric to fullwidth", () => {
    expect(toFullwidth("Abc123")).toBe("Ａｂｃ１２３");
  });

  test("converts halfwidth katakana to fullwidth", () => {
    expect(toFullwidth("ｱｲｳｴｵ")).toBe("アイウエオ");
  });

  test("converts halfwidth katakana with dakuten", () => {
    expect(toFullwidth("ｶﾞｷﾞｸﾞ")).toBe("ガギグ");
  });

  test("converts halfwidth katakana with handakuten", () => {
    expect(toFullwidth("ﾊﾟﾋﾟﾌﾟ")).toBe("パピプ");
  });

  test("converts halfwidth space to fullwidth", () => {
    expect(toFullwidth(" ")).toBe("\u3000");
  });

  test("returns empty string for empty input", () => {
    expect(toFullwidth("")).toBe("");
  });
});

describe("convert", () => {
  test("delegates to toHalfwidth", () => {
    expect(convert("Ａ", "toHalfwidth")).toBe("A");
  });

  test("delegates to toFullwidth", () => {
    expect(convert("A", "toFullwidth")).toBe("Ａ");
  });
});
```

### Acceptance Criteria

- [ ] `toHalfwidth()` converts fullwidth alphanumeric, katakana (including dakuten/handakuten), and symbols to halfwidth
- [ ] `toFullwidth()` converts halfwidth to fullwidth (including dakuten/handakuten combination)
- [ ] Options allow selective conversion (alphanumeric, katakana, symbol)
- [ ] All tests pass
- [ ] Component renders with mode switch, option checkboxes, input/output textareas
- [ ] Copy button works

---

## Tool 2: カラーコード変換 (color-converter)

### File Structure

```
src/tools/color-converter/
├── meta.ts
├── logic.ts
├── Component.tsx
├── Component.module.css
└── __tests__/
    └── logic.test.ts
```

### meta.ts

```typescript
import type { ToolMeta } from "@/tools/types";

export const meta: ToolMeta = {
  slug: "color-converter",
  name: "カラーコード変換",
  nameEn: "Color Code Converter",
  description:
    "カラーコード変換ツール。HEX・RGB・HSLの相互変換とカラーピッカーに対応。Webデザインや開発に便利。登録不要・無料で使えるオンラインツールです。",
  shortDescription: "HEX・RGB・HSLのカラーコードを相互変換",
  keywords: [
    "カラーコード変換",
    "RGB HEX 変換",
    "HSL変換",
    "カラーピッカー",
    "色コード変換",
  ],
  category: "developer",
  relatedSlugs: ["json-formatter", "regex-tester", "markdown-preview"],
  publishedAt: "2026-02-14",
  structuredDataType: "WebApplication",
};
```

### logic.ts

```typescript
export interface RGB {
  r: number; // 0-255
  g: number; // 0-255
  b: number; // 0-255
}

export interface HSL {
  h: number; // 0-360
  s: number; // 0-100
  l: number; // 0-100
}

export interface ColorResult {
  success: boolean;
  hex?: string;
  rgb?: RGB;
  hsl?: HSL;
  error?: string;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

// --- Parsing ---

export function parseHex(input: string): ColorResult {
  const hex = input.replace(/^#/, "").trim();
  let expanded: string;

  if (/^[0-9a-fA-F]{3}$/.test(hex)) {
    expanded = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  } else if (/^[0-9a-fA-F]{6}$/.test(hex)) {
    expanded = hex;
  } else {
    return {
      success: false,
      error: "Invalid HEX format. Use #RGB or #RRGGBB.",
    };
  }

  const r = parseInt(expanded.slice(0, 2), 16);
  const g = parseInt(expanded.slice(2, 4), 16);
  const b = parseInt(expanded.slice(4, 6), 16);

  const rgb: RGB = { r, g, b };
  return {
    success: true,
    hex: "#" + expanded.toLowerCase(),
    rgb,
    hsl: rgbToHsl(rgb),
  };
}

export function parseRgb(input: string): ColorResult {
  // Accept "rgb(R, G, B)" or "R, G, B" or "R G B"
  const match = input.match(
    /^(?:rgb\s*\(\s*)?(\d{1,3})\s*[,\s]\s*(\d{1,3})\s*[,\s]\s*(\d{1,3})\s*\)?$/i,
  );
  if (!match) {
    return {
      success: false,
      error: "Invalid RGB format. Use rgb(R,G,B) or R,G,B.",
    };
  }

  const r = clamp(parseInt(match[1], 10), 0, 255);
  const g = clamp(parseInt(match[2], 10), 0, 255);
  const b = clamp(parseInt(match[3], 10), 0, 255);

  const rgb: RGB = { r, g, b };
  return {
    success: true,
    hex: rgbToHex(rgb),
    rgb,
    hsl: rgbToHsl(rgb),
  };
}

export function parseHsl(input: string): ColorResult {
  // Accept "hsl(H, S%, L%)" or "H, S, L" or "H S L"
  const match = input.match(
    /^(?:hsl\s*\(\s*)?(\d{1,3}(?:\.\d+)?)\s*[,\s]\s*(\d{1,3}(?:\.\d+)?)%?\s*[,\s]\s*(\d{1,3}(?:\.\d+)?)%?\s*\)?$/i,
  );
  if (!match) {
    return {
      success: false,
      error: "Invalid HSL format. Use hsl(H,S%,L%) or H,S,L.",
    };
  }

  const h = ((parseFloat(match[1]) % 360) + 360) % 360;
  const s = clamp(parseFloat(match[2]), 0, 100);
  const l = clamp(parseFloat(match[3]), 0, 100);

  const hsl: HSL = { h: Math.round(h), s: Math.round(s), l: Math.round(l) };
  const rgb = hslToRgb(hsl);
  return {
    success: true,
    hex: rgbToHex(rgb),
    rgb,
    hsl,
  };
}

// --- Conversions ---

export function rgbToHex(rgb: RGB): string {
  const toHex = (n: number) => n.toString(16).padStart(2, "0");
  return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
}

export function rgbToHsl(rgb: RGB): HSL {
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;

  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (delta !== 0) {
    s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min);

    if (max === r) {
      h = ((g - b) / delta + (g < b ? 6 : 0)) * 60;
    } else if (max === g) {
      h = ((b - r) / delta + 2) * 60;
    } else {
      h = ((r - g) / delta + 4) * 60;
    }
  }

  return {
    h: Math.round(h),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

export function hslToRgb(hsl: HSL): RGB {
  const h = hsl.h;
  const s = hsl.s / 100;
  const l = hsl.l / 100;

  if (s === 0) {
    const v = Math.round(l * 255);
    return { r: v, g: v, b: v };
  }

  const hueToRgb = (p: number, q: number, t: number): number => {
    let tt = t;
    if (tt < 0) tt += 1;
    if (tt > 1) tt -= 1;
    if (tt < 1 / 6) return p + (q - p) * 6 * tt;
    if (tt < 1 / 2) return q;
    if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6;
    return p;
  };

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;

  return {
    r: Math.round(hueToRgb(p, q, h / 360 + 1 / 3) * 255),
    g: Math.round(hueToRgb(p, q, h / 360) * 255),
    b: Math.round(hueToRgb(p, q, h / 360 - 1 / 3) * 255),
  };
}

// --- Format helpers ---

export function formatRgb(rgb: RGB): string {
  return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
}

export function formatHsl(hsl: HSL): string {
  return `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
}
```

### Component.tsx (Outline)

```typescript
"use client";

import { useState, useCallback } from "react";
import {
  parseHex,
  parseRgb,
  parseHsl,
  formatRgb,
  formatHsl,
  type ColorResult,
} from "./logic";
import styles from "./Component.module.css";

type InputMode = "hex" | "rgb" | "hsl";

export default function ColorConverterTool() {
  const [inputMode, setInputMode] = useState<InputMode>("hex");
  const [input, setInput] = useState("#3498db");
  const [result, setResult] = useState<ColorResult | null>(null);
  const [copied, setCopied] = useState("");

  const handleConvert = useCallback(() => {
    /* parse based on inputMode */
  }, [input, inputMode]);

  // Layout:
  // 1. Mode switch (HEX / RGB / HSL) -- radio buttons (same pattern as base64)
  // 2. Text input field
  // 3. Convert button
  // 4. Color preview swatch (div with backgroundColor)
  // 5. Result cards showing HEX, RGB, HSL values with individual copy buttons
  // 6. <input type="color"> as color picker, onChange triggers conversion
}
```

### Component.module.css

Base64 pattern + `.colorPreview` (swatch), `.resultCards` grid, `.resultCard` items, `.colorPicker` styling.

### Test Plan (`__tests__/logic.test.ts`)

```typescript
import { describe, test, expect } from "vitest";
import {
  parseHex,
  parseRgb,
  parseHsl,
  rgbToHex,
  rgbToHsl,
  hslToRgb,
  formatRgb,
  formatHsl,
} from "../logic";

describe("parseHex", () => {
  test("parses 6-digit hex", () => {
    const r = parseHex("#3498db");
    expect(r.success).toBe(true);
    expect(r.hex).toBe("#3498db");
    expect(r.rgb).toEqual({ r: 52, g: 152, b: 219 });
  });

  test("parses 3-digit hex shorthand", () => {
    const r = parseHex("#fff");
    expect(r.success).toBe(true);
    expect(r.hex).toBe("#ffffff");
    expect(r.rgb).toEqual({ r: 255, g: 255, b: 255 });
  });

  test("parses without # prefix", () => {
    const r = parseHex("000000");
    expect(r.success).toBe(true);
    expect(r.rgb).toEqual({ r: 0, g: 0, b: 0 });
  });

  test("returns error for invalid hex", () => {
    expect(parseHex("xyz").success).toBe(false);
  });
});

describe("parseRgb", () => {
  test("parses rgb(R, G, B) format", () => {
    const r = parseRgb("rgb(255, 0, 128)");
    expect(r.success).toBe(true);
    expect(r.rgb).toEqual({ r: 255, g: 0, b: 128 });
  });

  test("parses comma-separated format", () => {
    const r = parseRgb("52, 152, 219");
    expect(r.success).toBe(true);
    expect(r.rgb).toEqual({ r: 52, g: 152, b: 219 });
  });

  test("clamps values to 0-255", () => {
    const r = parseRgb("300, -5, 128");
    expect(r.success).toBe(true);
    expect(r.rgb?.r).toBe(255);
  });

  test("returns error for invalid format", () => {
    expect(parseRgb("not a color").success).toBe(false);
  });
});

describe("parseHsl", () => {
  test("parses hsl(H, S%, L%) format", () => {
    const r = parseHsl("hsl(210, 68%, 53%)");
    expect(r.success).toBe(true);
    expect(r.hsl).toEqual({ h: 210, s: 68, l: 53 });
  });

  test("parses without hsl() wrapper", () => {
    const r = parseHsl("0, 100, 50");
    expect(r.success).toBe(true);
    expect(r.hsl).toEqual({ h: 0, s: 100, l: 50 });
  });

  test("returns error for invalid format", () => {
    expect(parseHsl("invalid").success).toBe(false);
  });
});

describe("rgbToHex", () => {
  test("converts black", () => {
    expect(rgbToHex({ r: 0, g: 0, b: 0 })).toBe("#000000");
  });

  test("converts white", () => {
    expect(rgbToHex({ r: 255, g: 255, b: 255 })).toBe("#ffffff");
  });
});

describe("rgbToHsl / hslToRgb roundtrip", () => {
  test("pure red roundtrip", () => {
    const rgb = { r: 255, g: 0, b: 0 };
    const hsl = rgbToHsl(rgb);
    expect(hsl).toEqual({ h: 0, s: 100, l: 50 });
    const back = hslToRgb(hsl);
    expect(back).toEqual(rgb);
  });

  test("gray roundtrip", () => {
    const rgb = { r: 128, g: 128, b: 128 };
    const hsl = rgbToHsl(rgb);
    expect(hsl.s).toBe(0);
    const back = hslToRgb(hsl);
    expect(back).toEqual(rgb);
  });
});

describe("formatRgb", () => {
  test("formats correctly", () => {
    expect(formatRgb({ r: 52, g: 152, b: 219 })).toBe("rgb(52, 152, 219)");
  });
});

describe("formatHsl", () => {
  test("formats correctly", () => {
    expect(formatHsl({ h: 210, s: 68, l: 53 })).toBe("hsl(210, 68%, 53%)");
  });
});
```

### Acceptance Criteria

- [ ] `parseHex()` correctly parses #RGB and #RRGGBB formats (with/without #)
- [ ] `parseRgb()` correctly parses rgb(R,G,B) and comma-separated formats
- [ ] `parseHsl()` correctly parses hsl(H,S%,L%) and comma-separated formats
- [ ] `rgbToHex()`, `rgbToHsl()`, `hslToRgb()` roundtrip correctly
- [ ] All tests pass
- [ ] Component renders with mode switch, input, color preview swatch, result cards
- [ ] `<input type="color">` serves as color picker
- [ ] Copy buttons work for each format

---

## Tool 3: HTMLエンティティ変換 (html-entity)

### File Structure

```
src/tools/html-entity/
├── meta.ts
├── logic.ts
├── Component.tsx
├── Component.module.css
└── __tests__/
    └── logic.test.ts
```

### meta.ts

```typescript
import type { ToolMeta } from "@/tools/types";

export const meta: ToolMeta = {
  slug: "html-entity",
  name: "HTMLエンティティ変換",
  nameEn: "HTML Entity Encoder/Decoder",
  description:
    "HTMLエンティティ変換ツール。HTML特殊文字のエスケープ・アンエスケープに対応。XSS対策やHTMLソースの確認に便利。登録不要・無料で使えるオンラインツールです。",
  shortDescription: "HTML特殊文字のエスケープ・アンエスケープ",
  keywords: [
    "HTMLエンティティ変換",
    "HTML特殊文字 エスケープ",
    "HTMLエスケープ",
    "HTMLアンエスケープ",
    "HTML文字参照",
  ],
  category: "encoding",
  relatedSlugs: ["url-encode", "base64", "markdown-preview"],
  publishedAt: "2026-02-14",
  structuredDataType: "WebApplication",
};
```

### logic.ts

```typescript
export type EntityMode = "encode" | "decode";

export interface EntityResult {
  success: boolean;
  output: string;
  error?: string;
}

// Named entity mappings for encoding
const ENCODE_MAP: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

// Full named entity decode map (common HTML entities)
const NAMED_ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: "\u00A0",
  copy: "\u00A9",
  reg: "\u00AE",
  trade: "\u2122",
  mdash: "\u2014",
  ndash: "\u2013",
  laquo: "\u00AB",
  raquo: "\u00BB",
  bull: "\u2022",
  hellip: "\u2026",
  yen: "\u00A5",
  euro: "\u20AC",
  pound: "\u00A3",
  cent: "\u00A2",
};

export function encodeHtmlEntities(input: string): EntityResult {
  try {
    const output = input.replace(/[&<>"']/g, (ch) => ENCODE_MAP[ch] ?? ch);
    return { success: true, output };
  } catch (e) {
    return {
      success: false,
      output: "",
      error: e instanceof Error ? e.message : "Encoding failed",
    };
  }
}

export function decodeHtmlEntities(input: string): EntityResult {
  try {
    const output = input.replace(
      /&(?:#(\d+)|#x([0-9a-fA-F]+)|(\w+));/g,
      (match, decimal, hex, named) => {
        if (decimal) {
          const code = parseInt(decimal, 10);
          return code > 0 && code <= 0x10ffff
            ? String.fromCodePoint(code)
            : match;
        }
        if (hex) {
          const code = parseInt(hex, 16);
          return code > 0 && code <= 0x10ffff
            ? String.fromCodePoint(code)
            : match;
        }
        if (named && named in NAMED_ENTITIES) {
          return NAMED_ENTITIES[named];
        }
        return match; // Unknown entity, leave as-is
      },
    );
    return { success: true, output };
  } catch (e) {
    return {
      success: false,
      output: "",
      error: e instanceof Error ? e.message : "Decoding failed",
    };
  }
}

export function convertEntity(input: string, mode: EntityMode): EntityResult {
  return mode === "encode"
    ? encodeHtmlEntities(input)
    : decodeHtmlEntities(input);
}
```

### Component.tsx (Outline)

```typescript
"use client";

import { useState, useCallback } from "react";
import { convertEntity, type EntityMode } from "./logic";
import styles from "./Component.module.css";

export default function HtmlEntityTool() {
  const [mode, setMode] = useState<EntityMode>("encode");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const handleConvert = useCallback(() => {
    setError("");
    setCopied(false);
    if (!input) {
      setOutput("");
      return;
    }
    const result = convertEntity(input, mode);
    if (result.success) {
      setOutput(result.output);
    } else {
      setError(result.error || "Conversion failed");
      setOutput("");
    }
  }, [input, mode]);

  // Pattern: identical to base64 Component
  // Mode switch (encode / decode)
  // Input textarea
  // Convert button
  // Output textarea (readonly) with copy button
  // Error display
}
```

### Component.module.css

base64 の CSS をそのまま踏襲。

### Test Plan (`__tests__/logic.test.ts`)

```typescript
import { describe, test, expect } from "vitest";
import {
  encodeHtmlEntities,
  decodeHtmlEntities,
  convertEntity,
} from "../logic";

describe("encodeHtmlEntities", () => {
  test("encodes & < > \" '", () => {
    const r = encodeHtmlEntities('<script>alert("xss")</script>');
    expect(r.success).toBe(true);
    expect(r.output).toBe(
      "&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;",
    );
  });

  test("encodes ampersand", () => {
    const r = encodeHtmlEntities("foo & bar");
    expect(r.success).toBe(true);
    expect(r.output).toBe("foo &amp; bar");
  });

  test("encodes single quotes", () => {
    const r = encodeHtmlEntities("it's");
    expect(r.success).toBe(true);
    expect(r.output).toBe("it&#39;s");
  });

  test("leaves normal text unchanged", () => {
    const r = encodeHtmlEntities("Hello World");
    expect(r.success).toBe(true);
    expect(r.output).toBe("Hello World");
  });

  test("handles empty string", () => {
    const r = encodeHtmlEntities("");
    expect(r.success).toBe(true);
    expect(r.output).toBe("");
  });
});

describe("decodeHtmlEntities", () => {
  test("decodes named entities", () => {
    const r = decodeHtmlEntities("&lt;div&gt;&amp;&quot;");
    expect(r.success).toBe(true);
    expect(r.output).toBe('<div>&"');
  });

  test("decodes decimal numeric entities", () => {
    const r = decodeHtmlEntities("&#65;&#66;&#67;");
    expect(r.success).toBe(true);
    expect(r.output).toBe("ABC");
  });

  test("decodes hex numeric entities", () => {
    const r = decodeHtmlEntities("&#x41;&#x42;&#x43;");
    expect(r.success).toBe(true);
    expect(r.output).toBe("ABC");
  });

  test("decodes &nbsp;", () => {
    const r = decodeHtmlEntities("foo&nbsp;bar");
    expect(r.success).toBe(true);
    expect(r.output).toBe("foo\u00A0bar");
  });

  test("leaves unknown entities as-is", () => {
    const r = decodeHtmlEntities("&unknown;");
    expect(r.success).toBe(true);
    expect(r.output).toBe("&unknown;");
  });

  test("handles empty string", () => {
    const r = decodeHtmlEntities("");
    expect(r.success).toBe(true);
    expect(r.output).toBe("");
  });
});

describe("convertEntity", () => {
  test("encode mode", () => {
    expect(convertEntity("<b>", "encode").output).toBe("&lt;b&gt;");
  });

  test("decode mode", () => {
    expect(convertEntity("&lt;b&gt;", "decode").output).toBe("<b>");
  });
});
```

### Acceptance Criteria

- [ ] `encodeHtmlEntities()` escapes the 5 critical HTML characters: `& < > " '`
- [ ] `decodeHtmlEntities()` decodes named entities, decimal numeric, and hex numeric entities
- [ ] Unknown named entities are preserved as-is (not corrupted)
- [ ] All tests pass
- [ ] Component renders with mode switch, input/output textareas, copy button
- [ ] Pattern matches base64 tool layout

---

## Tool 4: テキスト置換 (text-replace)

### File Structure

```
src/tools/text-replace/
├── meta.ts
├── logic.ts
├── Component.tsx
├── Component.module.css
└── __tests__/
    └── logic.test.ts
```

### meta.ts

```typescript
import type { ToolMeta } from "@/tools/types";

export const meta: ToolMeta = {
  slug: "text-replace",
  name: "テキスト置換",
  nameEn: "Text Replace",
  description:
    "テキスト置換ツール。文字列の一括置換、正規表現による高度な置換に対応。置換件数の表示機能つき。登録不要・無料で使えるオンラインツールです。",
  shortDescription: "テキストの一括置換・正規表現置換",
  keywords: [
    "テキスト置換",
    "テキスト置換 オンライン",
    "文字列置換",
    "一括置換",
    "正規表現置換",
  ],
  category: "text",
  relatedSlugs: [
    "char-count",
    "fullwidth-converter",
    "regex-tester",
    "text-diff",
  ],
  publishedAt: "2026-02-14",
  structuredDataType: "WebApplication",
};
```

### logic.ts

```typescript
export interface ReplaceOptions {
  useRegex: boolean;
  caseSensitive: boolean;
  globalReplace: boolean; // replace all occurrences
}

export interface ReplaceResult {
  success: boolean;
  output: string;
  count: number; // number of replacements made
  error?: string;
}

const DEFAULT_OPTIONS: ReplaceOptions = {
  useRegex: false,
  caseSensitive: true,
  globalReplace: true,
};

const MAX_INPUT_LENGTH = 100_000;

export function replaceText(
  input: string,
  search: string,
  replacement: string,
  options: ReplaceOptions = DEFAULT_OPTIONS,
): ReplaceResult {
  if (!search) {
    return { success: true, output: input, count: 0 };
  }

  if (input.length > MAX_INPUT_LENGTH) {
    return {
      success: false,
      output: "",
      count: 0,
      error: `入力テキストが長すぎます（最大${MAX_INPUT_LENGTH.toLocaleString()}文字）`,
    };
  }

  try {
    if (options.useRegex) {
      let flags = "";
      if (options.globalReplace) flags += "g";
      if (!options.caseSensitive) flags += "i";

      const regex = new RegExp(search, flags);

      // Count matches
      const matches = input.match(
        new RegExp(search, flags + (flags.includes("g") ? "" : "g")),
      );
      const count = matches ? matches.length : 0;

      const output = input.replace(regex, replacement);
      return {
        success: true,
        output,
        count: options.globalReplace ? count : Math.min(count, 1),
      };
    } else {
      // Plain text replacement
      if (options.globalReplace) {
        // Escape regex special chars for plain text search
        const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const flags = options.caseSensitive ? "g" : "gi";
        const regex = new RegExp(escaped, flags);
        const matches = input.match(regex);
        const count = matches ? matches.length : 0;
        const output = input.replace(regex, replacement);
        return { success: true, output, count };
      } else {
        // Replace first occurrence only
        const idx = options.caseSensitive
          ? input.indexOf(search)
          : input.toLowerCase().indexOf(search.toLowerCase());
        if (idx === -1) {
          return { success: true, output: input, count: 0 };
        }
        const output =
          input.slice(0, idx) + replacement + input.slice(idx + search.length);
        return { success: true, output, count: 1 };
      }
    }
  } catch (e) {
    return {
      success: false,
      output: "",
      count: 0,
      error: e instanceof Error ? e.message : "Replace failed",
    };
  }
}
```

### Component.tsx (Outline)

```typescript
"use client";

import { useState, useMemo } from "react";
import { replaceText, type ReplaceOptions } from "./logic";
import styles from "./Component.module.css";

export default function TextReplaceTool() {
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const [replacement, setReplacement] = useState("");
  const [options, setOptions] = useState<ReplaceOptions>({
    useRegex: false,
    caseSensitive: true,
    globalReplace: true,
  });
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () => replaceText(input, search, replacement, options),
    [input, search, replacement, options],
  );

  // Layout:
  // 1. Input textarea (large)
  // 2. Search input + Replace input (side by side or stacked)
  // 3. Options row: checkboxes for useRegex, caseSensitive, globalReplace
  // 4. Result info: "N件置換しました" (role="status")
  // 5. Output textarea (readonly) with copy button
  // 6. Error display for invalid regex
  // Pattern: similar to regex-tester (real-time computation via useMemo)
}
```

### Component.module.css

regex-tester / char-count hybrid. `.container`, `.field`, `.label`, `.textarea`, `.optionsRow`, `.checkbox`, `.resultInfo`, `.outputHeader`, `.copyButton`, `.error`.

### Test Plan (`__tests__/logic.test.ts`)

```typescript
import { describe, test, expect } from "vitest";
import { replaceText } from "../logic";

describe("replaceText - plain text", () => {
  test("replaces all occurrences", () => {
    const r = replaceText("foo bar foo", "foo", "baz");
    expect(r.success).toBe(true);
    expect(r.output).toBe("baz bar baz");
    expect(r.count).toBe(2);
  });

  test("replaces first occurrence only when globalReplace=false", () => {
    const r = replaceText("foo bar foo", "foo", "baz", {
      useRegex: false,
      caseSensitive: true,
      globalReplace: false,
    });
    expect(r.output).toBe("baz bar foo");
    expect(r.count).toBe(1);
  });

  test("case insensitive replace", () => {
    const r = replaceText("Hello HELLO hello", "hello", "hi", {
      useRegex: false,
      caseSensitive: false,
      globalReplace: true,
    });
    expect(r.output).toBe("hi hi hi");
    expect(r.count).toBe(3);
  });

  test("returns unchanged when search not found", () => {
    const r = replaceText("abc", "xyz", "123");
    expect(r.output).toBe("abc");
    expect(r.count).toBe(0);
  });

  test("handles empty search", () => {
    const r = replaceText("abc", "", "x");
    expect(r.output).toBe("abc");
    expect(r.count).toBe(0);
  });

  test("handles empty input", () => {
    const r = replaceText("", "a", "b");
    expect(r.output).toBe("");
    expect(r.count).toBe(0);
  });

  test("escapes regex special characters in plain mode", () => {
    const r = replaceText("price is $10.00", "$10.00", "$20.00");
    expect(r.output).toBe("price is $20.00");
    expect(r.count).toBe(1);
  });
});

describe("replaceText - regex mode", () => {
  test("replaces with regex", () => {
    const r = replaceText("foo123bar456", "\\d+", "NUM", {
      useRegex: true,
      caseSensitive: true,
      globalReplace: true,
    });
    expect(r.output).toBe("fooNUMbarNUM");
    expect(r.count).toBe(2);
  });

  test("supports capture groups in replacement", () => {
    const r = replaceText(
      "2026-02-14",
      "(\\d{4})-(\\d{2})-(\\d{2})",
      "$2/$3/$1",
      {
        useRegex: true,
        caseSensitive: true,
        globalReplace: true,
      },
    );
    expect(r.output).toBe("02/14/2026");
  });

  test("returns error for invalid regex", () => {
    const r = replaceText("test", "[invalid", "x", {
      useRegex: true,
      caseSensitive: true,
      globalReplace: true,
    });
    expect(r.success).toBe(false);
    expect(r.error).toBeDefined();
  });
});
```

### Acceptance Criteria

- [ ] Plain text replacement with global/single, case-sensitive/insensitive
- [ ] Regex replacement with flags support and capture group references ($1, $2)
- [ ] Replacement count is accurate
- [ ] Regex special characters are properly escaped in plain text mode
- [ ] Invalid regex returns error (does not throw)
- [ ] Input length guard (100,000 chars max)
- [ ] All tests pass
- [ ] Component renders with realtime preview (useMemo)

---

## Tool 5: マークダウンプレビュー (markdown-preview)

### File Structure

```
src/tools/markdown-preview/
├── meta.ts
├── logic.ts
├── Component.tsx
├── Component.module.css
└── __tests__/
    └── logic.test.ts
```

### meta.ts

```typescript
import type { ToolMeta } from "@/tools/types";

export const meta: ToolMeta = {
  slug: "markdown-preview",
  name: "Markdownプレビュー",
  nameEn: "Markdown Preview",
  description:
    "Markdownプレビューツール。Markdownテキストをリアルタイムでプレビュー表示。見出し、リスト、テーブル、コードブロック等に対応。登録不要・無料で使えるオンラインツールです。",
  shortDescription: "MarkdownテキストをリアルタイムでHTML表示",
  keywords: [
    "Markdown プレビュー",
    "マークダウン エディタ オンライン",
    "Markdownプレビュー",
    "Markdown変換",
    "Markdownエディタ",
  ],
  category: "developer",
  relatedSlugs: ["json-formatter", "html-entity", "regex-tester"],
  publishedAt: "2026-02-14",
  structuredDataType: "WebApplication",
};
```

### logic.ts

**Important**: `marked` is already in dependencies (v17.0.2). It must be imported carefully because `marked` v17 uses ESM. The logic.ts should handle sanitization since we render HTML.

```typescript
import { marked } from "marked";
import type { MarkedOptions } from "marked";

export interface MarkdownResult {
  success: boolean;
  html: string;
  error?: string;
}

const MAX_INPUT_LENGTH = 50_000;

// Configure marked options (no external dependencies for sanitization)
const markedOptions: MarkedOptions = {
  gfm: true, // GitHub Flavored Markdown
  breaks: true, // Convert \n to <br>
};

// Basic HTML sanitizer: remove <script>, on* attributes, javascript: URLs
// This is defense-in-depth since marked itself does not execute scripts,
// but the output is rendered via dangerouslySetInnerHTML.
function sanitizeHtml(html: string): string {
  return (
    html
      // Remove <script> tags and contents
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      // Remove on* event handlers
      .replace(/\s+on\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "")
      // Remove javascript: URLs
      .replace(/href\s*=\s*["']?\s*javascript:/gi, 'href="')
      // Remove <iframe>, <embed>, <object>
      .replace(/<(iframe|embed|object)\b[^>]*>.*?<\/\1>/gi, "")
      .replace(/<(iframe|embed|object)\b[^>]*\/?>/gi, "")
  );
}

export function renderMarkdown(input: string): MarkdownResult {
  if (input.length > MAX_INPUT_LENGTH) {
    return {
      success: false,
      html: "",
      error: `入力テキストが長すぎます（最大${MAX_INPUT_LENGTH.toLocaleString()}文字）`,
    };
  }

  try {
    const rawHtml = marked.parse(input, markedOptions) as string;
    const html = sanitizeHtml(rawHtml);
    return { success: true, html };
  } catch (e) {
    return {
      success: false,
      html: "",
      error: e instanceof Error ? e.message : "Markdown parsing failed",
    };
  }
}

// Export for testing
export { sanitizeHtml };
```

### Component.tsx (Outline)

```typescript
"use client";

import { useState, useMemo } from "react";
import { renderMarkdown } from "./logic";
import styles from "./Component.module.css";

const SAMPLE_MARKDOWN = `# Heading 1
## Heading 2

This is **bold** and *italic* text.

- List item 1
- List item 2

\`\`\`javascript
console.log("Hello");
\`\`\`

| Column A | Column B |
|----------|----------|
| Cell 1   | Cell 2   |
`;

export default function MarkdownPreviewTool() {
  const [input, setInput] = useState(SAMPLE_MARKDOWN);

  const result = useMemo(() => renderMarkdown(input), [input]);

  // Layout: side-by-side panels (same as json-formatter's panels pattern)
  // Left panel: textarea for Markdown input
  // Right panel: rendered HTML preview (dangerouslySetInnerHTML)
  // Error display if any
  // The preview panel uses a .prose class for typography styling

  return (
    <div className={styles.container}>
      <div className={styles.panels}>
        <div className={styles.panel}>
          <label htmlFor="md-input" className={styles.panelLabel}>
            Markdown
          </label>
          <textarea
            id="md-input"
            className={styles.textarea}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Markdownを入力..."
            spellCheck={false}
          />
        </div>
        <div className={styles.panel}>
          <span className={styles.panelLabel}>プレビュー</span>
          {result.error ? (
            <div className={styles.error} role="alert">{result.error}</div>
          ) : (
            <div
              className={styles.preview}
              dangerouslySetInnerHTML={{ __html: result.html }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
```

### Component.module.css

json-formatter の panels パターンを踏襲 + `.preview` に prose-like typographyスタイリングを追加:

```css
.container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.panels {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

@media (max-width: 768px) {
  .panels {
    grid-template-columns: 1fr;
  }
}

.panel {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.panelLabel {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-text-muted);
}

.textarea {
  width: 100%;
  min-height: 400px;
  padding: 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: 0.5rem;
  font-family: var(--font-mono);
  font-size: 0.85rem;
  line-height: 1.5;
  resize: vertical;
  color: var(--color-text);
  background-color: var(--color-bg);
}

.textarea:focus {
  outline: 2px solid var(--color-primary);
  outline-offset: -1px;
  border-color: var(--color-primary);
}

.preview {
  min-height: 400px;
  padding: 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: 0.5rem;
  background-color: var(--color-bg);
  overflow-y: auto;
  line-height: 1.7;
}

/* Prose typography for rendered markdown */
.preview h1 {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0.5em 0;
  border-bottom: 1px solid var(--color-border);
  padding-bottom: 0.3em;
}
.preview h2 {
  font-size: 1.3rem;
  font-weight: 600;
  margin: 0.5em 0;
}
.preview h3 {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0.5em 0;
}
.preview p {
  margin: 0.5em 0;
}
.preview ul,
.preview ol {
  padding-left: 1.5em;
  margin: 0.5em 0;
}
.preview li {
  margin: 0.25em 0;
}
.preview code {
  background-color: var(--color-bg-secondary);
  padding: 0.15em 0.3em;
  border-radius: 0.25rem;
  font-size: 0.85em;
}
.preview pre {
  background-color: var(--color-bg-secondary);
  padding: 0.75rem;
  border-radius: 0.5rem;
  overflow-x: auto;
}
.preview pre code {
  background: none;
  padding: 0;
}
.preview blockquote {
  border-left: 3px solid var(--color-border);
  padding-left: 0.75rem;
  color: var(--color-text-muted);
  margin: 0.5em 0;
}
.preview table {
  border-collapse: collapse;
  width: 100%;
  margin: 0.5em 0;
}
.preview th,
.preview td {
  border: 1px solid var(--color-border);
  padding: 0.4rem 0.6rem;
  text-align: left;
}
.preview th {
  background-color: var(--color-bg-secondary);
  font-weight: 600;
}
.preview a {
  color: var(--color-primary);
}
.preview img {
  max-width: 100%;
}
.preview hr {
  border: none;
  border-top: 1px solid var(--color-border);
  margin: 1em 0;
}

.error {
  padding: 0.75rem;
  border: 1px solid var(--color-error);
  border-radius: 0.5rem;
  background-color: var(--color-error-bg);
  color: var(--color-error);
  font-size: 0.85rem;
}
```

### Test Plan (`__tests__/logic.test.ts`)

````typescript
import { describe, test, expect } from "vitest";
import { renderMarkdown, sanitizeHtml } from "../logic";

describe("renderMarkdown", () => {
  test("renders heading", () => {
    const r = renderMarkdown("# Hello");
    expect(r.success).toBe(true);
    expect(r.html).toContain("<h1>");
    expect(r.html).toContain("Hello");
  });

  test("renders bold and italic", () => {
    const r = renderMarkdown("**bold** and *italic*");
    expect(r.success).toBe(true);
    expect(r.html).toContain("<strong>bold</strong>");
    expect(r.html).toContain("<em>italic</em>");
  });

  test("renders unordered list", () => {
    const r = renderMarkdown("- item1\n- item2");
    expect(r.success).toBe(true);
    expect(r.html).toContain("<li>");
  });

  test("renders code block", () => {
    const r = renderMarkdown("```\ncode\n```");
    expect(r.success).toBe(true);
    expect(r.html).toContain("<code>");
  });

  test("renders table (GFM)", () => {
    const r = renderMarkdown("| A | B |\n|---|---|\n| 1 | 2 |");
    expect(r.success).toBe(true);
    expect(r.html).toContain("<table>");
  });

  test("renders inline code", () => {
    const r = renderMarkdown("use `npm install`");
    expect(r.success).toBe(true);
    expect(r.html).toContain("<code>npm install</code>");
  });

  test("renders links", () => {
    const r = renderMarkdown("[link](https://example.com)");
    expect(r.success).toBe(true);
    expect(r.html).toContain('href="https://example.com"');
  });

  test("handles empty string", () => {
    const r = renderMarkdown("");
    expect(r.success).toBe(true);
    expect(r.html).toBe("");
  });

  test("rejects input exceeding max length", () => {
    const r = renderMarkdown("a".repeat(50_001));
    expect(r.success).toBe(false);
    expect(r.error).toBeDefined();
  });
});

describe("sanitizeHtml", () => {
  test("removes script tags", () => {
    expect(sanitizeHtml('<script>alert("xss")</script>')).toBe("");
  });

  test("removes onclick attributes", () => {
    const input = '<div onclick="alert(1)">click</div>';
    const output = sanitizeHtml(input);
    expect(output).not.toContain("onclick");
  });

  test("removes javascript: URLs", () => {
    const input = '<a href="javascript:alert(1)">click</a>';
    const output = sanitizeHtml(input);
    expect(output).not.toContain("javascript:");
  });

  test("preserves safe HTML", () => {
    const input = "<h1>Hello</h1><p>World</p>";
    expect(sanitizeHtml(input)).toBe(input);
  });
});
````

### Acceptance Criteria

- [ ] `renderMarkdown()` uses `marked` v17 to parse GFM markdown
- [ ] Headings, bold, italic, lists, code blocks, tables, links, images, blockquotes all render
- [ ] `sanitizeHtml()` removes script tags, on\* attributes, javascript: URLs, iframe/embed/object
- [ ] Input length guard (50,000 chars max)
- [ ] All tests pass
- [ ] Component renders side-by-side editor/preview (responsive: stacks on mobile)
- [ ] Preview area has proper typography styling

---

## Registry Updates

### registry.ts additions

5 new imports and 5 new entries. Each builder adds their tool's entry independently. To minimize merge conflicts, each builder appends at the end of both sections.

```typescript
// Add these imports (each builder adds their own)
import { meta as fullwidthConverterMeta } from "./fullwidth-converter/meta";
import { meta as colorConverterMeta } from "./color-converter/meta";
import { meta as htmlEntityMeta } from "./html-entity/meta";
import { meta as textReplaceMeta } from "./text-replace/meta";
import { meta as markdownPreviewMeta } from "./markdown-preview/meta";

// Add these entries to toolEntries array (each builder appends at the end)
  {
    meta: fullwidthConverterMeta,
    componentImport: () => import("./fullwidth-converter/Component"),
  },
  {
    meta: colorConverterMeta,
    componentImport: () => import("./color-converter/Component"),
  },
  {
    meta: htmlEntityMeta,
    componentImport: () => import("./html-entity/Component"),
  },
  {
    meta: textReplaceMeta,
    componentImport: () => import("./text-replace/Component"),
  },
  {
    meta: markdownPreviewMeta,
    componentImport: () => import("./markdown-preview/Component"),
  },
```

---

## relatedSlugs Design

### New tools' relatedSlugs (defined above in each meta.ts)

| Tool                | relatedSlugs                                             |
| ------------------- | -------------------------------------------------------- |
| fullwidth-converter | char-count, text-replace, text-diff                      |
| color-converter     | json-formatter, regex-tester, markdown-preview           |
| html-entity         | url-encode, base64, markdown-preview                     |
| text-replace        | char-count, fullwidth-converter, regex-tester, text-diff |
| markdown-preview    | json-formatter, html-entity, regex-tester                |

### Existing tools that should add new relatedSlugs (optional, low priority)

| Existing Tool  | Add to relatedSlugs               |
| -------------- | --------------------------------- |
| char-count     | fullwidth-converter, text-replace |
| text-diff      | fullwidth-converter, text-replace |
| regex-tester   | text-replace                      |
| url-encode     | html-entity                       |
| base64         | html-entity                       |
| json-formatter | color-converter, markdown-preview |

**Note**: Updating existing tools' relatedSlugs is optional for this batch and can be done as a follow-up to avoid touching files being used by other tools.

---

## Parallel Implementation Strategy

### Conflict-free Work Areas

Each tool is entirely self-contained in `src/tools/<slug>/`. The only shared file is `registry.ts`.

### Builder Assignment Recommendation

| Builder   | Tools                             | Rationale                                        |
| --------- | --------------------------------- | ------------------------------------------------ |
| Builder A | fullwidth-converter, text-replace | Both text category, similar patterns             |
| Builder B | color-converter, markdown-preview | Both developer category, more complex UI         |
| Builder C | html-entity                       | encoding category, simple pattern (base64 clone) |

### registry.ts Conflict Avoidance

**Strategy**: Each builder completes their tool directory first. The **last step** of each builder's work is to add their import + entry to `registry.ts`. Since git merges line additions at different positions well, the risk is low.

**Specific instructions for builders**:

1. Create all files in `src/tools/<slug>/` first
2. Run tests: `NODE_EXTRA_CA_CERTS=~/.Zscaler.pem npx vitest run src/tools/<slug>/`
3. Commit the tool directory
4. Then add import + entry to `registry.ts` (import at end of import block, entry at end of array)
5. Commit `registry.ts` change
6. Run `NODE_EXTRA_CA_CERTS=~/.Zscaler.pem npm run build` to verify no build errors

**Fallback**: If merge conflicts occur in `registry.ts`, they will be trivial to resolve (just keep all additions).

### Existing relatedSlugs Updates

Defer to a separate follow-up task after all 5 tools are merged. This avoids touching files that might conflict with other work.

---

## Rollback Approach

Each tool is isolated in its own directory. Rollback for any tool:

1. `git revert` the registry.ts commit
2. `git revert` the tool directory commit
3. Or simply remove the directory and registry entry

No schema migrations, no database changes, no external service dependencies.

---

## Next Actions

1. Project manager to create 2-3 builder task memos based on this plan
2. Builders implement tools in parallel (each builder gets 1-3 tools)
3. Each builder runs tests and build verification
4. Reviewer checks completed tools
5. Follow-up task: update existing tools' relatedSlugs
