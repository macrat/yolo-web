import fs from "node:fs";
import path from "node:path";
import { generateMemoId } from "../core/id.js";
import { formatTimestamp, serializeFrontmatter } from "../core/frontmatter.js";
import { resolveRoleSlug, memoFilePath } from "../core/paths.js";
import { checkCredentials } from "../core/credential-check.js";
import { scanAllMemos } from "../core/scanner.js";
import type { MemoFrontmatter } from "../types.js";

export interface CreateOptions {
  subject: string;
  from: string;
  to: string;
  tags: string[];
  replyTo: string | null;
  body: string;
  skipCredentialCheck?: boolean;
}

/**
 * Create a new memo file.
 * Returns the created memo's ID.
 */
export function createMemo(options: CreateOptions): string {
  const fromSlug = resolveRoleSlug(options.from);
  const toSlug = resolveRoleSlug(options.to);

  // Validate body is not empty
  if (!options.body || options.body.trim() === "") {
    throw new Error("Body is required and cannot be empty");
  }

  // Credential check
  if (!options.skipCredentialCheck) {
    const textToCheck = `${options.subject}\n${options.body}`;
    const result = checkCredentials(textToCheck);
    if (result.found) {
      throw new Error(
        `Warning: Potential credential detected: ${result.description}\n` +
          `Memo content will be public on GitHub and the website.\n` +
          `If the content is safe to publish, re-run with --skip-credential-check`,
      );
    }
  }

  // Auto-add "reply" tag for replies
  const tags = [...options.tags];
  if (options.replyTo && !tags.includes("reply")) {
    tags.unshift("reply");
  }

  // Generate ID and timestamp from same millisecond value
  let { id, timestamp } = generateMemoId();

  // Check for ID collisions
  const existingMemos = scanAllMemos();
  const existingIds = new Set(existingMemos.map((m) => m.frontmatter.id));
  while (existingIds.has(id)) {
    timestamp += 1;
    id = timestamp.toString(16);
  }

  const frontmatter: MemoFrontmatter = {
    id,
    subject: options.subject,
    from: fromSlug,
    to: toSlug,
    created_at: formatTimestamp(timestamp),
    tags,
    reply_to: options.replyTo,
  };

  const yaml = serializeFrontmatter(frontmatter);
  const content = `${yaml}\n\n${options.body}\n`;

  const filePath = memoFilePath(toSlug, id, options.subject);
  const dir = path.dirname(filePath);

  // Ensure directory exists
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(filePath, content, "utf-8");

  return id;
}
