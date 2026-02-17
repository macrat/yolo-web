/**
 * One-time fix script for existing memos:
 * 1. Derive created_at from ID (ID is master, hex-encoded millisecond timestamp)
 * 2. Remove public: true / public: false lines from frontmatter
 * 3. Resolve duplicate IDs by offsetting one by +1ms
 * 4. Rename files if ID changes
 */

import fs from "node:fs";
import path from "node:path";
import { formatTimestamp } from "./core/frontmatter.js";
import { getMemoRoot } from "./core/paths.js";

type MemoState = "inbox" | "active" | "archive";
const VALID_STATES: MemoState[] = ["inbox", "active", "archive"];

interface RawMemo {
  filePath: string;
  id: string;
  content: string;
}

function scanAllRawMemos(): RawMemo[] {
  const root = getMemoRoot();
  if (!fs.existsSync(root)) return [];

  const memos: RawMemo[] = [];

  for (const roleDir of fs.readdirSync(root)) {
    const rolePath = path.join(root, roleDir);
    if (!fs.statSync(rolePath).isDirectory()) continue;

    for (const state of VALID_STATES) {
      const dirPath = path.join(rolePath, state);
      if (!fs.existsSync(dirPath)) continue;

      for (const file of fs.readdirSync(dirPath)) {
        if (!file.endsWith(".md")) continue;

        const filePath = path.join(dirPath, file);
        const content = fs.readFileSync(filePath, "utf-8");

        // Extract ID from frontmatter
        const idMatch = content.match(/^id:\s*"([^"]+)"/m);
        if (!idMatch) {
          console.warn(`Warning: No ID found in ${filePath}, skipping`);
          continue;
        }

        memos.push({ filePath, id: idMatch[1], content });
      }
    }
  }

  return memos;
}

function fixCreatedAt(content: string, id: string): string {
  const ms = parseInt(id, 16);
  const newCreatedAt = formatTimestamp(ms);
  // Replace existing created_at line
  return content.replace(
    /^created_at:\s*"[^"]*"/m,
    `created_at: "${newCreatedAt}"`,
  );
}

function removePublicLine(content: string): string {
  // Remove public: true or public: false lines (with optional quotes)
  return content.replace(/^public:\s*(true|false|"true"|"false")\s*\n/gm, "");
}

function run(): void {
  console.log("Scanning all memos...");
  const memos = scanAllRawMemos();
  console.log(`Found ${memos.length} memos`);

  // Step 1: Find duplicate IDs
  const idToMemos = new Map<string, RawMemo[]>();
  for (const memo of memos) {
    const existing = idToMemos.get(memo.id) ?? [];
    existing.push(memo);
    idToMemos.set(memo.id, existing);
  }

  const duplicates = [...idToMemos.entries()].filter(([, v]) => v.length > 1);
  console.log(`\nFound ${duplicates.length} duplicate ID groups:`);

  // Track ID changes for duplicates: oldId -> newId
  const idChanges = new Map<string, string>();

  for (const [dupId, dupMemos] of duplicates) {
    console.log(`  ID ${dupId}:`);
    for (const m of dupMemos) {
      console.log(`    - ${m.filePath}`);
    }

    // Keep the first one as-is, offset subsequent ones by +1ms each
    for (let i = 1; i < dupMemos.length; i++) {
      const oldMs = parseInt(dupId, 16);
      const newMs = oldMs + i;
      const newId = newMs.toString(16);
      console.log(
        `    Changing ${dupMemos[i].filePath} ID: ${dupId} -> ${newId}`,
      );
      dupMemos[i].id = newId;
      idChanges.set(dupMemos[i].filePath, newId);
    }
  }

  // Step 2: Process all memos
  let fixedCount = 0;
  let publicRemoved = 0;
  let renamedCount = 0;

  for (const memo of memos) {
    let content = memo.content;

    // Check if ID was changed (duplicate resolution)
    const newId = idChanges.get(memo.filePath);
    if (newId) {
      content = content.replace(/^id:\s*"[^"]+"/m, `id: "${newId}"`);
      memo.id = newId;
    }

    // Fix created_at from ID
    content = fixCreatedAt(content, memo.id);

    // Remove public lines
    if (/^public:\s*/m.test(content)) {
      publicRemoved++;
    }
    content = removePublicLine(content);

    // Write back if changed
    if (content !== memo.content) {
      fs.writeFileSync(memo.filePath, content, "utf-8");
      fixedCount++;
    }

    // Rename file if ID changed
    if (newId) {
      const dir = path.dirname(memo.filePath);
      const oldFilename = path.basename(memo.filePath);
      // Replace old ID prefix with new ID
      const oldIdPrefix = oldFilename.split("-")[0];
      // The filename format is: {id}-{kebab-subject}.md
      // We need to replace the ID part only (first segment before first hyphen that matches hex)
      const rest = oldFilename.slice(oldIdPrefix.length);
      const newFilename = `${newId}${rest}`;
      const newFilePath = path.join(dir, newFilename);

      if (memo.filePath !== newFilePath) {
        fs.renameSync(memo.filePath, newFilePath);
        console.log(`  Renamed: ${oldFilename} -> ${newFilename}`);
        renamedCount++;
      }
    }
  }

  console.log(`\nSummary:`);
  console.log(`  Memos processed: ${memos.length}`);
  console.log(`  Files modified: ${fixedCount}`);
  console.log(`  Public attributes removed: ${publicRemoved}`);
  console.log(`  Files renamed (duplicate ID fix): ${renamedCount}`);
  console.log(`\nDone! Run 'npx prettier --write "memo/**/*.md"' next.`);
}

run();
