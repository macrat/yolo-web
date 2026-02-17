import fs from "node:fs";
import path from "node:path";
import { parseFrontmatter, markdownToHtml } from "@/lib/markdown";
import type { RoleSlug, PublicMemo } from "@/lib/memos-shared";

// Re-export shared types and constants for server-side consumers
export { ROLE_DISPLAY } from "@/lib/memos-shared";
export type { RoleSlug, RoleDisplay, PublicMemo } from "@/lib/memos-shared";

const ROLE_SLUGS: RoleSlug[] = [
  "owner",
  "project-manager",
  "researcher",
  "planner",
  "builder",
  "reviewer",
  "process-engineer",
];

interface MemoFrontmatter {
  id: string;
  subject: string;
  from: string;
  to: string;
  created_at: string;
  tags: string[];
  reply_to: string | null;
}

/** Internal representation before thread computation */
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

const MEMO_ROOT = path.join(process.cwd(), "memo");

/** Normalize a role string to a valid RoleSlug, or return as-is if valid. */
function normalizeRole(role: string): RoleSlug {
  const slug = role.toLowerCase().replace(/\s+/g, "-") as RoleSlug;
  if (ROLE_SLUGS.includes(slug)) return slug;
  // Fallback: try common variations
  const map: Record<string, RoleSlug> = {
    "project manager": "project-manager",
    "process engineer": "process-engineer",
    chatgpt: "owner", // Bootstrap memo sender
  };
  return map[role.toLowerCase()] || ("owner" as RoleSlug);
}

/**
 * Scan all memo/{role}/{inbox,active,archive}/ directories for memos.
 * All memos are included (public filter and secret detection removed).
 */
function scanAllMemos(): RawMemo[] {
  const memos: RawMemo[] = [];
  const SUBDIRS = ["inbox", "active", "archive"];

  for (const roleSlug of ROLE_SLUGS) {
    for (const subdir of SUBDIRS) {
      const dir = path.join(MEMO_ROOT, roleSlug, subdir);
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

  // Sort by created_at descending
  memos.sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

  return memos;
}

// Cache the scan results for the build
let _cachedMemos: RawMemo[] | null = null;
function getCachedMemos(): RawMemo[] {
  if (_cachedMemos === null) {
    _cachedMemos = scanAllMemos();
  }
  return _cachedMemos;
}

/**
 * Find the thread root ID for a given memo.
 * If the root memo is not found, use the earliest memo in the chain.
 * If reply_to references a non-existent memo, treat current memo as root.
 */
function findThreadRootId(memoId: string, allMemos: RawMemo[]): string {
  const memoMap = new Map<string, RawMemo>();
  for (const m of allMemos) {
    memoMap.set(m.id, m);
  }

  // Walk up the reply chain
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

/** Get all memos with thread information. */
export function getAllPublicMemos(): PublicMemo[] {
  const rawMemos = getCachedMemos();

  // Build thread root map and reply counts
  const threadRootMap = new Map<string, string>();
  for (const m of rawMemos) {
    threadRootMap.set(m.id, findThreadRootId(m.id, rawMemos));
  }

  // Count replies per thread root
  const replyCountMap = new Map<string, number>();
  for (const [, rootId] of threadRootMap) {
    replyCountMap.set(rootId, (replyCountMap.get(rootId) || 0) + 1);
  }

  return rawMemos.map((m) => {
    const threadRootId = threadRootMap.get(m.id) || m.id;
    return {
      id: m.id,
      subject: m.subject,
      from: normalizeRole(m.from),
      to: normalizeRole(m.to),
      created_at: m.created_at,
      tags: m.tags,
      reply_to: m.reply_to,
      contentHtml: m.contentHtml,
      threadRootId,
      replyCount: replyCountMap.get(threadRootId) || 1,
    };
  });
}

/** Get a single memo by ID. */
export function getPublicMemoById(id: string): PublicMemo | null {
  const memos = getAllPublicMemos();
  return memos.find((m) => m.id === id) || null;
}

/**
 * Get all memos in a thread, given any memo ID in the thread.
 * Returns memos sorted by created_at ascending (chronological).
 */
export function getMemoThread(id: string): PublicMemo[] {
  const allMemos = getAllPublicMemos();
  const memo = allMemos.find((m) => m.id === id);
  if (!memo) return [];

  const threadRootId = memo.threadRootId;
  const threadMemos = allMemos.filter((m) => m.threadRootId === threadRootId);

  // Sort chronologically (ascending)
  threadMemos.sort(
    (a, b) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  );

  return threadMemos;
}

/** Get all unique tags across memos. */
export function getAllMemoTags(): string[] {
  const memos = getAllPublicMemos();
  const tagSet = new Set<string>();
  for (const memo of memos) {
    for (const tag of memo.tags) {
      tagSet.add(tag);
    }
  }
  return Array.from(tagSet).sort();
}

/** Get all memo IDs for generateStaticParams. */
export function getAllPublicMemoIds(): string[] {
  return getAllPublicMemos().map((m) => m.id);
}

/** Get all thread root IDs for generateStaticParams. */
export function getAllThreadRootIds(): string[] {
  const memos = getAllPublicMemos();
  const rootIds = new Set<string>();
  for (const m of memos) {
    rootIds.add(m.threadRootId);
  }
  return Array.from(rootIds);
}
