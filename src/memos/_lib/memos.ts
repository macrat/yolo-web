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
import type {
  RoleSlug,
  PublicMemo,
  PublicMemoSummary,
} from "@/memos/_lib/memos-shared";
import { ROLE_DISPLAY } from "@/memos/_lib/memos-shared";

// Re-export PublicMemo and PublicMemoSummary types for server-side consumers
export type { PublicMemo, PublicMemoSummary } from "@/memos/_lib/memos-shared";

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

/** Get all memos without contentHtml (for list pages to reduce payload size). */
export function getAllPublicMemoSummaries(): PublicMemoSummary[] {
  const memos = getPublicMemosFromIndex();
  return memos.map((m) => ({
    id: m.id,
    subject: m.subject,
    from: m.from,
    to: m.to,
    created_at: m.created_at,
    tags: m.tags,
    reply_to: m.reply_to,
    threadRootId: m.threadRootId,
    replyCount: m.replyCount,
  }));
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

/** Options for server-side filtering and pagination of memo summaries. */
export interface FilteredMemoOptions {
  role?: string;
  tag?: string;
  page: number;
  perPage: number;
}

/** Result of server-side filtered and paginated memo summaries. */
export interface FilteredMemoResult {
  items: PublicMemoSummary[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
}

/**
 * Filter and paginate memo summaries on the server side.
 *
 * This avoids sending all memo summaries to the client; only the
 * requested page (typically 50 items) is included in the response.
 */
export function getFilteredMemoSummaries(
  opts: FilteredMemoOptions,
): FilteredMemoResult {
  let memos = getAllPublicMemoSummaries();

  if (opts.role && opts.role !== "all") {
    memos = memos.filter((m) => m.from === opts.role || m.to === opts.role);
  }
  if (opts.tag && opts.tag !== "all") {
    memos = memos.filter((m) => m.tags.includes(opts.tag!));
  }

  const totalItems = memos.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / opts.perPage));
  const currentPage = Math.max(1, Math.min(opts.page, totalPages));
  const start = (currentPage - 1) * opts.perPage;

  return {
    items: memos.slice(start, start + opts.perPage),
    totalItems,
    totalPages,
    currentPage,
  };
}
