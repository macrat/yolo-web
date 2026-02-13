export interface JsonValidationResult {
  valid: boolean;
  error?: string;
  position?: number;
}

export type IndentType = "2" | "4" | "tab";

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

export function validateJson(input: string): JsonValidationResult {
  try {
    JSON.parse(input);
    return { valid: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    // Try to extract position from error message
    const posMatch = message.match(/position\s+(\d+)/i);
    const position = posMatch ? parseInt(posMatch[1], 10) : undefined;
    return {
      valid: false,
      error: message,
      position,
    };
  }
}
