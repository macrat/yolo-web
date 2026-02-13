import fs from "node:fs";
import path from "node:path";
import { parseMemoFile } from "../core/parser.js";
import { getMemoRoot } from "../core/paths.js";

/**
 * Find a memo file by ID across all role directories and lifecycle folders.
 * Returns the first matching file path, or null if not found.
 */
export function findMemoById(id: string): string | null {
  const root = getMemoRoot();
  if (!fs.existsSync(root)) return null;

  for (const roleDir of fs.readdirSync(root)) {
    const rolePath = path.join(root, roleDir);
    if (!fs.statSync(rolePath).isDirectory()) continue;

    for (const subDir of ["inbox", "active", "archive"]) {
      const dirPath = path.join(rolePath, subDir);
      if (!fs.existsSync(dirPath)) continue;

      for (const file of fs.readdirSync(dirPath)) {
        if (file.startsWith(`${id}-`) && file.endsWith(".md")) {
          return path.join(dirPath, file);
        }
      }
    }
  }
  return null;
}

/**
 * Read a memo by ID or file path and print metadata header + body to stdout.
 */
export function readMemo(idOrPath: string): void {
  let filePath: string;

  if (fs.existsSync(idOrPath) && idOrPath.endsWith(".md")) {
    // Treat as a file path
    filePath = idOrPath;
  } else {
    // Treat as an ID
    const found = findMemoById(idOrPath);
    if (!found) {
      throw new Error(`No memo found with ID: ${idOrPath}`);
    }
    filePath = found;
  }

  const memo = parseMemoFile(filePath);
  const fm = memo.frontmatter;

  // Print header
  console.log(`ID:       ${fm.id}`);
  console.log(`Subject:  ${fm.subject}`);
  console.log(`From:     ${fm.from}`);
  console.log(`To:       ${fm.to}`);
  console.log(`Date:     ${fm.created_at}`);
  console.log(`Tags:     ${fm.tags.length > 0 ? fm.tags.join(", ") : "(none)"}`);
  console.log(`Reply-To: ${fm.reply_to ?? "(none)"}`);
  console.log(`File:     ${filePath}`);
  console.log("\u2500".repeat(60));
  console.log(memo.body);
}
