import fs from "node:fs";
import path from "node:path";
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
 * Read a memo by ID and print its raw content to stdout.
 */
export function readMemo(id: string): void {
  const found = findMemoById(id);
  if (!found) {
    throw new Error(`No memo found with ID: ${id}`);
  }

  const content = fs.readFileSync(found, "utf-8");
  process.stdout.write(content);
}

/**
 * Read multiple memos by IDs and print their raw content to stdout.
 * Memos are separated by a blank line.
 */
export function readMemos(ids: string[]): void {
  for (let i = 0; i < ids.length; i++) {
    if (i > 0) {
      process.stdout.write("\n");
    }
    readMemo(ids[i]);
  }
}
