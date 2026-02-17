import fs from "node:fs";
import path from "node:path";
import { getMemoRoot } from "./paths.js";
import { parseMemoFile } from "./parser.js";
import type { MemoFrontmatter } from "../types.js";

export type MemoState = "inbox" | "active" | "archive";

export interface ScannedMemo {
  frontmatter: MemoFrontmatter;
  body: string;
  filePath: string;
  state: MemoState;
}

const VALID_STATES: MemoState[] = ["inbox", "active", "archive"];

/**
 * Scan all memo directories and return parsed memos with their state.
 * Iterates over all role directories and their inbox/active/archive subdirectories.
 */
export function scanAllMemos(): ScannedMemo[] {
  const root = getMemoRoot();
  if (!fs.existsSync(root)) return [];

  const memos: ScannedMemo[] = [];

  for (const roleDir of fs.readdirSync(root)) {
    const rolePath = path.join(root, roleDir);
    if (!fs.statSync(rolePath).isDirectory()) continue;

    for (const state of VALID_STATES) {
      const dirPath = path.join(rolePath, state);
      if (!fs.existsSync(dirPath)) continue;

      for (const file of fs.readdirSync(dirPath)) {
        if (!file.endsWith(".md")) continue;

        const filePath = path.join(dirPath, file);
        try {
          const memo = parseMemoFile(filePath);
          memos.push({
            frontmatter: memo.frontmatter,
            body: memo.body,
            filePath,
            state,
          });
        } catch {
          // Skip files that fail to parse
          console.warn(`Warning: Could not parse memo file: ${filePath}`);
        }
      }
    }
  }

  return memos;
}
