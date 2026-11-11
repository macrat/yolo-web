/** デコードできなかった理由。理由ごとに、来訪者へ直し方を言い分ける。 */
export type DecodeError =
  /** Base64 に使わない字がある。char は最初に見つかったその字。 */
  | { kind: "invalid-char"; char: string }
  /** 「=」が末尾でない所にある。 */
  | { kind: "misplaced-padding" }
  /** 字の数が、Base64 の区切り（4字）で割って1余る。 */
  | { kind: "incomplete" }
  /** Base64 としては読めたが、中身が UTF-8 の文字でない。 */
  | { kind: "not-text" };

export type DecodeResult =
  { success: true; output: string } | { success: false; error: DecodeError };

/** Base64 に使う字（標準形と URL-safe 形の両方）と、末尾の「=」。 */
const BASE64_CHAR = /[A-Za-z0-9+/\-_=]/;

/**
 * 標準 Base64 文字列を URL-safe Base64 形式に変換する。
 * RFC 4648 section 5 に従い '+' → '-'、'/' → '_' に置換する。
 * パディング文字 '=' はそのまま保持する。
 */
export function toUrlSafe(standard: string): string {
  return standard.replace(/\+/g, "-").replace(/\//g, "_");
}

/**
 * URL-safe Base64 文字列を標準 Base64 形式に変換する。
 * RFC 4648 section 5 に従い '-' → '+'、'_' → '/' に置換する。
 * パディングが欠けている場合は、4字の区切りに合うよう補完する。空白を含まない文字列を受け取る。
 */
export function fromUrlSafe(urlSafe: string): string {
  const standard = urlSafe.replace(/-/g, "+").replace(/_/g, "/");
  const remainder = standard.length % 4;
  if (remainder === 0) return standard;
  return standard + "=".repeat(4 - remainder);
}

/**
 * テキストを Base64 にエンコードする。
 * UTF-8 バイト列に変換してから base64 エンコードするため、
 * 日本語・絵文字などのマルチバイト文字も正しく処理される。
 */
export function encodeBase64(input: string): string {
  const bytes = new TextEncoder().encode(input);
  const binary = Array.from(bytes, (b) => String.fromCharCode(b)).join("");
  return btoa(binary);
}

/**
 * Base64 文字列をテキストにデコードする。
 *
 * 端末の base64 コマンドやメール（MIME）の出力は 76字ごとに改行し、文の中から選んで写すと前後に空白や改行が
 * 付く。空白と改行は Base64 の字ではないので、取り除いてから読む。標準形と URL-safe 形のどちらも読み、
 * 末尾の「=」の有無や数が合わなくても、字の数から補って読む。
 */
export function decodeBase64(input: string): DecodeResult {
  const compact = input.replace(/\s+/g, "");
  const invalid = Array.from(compact).find((c) => !BASE64_CHAR.test(c));
  if (invalid !== undefined) {
    return { success: false, error: { kind: "invalid-char", char: invalid } };
  }
  const body = compact.replace(/=+$/, "");
  if (body.includes("=")) {
    return { success: false, error: { kind: "misplaced-padding" } };
  }
  if (body.length % 4 === 1) {
    return { success: false, error: { kind: "incomplete" } };
  }
  const binary = atob(fromUrlSafe(body));
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  try {
    const text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
    return { success: true, output: text };
  } catch {
    return { success: false, error: { kind: "not-text" } };
  }
}
