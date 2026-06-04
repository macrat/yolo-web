export interface Base64Result {
  success: boolean;
  output: string;
  error?: string;
}

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
 * パディングが欠けている場合は補完する。
 */
export function fromUrlSafe(urlSafe: string): string {
  // URL-safe 文字を標準に戻す
  const standard = urlSafe.replace(/-/g, "+").replace(/_/g, "/");
  // パディングが欠けている場合は '=' を補完する（4文字区切りに合わせる）
  const remainder = standard.length % 4;
  if (remainder === 0) return standard;
  return standard + "=".repeat(4 - remainder);
}

/**
 * テキストを Base64 にエンコードする。
 * UTF-8 バイト列に変換してから base64 エンコードするため、
 * 日本語・絵文字などのマルチバイト文字も正しく処理される。
 */
export function encodeBase64(input: string): Base64Result {
  try {
    const bytes = new TextEncoder().encode(input);
    const binary = Array.from(bytes)
      .map((b) => String.fromCharCode(b))
      .join("");
    return { success: true, output: btoa(binary) };
  } catch (e) {
    return {
      success: false,
      output: "",
      error: e instanceof Error ? e.message : "Encoding failed",
    };
  }
}

/**
 * Base64 文字列をテキストにデコードする。
 * 標準 Base64 と URL-safe Base64（'-'/'_' を含む文字列）の両方を受け付ける。
 * パディングが欠けている場合も自動補完する。
 * JWT のペイロード部分など、URL-safe 形式の文字列もそのまま入力できる。
 */
export function decodeBase64(input: string): Base64Result {
  try {
    // URL-safe 文字('-','_') や欠損パディングを正規化してから atob に渡す
    const normalized = fromUrlSafe(input);
    const binary = atob(normalized);
    const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
    const text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
    return { success: true, output: text };
  } catch (e) {
    return {
      success: false,
      output: "",
      error:
        e instanceof Error
          ? e.message
          : "Decoding failed. Invalid Base64 input.",
    };
  }
}
