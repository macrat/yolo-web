export interface MemoFrontmatter {
  id: string;
  subject: string;
  from: string;
  to: string;
  created_at: string;
  tags: string[];
  reply_to: string | null;
}

export interface Memo {
  frontmatter: MemoFrontmatter;
  body: string;
  filePath: string;
}

/**
 * Normalize a role string for use as a directory name.
 * - Lowercases
 * - Replaces spaces with hyphens
 * - Only allows a-z and hyphens
 * - No leading or trailing hyphens
 * - Throws on invalid input
 */
export function normalizeRole(role: string): string {
  const normalized = role.toLowerCase().replace(/ /g, "-");
  if (!/^[a-z]([a-z-]*[a-z])?$/.test(normalized)) {
    throw new Error(
      `Invalid role: "${role}". Must contain only letters and hyphens, and must not start or end with a hyphen.`,
    );
  }
  return normalized;
}

/**
 * Determine the partition directory for a given "to" value.
 * "owner" goes to the "owner" partition; everything else goes to "agent".
 */
export function toPartition(to: string): "owner" | "agent" {
  return to === "owner" ? "owner" : "agent";
}

/**
 * Check if the current process is running inside Claude Code.
 */
export function isAgentMode(): boolean {
  return process.env.CLAUDECODE !== undefined;
}
