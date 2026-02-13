export interface UrlEncodeResult {
  success: boolean;
  output: string;
  error?: string;
}

export type EncodeMode = "component" | "full";

export function encodeUrl(
  input: string,
  mode: EncodeMode = "component",
): UrlEncodeResult {
  try {
    const output =
      mode === "component" ? encodeURIComponent(input) : encodeURI(input);
    return { success: true, output };
  } catch (e) {
    return {
      success: false,
      output: "",
      error: e instanceof Error ? e.message : "Encoding failed",
    };
  }
}

export function decodeUrl(
  input: string,
  mode: EncodeMode = "component",
): UrlEncodeResult {
  try {
    const output =
      mode === "component" ? decodeURIComponent(input) : decodeURI(input);
    return { success: true, output };
  } catch (e) {
    return {
      success: false,
      output: "",
      error: e instanceof Error ? e.message : "Decoding failed",
    };
  }
}
