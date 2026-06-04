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

/**
 * HTML \u540D\u524D\u4ED8\u304D\u30A8\u30F3\u30C6\u30A3\u30C6\u30A3\u306E\u5BFE\u5FDC\u8868\uFF08decode \u7528\uFF09\u3002
 *
 * \u65E7\u5B9F\u88C5\u306E\u53D6\u308A\u3053\u307C\u3057\uFF08\u2460-8\uFF09\u3092\u89E3\u6D88\u3059\u308B\u305F\u3081\u3001HTML 4.01 / HTML5 \u3067\u5E83\u304F\u4F7F\u308F\u308C\u308B
 * \u4E3B\u8981\u306A\u540D\u524D\u4ED8\u304D\u30A8\u30F3\u30C6\u30A3\u30C6\u30A3\u3092\u7DB2\u7F85\u7684\u306B\u30AB\u30D0\u30FC\u3059\u308B\u3002
 * \u6570\u5024\u53C2\u7167\uFF08&#60; / &#x3C;\uFF09\u306F\u6B63\u898F\u8868\u73FE\u3067\u76F4\u63A5\u51E6\u7406\u3059\u308B\u305F\u3081\u3001\u3053\u3053\u306B\u306F\u542B\u3081\u306A\u3044\u3002
 */
const NAMED_ENTITIES: Record<string, string> = {
  // --- \u30A8\u30B9\u30B1\u30FC\u30D7\u5FC5\u98085\u6587\u5B57\uFF08encode \u3068\u306E\u5BFE\u79F0\u6027\u3092\u62C5\u4FDD\uFF09---
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  // --- \u7A7A\u767D\u30FB\u5236\u5FA1 ---
  nbsp: "\u00A0",
  shy: "\u00AD", // soft hyphen
  // --- \u8457\u4F5C\u6A29\u30FB\u5546\u6A19 ---
  copy: "\u00A9",
  reg: "\u00AE",
  trade: "\u2122",
  // --- \u901A\u8CA8 ---
  yen: "\u00A5",
  euro: "\u20AC",
  pound: "\u00A3",
  cent: "\u00A2",
  // --- \u30C0\u30C3\u30B7\u30E5\u30FB\u70B9 ---
  mdash: "\u2014",
  ndash: "\u2013",
  horbar: "\u2015",
  bull: "\u2022",
  hellip: "\u2026",
  // --- \u5F15\u7528\u7B26 ---
  laquo: "\u00AB",
  raquo: "\u00BB",
  lsquo: "\u2018",
  rsquo: "\u2019",
  ldquo: "\u201C",
  rdquo: "\u201D",
  sbquo: "\u201A",
  bdquo: "\u201E",
  // --- \u6570\u5B66\u30FB\u8A18\u53F7 ---
  times: "\u00D7",
  divide: "\u00F7",
  plusmn: "\u00B1",
  minus: "\u2212",
  prime: "\u2032",
  Prime: "\u2033",
  infin: "\u221E",
  sum: "\u2211",
  prod: "\u220F",
  radic: "\u221A",
  sdot: "\u22C5",
  and: "\u2227",
  or: "\u2228",
  ne: "\u2260",
  le: "\u2264",
  ge: "\u2265",
  asymp: "\u2248",
  cong: "\u2245",
  equiv: "\u2261",
  sub: "\u2282",
  sup: "\u2283",
  sube: "\u2286",
  supe: "\u2287",
  empty: "\u2205",
  isin: "\u2208",
  notin: "\u2209",
  nabla: "\u2207",
  forall: "\u2200",
  exist: "\u2203",
  part: "\u2202",
  int: "\u222B",
  prop: "\u221D",
  ang: "\u2220",
  perp: "\u22A5",
  deg: "\u00B0",
  micro: "\u00B5",
  frac12: "\u00BD",
  frac14: "\u00BC",
  frac34: "\u00BE",
  sup1: "\u00B9",
  sup2: "\u00B2",
  sup3: "\u00B3",
  // --- \u30E9\u30C6\u30F3\u62E1\u5F35\uFF08\u30A2\u30AF\u30BB\u30F3\u30C8\u4ED8\u304D\u6587\u5B57\uFF09---
  Agrave: "\u00C0",
  Aacute: "\u00C1",
  Acirc: "\u00C2",
  Atilde: "\u00C3",
  Auml: "\u00C4",
  Aring: "\u00C5",
  AElig: "\u00C6",
  Ccedil: "\u00C7",
  Egrave: "\u00C8",
  Eacute: "\u00C9",
  Ecirc: "\u00CA",
  Euml: "\u00CB",
  Igrave: "\u00CC",
  Iacute: "\u00CD",
  Icirc: "\u00CE",
  Iuml: "\u00CF",
  ETH: "\u00D0",
  Ntilde: "\u00D1",
  Ograve: "\u00D2",
  Oacute: "\u00D3",
  Ocirc: "\u00D4",
  Otilde: "\u00D5",
  Ouml: "\u00D6",
  Oslash: "\u00D8",
  Ugrave: "\u00D9",
  Uacute: "\u00DA",
  Ucirc: "\u00DB",
  Uuml: "\u00DC",
  Yacute: "\u00DD",
  THORN: "\u00DE",
  szlig: "\u00DF",
  agrave: "\u00E0",
  aacute: "\u00E1",
  acirc: "\u00E2",
  atilde: "\u00E3",
  auml: "\u00E4",
  aring: "\u00E5",
  aelig: "\u00E6",
  ccedil: "\u00E7",
  egrave: "\u00E8",
  eacute: "\u00E9",
  ecirc: "\u00EA",
  euml: "\u00EB",
  igrave: "\u00EC",
  iacute: "\u00ED",
  icirc: "\u00EE",
  iuml: "\u00EF",
  eth: "\u00F0",
  ntilde: "\u00F1",
  ograve: "\u00F2",
  oacute: "\u00F3",
  ocirc: "\u00F4",
  otilde: "\u00F5",
  ouml: "\u00F6",
  oslash: "\u00F8",
  ugrave: "\u00F9",
  uacute: "\u00FA",
  ucirc: "\u00FB",
  uuml: "\u00FC",
  yacute: "\u00FD",
  thorn: "\u00FE",
  yuml: "\u00FF",
  // --- \u305D\u306E\u4ED6\u8A18\u53F7 ---
  iquest: "\u00BF",
  iexcl: "\u00A1",
  para: "\u00B6",
  sect: "\u00A7",
  ordf: "\u00AA",
  ordm: "\u00BA",
  dagger: "\u2020",
  Dagger: "\u2021",
  permil: "\u2030",
  lsaquo: "\u2039",
  rsaquo: "\u203A",
  oline: "\u203E",
  frasl: "\u2044",
  spades: "\u2660",
  clubs: "\u2663",
  hearts: "\u2665",
  diams: "\u2666",
  // --- \u77E2\u5370 ---
  larr: "\u2190",
  uarr: "\u2191",
  rarr: "\u2192",
  darr: "\u2193",
  harr: "\u2194",
  crarr: "\u21B5",
  lArr: "\u21D0",
  uArr: "\u21D1",
  rArr: "\u21D2",
  dArr: "\u21D3",
  hArr: "\u21D4",
  // --- \u305D\u306E\u4ED6 Unicode \u91CD\u8981\u8A18\u53F7 ---
  zwj: "\u200D", // zero width joiner
  zwnj: "\u200C", // zero width non-joiner
  lrm: "\u200E", // left-to-right mark
  rlm: "\u200F", // right-to-left mark
  ensp: "\u2002",
  emsp: "\u2003",
  thinsp: "\u2009",
  circ: "\u02C6",
  tilde: "\u02DC",
  OElig: "\u0152",
  oelig: "\u0153",
  Scaron: "\u0160",
  scaron: "\u0161",
  Yuml: "\u0178",
  fnof: "\u0192",
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
