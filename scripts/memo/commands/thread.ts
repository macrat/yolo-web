import fs from "node:fs";
import path from "node:path";
import { parseMemoFile } from "../core/parser.js";
import { getMemoRoot } from "../core/paths.js";
import type { Memo } from "../types.js";

/**
 * Scan all memo directories and return all parsed memos.
 */
function scanAllMemos(): Memo[] {
  const root = getMemoRoot();
  const memos: Memo[] = [];

  if (!fs.existsSync(root)) return memos;

  for (const roleDir of fs.readdirSync(root)) {
    const rolePath = path.join(root, roleDir);
    if (!fs.statSync(rolePath).isDirectory()) continue;

    for (const subDir of ["inbox", "archive"]) {
      const dirPath = path.join(rolePath, subDir);
      if (!fs.existsSync(dirPath)) continue;

      for (const file of fs.readdirSync(dirPath)) {
        if (!file.endsWith(".md") || file === ".gitkeep") continue;
        try {
          memos.push(parseMemoFile(path.join(dirPath, file)));
        } catch {
          // Skip unparseable files
        }
      }
    }
  }
  return memos;
}

export function showThread(id: string): void {
  const allMemos = scanAllMemos();
  const byId = new Map(allMemos.map((m) => [m.frontmatter.id, m]));

  // Find the root of the thread (with cycle detection)
  let rootId = id;
  const visitedUp = new Set<string>();
  while (true) {
    visitedUp.add(rootId);
    const memo = byId.get(rootId);
    if (!memo || !memo.frontmatter.reply_to) break;
    if (visitedUp.has(memo.frontmatter.reply_to)) break;
    rootId = memo.frontmatter.reply_to;
  }

  // Collect all memos in the thread (with cycle detection)
  const threadMemos: Memo[] = [];
  const visitedDown = new Set<string>();
  const collectThread = (currentId: string): void => {
    if (visitedDown.has(currentId)) return;
    visitedDown.add(currentId);

    const memo = byId.get(currentId);
    if (memo) threadMemos.push(memo);
    for (const m of allMemos) {
      if (m.frontmatter.reply_to === currentId) {
        collectThread(m.frontmatter.id);
      }
    }
  };
  collectThread(rootId);

  // Sort by created_at
  threadMemos.sort((a, b) =>
    a.frontmatter.created_at.localeCompare(b.frontmatter.created_at),
  );

  if (threadMemos.length === 0) {
    console.log(`No thread found for ID: ${id}`);
    return;
  }

  const rootMemo = threadMemos[0];
  console.log(`Thread: "${rootMemo.frontmatter.subject}"`);
  for (const m of threadMemos) {
    const location = m.filePath.includes("/inbox/") ? "inbox" : "archive";
    console.log(
      `  ${m.frontmatter.id}  ${m.frontmatter.from} -> ${m.frontmatter.to}  [${location}]  ${m.frontmatter.created_at}`,
    );
  }
}
