import fs from "node:fs";
import path from "node:path";
import { scanAllMemos, type MemoState } from "../core/scanner.js";
import { getMemoRoot } from "../core/paths.js";
import { isAgentMode } from "../types.js";

const VALID_STATES: MemoState[] = ["inbox", "active", "archive"];

/**
 * Change a memo's state by moving it to the corresponding directory.
 * Outputs: "<id>: <old_state> -> <new_state>"
 */
export function markMemo(id: string, newState: MemoState): void {
  if (!VALID_STATES.includes(newState)) {
    throw new Error(
      `Invalid state: "${newState}". Valid states: ${VALID_STATES.join(", ")}`,
    );
  }

  const memos = scanAllMemos();
  const memo = memos.find((m) => m.frontmatter.id === id);

  if (!memo) {
    throw new Error(`No memo found with ID: ${id}`);
  }

  // Agent mode: prohibit operating on owner's directory
  const memoRoot = getMemoRoot();
  const rel = path.relative(memoRoot, memo.filePath);
  if (isAgentMode() && rel.startsWith("owner" + path.sep)) {
    throw new Error(
      "It is prohibited to operate memos in owner's directory.",
    );
  }

  const oldState = memo.state;

  if (oldState === newState) {
    console.log(`${id}: ${oldState} -> ${newState}`);
    return;
  }

  // Compute new file path by replacing the state directory
  const oldDir = path.dirname(memo.filePath);
  const fileName = path.basename(memo.filePath);
  const roleDir = path.dirname(oldDir); // Go up from inbox/active/archive to role dir
  const newDir = path.join(roleDir, newState);

  // Ensure destination directory exists
  fs.mkdirSync(newDir, { recursive: true });

  const newFilePath = path.join(newDir, fileName);
  fs.renameSync(memo.filePath, newFilePath);

  console.log(`${id}: ${oldState} -> ${newState}`);
}
