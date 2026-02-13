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
