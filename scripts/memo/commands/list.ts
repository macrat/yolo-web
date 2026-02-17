import { scanAllMemos, type MemoState } from "../core/scanner.js";

const DEFAULT_FIELDS = [
  "id",
  "reply_to",
  "created_at",
  "from",
  "to",
  "state",
  "subject",
];

const NULL_REPLY_TO = "-----------";

export interface ListOptions {
  state?: MemoState | "all";
  from?: string;
  to?: string;
  tags?: string[];
  limit?: number;
  fields?: string[];
}

/**
 * List memos with optional filtering and field selection.
 * Outputs tab-separated values with a header row.
 */
export function listMemos(options: ListOptions = {}): void {
  const {
    state = "all",
    from,
    to,
    tags = [],
    limit = 10,
    fields = DEFAULT_FIELDS,
  } = options;

  let memos = scanAllMemos();

  // Filter by state
  if (state !== "all") {
    memos = memos.filter((m) => m.state === state);
  }

  // Filter by from
  if (from) {
    memos = memos.filter((m) => m.frontmatter.from === from);
  }

  // Filter by to
  if (to) {
    memos = memos.filter((m) => m.frontmatter.to === to);
  }

  // Filter by tags (AND condition)
  if (tags.length > 0) {
    memos = memos.filter((m) =>
      tags.every((tag) => m.frontmatter.tags.includes(tag)),
    );
  }

  // Sort by created_at descending
  memos.sort(
    (a, b) =>
      new Date(b.frontmatter.created_at).getTime() -
      new Date(a.frontmatter.created_at).getTime(),
  );

  // Apply limit
  memos = memos.slice(0, limit);

  // Print header
  console.log(fields.join("\t"));

  // Print rows
  for (const memo of memos) {
    const values = fields.map((field) => {
      if (field === "state") return memo.state;
      if (field === "reply_to") {
        return memo.frontmatter.reply_to ?? NULL_REPLY_TO;
      }
      if (field === "tags") {
        return memo.frontmatter.tags.join(",");
      }
      const value =
        memo.frontmatter[field as keyof typeof memo.frontmatter] ?? "";
      if (Array.isArray(value)) return value.join(",");
      return String(value);
    });
    console.log(values.join("\t"));
  }
}
