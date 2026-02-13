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
  console.log(`Usage: npx tsx scripts/memo.ts <command> [options]

Commands:
  create    Create a new memo
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

inbox options:
  --role           Role to check inbox for (optional, shows all if omitted)

thread options:
  --id             Any memo ID in the thread (required)

archive options:
  --role           Role whose inbox to archive from (required)
  --id             Memo ID to archive (required)
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
