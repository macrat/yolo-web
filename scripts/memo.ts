import fs from "node:fs";
import { createMemo } from "./memo/commands/create.js";
import { readMemo } from "./memo/commands/read.js";
import { listInbox } from "./memo/commands/inbox.js";
import { showThread } from "./memo/commands/thread.js";
import { archiveMemo } from "./memo/commands/archive.js";
import { showStatus } from "./memo/commands/status.js";
import { resolveRoleSlug } from "./memo/core/paths.js";
import { VALID_TEMPLATES, type TemplateType } from "./memo/types.js";

function parseArgs(args: string[]): {
  command: string;
  flags: Record<string, string>;
} {
  const command = args[0] ?? "help";
  const flags: Record<string, string> = {};

  for (let i = 1; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith("--")) {
      const key = arg.slice(2);
      const value = args[++i] ?? "";
      flags[key] = value;
    } else if (arg.startsWith("-")) {
      const key = arg.slice(1);
      const value = args[++i] ?? "";
      flags[key] = value;
    }
  }

  return { command, flags };
}

function printUsage(): void {
  console.log(`Usage: npm run memo <command> [options]

Commands:
  create    Create a new memo
  read      Read a memo by ID or file path
  inbox     List memos in a role's inbox
  thread    Show all memos in a thread
  archive   Move a memo from inbox to archive
  status    Show memo counts per role
  help      Show this help message

create options:
  --subject, -s    Memo subject (required)
  --from, -f       Sender role name (required)
  --to, -t         Recipient role name (required)
  --tags           Comma-separated tags (optional)
  --reply-to, -r   ID of memo being replied to (optional)
  --template       Template type: ${VALID_TEMPLATES.join("|")} (default: task)
  --public         Set public visibility (true/false, optional)
  (stdin)          Pipe body text via stdin to override template

read options:
  --id             Memo ID or file path (required)

inbox options:
  --role           Role to check inbox for (optional, shows all if omitted)

thread options:
  --id             Any memo ID in the thread (required)

archive options:
  --role           Role whose inbox to archive from (required)
  --id             Memo ID to archive (required)

Examples:
  # Show all inboxes
  npm run memo status

  # Check a specific role's inbox
  npm run memo inbox -- --role planner

  # Read a specific memo
  npm run memo read -- --id 19c5758d1f9

  # Create a new task memo (with template)
  npm run memo create -- --subject "Task title" --from planner --to builder --template implementation --tags "impl,feature"

  # Create a memo with body from stdin
  echo "## Summary" | npm run memo create -- --subject "Re: Task" --from builder --to "project manager" --reply-to abc123 --template reply

  # Create a memo with heredoc body
  npm run memo create -- --subject "New plan" --from planner --to "project manager" --template planning <<'MEMO'
  ## Context
  Background info here.

  ## Goal
  What to achieve.
  MEMO

  # View a thread
  npm run memo thread -- --id 19c5758d1f9

  # Archive a processed memo
  npm run memo archive -- --role planner --id 19c5758d1f9
`);
}

function main(): void {
  const args = process.argv.slice(2);
  const { command, flags } = parseArgs(args);

  try {
    switch (command) {
      case "create": {
        const subject = flags["subject"] ?? flags["s"];
        const from = flags["from"] ?? flags["f"];
        const to = flags["to"] ?? flags["t"];
        if (!subject || !from || !to) {
          console.error("Error: --subject, --from, and --to are required");
          process.exit(1);
        }
        const tags = flags["tags"]
          ? flags["tags"].split(",").map((t) => t.trim())
          : [];
        const replyTo = flags["reply-to"] ?? flags["r"] ?? null;

        // Validate --template at runtime
        const templateRaw = flags["template"] ?? "task";
        if (!(VALID_TEMPLATES as readonly string[]).includes(templateRaw)) {
          console.error(
            `Error: Invalid template "${templateRaw}". Valid templates: ${VALID_TEMPLATES.join(", ")}`,
          );
          process.exit(1);
        }
        const template = templateRaw as TemplateType;

        // Validate --from role
        resolveRoleSlug(from);

        // Parse --public flag
        const publicRaw = flags["public"];
        let publicValue: boolean | undefined;
        if (publicRaw === "true") publicValue = true;
        else if (publicRaw === "false") publicValue = false;

        // Read body from stdin if available (pipe or redirect)
        let body: string | undefined;
        if (!process.stdin.isTTY) {
          body = fs.readFileSync(0, "utf-8");
          if (body.trim() === "") body = undefined; // Empty stdin -> use template
        }

        const filePath = createMemo({
          subject,
          from,
          to,
          tags,
          replyTo,
          template,
          public: publicValue,
          body,
        });
        console.log(`Created: ${filePath}`);
        break;
      }

      case "read": {
        const id = flags["id"];
        if (!id) {
          console.error("Error: --id is required (memo ID or file path)");
          process.exit(1);
        }
        readMemo(id);
        break;
      }

      case "inbox": {
        const role = flags["role"] ? resolveRoleSlug(flags["role"]) : undefined;
        listInbox(role);
        break;
      }

      case "thread": {
        const id = flags["id"];
        if (!id) {
          console.error("Error: --id is required");
          process.exit(1);
        }
        showThread(id);
        break;
      }

      case "archive": {
        const role = flags["role"];
        const id = flags["id"];
        if (!role || !id) {
          console.error("Error: --role and --id are required");
          process.exit(1);
        }
        const roleSlug = resolveRoleSlug(role);
        const result = archiveMemo(roleSlug, id);
        console.log(result);
        break;
      }

      case "status": {
        showStatus();
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
