---
id: "19c5930872b"
subject: "Re: 計画依頼: 次期5ツール詳細実装計画（csv-converter, number-base-converter, dummy-text, date-calculator, byte-counter）"
from: "planner"
to: "project-manager"
created_at: "2026-02-14T07:47:58+09:00"
tags:
  - reply
reply_to: "19c592abd50"
---

## Summary

researcher の調査結果と PM の要件に基づく5ツールの詳細な実装計画を策定した。既存15ツール（特に text-replace, color-converter, char-count, base64, unix-timestamp）のパターンを徹底調査し、完全に準拠した計画を提供する。

## Goal

15ツール → 20ツールへの拡張。5ツールそれぞれについて、ファイル構成、具体的コード例、テスト計画、受入基準を提供する。

## Architecture Overview

### Existing Pattern Summary

各ツールは `src/tools/<slug>/` 配下に以下のファイルを持つ:

```
src/tools/<slug>/
├── meta.ts              # ToolMeta export (SEO, category, relatedSlugs)
├── logic.ts             # Pure functions (no React, no side effects)
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

## Tool 1: CSV/TSV変換 (csv-converter)

### File Structure

```
src/tools/csv-converter/
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
  slug: "csv-converter",
  name: "CSV/TSV変換",
  nameEn: "CSV/TSV Converter",
  description:
    "CSV/TSV変換ツール。CSV・TSV・JSON・Markdown表の相互変換に対応。ダブルクォートや改行を含むフィールドも正しく処理。登録不要・無料で使えるオンラインツールです。",
  shortDescription: "CSV・TSV・JSON・Markdown表を相互変換",
  keywords: [
    "CSV変換",
    "TSV変換",
    "CSV JSON 変換",
    "CSV Markdown 変換",
    "CSV TSV 変換 オンライン",
  ],
  category: "developer",
  relatedSlugs: ["json-formatter", "markdown-preview", "text-replace"],
  publishedAt: "2026-02-14",
  structuredDataType: "WebApplication",
};
```

### logic.ts

```typescript
export type DataFormat = "csv" | "tsv" | "json" | "markdown";

export interface ConvertResult {
  success: boolean;
  output: string;
  error?: string;
}

const MAX_INPUT_LENGTH = 500_000;

// --- CSV Parser (RFC 4180 compliant) ---
// Handles: double-quoted fields, embedded newlines, embedded commas, escaped quotes

export function parseCsv(input: string, delimiter: string = ","): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = "";
  let inQuotes = false;
  let i = 0;

  while (i < input.length) {
    const ch = input[i];

    if (inQuotes) {
      if (ch === '"') {
        // Check for escaped quote ("")
        if (i + 1 < input.length && input[i + 1] === '"') {
          currentField += '"';
          i += 2;
          continue;
        }
        // End of quoted field
        inQuotes = false;
        i++;
        continue;
      }
      currentField += ch;
      i++;
      continue;
    }

    // Not in quotes
    if (ch === '"' && currentField === "") {
      inQuotes = true;
      i++;
      continue;
    }

    if (ch === delimiter) {
      currentRow.push(currentField);
      currentField = "";
      i++;
      continue;
    }

    if (ch === "\r") {
      // Handle \r\n or standalone \r
      currentRow.push(currentField);
      currentField = "";
      rows.push(currentRow);
      currentRow = [];
      if (i + 1 < input.length && input[i + 1] === "\n") {
        i += 2;
      } else {
        i++;
      }
      continue;
    }

    if (ch === "\n") {
      currentRow.push(currentField);
      currentField = "";
      rows.push(currentRow);
      currentRow = [];
      i++;
      continue;
    }

    currentField += ch;
    i++;
  }

  // Push remaining field/row
  if (currentField !== "" || currentRow.length > 0) {
    currentRow.push(currentField);
    rows.push(currentRow);
  }

  return rows;
}

// --- Serializers ---

function needsQuoting(field: string, delimiter: string): boolean {
  return (
    field.includes(delimiter) ||
    field.includes('"') ||
    field.includes("\n") ||
    field.includes("\r")
  );
}

function quoteField(field: string, delimiter: string): string {
  if (needsQuoting(field, delimiter)) {
    return '"' + field.replace(/"/g, '""') + '"';
  }
  return field;
}

export function toCsv(rows: string[][]): string {
  return rows
    .map((row) => row.map((field) => quoteField(field, ",")).join(","))
    .join("\n");
}

export function toTsv(rows: string[][]): string {
  // TSV: tabs as delimiter, fields containing tabs/newlines are quoted
  return rows
    .map((row) => row.map((field) => quoteField(field, "\t")).join("\t"))
    .join("\n");
}

export function toJson(rows: string[][]): string {
  if (rows.length === 0) return "[]";

  // First row as headers
  const headers = rows[0];
  const data = rows.slice(1).map((row) => {
    const obj: Record<string, string> = {};
    headers.forEach((header, idx) => {
      obj[header || `column${idx + 1}`] = row[idx] ?? "";
    });
    return obj;
  });

  return JSON.stringify(data, null, 2);
}

export function toMarkdown(rows: string[][]): string {
  if (rows.length === 0) return "";

  // Escape pipe characters in cells
  const escapeCell = (cell: string): string =>
    cell.replace(/\|/g, "\\|").replace(/\n/g, " ");

  const header = "| " + rows[0].map(escapeCell).join(" | ") + " |";
  const separator = "| " + rows[0].map(() => "---").join(" | ") + " |";
  const body = rows
    .slice(1)
    .map((row) => {
      // Pad row to match header length
      const paddedRow = [...row];
      while (paddedRow.length < rows[0].length) {
        paddedRow.push("");
      }
      return "| " + paddedRow.map(escapeCell).join(" | ") + " |";
    })
    .join("\n");

  return [header, separator, body].filter(Boolean).join("\n");
}

// --- JSON parser → rows ---

export function parseJson(input: string): string[][] {
  const data = JSON.parse(input);
  if (!Array.isArray(data)) {
    throw new Error("JSONは配列である必要があります");
  }
  if (data.length === 0) return [];

  // Extract headers from first object
  const headers = Object.keys(data[0]);
  const rows: string[][] = [headers];

  for (const item of data) {
    const row = headers.map((h) => {
      const val = item[h];
      return val == null ? "" : String(val);
    });
    rows.push(row);
  }

  return rows;
}

// --- Markdown parser → rows ---

export function parseMarkdown(input: string): string[][] {
  const lines = input.trim().split("\n");
  if (lines.length < 2) {
    throw new Error("Markdown表には少なくともヘッダー行と区切り行が必要です");
  }

  const parseLine = (line: string): string[] => {
    // Remove leading/trailing pipe and split
    return line
      .replace(/^\|/, "")
      .replace(/\|$/, "")
      .split("|")
      .map((cell) => cell.trim().replace(/\\\|/g, "|"));
  };

  const rows: string[][] = [];
  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    if (!trimmed) continue;
    // Skip separator row (| --- | --- |)
    if (/^\|?\s*:?-+:?\s*(\|\s*:?-+:?\s*)*\|?\s*$/.test(trimmed)) continue;
    rows.push(parseLine(trimmed));
  }

  return rows;
}

// --- Main conversion function ---

export function convert(
  input: string,
  fromFormat: DataFormat,
  toFormat: DataFormat,
): ConvertResult {
  if (!input.trim()) {
    return { success: true, output: "" };
  }

  if (input.length > MAX_INPUT_LENGTH) {
    return {
      success: false,
      output: "",
      error: `入力が長すぎます（最大${MAX_INPUT_LENGTH.toLocaleString()}文字）`,
    };
  }

  try {
    // Parse input to rows
    let rows: string[][];
    switch (fromFormat) {
      case "csv":
        rows = parseCsv(input, ",");
        break;
      case "tsv":
        rows = parseCsv(input, "\t");
        break;
      case "json":
        rows = parseJson(input);
        break;
      case "markdown":
        rows = parseMarkdown(input);
        break;
    }

    // Serialize rows to output
    let output: string;
    switch (toFormat) {
      case "csv":
        output = toCsv(rows);
        break;
      case "tsv":
        output = toTsv(rows);
        break;
      case "json":
        output = toJson(rows);
        break;
      case "markdown":
        output = toMarkdown(rows);
        break;
    }

    return { success: true, output };
  } catch (e) {
    return {
      success: false,
      output: "",
      error: e instanceof Error ? e.message : "変換に失敗しました",
    };
  }
}
```

### Component.tsx (Outline)

```typescript
"use client";

import { useState, useCallback } from "react";
import { convert, type DataFormat } from "./logic";
import styles from "./Component.module.css";

const FORMAT_LABELS: Record<DataFormat, string> = {
  csv: "CSV",
  tsv: "TSV",
  json: "JSON",
  markdown: "Markdown表",
};

const SAMPLE_CSV = `名前,年齢,都市
田中太郎,30,東京
佐藤花子,25,大阪
"鈴木, 一郎",40,名古屋`;

export default function CsvConverterTool() {
  const [input, setInput] = useState(SAMPLE_CSV);
  const [fromFormat, setFromFormat] = useState<DataFormat>("csv");
  const [toFormat, setToFormat] = useState<DataFormat>("json");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const handleConvert = useCallback(() => {
    setError("");
    setCopied(false);
    const result = convert(input, fromFormat, toFormat);
    if (result.success) {
      setOutput(result.output);
    } else {
      setError(result.error || "変換に失敗しました");
      setOutput("");
    }
  }, [input, fromFormat, toFormat]);

  const handleCopy = useCallback(async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }, [output]);

  // Layout:
  // 1. Format selector row: "From" dropdown + "To" dropdown
  // 2. Input textarea (rows=10, monospace)
  // 3. Convert button
  // 4. Error display
  // 5. Output textarea (readonly, monospace) with copy button
  // Pattern: similar to base64 (input → button → output) but with two dropdowns instead of mode toggle
}
```

### Component.module.css key classes

base64 pattern を踏襲 + format selector:

- `.container` - flex column, gap 1rem
- `.formatRow` - display flex, gap 1rem, align center (2 select dropdowns with labels)
- `.formatSelect` - styled select element
- `.field` - flex column, gap 0.4rem
- `.label` - 0.85rem, font-weight 600, color-text-muted
- `.textarea` - monospace, border, padding, resize vertical
- `.convertButton` - primary color button
- `.outputHeader` - flex, space-between
- `.copyButton` - small border button
- `.error` - error styling

### Test Plan (`__tests__/logic.test.ts`)

```typescript
import { describe, test, expect } from "vitest";
import {
  parseCsv,
  toCsv,
  toTsv,
  toJson,
  toMarkdown,
  parseJson,
  parseMarkdown,
  convert,
} from "../logic";

describe("parseCsv", () => {
  test("parses simple CSV", () => {
    const rows = parseCsv("a,b,c\n1,2,3");
    expect(rows).toEqual([
      ["a", "b", "c"],
      ["1", "2", "3"],
    ]);
  });

  test("handles quoted fields", () => {
    const rows = parseCsv('"hello, world",b\n"line1\nline2",d');
    expect(rows[0][0]).toBe("hello, world");
    expect(rows[1][0]).toBe("line1\nline2");
  });

  test("handles escaped double quotes", () => {
    const rows = parseCsv('"say ""hello""",b');
    expect(rows[0][0]).toBe('say "hello"');
  });

  test("handles CRLF line endings", () => {
    const rows = parseCsv("a,b\r\n1,2");
    expect(rows).toEqual([
      ["a", "b"],
      ["1", "2"],
    ]);
  });

  test("handles empty input", () => {
    expect(parseCsv("")).toEqual([]);
  });

  test("handles single field", () => {
    expect(parseCsv("hello")).toEqual([["hello"]]);
  });

  test("handles trailing newline", () => {
    const rows = parseCsv("a,b\n1,2\n");
    expect(rows).toEqual([
      ["a", "b"],
      ["1", "2"],
    ]);
  });

  test("parses TSV with tab delimiter", () => {
    const rows = parseCsv("a\tb\tc\n1\t2\t3", "\t");
    expect(rows).toEqual([
      ["a", "b", "c"],
      ["1", "2", "3"],
    ]);
  });
});

describe("toCsv", () => {
  test("serializes simple rows", () => {
    expect(
      toCsv([
        ["a", "b"],
        ["1", "2"],
      ]),
    ).toBe("a,b\n1,2");
  });

  test("quotes fields containing commas", () => {
    expect(toCsv([["hello, world"]])).toBe('"hello, world"');
  });

  test("escapes double quotes", () => {
    expect(toCsv([['say "hello"']])).toBe('"say ""hello"""');
  });

  test("handles empty rows", () => {
    expect(toCsv([])).toBe("");
  });
});

describe("toTsv", () => {
  test("serializes with tabs", () => {
    expect(
      toTsv([
        ["a", "b"],
        ["1", "2"],
      ]),
    ).toBe("a\tb\n1\t2");
  });

  test("quotes fields containing tabs", () => {
    const result = toTsv([["has\ttab"]]);
    expect(result).toContain('"');
  });
});

describe("toJson", () => {
  test("converts rows to JSON array of objects", () => {
    const json = toJson([
      ["name", "age"],
      ["Alice", "30"],
    ]);
    const parsed = JSON.parse(json);
    expect(parsed).toEqual([{ name: "Alice", age: "30" }]);
  });

  test("handles empty rows", () => {
    expect(toJson([])).toBe("[]");
  });

  test("uses column1, column2 for empty headers", () => {
    const json = toJson([
      ["", "b"],
      ["1", "2"],
    ]);
    const parsed = JSON.parse(json);
    expect(parsed[0]).toHaveProperty("column1");
  });
});

describe("toMarkdown", () => {
  test("converts rows to markdown table", () => {
    const md = toMarkdown([
      ["Name", "Age"],
      ["Alice", "30"],
    ]);
    expect(md).toContain("| Name | Age |");
    expect(md).toContain("| --- | --- |");
    expect(md).toContain("| Alice | 30 |");
  });

  test("escapes pipe characters", () => {
    const md = toMarkdown([["a|b"], ["c|d"]]);
    expect(md).toContain("a\\|b");
  });

  test("handles empty rows", () => {
    expect(toMarkdown([])).toBe("");
  });
});

describe("parseJson", () => {
  test("parses JSON array of objects", () => {
    const rows = parseJson('[{"name":"Alice","age":"30"}]');
    expect(rows).toEqual([
      ["name", "age"],
      ["Alice", "30"],
    ]);
  });

  test("throws on non-array JSON", () => {
    expect(() => parseJson('{"key":"value"}')).toThrow();
  });

  test("handles empty array", () => {
    expect(parseJson("[]")).toEqual([]);
  });
});

describe("parseMarkdown", () => {
  test("parses markdown table", () => {
    const md = "| Name | Age |\n| --- | --- |\n| Alice | 30 |";
    const rows = parseMarkdown(md);
    expect(rows).toEqual([
      ["Name", "Age"],
      ["Alice", "30"],
    ]);
  });

  test("throws on invalid table", () => {
    expect(() => parseMarkdown("not a table")).toThrow();
  });
});

describe("convert", () => {
  test("csv to json", () => {
    const r = convert("name,age\nAlice,30", "csv", "json");
    expect(r.success).toBe(true);
    expect(JSON.parse(r.output)).toEqual([{ name: "Alice", age: "30" }]);
  });

  test("csv to tsv", () => {
    const r = convert("a,b\n1,2", "csv", "tsv");
    expect(r.success).toBe(true);
    expect(r.output).toBe("a\tb\n1\t2");
  });

  test("csv to markdown", () => {
    const r = convert("Name,Age\nAlice,30", "csv", "markdown");
    expect(r.success).toBe(true);
    expect(r.output).toContain("| Name | Age |");
  });

  test("json to csv", () => {
    const r = convert('[{"name":"Alice","age":"30"}]', "json", "csv");
    expect(r.success).toBe(true);
    expect(r.output).toContain("name,age");
  });

  test("handles empty input", () => {
    const r = convert("", "csv", "json");
    expect(r.success).toBe(true);
    expect(r.output).toBe("");
  });

  test("returns error for invalid JSON", () => {
    const r = convert("not json", "json", "csv");
    expect(r.success).toBe(false);
    expect(r.error).toBeDefined();
  });

  test("returns error for oversized input", () => {
    const r = convert("a".repeat(500_001), "csv", "json");
    expect(r.success).toBe(false);
  });
});
```

### Acceptance Criteria

- [ ] `parseCsv()` correctly parses RFC 4180 compliant CSV (quoted fields, embedded newlines, escaped quotes, CRLF)
- [ ] `parseCsv()` with tab delimiter also works for TSV
- [ ] `toCsv()`, `toTsv()` properly serialize rows with quoting when needed
- [ ] `toJson()` converts rows to array of objects using first row as headers
- [ ] `toMarkdown()` generates valid GitHub Flavored Markdown table
- [ ] `parseJson()` converts array of objects back to rows
- [ ] `parseMarkdown()` parses Markdown tables, skipping separator row
- [ ] `convert()` handles all 4x4 format combinations
- [ ] Input length guard (500,000 chars max)
- [ ] All tests pass
- [ ] Component renders with format selectors, input/output textareas, convert button, copy button

---

## Tool 2: 進数変換 (number-base-converter)

### File Structure

```
src/tools/number-base-converter/
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
  slug: "number-base-converter",
  name: "進数変換",
  nameEn: "Number Base Converter",
  description:
    "進数変換ツール。2進数・8進数・10進数・16進数の相互変換に対応。BigIntによる大きな数値もリアルタイム変換。登録不要・無料で使えるオンラインツールです。",
  shortDescription: "2進数・8進数・10進数・16進数を相互変換",
  keywords: [
    "進数変換",
    "2進数 変換",
    "16進数 変換",
    "8進数 変換",
    "基数変換 オンライン",
  ],
  category: "developer",
  relatedSlugs: ["color-converter", "unix-timestamp", "csv-converter"],
  publishedAt: "2026-02-14",
  structuredDataType: "WebApplication",
};
```

### logic.ts

```typescript
export type NumberBase = 2 | 8 | 10 | 16;

export interface BaseConvertResult {
  success: boolean;
  binary: string;
  octal: string;
  decimal: string;
  hexadecimal: string;
  error?: string;
}

const BASE_LABELS: Record<NumberBase, string> = {
  2: "2進数 (Binary)",
  8: "8進数 (Octal)",
  10: "10進数 (Decimal)",
  16: "16進数 (Hexadecimal)",
};

export function getBaseLabel(base: NumberBase): string {
  return BASE_LABELS[base];
}

// Validate input for the given base
function isValidForBase(input: string, base: NumberBase): boolean {
  const cleaned = input.trim().toLowerCase();
  if (cleaned === "" || cleaned === "-") return false;

  const numPart = cleaned.startsWith("-") ? cleaned.slice(1) : cleaned;
  if (numPart === "") return false;

  switch (base) {
    case 2:
      return /^[01]+$/.test(numPart);
    case 8:
      return /^[0-7]+$/.test(numPart);
    case 10:
      return /^[0-9]+$/.test(numPart);
    case 16:
      return /^[0-9a-f]+$/.test(numPart);
    default:
      return false;
  }
}

// Parse string to BigInt for the given base
function parseBigInt(input: string, base: NumberBase): bigint {
  const cleaned = input.trim().toLowerCase();
  const isNegative = cleaned.startsWith("-");
  const numPart = isNegative ? cleaned.slice(1) : cleaned;

  let result = 0n;
  const baseBig = BigInt(base);

  for (const ch of numPart) {
    const digit = parseInt(ch, 16); // works for all bases <= 16
    result = result * baseBig + BigInt(digit);
  }

  return isNegative ? -result : result;
}

// Convert BigInt to string in the given base
function bigIntToString(value: bigint, base: NumberBase): string {
  if (value === 0n) return "0";

  const isNegative = value < 0n;
  let abs = isNegative ? -value : value;
  const baseBig = BigInt(base);
  const digits: string[] = [];

  while (abs > 0n) {
    const remainder = Number(abs % baseBig);
    digits.push(remainder.toString(base));
    abs = abs / baseBig;
  }

  const result = digits.reverse().join("");
  return isNegative ? "-" + result : result;
}

export function convertBase(
  input: string,
  fromBase: NumberBase,
): BaseConvertResult {
  const trimmed = input.trim();

  if (!trimmed) {
    return {
      success: true,
      binary: "",
      octal: "",
      decimal: "",
      hexadecimal: "",
    };
  }

  if (!isValidForBase(trimmed, fromBase)) {
    return {
      success: false,
      binary: "",
      octal: "",
      decimal: "",
      hexadecimal: "",
      error: `${getBaseLabel(fromBase)}として無効な入力です`,
    };
  }

  try {
    const value = parseBigInt(trimmed, fromBase);

    return {
      success: true,
      binary: bigIntToString(value, 2),
      octal: bigIntToString(value, 8),
      decimal: bigIntToString(value, 10),
      hexadecimal: bigIntToString(value, 16),
    };
  } catch (e) {
    return {
      success: false,
      binary: "",
      octal: "",
      decimal: "",
      hexadecimal: "",
      error: e instanceof Error ? e.message : "変換に失敗しました",
    };
  }
}

// Format binary with spaces every 4 digits for readability
export function formatBinary(binary: string): string {
  if (!binary || binary === "0") return binary;
  const isNeg = binary.startsWith("-");
  const abs = isNeg ? binary.slice(1) : binary;
  // Pad to multiple of 4
  const padded = abs.padStart(Math.ceil(abs.length / 4) * 4, "0");
  const formatted = padded.replace(/(.{4})/g, "$1 ").trim();
  return isNeg ? "-" + formatted : formatted;
}

// Format hex with spaces every 2 digits
export function formatHex(hex: string): string {
  if (!hex || hex === "0") return hex;
  const isNeg = hex.startsWith("-");
  const abs = isNeg ? hex.slice(1) : hex;
  const padded = abs.length % 2 === 0 ? abs : "0" + abs;
  const formatted = padded.replace(/(.{2})/g, "$1 ").trim();
  return isNeg ? "-" + formatted : formatted;
}
```

### Component.tsx (Outline)

```typescript
"use client";

import { useState, useMemo } from "react";
import { convertBase, formatBinary, formatHex, type NumberBase } from "./logic";
import styles from "./Component.module.css";

const BASES: { value: NumberBase; label: string; prefix: string }[] = [
  { value: 2, label: "2進数 (BIN)", prefix: "0b" },
  { value: 8, label: "8進数 (OCT)", prefix: "0o" },
  { value: 10, label: "10進数 (DEC)", prefix: "" },
  { value: 16, label: "16進数 (HEX)", prefix: "0x" },
];

export default function NumberBaseConverterTool() {
  const [input, setInput] = useState("");
  const [fromBase, setFromBase] = useState<NumberBase>(10);
  const [copied, setCopied] = useState("");

  const result = useMemo(() => convertBase(input, fromBase), [input, fromBase]);

  // Layout:
  // 1. Base selector (radio group: BIN / OCT / DEC / HEX) for input base
  // 2. Text input field with placeholder
  // 3. Error display
  // 4. Results grid (4 cards: binary, octal, decimal, hex)
  //    Each card: label, formatted value (monospace), copy button
  //    Binary uses formatBinary(), Hex uses formatHex() for readability
  // Pattern: similar to color-converter (input → result cards) but with radio for base selection
  //          + real-time conversion via useMemo (like text-replace)
}
```

### Component.module.css key classes

color-converter pattern を踏襲:

- `.container` - flex column, gap 1rem
- `.modeSwitch` / `.modeButton` / `.active` - radio group for base selection (same as base64)
- `.field` / `.label` / `.input` - text input (same as color-converter)
- `.resultCards` - grid, 2 columns (responsive: 1 on mobile)
- `.resultCard` - border, padding, flex column
- `.resultLabel` - small, muted text
- `.resultValue` - monospace, word-break
- `.copyButton` - small border button
- `.error` - error styling

### Test Plan (`__tests__/logic.test.ts`)

```typescript
import { describe, test, expect } from "vitest";
import { convertBase, formatBinary, formatHex } from "../logic";

describe("convertBase", () => {
  test("converts decimal 255 to all bases", () => {
    const r = convertBase("255", 10);
    expect(r.success).toBe(true);
    expect(r.binary).toBe("11111111");
    expect(r.octal).toBe("377");
    expect(r.decimal).toBe("255");
    expect(r.hexadecimal).toBe("ff");
  });

  test("converts binary 1010 to all bases", () => {
    const r = convertBase("1010", 2);
    expect(r.success).toBe(true);
    expect(r.decimal).toBe("10");
    expect(r.hexadecimal).toBe("a");
    expect(r.octal).toBe("12");
  });

  test("converts hex ff to all bases", () => {
    const r = convertBase("ff", 16);
    expect(r.success).toBe(true);
    expect(r.decimal).toBe("255");
    expect(r.binary).toBe("11111111");
  });

  test("converts octal 77 to all bases", () => {
    const r = convertBase("77", 8);
    expect(r.success).toBe(true);
    expect(r.decimal).toBe("63");
  });

  test("handles zero", () => {
    const r = convertBase("0", 10);
    expect(r.success).toBe(true);
    expect(r.binary).toBe("0");
    expect(r.octal).toBe("0");
    expect(r.decimal).toBe("0");
    expect(r.hexadecimal).toBe("0");
  });

  test("handles negative numbers", () => {
    const r = convertBase("-10", 10);
    expect(r.success).toBe(true);
    expect(r.binary).toBe("-1010");
    expect(r.hexadecimal).toBe("-a");
  });

  test("handles large numbers (BigInt)", () => {
    const r = convertBase("18446744073709551615", 10);
    expect(r.success).toBe(true);
    expect(r.hexadecimal).toBe("ffffffffffffffff");
    expect(r.binary).toBe(
      "1111111111111111111111111111111111111111111111111111111111111111",
    );
  });

  test("returns error for invalid binary input", () => {
    const r = convertBase("123", 2);
    expect(r.success).toBe(false);
    expect(r.error).toBeDefined();
  });

  test("returns error for invalid hex input", () => {
    const r = convertBase("xyz", 16);
    expect(r.success).toBe(false);
  });

  test("returns error for invalid octal input", () => {
    const r = convertBase("89", 8);
    expect(r.success).toBe(false);
  });

  test("handles empty input", () => {
    const r = convertBase("", 10);
    expect(r.success).toBe(true);
    expect(r.binary).toBe("");
  });

  test("handles case insensitive hex", () => {
    const r = convertBase("FF", 16);
    expect(r.success).toBe(true);
    expect(r.decimal).toBe("255");
  });
});

describe("formatBinary", () => {
  test("formats with spaces every 4 digits", () => {
    expect(formatBinary("11111111")).toBe("1111 1111");
  });

  test("pads to multiple of 4", () => {
    expect(formatBinary("1010")).toBe("1010");
  });

  test("handles zero", () => {
    expect(formatBinary("0")).toBe("0");
  });

  test("handles empty", () => {
    expect(formatBinary("")).toBe("");
  });

  test("handles negative", () => {
    expect(formatBinary("-1010")).toBe("-1010");
  });
});

describe("formatHex", () => {
  test("formats with spaces every 2 digits", () => {
    expect(formatHex("aabbcc")).toBe("aa bb cc");
  });

  test("pads odd-length", () => {
    expect(formatHex("abc")).toBe("0a bc");
  });

  test("handles zero", () => {
    expect(formatHex("0")).toBe("0");
  });
});
```

### Acceptance Criteria

- [ ] `convertBase()` correctly converts between bases 2, 8, 10, 16
- [ ] BigInt support for arbitrarily large numbers
- [ ] Negative number support
- [ ] Input validation per base (binary only 0-1, octal only 0-7, etc.)
- [ ] Case-insensitive hex input
- [ ] `formatBinary()` groups by 4 digits, `formatHex()` groups by 2 digits
- [ ] Real-time conversion via useMemo (no convert button needed)
- [ ] All tests pass
- [ ] Component renders with base selector radio, input, result cards with copy buttons

---

## Tool 3: ダミーテキスト生成 (dummy-text)

### File Structure

```
src/tools/dummy-text/
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
  slug: "dummy-text",
  name: "ダミーテキスト生成",
  nameEn: "Dummy Text Generator",
  description:
    "ダミーテキスト生成ツール。Lorem Ipsum（英語）と日本語のダミーテキストを段落数・文章数を指定して生成。Webデザインのモックアップ作成に便利。登録不要・無料で使えるオンラインツールです。",
  shortDescription: "英語・日本語のダミーテキストを段落数指定で生成",
  keywords: [
    "ダミーテキスト生成",
    "Lorem Ipsum",
    "ダミーテキスト",
    "日本語ダミーテキスト",
    "テスト文章 生成",
  ],
  category: "generator",
  relatedSlugs: ["password-generator", "char-count", "byte-counter"],
  publishedAt: "2026-02-14",
  structuredDataType: "WebApplication",
};
```

### logic.ts

```typescript
export type TextLanguage = "lorem" | "japanese";

export interface GenerateOptions {
  language: TextLanguage;
  paragraphs: number; // 1-20
  sentencesPerParagraph: number; // 1-20
}

// --- Lorem Ipsum data ---
const LOREM_SENTENCES: string[] = [
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  "Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
  "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
  "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
  "Curabitur pretium tincidunt lacus sed porttitor.",
  "Nulla facilisi etiam dignissim diam quis enim lobortis scelerisque.",
  "Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas.",
  "Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae.",
  "Praesent commodo cursus magna vel scelerisque nisl consectetur et.",
  "Donec sed odio dui nulla vitae elit libero a pharetra augue.",
  "Maecenas sed diam eget risus varius blandit sit amet non magna.",
  "Fusce dapibus tellus ac cursus commodo tortor mauris condimentum nibh.",
  "Integer posuere erat a ante venenatis dapibus posuere velit aliquet.",
  "Vivamus sagittis lacus vel augue laoreet rutrum faucibus dolor auctor.",
  "Nullam quis risus eget urna mollis ornare vel eu leo.",
  "Aenean lacinia bibendum nulla sed consectetur praesent commodo cursus magna.",
  "Cras mattis consectetur purus sit amet fermentum donec ullamcorper nulla.",
  "Etiam porta sem malesuada magna mollis euismod vivamus sagittis.",
  "Morbi leo risus porta ac consectetur ac vestibulum at eros.",
];

// --- Japanese dummy text data ---
const JAPANESE_SENTENCES: string[] = [
  "吾輩は猫である。名前はまだない。",
  "どこで生れたかとんと見当がつかぬ。",
  "何でも薄暗いじめじめした所でニャーニャー泣いていた事だけは記憶している。",
  "吾輩はここで始めて人間というものを見た。",
  "しかもあとで聞くとそれは書生という人間中で一番獰悪な種族であったそうだ。",
  "この書生というのは時々我々を捕えて煮て食うという話である。",
  "しかしその当時は何という考もなかったから別段恐しいとも思わなかった。",
  "ただ彼の掌に載せられてスーと持ち上げられた時何だかフワフワした感じがあったばかりである。",
  "掌の上で少し落ちついて書生の顔を見たのがいわゆる人間というものの見始であろう。",
  "この時妙なものだと思った感じが今でも残っている。",
  "朝は毎日のように雨が降り、午後になると日差しが戻ってくるという天気が続いていた。",
  "山の向こうに広がる町並みは、遠くから見るとまるで絵画のように美しかった。",
  "新しい技術の登場により、私たちの生活は日々便利になっている。",
  "四季折々の風景が楽しめるこの地域は、多くの観光客を惹きつけている。",
  "読書は心を豊かにし、新しい世界への扉を開いてくれる素晴らしい習慣である。",
  "地元の商店街では、昔ながらの伝統を守りながら新しい取り組みも行われている。",
  "科学技術の発展は目覚ましく、かつて不可能とされたことが次々と実現されている。",
  "自然の中で過ごす時間は、忙しい日常から離れてリフレッシュするのに最適である。",
  "音楽は言葉の壁を越えて、人々の心に直接語りかける力を持っている。",
  "健康的な食生活を心がけることは、長く充実した人生を送るための基本である。",
];

export function generateText(options: GenerateOptions): string {
  const paragraphs = Math.max(1, Math.min(20, options.paragraphs));
  const sentences = Math.max(1, Math.min(20, options.sentencesPerParagraph));
  const pool =
    options.language === "lorem" ? LOREM_SENTENCES : JAPANESE_SENTENCES;

  const result: string[] = [];
  let sentenceIndex = 0;

  for (let p = 0; p < paragraphs; p++) {
    const paragraphSentences: string[] = [];
    for (let s = 0; s < sentences; s++) {
      paragraphSentences.push(pool[sentenceIndex % pool.length]);
      sentenceIndex++;
    }
    // Join with space for Lorem, no space for Japanese
    const joiner = options.language === "lorem" ? " " : "";
    result.push(paragraphSentences.join(joiner));
  }

  return result.join("\n\n");
}

// Count words in generated text
export function countGeneratedWords(text: string): number {
  if (!text.trim()) return 0;
  return text.trim().split(/\s+/).length;
}

// Count characters
export function countGeneratedChars(text: string): number {
  return text.length;
}
```

### Component.tsx (Outline)

```typescript
"use client";

import { useState, useMemo, useCallback } from "react";
import {
  generateText,
  countGeneratedWords,
  countGeneratedChars,
  type TextLanguage,
} from "./logic";
import styles from "./Component.module.css";

export default function DummyTextTool() {
  const [language, setLanguage] = useState<TextLanguage>("lorem");
  const [paragraphs, setParagraphs] = useState(3);
  const [sentencesPerParagraph, setSentencesPerParagraph] = useState(5);
  const [copied, setCopied] = useState(false);

  const output = useMemo(
    () => generateText({ language, paragraphs, sentencesPerParagraph }),
    [language, paragraphs, sentencesPerParagraph],
  );

  const wordCount = useMemo(() => countGeneratedWords(output), [output]);
  const charCount = useMemo(() => countGeneratedChars(output), [output]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }, [output]);

  // Layout:
  // 1. Language switch (Lorem Ipsum / 日本語) - radio group (base64 pattern)
  // 2. Options row: paragraphs number input + sentences number input
  // 3. Info bar: "X段落 / Y文字 / Z単語" (role="status")
  // 4. Output textarea (readonly, large) with copy button
  // Pattern: similar to password-generator (options → generated output)
}
```

### Component.module.css key classes

password-generator / base64 hybrid:

- `.container` - flex column, gap 1rem
- `.modeSwitch` / `.modeButton` / `.active` - language radio (same as base64)
- `.optionsRow` - flex row, gap 1rem, wrap
- `.numberField` - label + number input, inline
- `.numberInput` - small number input, width 5rem
- `.infoBar` - flex row, small muted text, gap 1rem
- `.outputHeader` / `.copyButton` - same as text-replace
- `.textarea` - readonly output, monospace-off (proportional font for text)

### Test Plan (`__tests__/logic.test.ts`)

```typescript
import { describe, test, expect } from "vitest";
import {
  generateText,
  countGeneratedWords,
  countGeneratedChars,
} from "../logic";

describe("generateText", () => {
  test("generates lorem ipsum paragraphs", () => {
    const text = generateText({
      language: "lorem",
      paragraphs: 2,
      sentencesPerParagraph: 3,
    });
    expect(text).toContain("Lorem ipsum");
    // Two paragraphs separated by double newline
    expect(text.split("\n\n")).toHaveLength(2);
  });

  test("generates japanese paragraphs", () => {
    const text = generateText({
      language: "japanese",
      paragraphs: 2,
      sentencesPerParagraph: 3,
    });
    // Should contain Japanese characters
    expect(text).toMatch(/[\u3000-\u9FFF]/);
    expect(text.split("\n\n")).toHaveLength(2);
  });

  test("clamps paragraphs to 1-20", () => {
    const textMin = generateText({
      language: "lorem",
      paragraphs: 0,
      sentencesPerParagraph: 1,
    });
    expect(textMin.split("\n\n")).toHaveLength(1);

    const textMax = generateText({
      language: "lorem",
      paragraphs: 100,
      sentencesPerParagraph: 1,
    });
    expect(textMax.split("\n\n")).toHaveLength(20);
  });

  test("clamps sentences to 1-20", () => {
    const text = generateText({
      language: "lorem",
      paragraphs: 1,
      sentencesPerParagraph: 0,
    });
    // Should still have at least one sentence
    expect(text.length).toBeGreaterThan(0);
  });

  test("cycles through sentences when exceeding pool size", () => {
    // 20 sentences in pool, request 25 sentences total
    const text = generateText({
      language: "lorem",
      paragraphs: 5,
      sentencesPerParagraph: 5,
    });
    expect(text).toContain("Lorem ipsum"); // first sentence should appear again
  });

  test("lorem uses space as joiner", () => {
    const text = generateText({
      language: "lorem",
      paragraphs: 1,
      sentencesPerParagraph: 2,
    });
    // Should have sentences joined by space
    expect(text).not.toContain("\n");
  });

  test("japanese uses no space as joiner", () => {
    const text = generateText({
      language: "japanese",
      paragraphs: 1,
      sentencesPerParagraph: 2,
    });
    // Japanese sentences should be concatenated directly
    expect(text.includes("。") || text.includes("。")).toBe(true);
  });
});

describe("countGeneratedWords", () => {
  test("counts words in text", () => {
    expect(countGeneratedWords("hello world foo")).toBe(3);
  });

  test("returns 0 for empty text", () => {
    expect(countGeneratedWords("")).toBe(0);
  });

  test("returns 0 for whitespace-only text", () => {
    expect(countGeneratedWords("   ")).toBe(0);
  });
});

describe("countGeneratedChars", () => {
  test("counts characters", () => {
    expect(countGeneratedChars("hello")).toBe(5);
  });

  test("returns 0 for empty string", () => {
    expect(countGeneratedChars("")).toBe(0);
  });

  test("counts Japanese characters", () => {
    expect(countGeneratedChars("日本語")).toBe(3);
  });
});
```

### Acceptance Criteria

- [ ] `generateText()` produces correct number of paragraphs separated by double newlines
- [ ] Lorem Ipsum sentences use space as joiner, Japanese uses no space
- [ ] Paragraph count clamped to 1-20, sentence count clamped to 1-20
- [ ] Sentences cycle through pool when count exceeds pool size
- [ ] `countGeneratedWords()` and `countGeneratedChars()` return correct counts
- [ ] All tests pass
- [ ] Component renders with language switch, numeric inputs, info bar, output with copy button

---

## Tool 4: 日付計算 (date-calculator)

### File Structure

```
src/tools/date-calculator/
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
  slug: "date-calculator",
  name: "日付計算",
  nameEn: "Date Calculator",
  description:
    "日付計算ツール。2つの日付の日数差分、日付に日数を加算・減算、和暦・西暦変換に対応。登録不要・無料で使えるオンラインツールです。",
  shortDescription: "日付の差分計算・加減算・和暦変換",
  keywords: [
    "日付計算",
    "日数計算",
    "日付 差分",
    "和暦 西暦 変換",
    "日付 加算 減算",
  ],
  category: "developer",
  relatedSlugs: ["unix-timestamp", "number-base-converter", "char-count"],
  publishedAt: "2026-02-14",
  structuredDataType: "WebApplication",
};
```

### logic.ts

```typescript
// --- Date Difference ---

export interface DateDiffResult {
  days: number;
  weeks: number;
  months: number;
  years: number;
  totalDays: number;
}

export function dateDiff(date1: Date, date2: Date): DateDiffResult {
  const d1 = new Date(date1.getFullYear(), date1.getMonth(), date1.getDate());
  const d2 = new Date(date2.getFullYear(), date2.getMonth(), date2.getDate());

  const msPerDay = 1000 * 60 * 60 * 24;
  const totalDays = Math.round(
    Math.abs(d2.getTime() - d1.getTime()) / msPerDay,
  );

  const weeks = Math.floor(totalDays / 7);
  const remainingDays = totalDays % 7;

  // Calculate year/month difference
  const [earlier, later] = d1 <= d2 ? [d1, d2] : [d2, d1];
  let years = later.getFullYear() - earlier.getFullYear();
  let months = later.getMonth() - earlier.getMonth();
  let days = later.getDate() - earlier.getDate();

  if (days < 0) {
    months--;
    // Days in previous month
    const prevMonth = new Date(later.getFullYear(), later.getMonth(), 0);
    days += prevMonth.getDate();
  }

  if (months < 0) {
    years--;
    months += 12;
  }

  return {
    days,
    weeks,
    months: years * 12 + months,
    years,
    totalDays,
  };
}

// --- Date Addition/Subtraction ---

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function subtractDays(date: Date, days: number): Date {
  return addDays(date, -days);
}

// --- Wareki (Japanese Era) Conversion ---

interface EraDefinition {
  name: string;
  nameKanji: string;
  startDate: Date;
}

const ERAS: EraDefinition[] = [
  { name: "Reiwa", nameKanji: "令和", startDate: new Date(2019, 4, 1) },
  { name: "Heisei", nameKanji: "平成", startDate: new Date(1989, 0, 8) },
  { name: "Showa", nameKanji: "昭和", startDate: new Date(1926, 11, 25) },
  { name: "Taisho", nameKanji: "大正", startDate: new Date(1912, 6, 30) },
  { name: "Meiji", nameKanji: "明治", startDate: new Date(1868, 0, 25) },
];

export interface WarekiResult {
  success: boolean;
  era?: string;
  eraKanji?: string;
  year?: number;
  formatted?: string;
  error?: string;
}

export function toWareki(date: Date): WarekiResult {
  for (const era of ERAS) {
    if (date >= era.startDate) {
      const year =
        date.getFullYear() -
        era.startDate.getFullYear() +
        (date >=
        new Date(era.startDate.getFullYear(), date.getMonth(), date.getDate())
          ? 1
          : 0);
      // Simplified: year = date.getFullYear() - era.startDate.getFullYear() + 1
      // but must handle era start year boundary
      const eraYear = date.getFullYear() - era.startDate.getFullYear() + 1;
      const yearStr = eraYear === 1 ? "元" : String(eraYear);
      const m = date.getMonth() + 1;
      const d = date.getDate();
      return {
        success: true,
        era: era.name,
        eraKanji: era.nameKanji,
        year: eraYear,
        formatted: `${era.nameKanji}${yearStr}年${m}月${d}日`,
      };
    }
  }
  return {
    success: false,
    error: "明治以前の日付には対応していません",
  };
}

export function fromWareki(
  eraKanji: string,
  eraYear: number,
  month: number,
  day: number,
): { success: boolean; date?: Date; error?: string } {
  const era = ERAS.find((e) => e.nameKanji === eraKanji);
  if (!era) {
    return { success: false, error: `不明な元号: ${eraKanji}` };
  }

  const westernYear = era.startDate.getFullYear() + eraYear - 1;
  const date = new Date(westernYear, month - 1, day);

  if (isNaN(date.getTime())) {
    return { success: false, error: "無効な日付です" };
  }

  // Verify the date is within the era
  if (date < era.startDate) {
    return {
      success: false,
      error: `${eraKanji}${eraYear}年は元号の開始日より前です`,
    };
  }

  return { success: true, date };
}

// --- Date formatting helpers ---

export function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function parseDate(dateStr: string): Date | null {
  const date = new Date(dateStr + "T00:00:00");
  return isNaN(date.getTime()) ? null : date;
}

// --- Day of week ---
const DAY_NAMES_JA = [
  "日曜日",
  "月曜日",
  "火曜日",
  "水曜日",
  "木曜日",
  "金曜日",
  "土曜日",
];

export function getDayOfWeek(date: Date): string {
  return DAY_NAMES_JA[date.getDay()];
}
```

### Component.tsx (Outline)

```typescript
"use client";

import { useState, useCallback } from "react";
import {
  dateDiff,
  addDays,
  toWareki,
  fromWareki,
  formatDate,
  parseDate,
  getDayOfWeek,
  type DateDiffResult,
  type WarekiResult,
} from "./logic";
import styles from "./Component.module.css";

export default function DateCalculatorTool() {
  // Section 1: Date difference
  const [date1, setDate1] = useState(formatDate(new Date()));
  const [date2, setDate2] = useState(formatDate(new Date()));
  const [diffResult, setDiffResult] = useState<DateDiffResult | null>(null);

  // Section 2: Date add/subtract
  const [baseDate, setBaseDate] = useState(formatDate(new Date()));
  const [daysToAdd, setDaysToAdd] = useState(0);
  const [addResult, setAddResult] = useState<string>("");

  // Section 3: Wareki conversion
  const [warekiDate, setWarekiDate] = useState(formatDate(new Date()));
  const [warekiResult, setWarekiResult] = useState<WarekiResult | null>(null);
  const [warekiEra, setWarekiEra] = useState("令和");
  const [warekiYear, setWarekiYear] = useState(1);
  const [warekiMonth, setWarekiMonth] = useState(1);
  const [warekiDay, setWarekiDay] = useState(1);
  const [fromWarekiResult, setFromWarekiResult] = useState<string>("");

  // Layout: 3 sections (like unix-timestamp tool)
  // Section 1: "日付の差分" - two date inputs + calculate button + result table
  // Section 2: "日付の加算・減算" - date input + days number input + +/- buttons + result
  // Section 3: "和暦・西暦変換" - date input → wareki display + wareki inputs → seireki display
  // Pattern: unix-timestamp style with multiple sections
}
```

### Component.module.css key classes

unix-timestamp pattern を踏襲:

- `.container` - flex column, gap 1rem
- `.section` - border, border-radius, padding, flex column
- `.sectionTitle` - h3 styled
- `.row` - flex row, gap, align center, wrap
- `.dateInput` - input type date styling
- `.numberInput` - small number input
- `.button` / `.buttonSecondary` - primary/secondary buttons
- `.resultTable` / `.resultRow` - results display (label + value)
- `.resultLabel` - small, muted
- `.error` - error styling

### Test Plan (`__tests__/logic.test.ts`)

```typescript
import { describe, test, expect } from "vitest";
import {
  dateDiff,
  addDays,
  subtractDays,
  toWareki,
  fromWareki,
  formatDate,
  parseDate,
  getDayOfWeek,
} from "../logic";

describe("dateDiff", () => {
  test("same date returns 0 days", () => {
    const d = new Date(2026, 0, 1);
    const result = dateDiff(d, d);
    expect(result.totalDays).toBe(0);
  });

  test("one day difference", () => {
    const d1 = new Date(2026, 0, 1);
    const d2 = new Date(2026, 0, 2);
    const result = dateDiff(d1, d2);
    expect(result.totalDays).toBe(1);
  });

  test("one year difference", () => {
    const d1 = new Date(2025, 0, 1);
    const d2 = new Date(2026, 0, 1);
    const result = dateDiff(d1, d2);
    expect(result.totalDays).toBe(365);
    expect(result.years).toBe(1);
  });

  test("handles leap year", () => {
    const d1 = new Date(2024, 0, 1);
    const d2 = new Date(2024, 11, 31);
    const result = dateDiff(d1, d2);
    expect(result.totalDays).toBe(365); // 2024 is leap year: 366 days total, but Jan 1 to Dec 31 = 365
  });

  test("order independent (absolute difference)", () => {
    const d1 = new Date(2026, 0, 1);
    const d2 = new Date(2026, 0, 15);
    expect(dateDiff(d1, d2).totalDays).toBe(dateDiff(d2, d1).totalDays);
  });

  test("calculates weeks correctly", () => {
    const d1 = new Date(2026, 0, 1);
    const d2 = new Date(2026, 0, 15);
    const result = dateDiff(d1, d2);
    expect(result.totalDays).toBe(14);
    expect(result.weeks).toBe(2);
  });

  test("calculates months correctly", () => {
    const d1 = new Date(2026, 0, 15);
    const d2 = new Date(2026, 3, 15);
    const result = dateDiff(d1, d2);
    expect(result.months).toBe(3);
  });
});

describe("addDays", () => {
  test("adds positive days", () => {
    const d = new Date(2026, 0, 1);
    const result = addDays(d, 10);
    expect(result.getDate()).toBe(11);
    expect(result.getMonth()).toBe(0);
  });

  test("adds across month boundary", () => {
    const d = new Date(2026, 0, 28);
    const result = addDays(d, 5);
    expect(result.getMonth()).toBe(1); // February
    expect(result.getDate()).toBe(2);
  });

  test("adds across year boundary", () => {
    const d = new Date(2025, 11, 30);
    const result = addDays(d, 5);
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth()).toBe(0);
  });

  test("handles zero days", () => {
    const d = new Date(2026, 5, 15);
    const result = addDays(d, 0);
    expect(result.getDate()).toBe(15);
  });
});

describe("subtractDays", () => {
  test("subtracts days", () => {
    const d = new Date(2026, 0, 15);
    const result = subtractDays(d, 5);
    expect(result.getDate()).toBe(10);
  });

  test("subtracts across month boundary", () => {
    const d = new Date(2026, 1, 3);
    const result = subtractDays(d, 5);
    expect(result.getMonth()).toBe(0); // January
    expect(result.getDate()).toBe(29);
  });
});

describe("toWareki", () => {
  test("converts 2026-02-14 to Reiwa 8", () => {
    const result = toWareki(new Date(2026, 1, 14));
    expect(result.success).toBe(true);
    expect(result.eraKanji).toBe("令和");
    expect(result.year).toBe(8);
    expect(result.formatted).toBe("令和8年2月14日");
  });

  test("converts 2019-05-01 to Reiwa 1 (元年)", () => {
    const result = toWareki(new Date(2019, 4, 1));
    expect(result.success).toBe(true);
    expect(result.eraKanji).toBe("令和");
    expect(result.formatted).toContain("令和元年");
  });

  test("converts 1989-01-08 to Heisei 1", () => {
    const result = toWareki(new Date(1989, 0, 8));
    expect(result.success).toBe(true);
    expect(result.eraKanji).toBe("平成");
    expect(result.year).toBe(1);
  });

  test("converts 1970-01-01 to Showa 45", () => {
    const result = toWareki(new Date(1970, 0, 1));
    expect(result.success).toBe(true);
    expect(result.eraKanji).toBe("昭和");
    expect(result.year).toBe(45);
  });

  test("converts Meiji era date", () => {
    const result = toWareki(new Date(1900, 0, 1));
    expect(result.success).toBe(true);
    expect(result.eraKanji).toBe("明治");
  });

  test("returns error for pre-Meiji date", () => {
    const result = toWareki(new Date(1867, 0, 1));
    expect(result.success).toBe(false);
  });
});

describe("fromWareki", () => {
  test("converts Reiwa 8 to 2026", () => {
    const result = fromWareki("令和", 8, 2, 14);
    expect(result.success).toBe(true);
    expect(result.date?.getFullYear()).toBe(2026);
    expect(result.date?.getMonth()).toBe(1);
    expect(result.date?.getDate()).toBe(14);
  });

  test("converts Heisei 1 to 1989", () => {
    const result = fromWareki("平成", 1, 1, 8);
    expect(result.success).toBe(true);
    expect(result.date?.getFullYear()).toBe(1989);
  });

  test("returns error for unknown era", () => {
    const result = fromWareki("不明", 1, 1, 1);
    expect(result.success).toBe(false);
  });
});

describe("formatDate", () => {
  test("formats date as YYYY-MM-DD", () => {
    expect(formatDate(new Date(2026, 1, 14))).toBe("2026-02-14");
  });

  test("pads month and day", () => {
    expect(formatDate(new Date(2026, 0, 5))).toBe("2026-01-05");
  });
});

describe("parseDate", () => {
  test("parses valid date string", () => {
    const d = parseDate("2026-02-14");
    expect(d).not.toBeNull();
    expect(d!.getFullYear()).toBe(2026);
  });

  test("returns null for invalid date", () => {
    expect(parseDate("invalid")).toBeNull();
  });
});

describe("getDayOfWeek", () => {
  test("returns correct day name in Japanese", () => {
    // 2026-02-14 is Saturday
    expect(getDayOfWeek(new Date(2026, 1, 14))).toBe("土曜日");
  });

  test("returns Sunday correctly", () => {
    // 2026-02-15 is Sunday
    expect(getDayOfWeek(new Date(2026, 1, 15))).toBe("日曜日");
  });
});
```

### Acceptance Criteria

- [ ] `dateDiff()` calculates correct totalDays, weeks, months, years between two dates
- [ ] `dateDiff()` is order-independent (absolute difference)
- [ ] `addDays()` and `subtractDays()` handle month/year boundaries correctly
- [ ] `toWareki()` correctly converts to Reiwa/Heisei/Showa/Taisho/Meiji eras
- [ ] `toWareki()` uses "元年" for year 1 of each era
- [ ] `fromWareki()` correctly converts from era/year/month/day to Date
- [ ] `getDayOfWeek()` returns Japanese day name
- [ ] All tests pass
- [ ] Component renders with 3 sections (difference, add/subtract, wareki) - same as unix-timestamp pattern

---

## Tool 5: バイト数計算 (byte-counter)

### File Structure

```
src/tools/byte-counter/
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
  slug: "byte-counter",
  name: "バイト数計算",
  nameEn: "Byte Counter",
  description:
    "バイト数計算ツール。UTF-8エンコーディングでのバイト数をリアルタイムで計算。文字数・行数・単語数も同時表示。データベースやAPIの文字数制限の確認に便利。登録不要・無料で使えるオンラインツールです。",
  shortDescription: "UTF-8バイト数をリアルタイム計算、文字数・行数も表示",
  keywords: [
    "バイト数計算",
    "UTF-8 バイト数",
    "バイト数 カウント",
    "文字数 バイト数",
    "バイト数計算 オンライン",
  ],
  category: "text",
  relatedSlugs: ["char-count", "dummy-text", "text-replace"],
  publishedAt: "2026-02-14",
  structuredDataType: "WebApplication",
};
```

### logic.ts

```typescript
export interface ByteCountResult {
  byteLength: number;
  charCount: number;
  charCountNoSpaces: number;
  lineCount: number;
  wordCount: number;
  // Per-character byte breakdown
  singleByteChars: number; // 1-byte (ASCII)
  twoBytechars: number; // 2-byte
  threeByteChars: number; // 3-byte (most CJK)
  fourByteChars: number; // 4-byte (emoji, rare CJK)
}

export function countBytes(text: string): number {
  return new TextEncoder().encode(text).byteLength;
}

export function countChars(text: string): number {
  // Use Array.from to handle surrogate pairs correctly
  return Array.from(text).length;
}

export function countCharsNoSpaces(text: string): number {
  return Array.from(text.replace(/\s/g, "")).length;
}

export function countLines(text: string): number {
  if (text === "") return 0;
  return text.split("\n").length;
}

export function countWords(text: string): number {
  if (text.trim() === "") return 0;
  // Simple space-based word count
  return text.trim().split(/\s+/).length;
}

// Analyze byte distribution per character
export function analyzeByteDistribution(
  text: string,
): Pick<
  ByteCountResult,
  "singleByteChars" | "twoBytechars" | "threeByteChars" | "fourByteChars"
> {
  let singleByteChars = 0;
  let twoBytechars = 0;
  let threeByteChars = 0;
  let fourByteChars = 0;

  for (const char of text) {
    const bytes = new TextEncoder().encode(char).byteLength;
    switch (bytes) {
      case 1:
        singleByteChars++;
        break;
      case 2:
        twoBytechars++;
        break;
      case 3:
        threeByteChars++;
        break;
      default:
        fourByteChars++;
        break;
    }
  }

  return { singleByteChars, twoBytechars, threeByteChars, fourByteChars };
}

export function analyzeText(text: string): ByteCountResult {
  const distribution = analyzeByteDistribution(text);
  return {
    byteLength: countBytes(text),
    charCount: countChars(text),
    charCountNoSpaces: countCharsNoSpaces(text),
    lineCount: countLines(text),
    wordCount: countWords(text),
    ...distribution,
  };
}
```

### Component.tsx (Outline)

```typescript
"use client";

import { useState, useMemo } from "react";
import { analyzeText } from "./logic";
import styles from "./Component.module.css";

export default function ByteCounterTool() {
  const [text, setText] = useState("");

  const result = useMemo(() => analyzeText(text), [text]);

  // Layout: char-count pattern (textarea + stats grid) with byte-focused emphasis
  // 1. Label + textarea (large, rows=10)
  // 2. Primary stat: byte count (large, prominent)
  // 3. Stats grid:
  //    - バイト数 (UTF-8) -- primary/large
  //    - 文字数
  //    - 文字数（空白除く）
  //    - 行数
  //    - 単語数
  // 4. Byte breakdown section:
  //    - 1バイト文字 (ASCII): N文字
  //    - 2バイト文字: N文字
  //    - 3バイト文字 (日本語等): N文字
  //    - 4バイト文字 (絵文字等): N文字
  // Pattern: enhanced char-count with byte breakdown table
}
```

### Component.module.css key classes

char-count pattern を踏襲 + byte breakdown:

- `.container` - flex column, gap 1rem
- `.label` - font-weight 600
- `.textarea` - full width, min-height 200px, proportional font
- `.primaryStat` - large byte count display (prominent, centered)
- `.results` - grid, auto-fill minmax(180px, 1fr)
- `.stat` / `.statLabel` / `.statValue` - same as char-count
- `.breakdown` - flex column, gap 0.5rem, border-top
- `.breakdownRow` - flex row, justify between
- `.breakdownLabel` - small text
- `.breakdownValue` - monospace, tabular-nums

### Test Plan (`__tests__/logic.test.ts`)

```typescript
import { describe, test, expect } from "vitest";
import {
  countBytes,
  countChars,
  countCharsNoSpaces,
  countLines,
  countWords,
  analyzeByteDistribution,
  analyzeText,
} from "../logic";

describe("countBytes", () => {
  test("ASCII characters are 1 byte each", () => {
    expect(countBytes("hello")).toBe(5);
  });

  test("Japanese hiragana is 3 bytes each", () => {
    expect(countBytes("あ")).toBe(3);
    expect(countBytes("あいう")).toBe(9);
  });

  test("Japanese kanji is 3 bytes each", () => {
    expect(countBytes("漢字")).toBe(6);
  });

  test("emoji is 4 bytes", () => {
    expect(countBytes("😀")).toBe(4);
  });

  test("mixed content", () => {
    // "Aあ" = 1 + 3 = 4
    expect(countBytes("Aあ")).toBe(4);
  });

  test("empty string is 0 bytes", () => {
    expect(countBytes("")).toBe(0);
  });

  test("newline is 1 byte", () => {
    expect(countBytes("\n")).toBe(1);
  });

  test("2-byte characters (Latin extended)", () => {
    // "ñ" (U+00F1) is 2 bytes in UTF-8
    expect(countBytes("ñ")).toBe(2);
  });
});

describe("countChars", () => {
  test("counts ASCII characters", () => {
    expect(countChars("hello")).toBe(5);
  });

  test("counts emoji as 1 character (not surrogate pair)", () => {
    expect(countChars("😀")).toBe(1);
  });

  test("counts Japanese characters", () => {
    expect(countChars("日本語")).toBe(3);
  });

  test("empty string", () => {
    expect(countChars("")).toBe(0);
  });
});

describe("countCharsNoSpaces", () => {
  test("excludes spaces", () => {
    expect(countCharsNoSpaces("hello world")).toBe(10);
  });

  test("excludes tabs and newlines", () => {
    expect(countCharsNoSpaces("a\tb\nc")).toBe(3);
  });
});

describe("countLines", () => {
  test("single line", () => {
    expect(countLines("hello")).toBe(1);
  });

  test("multiple lines", () => {
    expect(countLines("line1\nline2\nline3")).toBe(3);
  });

  test("empty string returns 0", () => {
    expect(countLines("")).toBe(0);
  });

  test("trailing newline", () => {
    expect(countLines("a\n")).toBe(2);
  });
});

describe("countWords", () => {
  test("counts words", () => {
    expect(countWords("hello world")).toBe(2);
  });

  test("empty string returns 0", () => {
    expect(countWords("")).toBe(0);
  });

  test("whitespace only returns 0", () => {
    expect(countWords("   ")).toBe(0);
  });

  test("multiple spaces between words", () => {
    expect(countWords("a  b  c")).toBe(3);
  });
});

describe("analyzeByteDistribution", () => {
  test("categorizes ASCII as 1-byte", () => {
    const r = analyzeByteDistribution("abc");
    expect(r.singleByteChars).toBe(3);
    expect(r.twoBytechars).toBe(0);
    expect(r.threeByteChars).toBe(0);
    expect(r.fourByteChars).toBe(0);
  });

  test("categorizes Japanese as 3-byte", () => {
    const r = analyzeByteDistribution("あいう");
    expect(r.threeByteChars).toBe(3);
  });

  test("categorizes emoji as 4-byte", () => {
    const r = analyzeByteDistribution("😀");
    expect(r.fourByteChars).toBe(1);
  });

  test("mixed content", () => {
    const r = analyzeByteDistribution("Aあ😀");
    expect(r.singleByteChars).toBe(1);
    expect(r.threeByteChars).toBe(1);
    expect(r.fourByteChars).toBe(1);
  });

  test("empty string", () => {
    const r = analyzeByteDistribution("");
    expect(r.singleByteChars).toBe(0);
  });
});

describe("analyzeText", () => {
  test("returns comprehensive analysis", () => {
    const r = analyzeText("Hello あいう");
    expect(r.byteLength).toBe(5 + 1 + 9); // "Hello" + space + 3 hiragana
    expect(r.charCount).toBe(9); // H,e,l,l,o, ,あ,い,う
    expect(r.charCountNoSpaces).toBe(8);
    expect(r.lineCount).toBe(1);
    expect(r.wordCount).toBe(2);
    expect(r.singleByteChars).toBe(6); // H,e,l,l,o,space
    expect(r.threeByteChars).toBe(3); // あ,い,う
  });

  test("handles empty string", () => {
    const r = analyzeText("");
    expect(r.byteLength).toBe(0);
    expect(r.charCount).toBe(0);
    expect(r.lineCount).toBe(0);
    expect(r.wordCount).toBe(0);
  });
});
```

### Acceptance Criteria

- [ ] `countBytes()` correctly calculates UTF-8 byte length for ASCII, CJK, and emoji
- [ ] `countChars()` uses `Array.from()` to handle surrogate pairs (emoji counted as 1)
- [ ] `analyzeByteDistribution()` correctly categorizes 1/2/3/4-byte characters
- [ ] `countLines()`, `countWords()`, `countCharsNoSpaces()` all work correctly
- [ ] `analyzeText()` returns comprehensive results
- [ ] All tests pass
- [ ] Component renders with textarea, prominent byte count, stats grid, byte breakdown
- [ ] Differentiation from char-count: byte-focused UI with byte distribution breakdown

---

## Registry Updates

### registry.ts additions

5 new imports and 5 new entries. Each builder adds their tool's entry independently.

```typescript
// Add these imports (each builder adds their own)
import { meta as csvConverterMeta } from "./csv-converter/meta";
import { meta as numberBaseConverterMeta } from "./number-base-converter/meta";
import { meta as dummyTextMeta } from "./dummy-text/meta";
import { meta as dateCalculatorMeta } from "./date-calculator/meta";
import { meta as byteCounterMeta } from "./byte-counter/meta";

// Add these entries to toolEntries array (each builder appends at the end)
  {
    meta: csvConverterMeta,
    componentImport: () => import("./csv-converter/Component"),
  },
  {
    meta: numberBaseConverterMeta,
    componentImport: () => import("./number-base-converter/Component"),
  },
  {
    meta: dummyTextMeta,
    componentImport: () => import("./dummy-text/Component"),
  },
  {
    meta: dateCalculatorMeta,
    componentImport: () => import("./date-calculator/Component"),
  },
  {
    meta: byteCounterMeta,
    componentImport: () => import("./byte-counter/Component"),
  },
```

---

## relatedSlugs Design

### New tools' relatedSlugs (defined above in each meta.ts)

| Tool                  | relatedSlugs                                      |
| --------------------- | ------------------------------------------------- |
| csv-converter         | json-formatter, markdown-preview, text-replace    |
| number-base-converter | color-converter, unix-timestamp, csv-converter    |
| dummy-text            | password-generator, char-count, byte-counter      |
| date-calculator       | unix-timestamp, number-base-converter, char-count |
| byte-counter          | char-count, dummy-text, text-replace              |

### Existing tools that should add new relatedSlugs (optional, low priority)

| Existing Tool      | Add to relatedSlugs   |
| ------------------ | --------------------- |
| json-formatter     | csv-converter         |
| markdown-preview   | csv-converter         |
| char-count         | byte-counter          |
| unix-timestamp     | date-calculator       |
| color-converter    | number-base-converter |
| password-generator | dummy-text            |

**Note**: Updating existing tools' relatedSlugs is optional for this batch and can be done as a follow-up.

---

## Parallel Implementation Strategy

### Conflict-free Work Areas

Each tool is entirely self-contained in `src/tools/<slug>/`. The only shared file is `registry.ts`.

### Builder Assignment Recommendation

| Builder   | Tools                                | Rationale                                                                               |
| --------- | ------------------------------------ | --------------------------------------------------------------------------------------- |
| Builder A | csv-converter, number-base-converter | Both developer category, complex logic (CSV parser, BigInt)                             |
| Builder B | date-calculator, byte-counter        | date-calculator has complex logic; byte-counter is simpler but related category pairing |
| Builder C | dummy-text                           | Simplest tool, generator category, standalone                                           |

### Why this split

- **Builder A** gets the most complex logic (CSV parser with RFC 4180 compliance + BigInt base conversion). These are developer tools with deep logic but simpler UIs.
- **Builder B** gets date-calculator (moderate complexity with wareki conversion, 3 sections) + byte-counter (simple logic, char-count-like UI).
- **Builder C** gets the lightest tool (dummy-text has static data arrays and simple generation logic).

### registry.ts Conflict Avoidance

**Strategy**: Same as previous batch. Each builder completes their tool directory first. The **last step** of each builder's work is to add their import + entry to `registry.ts`.

**Specific instructions for builders**:

1. Create all files in `src/tools/<slug>/` first
2. Run tests: `NODE_EXTRA_CA_CERTS=~/.Zscaler.pem npx vitest run src/tools/<slug>/`
3. Commit the tool directory
4. Then add import + entry to `registry.ts` (import at end of import block, entry at end of array)
5. Commit `registry.ts` change
6. Run `NODE_EXTRA_CA_CERTS=~/.Zscaler.pem npm run build` to verify no build errors

**Fallback**: If merge conflicts occur in `registry.ts`, they will be trivial to resolve (just keep all additions).

### Existing relatedSlugs Updates

Defer to a separate follow-up task after all 5 tools are merged.

---

## Implementation Dependencies

**No dependencies between tools.** All 5 tools are independent of each other and can be built in any order. The only coordination point is `registry.ts` which is handled by the sequential commit strategy described above.

---

## Rollback Approach

Each tool is isolated in its own directory. Rollback for any tool:

1. `git revert` the registry.ts commit
2. `git revert` the tool directory commit
3. Or simply remove the directory and registry entry

No schema migrations, no database changes, no external service dependencies.

---

## Next Actions

1. Project manager to create 3 builder task memos based on this plan (Builder A: csv-converter + number-base-converter, Builder B: date-calculator + byte-counter, Builder C: dummy-text)
2. Builders implement tools in parallel (each builder gets 1-2 tools)
3. Each builder runs tests and build verification
4. Reviewer checks completed tools
5. Follow-up task: update existing tools' relatedSlugs
