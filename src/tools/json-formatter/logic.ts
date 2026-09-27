export interface JsonValidationResult {
  valid: boolean;
  error?: string;
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
    return {
      valid: false,
      error: e instanceof Error ? e.message : String(e),
    };
  }
}
