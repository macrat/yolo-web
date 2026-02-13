import fs from "node:fs";
import path from "node:path";
import { parseFrontmatter, markdownToHtml } from "@/lib/markdown";
import { detectSecrets } from "@/lib/secrets";
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
  public: boolean | null;
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
 * Scan all memo/{role}/{inbox,active,archive}/ directories for public memos.
 * All directories are scanned since all memos are public by default
 * (the source code is already public on GitHub).
 * Only memos with explicit public: false are excluded.
 * Memos matching secret patterns are excluded (C3).
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

        // Only exclude memos explicitly marked as non-public
        if (data.public === false) continue;

        // C3: Secret pattern detection
        const secretMatch = detectSecrets(content);
        if (secretMatch) {
          console.warn(
            `[memos] Excluding memo ${data.id || file} due to detected secret pattern: ${secretMatch}`,
          );
          continue;
        }

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
 * H5: If the root memo is not public, use the earliest public memo in the chain.
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

  // Check if the root is in our public set
  if (memoMap.has(currentId)) {
    return currentId;
  }

  // H5: Root not public -- use the earliest public memo we can trace back to
  let earliestPublicId = memoId;
  let earliestTime = Infinity;

  for (const visited_id of visited) {
    if (memoMap.has(visited_id)) {
      const m = memoMap.get(visited_id)!;
      const time = new Date(m.created_at).getTime();
      if (time < earliestTime) {
        earliestTime = time;
        earliestPublicId = visited_id;
      }
    }
  }

  return earliestPublicId;
}

/** Get all public memos with thread information. */
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

/** Get a single public memo by ID. */
export function getPublicMemoById(id: string): PublicMemo | null {
  const memos = getAllPublicMemos();
  return memos.find((m) => m.id === id) || null;
}

/**
 * Get all memos in a thread, given any memo ID in the thread.
 * Returns memos sorted by created_at ascending (chronological).
 * H5: Only includes public memos; skips non-public memos in the chain.
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

/** Get all unique tags across public memos. */
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
