import fs from "node:fs";
import path from "node:path";
import { parseMemoFile } from "../core/parser.js";
import { inboxDir } from "../core/paths.js";
import { VALID_ROLES, type RoleSlug } from "../types.js";

export function listInbox(role?: RoleSlug): void {
  const roles = role ? [role] : [...VALID_ROLES];

  for (const r of roles) {
    const dir = inboxDir(r);
    if (!fs.existsSync(dir)) continue;

    const files = fs
      .readdirSync(dir)
      .filter((f) => f.endsWith(".md") && f !== ".gitkeep");

    if (files.length === 0 && role) {
      console.log(`${r} (0 memos)`);
      continue;
    }
    if (files.length === 0) continue;

    console.log(`${r} (${files.length} memo${files.length > 1 ? "s" : ""}):`);
    for (const file of files) {
      try {
        const memo = parseMemoFile(path.join(dir, file));
        const tags =
          memo.frontmatter.tags.length > 0
            ? `  [${memo.frontmatter.tags.join(", ")}]`
            : "";
        console.log(
          `  ${memo.frontmatter.id}  ${memo.frontmatter.subject}${tags}`,
        );
      } catch {
        console.log(`  (parse error: ${file})`);
      }
    }
  }
}
