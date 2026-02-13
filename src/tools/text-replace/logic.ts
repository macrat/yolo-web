export interface ReplaceOptions {
  useRegex: boolean;
  caseSensitive: boolean;
  globalReplace: boolean; // replace all occurrences
}

export interface ReplaceResult {
  success: boolean;
  output: string;
  count: number; // number of replacements made
  error?: string;
}

const DEFAULT_OPTIONS: ReplaceOptions = {
  useRegex: false,
  caseSensitive: true,
  globalReplace: true,
};

const MAX_INPUT_LENGTH = 100_000;

export function replaceText(
  input: string,
  search: string,
  replacement: string,
  options: ReplaceOptions = DEFAULT_OPTIONS,
): ReplaceResult {
  if (!search) {
    return { success: true, output: input, count: 0 };
  }

  if (input.length > MAX_INPUT_LENGTH) {
    return {
      success: false,
      output: "",
      count: 0,
      error: `入力テキストが長すぎます（最大${MAX_INPUT_LENGTH.toLocaleString()}文字）`,
    };
  }

  try {
    if (options.useRegex) {
      let flags = "";
      if (options.globalReplace) flags += "g";
      if (!options.caseSensitive) flags += "i";

      const regex = new RegExp(search, flags);

      // Count matches
      const matches = input.match(
        new RegExp(search, flags + (flags.includes("g") ? "" : "g")),
      );
      const count = matches ? matches.length : 0;

      const output = input.replace(regex, replacement);
      return {
        success: true,
        output,
        count: options.globalReplace ? count : Math.min(count, 1),
      };
    } else {
      // Plain text replacement
      if (options.globalReplace) {
        // Escape regex special chars for plain text search
        const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const flags = options.caseSensitive ? "g" : "gi";
        const regex = new RegExp(escaped, flags);
        const matches = input.match(regex);
        const count = matches ? matches.length : 0;
        const output = input.replace(regex, replacement);
        return { success: true, output, count };
      } else {
        // Replace first occurrence only
        const idx = options.caseSensitive
          ? input.indexOf(search)
          : input.toLowerCase().indexOf(search.toLowerCase());
        if (idx === -1) {
          return { success: true, output: input, count: 0 };
        }
        const output =
          input.slice(0, idx) + replacement + input.slice(idx + search.length);
        return { success: true, output, count: 1 };
      }
    }
  } catch (e) {
    return {
      success: false,
      output: "",
      count: 0,
      error: e instanceof Error ? e.message : "Replace failed",
    };
  }
}
