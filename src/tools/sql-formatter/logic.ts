export interface FormatOptions {
  indent: string;
  uppercase: boolean;
  linesBetweenQueries: number;
}

const DEFAULT_OPTIONS: FormatOptions = {
  indent: "  ",
  uppercase: true,
  linesBetweenQueries: 2,
};

const SQL_KEYWORDS = new Set([
  "SELECT",
  "FROM",
  "WHERE",
  "AND",
  "OR",
  "NOT",
  "IN",
  "ON",
  "AS",
  "JOIN",
  "LEFT",
  "RIGHT",
  "INNER",
  "OUTER",
  "FULL",
  "CROSS",
  "GROUP",
  "ORDER",
  "BY",
  "HAVING",
  "LIMIT",
  "OFFSET",
  "INSERT",
  "INTO",
  "VALUES",
  "UPDATE",
  "SET",
  "DELETE",
  "CREATE",
  "TABLE",
  "ALTER",
  "DROP",
  "INDEX",
  "UNION",
  "ALL",
  "DISTINCT",
  "BETWEEN",
  "LIKE",
  "IS",
  "NULL",
  "EXISTS",
  "CASE",
  "WHEN",
  "THEN",
  "ELSE",
  "END",
  "ASC",
  "DESC",
  "COUNT",
  "SUM",
  "AVG",
  "MIN",
  "MAX",
  "WITH",
  "RECURSIVE",
]);

/** Keywords that start a new major clause (new line, no extra indent) */
const MAJOR_CLAUSE_KEYWORDS = new Set([
  "SELECT",
  "FROM",
  "WHERE",
  "SET",
  "VALUES",
  "HAVING",
  "LIMIT",
  "UNION",
  "INSERT",
  "UPDATE",
  "DELETE",
  "CREATE",
  "ALTER",
  "DROP",
]);

/** Keywords that start a new line with extra indent */
const SUB_CLAUSE_KEYWORDS = new Set(["AND", "OR"]);

/** Keywords that form compound keywords with the next token */
const COMPOUND_FIRST: Record<string, Set<string>> = {
  GROUP: new Set(["BY"]),
  ORDER: new Set(["BY"]),
  LEFT: new Set(["JOIN", "OUTER"]),
  RIGHT: new Set(["JOIN", "OUTER"]),
  INNER: new Set(["JOIN"]),
  OUTER: new Set(["JOIN"]),
  FULL: new Set(["JOIN", "OUTER"]),
  CROSS: new Set(["JOIN"]),
  INSERT: new Set(["INTO"]),
  IS: new Set(["NOT"]),
  NOT: new Set(["IN", "EXISTS", "BETWEEN", "LIKE", "NULL"]),
};

/** Compound keywords that act as major clauses */
const COMPOUND_MAJOR_CLAUSES = new Set(["GROUP BY", "ORDER BY", "INSERT INTO"]);

/** Join-related compound keywords */
const JOIN_KEYWORDS = new Set([
  "LEFT JOIN",
  "RIGHT JOIN",
  "INNER JOIN",
  "OUTER JOIN",
  "FULL JOIN",
  "FULL OUTER JOIN",
  "LEFT OUTER JOIN",
  "RIGHT OUTER JOIN",
  "CROSS JOIN",
]);

type TokenType =
  | "keyword"
  | "word"
  | "string"
  | "number"
  | "operator"
  | "comma"
  | "open_paren"
  | "close_paren"
  | "semicolon"
  | "line_comment"
  | "block_comment"
  | "whitespace"
  | "dot"
  | "star";

interface Token {
  type: TokenType;
  value: string;
  upperValue: string;
}

function tokenize(sql: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;

  while (i < sql.length) {
    const ch = sql[i];

    // Whitespace
    if (/\s/.test(ch)) {
      const start = i;
      while (i < sql.length && /\s/.test(sql[i])) i++;
      tokens.push({
        type: "whitespace",
        value: sql.slice(start, i),
        upperValue: " ",
      });
      continue;
    }

    // Line comment
    if (ch === "-" && i + 1 < sql.length && sql[i + 1] === "-") {
      const start = i;
      while (i < sql.length && sql[i] !== "\n") i++;
      tokens.push({
        type: "line_comment",
        value: sql.slice(start, i),
        upperValue: sql.slice(start, i),
      });
      continue;
    }

    // Block comment
    if (ch === "/" && i + 1 < sql.length && sql[i + 1] === "*") {
      const start = i;
      i += 2;
      while (i < sql.length && !(sql[i - 1] === "*" && sql[i] === "/")) i++;
      if (i < sql.length) i++;
      tokens.push({
        type: "block_comment",
        value: sql.slice(start, i),
        upperValue: sql.slice(start, i),
      });
      continue;
    }

    // Single-quoted string
    if (ch === "'") {
      const start = i;
      i++;
      while (i < sql.length) {
        if (sql[i] === "'" && i + 1 < sql.length && sql[i + 1] === "'") {
          i += 2; // escaped quote
        } else if (sql[i] === "'") {
          i++;
          break;
        } else {
          i++;
        }
      }
      const val = sql.slice(start, i);
      tokens.push({ type: "string", value: val, upperValue: val });
      continue;
    }

    // Double-quoted string (identifier)
    if (ch === '"') {
      const start = i;
      i++;
      while (i < sql.length) {
        if (sql[i] === '"' && i + 1 < sql.length && sql[i + 1] === '"') {
          i += 2;
        } else if (sql[i] === '"') {
          i++;
          break;
        } else {
          i++;
        }
      }
      const val = sql.slice(start, i);
      tokens.push({ type: "string", value: val, upperValue: val });
      continue;
    }

    // Backtick-quoted identifier (MySQL)
    if (ch === "`") {
      const start = i;
      i++;
      while (i < sql.length && sql[i] !== "`") i++;
      if (i < sql.length) i++;
      const val = sql.slice(start, i);
      tokens.push({ type: "string", value: val, upperValue: val });
      continue;
    }

    // Parentheses
    if (ch === "(") {
      tokens.push({ type: "open_paren", value: "(", upperValue: "(" });
      i++;
      continue;
    }
    if (ch === ")") {
      tokens.push({ type: "close_paren", value: ")", upperValue: ")" });
      i++;
      continue;
    }

    // Comma
    if (ch === ",") {
      tokens.push({ type: "comma", value: ",", upperValue: "," });
      i++;
      continue;
    }

    // Semicolon
    if (ch === ";") {
      tokens.push({ type: "semicolon", value: ";", upperValue: ";" });
      i++;
      continue;
    }

    // Dot
    if (ch === "." && (i + 1 >= sql.length || !/\d/.test(sql[i + 1]))) {
      tokens.push({ type: "dot", value: ".", upperValue: "." });
      i++;
      continue;
    }

    // Star
    if (ch === "*") {
      tokens.push({ type: "star", value: "*", upperValue: "*" });
      i++;
      continue;
    }

    // Operators
    if (
      ch === "=" ||
      ch === "<" ||
      ch === ">" ||
      ch === "!" ||
      ch === "+" ||
      ch === "-" ||
      ch === "/" ||
      ch === "|"
    ) {
      const start = i;
      i++;
      // Handle two-character operators
      if (
        i < sql.length &&
        ((ch === "<" && (sql[i] === "=" || sql[i] === ">")) ||
          (ch === ">" && sql[i] === "=") ||
          (ch === "!" && sql[i] === "=") ||
          (ch === "|" && sql[i] === "|"))
      ) {
        i++;
      }
      const val = sql.slice(start, i);
      tokens.push({ type: "operator", value: val, upperValue: val });
      continue;
    }

    // Numbers
    if (
      /\d/.test(ch) ||
      (ch === "." && i + 1 < sql.length && /\d/.test(sql[i + 1]))
    ) {
      const start = i;
      while (i < sql.length && /[\d.]/.test(sql[i])) i++;
      const val = sql.slice(start, i);
      tokens.push({ type: "number", value: val, upperValue: val });
      continue;
    }

    // Words (identifiers and keywords)
    if (/[a-zA-Z_]/.test(ch)) {
      const start = i;
      while (i < sql.length && /[a-zA-Z0-9_]/.test(sql[i])) i++;
      const val = sql.slice(start, i);
      const upper = val.toUpperCase();
      if (SQL_KEYWORDS.has(upper)) {
        tokens.push({ type: "keyword", value: val, upperValue: upper });
      } else {
        tokens.push({ type: "word", value: val, upperValue: val });
      }
      continue;
    }

    // Unknown character - pass through
    tokens.push({ type: "word", value: ch, upperValue: ch });
    i++;
  }

  return tokens;
}

/** Filter out whitespace tokens */
function stripWhitespace(tokens: Token[]): Token[] {
  return tokens.filter((t) => t.type !== "whitespace");
}

/**
 * Merge compound keywords like GROUP BY, LEFT JOIN, INSERT INTO etc.
 * into single tokens for easier formatting.
 */
function mergeCompoundKeywords(tokens: Token[]): Token[] {
  const result: Token[] = [];
  let i = 0;

  while (i < tokens.length) {
    const token = tokens[i];

    if (token.type === "keyword" && COMPOUND_FIRST[token.upperValue]) {
      const possibleSeconds = COMPOUND_FIRST[token.upperValue];
      // Look ahead for compound (up to 3 tokens for FULL OUTER JOIN, LEFT OUTER JOIN)
      if (
        i + 1 < tokens.length &&
        tokens[i + 1].type === "keyword" &&
        possibleSeconds.has(tokens[i + 1].upperValue)
      ) {
        const second = tokens[i + 1];
        // Check for triple compound: LEFT OUTER JOIN, RIGHT OUTER JOIN, FULL OUTER JOIN
        if (
          second.upperValue === "OUTER" &&
          i + 2 < tokens.length &&
          tokens[i + 2].type === "keyword" &&
          tokens[i + 2].upperValue === "JOIN"
        ) {
          const compound = `${token.upperValue} ${second.upperValue} ${tokens[i + 2].upperValue}`;
          result.push({
            type: "keyword",
            value: `${token.value} ${second.value} ${tokens[i + 2].value}`,
            upperValue: compound,
          });
          i += 3;
          continue;
        }
        const compound = `${token.upperValue} ${second.upperValue}`;
        result.push({
          type: "keyword",
          value: `${token.value} ${second.value}`,
          upperValue: compound,
        });
        i += 2;
        continue;
      }
    }

    result.push(token);
    i++;
  }

  return result;
}

export function formatSql(
  sql: string,
  options?: Partial<FormatOptions>,
): string {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  if (!sql.trim()) return "";

  const rawTokens = tokenize(sql);
  const strippedTokens = stripWhitespace(rawTokens);
  const tokens = mergeCompoundKeywords(strippedTokens);

  const lines: string[] = [];
  let currentLine = "";
  let indentLevel = 0;
  let parenDepth = 0;

  function pushLine() {
    if (currentLine.trim()) {
      lines.push(opts.indent.repeat(indentLevel) + currentLine.trim());
    }
    currentLine = "";
  }

  function newLineWithIndent(level: number) {
    pushLine();
    indentLevel = level;
  }

  function keywordValue(token: Token): string {
    return opts.uppercase ? token.upperValue : token.value.toLowerCase();
  }

  /** Base indent level (outside parens) based on paren depth */
  function baseIndent(): number {
    return parenDepth;
  }

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];

    if (token.type === "line_comment" || token.type === "block_comment") {
      if (currentLine.trim()) {
        currentLine += " " + token.value;
      } else {
        currentLine = token.value;
      }
      pushLine();
      continue;
    }

    if (token.type === "semicolon") {
      currentLine += ";";
      pushLine();
      // Add blank lines between queries
      for (let b = 0; b < opts.linesBetweenQueries - 1; b++) {
        lines.push("");
      }
      indentLevel = 0;
      parenDepth = 0;
      continue;
    }

    if (token.type === "open_paren") {
      currentLine += " (";
      pushLine();
      parenDepth++;
      indentLevel = baseIndent();
      continue;
    }

    if (token.type === "close_paren") {
      pushLine();
      parenDepth = Math.max(0, parenDepth - 1);
      indentLevel = baseIndent();
      currentLine = ")";
      continue;
    }

    if (token.type === "comma") {
      currentLine += ",";
      pushLine();
      continue;
    }

    if (token.type === "keyword") {
      const kw = token.upperValue;
      const kwDisplay = keywordValue(token);

      // Major clause keywords -> new line at base indent
      if (
        MAJOR_CLAUSE_KEYWORDS.has(kw) ||
        COMPOUND_MAJOR_CLAUSES.has(kw) ||
        JOIN_KEYWORDS.has(kw) ||
        kw === "ON"
      ) {
        if (JOIN_KEYWORDS.has(kw) || kw === "ON") {
          newLineWithIndent(baseIndent());
        } else {
          newLineWithIndent(baseIndent());
        }
        currentLine = kwDisplay;
        continue;
      }

      // Sub-clause keywords -> new line with extra indent
      if (SUB_CLAUSE_KEYWORDS.has(kw)) {
        newLineWithIndent(baseIndent() + 1);
        currentLine = kwDisplay;
        continue;
      }

      // Regular keyword -> add to current line
      if (currentLine) {
        currentLine += " " + kwDisplay;
      } else {
        currentLine = kwDisplay;
      }
      continue;
    }

    // Non-keyword tokens
    if (token.type === "dot") {
      // No space around dots (table.column)
      currentLine += ".";
      continue;
    }

    const prevToken = i > 0 ? tokens[i - 1] : null;

    if (prevToken && prevToken.type === "dot") {
      // No space after dot
      currentLine += token.value;
      continue;
    }

    if (token.type === "operator") {
      currentLine += " " + token.value;
      continue;
    }

    // Default: add with space
    if (currentLine) {
      currentLine += " " + token.value;
    } else {
      currentLine = token.value;
    }
  }

  // Push any remaining content
  pushLine();

  // Trim trailing empty lines
  while (lines.length > 0 && lines[lines.length - 1] === "") {
    lines.pop();
  }

  return lines.join("\n");
}

export function minifySql(sql: string): string {
  if (!sql.trim()) return "";

  const tokens = tokenize(sql);
  let result = "";
  let prevNonWsType: TokenType | null = null;
  let hadWhitespace = false;

  for (const token of tokens) {
    if (token.type === "whitespace") {
      hadWhitespace = true;
      continue;
    }

    if (token.type === "line_comment") {
      // Line comments need a space before and a newline after
      if (result.length > 0) result += " ";
      result += token.value + "\n";
      prevNonWsType = token.type;
      hadWhitespace = false;
      continue;
    }

    if (token.type === "block_comment") {
      if (result.length > 0) result += " ";
      result += token.value;
      prevNonWsType = token.type;
      hadWhitespace = true;
      continue;
    }

    // Determine if we need a space before this token
    if (prevNonWsType && hadWhitespace) {
      if (needsSpace(prevNonWsType, token.type)) {
        result += " ";
      }
    } else if (
      prevNonWsType &&
      !hadWhitespace &&
      needsSpace(prevNonWsType, token.type)
    ) {
      result += " ";
    }

    result += token.value;
    prevNonWsType = token.type;
    hadWhitespace = false;
  }

  return result.trim();
}

function needsSpace(prev: TokenType, curr: TokenType): boolean {
  const wordLike = new Set<TokenType>(["keyword", "word", "number", "string"]);

  // No space around dots
  if (prev === "dot" || curr === "dot") return false;

  // Space between word-like tokens
  if (wordLike.has(prev) && wordLike.has(curr)) return true;

  // Space around operators
  if (prev === "operator" || curr === "operator") return true;

  // Space after comma
  if (prev === "comma") return true;

  // Space before keyword after close paren
  if (prev === "close_paren" && wordLike.has(curr)) return true;

  // Space after keyword before open paren
  if (wordLike.has(prev) && curr === "open_paren") return true;

  return false;
}
