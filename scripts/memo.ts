import fs from "node:fs";
import { createMemo } from "./memo/commands/create.js";
import { readMemos } from "./memo/commands/read.js";
import { listMemos } from "./memo/commands/list.js";
import { markMemo } from "./memo/commands/mark.js";
import { normalizeRole } from "./memo/types.js";
import type { MemoState } from "./memo/core/scanner.js";

interface ParsedArgs {
  command: string;
  positional: string[];
  flags: Record<string, string | string[]>;
  booleanFlags: Set<string>;
}

/** Flags that take no value (boolean switches) */
const BOOLEAN_FLAGS = new Set(["skip-credential-check"]);

function parseArgs(args: string[]): ParsedArgs {
  const command = args[0] ?? "help";
  const positional: string[] = [];
  const flags: Record<string, string | string[]> = {};
  const booleanFlags = new Set<string>();

  for (let i = 1; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith("--")) {
      const key = arg.slice(2);
      if (BOOLEAN_FLAGS.has(key)) {
        booleanFlags.add(key);
        continue;
      }
      const value = args[++i] ?? "";
      // Support multiple values for --tag
      if (key === "tag") {
        const existing = flags[key];
        if (Array.isArray(existing)) {
          existing.push(value);
        } else if (typeof existing === "string") {
          flags[key] = [existing, value];
        } else {
          flags[key] = [value];
        }
      } else {
        flags[key] = value;
      }
    } else if (arg.startsWith("-") && arg.length > 1) {
      const key = arg.slice(1);
      const value = args[++i] ?? "";
      flags[key] = value;
    } else {
      positional.push(arg);
    }
  }

  return { command, positional, flags, booleanFlags };
}

function getFlag(
  flags: Record<string, string | string[]>,
  key: string,
): string | undefined {
  const val = flags[key];
  if (Array.isArray(val)) return val[0];
  return val;
}

function getFlagArray(
  flags: Record<string, string | string[]>,
  key: string,
): string[] {
  const val = flags[key];
  if (Array.isArray(val)) return val;
  if (typeof val === "string") return [val];
  return [];
}

function printUsage(): void {
  console.log(`Usage: npm run memo -- <command> [options]

Commands:
  list      List memos with optional filters
  read      Read a memo by ID
  create    Create a new memo
  mark      Change memo state (inbox/active/archive)
  help      Show this help message

list options:
  --state <state>    Filter by state: inbox, active, archive, all (comma-separated, default: all)
  --from <role>      Filter by sender role (use "all" to skip filtering)
  --to <role>        Filter by recipient role
  --tag <tag>        Filter by tag (repeatable, AND logic)
  --limit <number>   Max results (default: 10)
  --fields <fields>  Comma-separated fields (default: id,reply_to,created_at,from,to,state,subject)

read:
  npm run memo -- read <id>...

create:
  npm run memo -- create <from> <to> <subject> [options]
  --reply-to <id>              Reply-to memo ID
  --tags <tags>                Comma-separated tags
  --body -                     Read body from stdin (use "-" to read from stdin explicitly)
  --skip-credential-check      Skip credential pattern check

mark:
  npm run memo -- mark <state> <id>...

Examples:
  npm run memo -- list
  npm run memo -- list --state inbox --to planner
  npm run memo -- list --state inbox,active
  npm run memo -- list --tag request --tag implementation
  npm run memo -- read 19c5758d1f9
  npm run memo -- read 19c5758d1f9 19c5758d200
  echo "## Summary" | npm run memo -- create builder reviewer "Task done" --tags "report,completion"
  npm run memo -- mark archive 19c5758d1f9
  npm run memo -- mark archive 19c5758d1f9 19c5758d200
`);
}

/**
 * Resolves the memo body from flags and stdin.
 *
 * Priority:
 * 1. `--body -` → read from stdin explicitly (Unix convention)
 * 2. `--body <value>` → use the value directly
 * 3. No `--body` flag and stdin is not a TTY → read from stdin (pipe)
 *
 * After resolving, validates that the body (after trimming) is at least 10 characters.
 * Exits with code 1 if validation fails.
 */
export function resolveBody(
  bodyFlag: string | undefined,
  isTTY: boolean,
  readStdin: () => string,
): string {
  let body: string | undefined;

  if (bodyFlag === "-") {
    // --body - means read from stdin explicitly
    body = readStdin();
  } else if (bodyFlag !== undefined) {
    // --body <value> means use the value directly
    body = bodyFlag;
  } else if (!isTTY) {
    // No --body flag, but stdin is a pipe
    body = readStdin();
  }

  if (!body || body.trim().length === 0) {
    console.error(
      "Error: body is required. Provide --body - or pipe via stdin.",
    );
    console.error(
      'Usage: echo "memo body..." | npm run memo -- create <from> <to> <subject>',
    );
    console.error(
      "  or:  npm run memo -- create <from> <to> <subject> --body - (reads from stdin)",
    );
    process.exit(1);
  }

  if (body.trim().length < 10) {
    console.error(
      `Error: Memo body is too short (${body.trim().length} characters). At least 10 characters required.`,
    );
    console.error(
      'Usage: echo "memo body..." | npm run memo -- create <from> <to> <subject>',
    );
    console.error(
      "  or:  npm run memo -- create <from> <to> <subject> --body - (reads from stdin)",
    );
    process.exit(1);
  }

  return body;
}

function main(): void {
  const args = process.argv.slice(2);
  const { command, positional, flags, booleanFlags } = parseArgs(args);

  try {
    switch (command) {
      case "list": {
        const stateStr = getFlag(flags, "state") ?? "all";
        let state: MemoState | MemoState[] | "all";
        if (stateStr === "all") {
          state = "all";
        } else if (stateStr.includes(",")) {
          state = stateStr.split(",").map((s) => s.trim()) as MemoState[];
        } else {
          state = stateStr as MemoState;
        }
        const from = getFlag(flags, "from");
        const to = getFlag(flags, "to");
        const tags = getFlagArray(flags, "tag");
        const limitStr = getFlag(flags, "limit");
        const limit = limitStr ? parseInt(limitStr, 10) : 10;
        const fieldsStr = getFlag(flags, "fields");
        const fields = fieldsStr
          ? fieldsStr.split(",").map((f) => f.trim())
          : undefined;

        listMemos({
          state,
          from: from ?? undefined,
          to: to ?? undefined,
          tags,
          limit,
          fields,
        });
        break;
      }

      case "read": {
        const ids = positional;
        if (ids.length === 0) {
          console.error(
            "Error: at least one memo ID is required. Usage: npm run memo -- read <id>...",
          );
          process.exit(1);
        }
        readMemos(ids);
        break;
      }

      case "create": {
        const from = positional[0];
        const to = positional[1];
        const subject = positional[2];
        if (!from || !to || !subject) {
          console.error(
            "Error: <from>, <to>, and <subject> are required. Usage: npm run memo -- create <from> <to> <subject>",
          );
          process.exit(1);
        }

        // Validate roles
        normalizeRole(from);
        normalizeRole(to);

        const tags = getFlag(flags, "tags")
          ? getFlag(flags, "tags")!
              .split(",")
              .map((t) => t.trim())
          : [];
        const replyTo = getFlag(flags, "reply-to") ?? null;
        const skipCredentialCheck = booleanFlags.has("skip-credential-check");

        // Read body from --body flag or stdin
        const bodyFlag = getFlag(flags, "body");
        const body = resolveBody(bodyFlag, process.stdin.isTTY === true, () =>
          fs.readFileSync(0, "utf-8"),
        );

        const id = createMemo({
          subject,
          from,
          to,
          tags,
          replyTo,
          body,
          skipCredentialCheck,
        });
        console.log(id);
        break;
      }

      case "mark": {
        const newState = positional[0] as MemoState;
        const ids = positional.slice(1);
        if (!newState || ids.length === 0) {
          console.error(
            "Error: <state> and at least one <id> are required. Usage: npm run memo -- mark <state> <id>...",
          );
          process.exit(1);
        }
        for (const id of ids) {
          markMemo(id, newState);
        }
        break;
      }

      case "help":
      default:
        printUsage();
        break;
    }
  } catch (err) {
    console.error(`Error: ${err instanceof Error ? err.message : String(err)}`);
    process.exit(1);
  }
}

main();
