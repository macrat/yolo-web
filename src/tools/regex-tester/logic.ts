export interface RegexMatch {
  match: string;
  index: number;
  groups: string[];
}

export interface RegexResult {
  success: boolean;
  matches: RegexMatch[];
  error?: string;
}

/** Worker に送信するリクエストメッセージの型 */
export interface RegexWorkerRequest {
  type: "match" | "replace";
  pattern: string;
  flags: string;
  testString: string;
  replacement?: string;
}

/** Worker から受信するレスポンスメッセージの型 */
export interface RegexWorkerResponse {
  type: "match" | "replace";
  matchResult?: RegexResult;
  replaceResult?: { success: boolean; output: string; error?: string };
}

const MAX_INPUT_LENGTH = 10_000;
const MAX_MATCHES = 1_000;

export function testRegex(
  pattern: string,
  flags: string,
  testString: string,
): RegexResult {
  if (!pattern) {
    return { success: true, matches: [] };
  }

  if (testString.length > MAX_INPUT_LENGTH) {
    return {
      success: false,
      matches: [],
      error: `入力テキストが長すぎます（最大${MAX_INPUT_LENGTH.toLocaleString()}文字）`,
    };
  }

  try {
    const regex = new RegExp(pattern, flags);
    const matches: RegexMatch[] = [];

    if (flags.includes("g")) {
      let match: RegExpExecArray | null;
      let count = 0;
      while ((match = regex.exec(testString)) !== null) {
        matches.push({
          match: match[0],
          index: match.index,
          groups: match.slice(1),
        });
        count++;
        if (count >= MAX_MATCHES) break;
        // Prevent infinite loop for zero-length matches
        if (match[0].length === 0) {
          regex.lastIndex++;
        }
      }
    } else {
      const match = regex.exec(testString);
      if (match) {
        matches.push({
          match: match[0],
          index: match.index,
          groups: match.slice(1),
        });
      }
    }

    return { success: true, matches };
  } catch (e) {
    return {
      success: false,
      matches: [],
      error: e instanceof Error ? e.message : "Invalid regex pattern",
    };
  }
}

export function replaceWithRegex(
  pattern: string,
  flags: string,
  testString: string,
  replacement: string,
): { success: boolean; output: string; error?: string } {
  if (!pattern) {
    return { success: true, output: testString };
  }

  if (testString.length > MAX_INPUT_LENGTH) {
    return {
      success: false,
      output: "",
      error: `入力テキストが長すぎます（最大${MAX_INPUT_LENGTH.toLocaleString()}文字）`,
    };
  }

  try {
    const regex = new RegExp(pattern, flags);
    const output = testString.replace(regex, replacement);
    return { success: true, output };
  } catch (e) {
    return {
      success: false,
      output: "",
      error: e instanceof Error ? e.message : "Invalid regex pattern",
    };
  }
}
