import path from "node:path";

const MEMO_ROOT = path.resolve(process.cwd(), "memo");

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

/** Get the inbox directory path for a partition */
export function inboxDir(partition: string): string {
  return path.join(MEMO_ROOT, partition, "inbox");
}

/** Get the active directory path for a partition */
export function activeDir(partition: string): string {
  return path.join(MEMO_ROOT, partition, "active");
}

/** Get the archive directory path for a partition */
export function archiveDir(partition: string): string {
  return path.join(MEMO_ROOT, partition, "archive");
}

/** Build the full file path for a new memo */
export function memoFilePath(
  partition: string,
  id: string,
  subject: string,
): string {
  const kebab = toKebabCase(subject);
  return path.join(inboxDir(partition), `${id}-${kebab}.md`);
}

/** Get the memo root directory */
export function getMemoRoot(): string {
  return MEMO_ROOT;
}
