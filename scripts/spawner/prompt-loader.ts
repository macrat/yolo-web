import fs from "node:fs";
import path from "node:path";
import type { MonitoredRole } from "./types.js";

function getPromptDir(): string {
  return path.resolve(process.cwd(), "agents", "prompt");
}

/**
 * Load a prompt file for the given role, replacing $INPUT_MEMO_FILES
 * with the provided memo file path(s).
 *
 * For project-manager, memoFiles should be null (no replacement).
 */
export function loadPrompt(
  role: MonitoredRole,
  memoFiles: string | null,
): string {
  const promptPath = path.join(getPromptDir(), `${role}.md`);
  let content = fs.readFileSync(promptPath, "utf-8");

  if (memoFiles !== null) {
    content = content.replace(/\$INPUT_MEMO_FILES/g, memoFiles);
  }

  return content;
}

/**
 * Check if a prompt file exists for the given role.
 */
export function promptExists(role: MonitoredRole): boolean {
  const promptPath = path.join(getPromptDir(), `${role}.md`);
  return fs.existsSync(promptPath);
}
