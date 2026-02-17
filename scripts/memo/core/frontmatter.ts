import type { MemoFrontmatter } from "../types.js";

/**
 * Format an ISO-8601 timestamp with millisecond precision and timezone offset.
 * Uses the system timezone.
 * If a timestamp (ms) is provided, uses that exact value for consistency with ID generation.
 */
export function formatTimestamp(timestampMs?: number): string {
  const date = timestampMs !== undefined ? new Date(timestampMs) : new Date();
  const pad = (n: number, len = 2): string => String(n).padStart(len, "0");
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());
  const ms = pad(date.getMilliseconds(), 3);

  const tzOffset = -date.getTimezoneOffset();
  const tzSign = tzOffset >= 0 ? "+" : "-";
  const tzHours = pad(Math.floor(Math.abs(tzOffset) / 60));
  const tzMinutes = pad(Math.abs(tzOffset) % 60);

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${ms}${tzSign}${tzHours}:${tzMinutes}`;
}

/**
 * Escape double quotes inside a string value for YAML serialization.
 * Replaces `"` with `\"`.
 */
function escapeYamlString(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

/**
 * Serialize a MemoFrontmatter object to a YAML frontmatter string
 * (including the --- delimiters).
 */
export function serializeFrontmatter(fm: MemoFrontmatter): string {
  const lines: string[] = ["---"];
  lines.push(`id: "${escapeYamlString(fm.id)}"`);
  lines.push(`subject: "${escapeYamlString(fm.subject)}"`);
  lines.push(`from: "${escapeYamlString(fm.from)}"`);
  lines.push(`to: "${escapeYamlString(fm.to)}"`);
  lines.push(`created_at: "${escapeYamlString(fm.created_at)}"`);

  if (fm.tags.length === 0) {
    lines.push("tags: []");
  } else {
    lines.push("tags:");
    for (const tag of fm.tags) {
      lines.push(`  - ${tag}`);
    }
  }

  if (fm.reply_to === null) {
    lines.push("reply_to: null");
  } else {
    lines.push(`reply_to: "${escapeYamlString(fm.reply_to)}"`);
  }

  lines.push("---");
  return lines.join("\n");
}
