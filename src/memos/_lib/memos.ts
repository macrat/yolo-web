/**
 * Memo data access layer for the Next.js application.
 *
 * Instead of scanning the filesystem at build time (which caused Turbopack
 * to trace 12,000+ files and emit broad-pattern warnings), this module reads
 * a pre-built JSON index at .generated/memo-index.json.
 *
 * The index is created by scripts/build-memo-index.ts and executed
 * automatically via npm lifecycle hooks (prebuild / predev / pretest).
 *
 * The JSON stores raw from/to role strings; normalizeRole() is applied here
 * at runtime so that the normalization logic stays in one place.
 */

import fs from "node:fs";
import path from "node:path";
import type { RoleSlug, PublicMemo } from "@/memos/_lib/memos-shared";
import { ROLE_DISPLAY } from "@/memos/_lib/memos-shared";

// Re-export shared types and constants for server-side consumers
export { ROLE_DISPLAY } from "@/memos/_lib/memos-shared";
export type {
  RoleSlug,
  RoleDisplay,
  PublicMemo,
} from "@/memos/_lib/memos-shared";

const KNOWN_ROLE_SLUGS: RoleSlug[] = Object.keys(ROLE_DISPLAY) as RoleSlug[];

// ---------------------------------------------------------------------------
// JSON index types
// ---------------------------------------------------------------------------

/** Shape of each entry in .generated/memo-index.json (raw, before normalizeRole) */
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

interface MemoIndex {
  memos: MemoIndexEntry[];
  generatedAt: string;
}

// ---------------------------------------------------------------------------
// Index loading  -- static path literal so Turbopack traces only one file
// ---------------------------------------------------------------------------

/**
 * Read the pre-built memo index.
 *
 * Uses fs.readFileSync with a fully static path (process.cwd() + literal
 * string) so that Turbopack can resolve it to a single file without
 * pattern expansion.  The result is cached for the lifetime of the process
 * (one build or one dev-server boot).
 */
let _cachedIndex: MemoIndex | null = null;
function loadIndex(): MemoIndex {
  if (_cachedIndex !== null) return _cachedIndex;

  const indexPath = path.join(process.cwd(), ".generated", "memo-index.json");
  const raw = fs.readFileSync(indexPath, "utf-8");
  _cachedIndex = JSON.parse(raw) as MemoIndex;
  return _cachedIndex;
}

// ---------------------------------------------------------------------------
// normalizeRole  -- pure function, no fs dependency
// ---------------------------------------------------------------------------

/** Normalize a role string to a known RoleSlug if possible, otherwise return as-is. */
export function normalizeRole(role: string): string {
  const slug = role.toLowerCase().replace(/\s+/g, "-");
  if (KNOWN_ROLE_SLUGS.includes(slug as RoleSlug)) return slug;
  // Fallback: try common variations and abbreviations
  const map: Record<string, RoleSlug> = {
    "project manager": "project-manager",
    "process engineer": "process-engineer",
    chatgpt: "owner", // Bootstrap memo sender
    pm: "project-manager",
    "agent-lead": "agent",
  };
  return map[role.toLowerCase()] || role;
}

// ---------------------------------------------------------------------------
// Cached public memos (with normalizeRole applied)
// ---------------------------------------------------------------------------

let _cachedPublicMemos: PublicMemo[] | null = null;
function getPublicMemosFromIndex(): PublicMemo[] {
  if (_cachedPublicMemos !== null) return _cachedPublicMemos;

  const index = loadIndex();
  _cachedPublicMemos = index.memos.map((m) => ({
    id: m.id,
    subject: m.subject,
    from: normalizeRole(m.from),
    to: normalizeRole(m.to),
    created_at: m.created_at,
    tags: m.tags,
    reply_to: m.reply_to,
    contentHtml: m.contentHtml,
    threadRootId: m.threadRootId,
    replyCount: m.replyCount,
  }));

  return _cachedPublicMemos;
}

// ---------------------------------------------------------------------------
// Public API  -- same signatures as before
// ---------------------------------------------------------------------------

/** Get all memos with thread information. */
export function getAllPublicMemos(): PublicMemo[] {
  return getPublicMemosFromIndex();
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

/** Get all unique roles across memos. */
export function getAllMemoRoles(): string[] {
  const memos = getAllPublicMemos();
  const roleSet = new Set<string>();
  for (const memo of memos) {
    roleSet.add(memo.from);
    roleSet.add(memo.to);
  }
  return Array.from(roleSet).sort();
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
