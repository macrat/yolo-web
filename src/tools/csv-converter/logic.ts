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

  // Escape backslashes first, then pipe characters, and normalize line breaks in cells.
  const escapeCell = (cell: string): string =>
    cell
      .replace(/\\/g, "\\\\")
      .replace(/\|/g, "\\|")
      .replace(/\r?\n|\r/g, " ");

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

// --- JSON parser -> rows ---

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

// --- Markdown parser -> rows ---

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
