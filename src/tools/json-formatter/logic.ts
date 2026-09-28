export type IndentType = "2" | "4" | "tab";

/** 誤りの位置。行も字も1から数え、字はコードポイントで数える（タブも1字）。 */
export interface JsonErrorPosition {
  line: number;
  column: number;
}

function getIndent(indentType: IndentType): string | number {
  switch (indentType) {
    case "2":
      return 2;
    case "4":
      return 4;
    case "tab":
      return "\t";
  }
}

export function formatJson(input: string, indent: IndentType = "2"): string {
  const parsed = JSON.parse(input);
  return JSON.stringify(parsed, null, getIndent(indent));
}

export function minifyJson(input: string): string {
  const parsed = JSON.parse(input);
  return JSON.stringify(parsed);
}

export function isValidJson(input: string): boolean {
  try {
    JSON.parse(input);
    return true;
  } catch {
    return false;
  }
}

/** 読み進めた字が JSON の文法に合わなかった所。投げて、読む処理を一度に抜ける。 */
class JsonMismatch {
  constructor(readonly index: number) {}
}

const WHITESPACE = " \t\n\r";
const SIMPLE_ESCAPES = '"\\/bfnrt';
const LITERALS = ["true", "false", "null"];

function isDigit(char: string | undefined): boolean {
  return char !== undefined && char >= "0" && char <= "9";
}

function isHexDigit(char: string | undefined): boolean {
  return char !== undefined && /^[0-9a-fA-F]$/.test(char);
}

/**
 * JSON を先頭から読み、文法に合わない最初の字の位置（UTF-16 の添字）を返す。合わない字が無ければ null。
 * 文が途中で終わったときは、文の終わり（input.length）を返す。
 */
function findMismatchIndex(input: string): number | null {
  let i = 0;

  const fail = (): never => {
    throw new JsonMismatch(i);
  };

  const skipWhitespace = (): void => {
    while (i < input.length && WHITESPACE.includes(input[i])) i++;
  };

  const expectDigits = (): void => {
    if (!isDigit(input[i])) fail();
    while (isDigit(input[i])) i++;
  };

  const readLiteral = (word: string): void => {
    for (const char of word) {
      if (input[i] !== char) fail();
      i++;
    }
  };

  const readNumber = (): void => {
    if (input[i] === "-") i++;
    if (input[i] === "0") {
      i++;
    } else {
      expectDigits();
    }
    if (input[i] === ".") {
      i++;
      expectDigits();
    }
    if (input[i] === "e" || input[i] === "E") {
      i++;
      if (input[i] === "+" || input[i] === "-") i++;
      expectDigits();
    }
  };

  const readString = (): void => {
    i++;
    for (;;) {
      if (i >= input.length) fail();
      const char = input[i];
      if (char === '"') {
        i++;
        return;
      }
      if (char === "\\") {
        i++;
        if (input[i] === "u") {
          i++;
          for (let k = 0; k < 4; k++) {
            if (!isHexDigit(input[i])) fail();
            i++;
          }
        } else if (i < input.length && SIMPLE_ESCAPES.includes(input[i])) {
          i++;
        } else {
          fail();
        }
        continue;
      }
      // 改行やタブなどの制御文字は、文字列の中にそのまま置けない。
      if (char.charCodeAt(0) < 0x20) fail();
      i++;
    }
  };

  // 開いている入れ子を配列のスタックで持ち、どれほど深い入れ子でも呼び出しのスタックを使わずに読む。
  const openContainers: ("array" | "object")[] = [];

  /** オブジェクトの鍵と「:」を読む。 */
  const readKey = (): void => {
    skipWhitespace();
    if (input[i] !== '"') fail();
    readString();
    skipWhitespace();
    if (input[i] !== ":") fail();
    i++;
  };

  /** 値を1つ読み始める。入れ子を開いたときは、その中の最初の値の手前まで進めて true を返す。 */
  const startValue = (): boolean => {
    skipWhitespace();
    const char = input[i];
    if (char === "[" || char === "{") {
      i++;
      skipWhitespace();
      const closing = char === "[" ? "]" : "}";
      if (input[i] === closing) {
        i++;
        return false;
      }
      openContainers.push(char === "[" ? "array" : "object");
      if (char === "{") readKey();
      return true;
    }
    if (char === '"') readString();
    else if (char === "-" || isDigit(char)) readNumber();
    else {
      const literal = LITERALS.find((word) => word[0] === char);
      if (!literal) fail();
      readLiteral(literal!);
    }
    return false;
  };

  try {
    let needValue = true;
    for (;;) {
      if (needValue && startValue()) continue;
      needValue = false;
      skipWhitespace();
      const container = openContainers.at(-1);
      if (!container) break;
      if (input[i] === ",") {
        i++;
        if (container === "object") readKey();
        needValue = true;
        continue;
      }
      if (input[i] !== (container === "array" ? "]" : "}")) fail();
      i++;
      openContainers.pop();
    }
    if (i < input.length) fail();
    return null;
  } catch (e) {
    if (e instanceof JsonMismatch) return e.index;
    throw e;
  }
}

/**
 * JSON の文法に合わない最初の字が、何行目の何字目かを返す。合わない字が無ければ null。
 *
 * JSON.parse の誤りの文は、位置を言うかどうかがエンジンと誤りの種類で違う（Safari はどれも言わず、Chrome も
 * `True` や `//` のような予期しない字では言わない）。自分で読んで求め、どのブラウザでも同じ位置を返す。
 */
export function findJsonErrorPosition(input: string): JsonErrorPosition | null {
  const index = findMismatchIndex(input);
  if (index === null) return null;
  let line = 1;
  let column = 1;
  for (let k = 0; k < index;) {
    const codePoint = input.codePointAt(k) ?? 0;
    if (input[k] === "\n") {
      line++;
      column = 1;
    } else {
      column++;
    }
    k += codePoint > 0xffff ? 2 : 1;
  }
  return { line, column };
}
