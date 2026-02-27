/**
 * Prebuild script: Generate a JSON index of all memos.
 *
 * This script scans memo/**\/*.md files and produces .generated/memo-index.json
 * so that the Next.js build (Turbopack) does not need to perform dynamic
 * fs.readdirSync / fs.readFileSync calls at compile time.
 *
 * Why: Turbopack traces every dynamic file-system access and expands path
 * patterns across the entire project.  With 1,500+ memo files the pattern
 * explosion causes a "matches 12,168 files" warning and slows compilation.
 * By pre-building a single JSON file we eliminate all dynamic fs access from
 * the Next.js module graph.
 *
 * This script is executed synchronously and sequentially -- markdownToHtml()
 * uses a module-level Marked instance with a closure-based heading-ID counter
 * that is reset per call, so parallel processing would not be safe.
 *
 * Executed via npm lifecycle hooks: prebuild, predev, pretest.
 */

import fs from "node:fs";
import path from "node:path";

// Use relative paths because tsx does not resolve tsconfig paths (@/ aliases)
import { parseFrontmatter, markdownToHtml } from "../src/lib/markdown.js";

const MEMO_ROOT = path.resolve(process.cwd(), "memo");
const OUTPUT_DIR = path.resolve(process.cwd(), ".generated");
const OUTPUT_FILE = path.join(OUTPUT_DIR, "memo-index.json");
const SUBDIRS = ["inbox", "active", "archive"] as const;

interface MemoFrontmatter {
  id: string;
  subject: string;
  from: string;
  to: string;
  created_at: string;
  tags: string[];
  reply_to: string | null;
}

/** Raw memo data before thread computation -- matches the shape in memos.ts */
interface RawMemo {
  id: string;
  subject: string;
  from: string;
  to: string;
  created_at: string;
  tags: string[];
  reply_to: string | null;
  contentHtml: string;
}

/**
 * Scan all memo/{partition}/{inbox,active,archive}/ directories and parse
 * each .md file into a RawMemo.  This is equivalent to the former
 * scanAllMemos() that lived in memos.ts.
 */
function scanAllMemos(): RawMemo[] {
  const memos: RawMemo[] = [];

  if (!fs.existsSync(MEMO_ROOT)) return memos;

  const partitions = fs.readdirSync(MEMO_ROOT).filter((entry) => {
    const entryPath = path.join(MEMO_ROOT, entry);
    return fs.statSync(entryPath).isDirectory();
  });

  for (const partition of partitions) {
    for (const subdir of SUBDIRS) {
      const dir = path.join(MEMO_ROOT, partition, subdir);
      if (!fs.existsSync(dir)) continue;

      const files = fs.readdirSync(dir).filter((f) => f.endsWith(".md"));

      for (const file of files) {
        const filePath = path.join(dir, file);
        const raw = fs.readFileSync(filePath, "utf-8");
        const { data, content } = parseFrontmatter<MemoFrontmatter>(raw);

        memos.push({
          id: String(data.id || ""),
          subject: String(data.subject || ""),
          from: String(data.from || ""),
          to: String(data.to || ""),
          created_at: String(data.created_at || ""),
          tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
          reply_to:
            data.reply_to === null || data.reply_to === undefined
              ? null
              : String(data.reply_to),
          contentHtml: markdownToHtml(content),
        });
      }
    }
  }

  // Sort by created_at descending (newest first)
  memos.sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

  return memos;
}

/**
 * Walk up the reply chain to find the thread root memo ID.
 * If the root memo is not found in the set, fall back to the earliest
 * memo we can trace back to.  Cycle protection is included.
 */
function findThreadRootId(
  memoId: string,
  memoMap: Map<string, RawMemo>,
): string {
  let currentId = memoId;
  const visited = new Set<string>();

  while (true) {
    if (visited.has(currentId)) break; // Cycle protection
    visited.add(currentId);

    const memo = memoMap.get(currentId);
    if (!memo) break; // Non-existent memo: stop here
    if (!memo.reply_to) break; // Found root

    currentId = memo.reply_to;
  }

  // Check if the root is in our set
  if (memoMap.has(currentId)) {
    return currentId;
  }

  // Root not found -- use the earliest memo we can trace back to
  let earliestId = memoId;
  let earliestTime = Infinity;

  for (const visitedId of visited) {
    if (memoMap.has(visitedId)) {
      const m = memoMap.get(visitedId)!;
      const time = new Date(m.created_at).getTime();
      if (time < earliestTime) {
        earliestTime = time;
        earliestId = visitedId;
      }
    }
  }

  return earliestId;
}

/** JSON index structure written to .generated/memo-index.json */
interface MemoIndex {
  memos: MemoIndexEntry[];
  generatedAt: string;
}

/** Each entry stores raw from/to (normalizeRole is applied at runtime) */
interface MemoIndexEntry {
  id: string;
  subject: string;
  from: string;
  to: string;
  created_at: string;
  tags: string[];
  reply_to: string | null;
  contentHtml: string;
  threadRootId: string;
  replyCount: number;
}

function main(): void {
  const startTime = Date.now();

  console.log("[build-memo-index] Scanning memo files...");
  const rawMemos = scanAllMemos();
  console.log(`[build-memo-index] Found ${rawMemos.length} memos`);

  // Build a lookup map for thread resolution
  const memoMap = new Map<string, RawMemo>();
  for (const m of rawMemos) {
    memoMap.set(m.id, m);
  }

  // Compute thread root for each memo
  const threadRootMap = new Map<string, string>();
  for (const m of rawMemos) {
    threadRootMap.set(m.id, findThreadRootId(m.id, memoMap));
  }

  // Count replies per thread root
  const replyCountMap = new Map<string, number>();
  for (const [, rootId] of threadRootMap) {
    replyCountMap.set(rootId, (replyCountMap.get(rootId) || 0) + 1);
  }

  // Build index entries (raw from/to -- normalizeRole applied at runtime)
  const entries: MemoIndexEntry[] = rawMemos.map((m) => {
    const threadRootId = threadRootMap.get(m.id) || m.id;
    return {
      id: m.id,
      subject: m.subject,
      from: m.from,
      to: m.to,
      created_at: m.created_at,
      tags: m.tags,
      reply_to: m.reply_to,
      contentHtml: m.contentHtml,
      threadRootId,
      replyCount: replyCountMap.get(threadRootId) || 1,
    };
  });

  const index: MemoIndex = {
    memos: entries,
    generatedAt: new Date().toISOString(),
  };

  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(index), "utf-8");

  const elapsed = Date.now() - startTime;
  const sizeKB = (fs.statSync(OUTPUT_FILE).size / 1024).toFixed(1);
  console.log(
    `[build-memo-index] Wrote ${OUTPUT_FILE} (${sizeKB} KB) in ${elapsed}ms`,
  );
}

main();
