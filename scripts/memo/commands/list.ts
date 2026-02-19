import { scanAllMemos, type MemoState } from "../core/scanner.js";
import { getMemoRoot } from "../core/paths.js";
import { isAgentMode } from "../types.js";
import path from "node:path";

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
  state?: MemoState | MemoState[] | "all";
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
    if (Array.isArray(state)) {
      const stateSet = new Set<string>(state);
      memos = memos.filter((m) => stateSet.has(m.state));
    } else {
      memos = memos.filter((m) => m.state === state);
    }
  }

  // Filter by from (skip if "all")
  if (from && from !== "all") {
    memos = memos.filter((m) => m.frontmatter.from === from);
  }

  // Filter by to / partition based on agent mode
  const memoRoot = getMemoRoot();
  const isInPartition = (filePath: string, partition: string): boolean => {
    const rel = path.relative(memoRoot, filePath);
    return rel.startsWith(partition + path.sep);
  };

  if (isAgentMode()) {
    if (to === "all") {
      // No filtering
    } else if (to === "owner") {
      memos = memos.filter((m) => isInPartition(m.filePath, "owner"));
    } else if (to) {
      // Filter by frontmatter.to matching the specified value
      memos = memos.filter((m) => m.frontmatter.to === to);
    } else {
      // Default: only show memos in memo/agent/
      memos = memos.filter((m) => isInPartition(m.filePath, "agent"));
    }
  } else {
    // Owner mode: default is all, but filter if --to is specified
    if (to && to !== "all") {
      memos = memos.filter((m) => m.frontmatter.to === to);
    }
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
