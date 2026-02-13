export interface Base64Result {
  success: boolean;
  output: string;
  error?: string;
}

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

export function decodeBase64(input: string): Base64Result {
  try {
    const binary = atob(input);
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
