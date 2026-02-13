import path from "node:path";
import { ROLE_SLUG_MAP, type RoleSlug } from "../types.js";

const MEMO_ROOT = path.resolve(process.cwd(), "memo");

/**
 * Resolve a role display name (e.g. "project manager") to its directory slug.
 * Throws if the role is unknown.
 */
export function resolveRoleSlug(role: string): RoleSlug {
  const slug = ROLE_SLUG_MAP[role.toLowerCase().trim()];
  if (!slug) {
    throw new Error(
      `Unknown role: "${role}". Valid roles: ${Object.keys(ROLE_SLUG_MAP).join(", ")}`,
    );
  }
  return slug;
}

/**
 * Convert a subject string to kebab-case for use in filenames.
 * - Lowercases
 * - Replaces non-alphanumeric characters (except hyphens) with hyphens
 * - Collapses consecutive hyphens
 * - Trims leading/trailing hyphens
 * - Truncates to 60 characters max
 */
export function toKebabCase(subject: string): string {
  return subject
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

/** Get the inbox directory path for a role */
export function inboxDir(roleSlug: RoleSlug): string {
  return path.join(MEMO_ROOT, roleSlug, "inbox");
}

/** Get the active directory path for a role */
export function activeDir(roleSlug: RoleSlug): string {
  return path.join(MEMO_ROOT, roleSlug, "active");
}

/** Get the archive directory path for a role */
export function archiveDir(roleSlug: RoleSlug): string {
  return path.join(MEMO_ROOT, roleSlug, "archive");
}

/** Build the full file path for a new memo */
export function memoFilePath(
  roleSlug: RoleSlug,
  id: string,
  subject: string,
): string {
  const kebab = toKebabCase(subject);
  return path.join(inboxDir(roleSlug), `${id}-${kebab}.md`);
}

/** Get the memo root directory */
export function getMemoRoot(): string {
  return MEMO_ROOT;
}
