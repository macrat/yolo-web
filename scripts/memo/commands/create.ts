import fs from "node:fs";
import path from "node:path";
import { generateMemoId } from "../core/id.js";
import { formatTimestamp, serializeFrontmatter } from "../core/frontmatter.js";
import { getTemplate } from "../core/templates.js";
import { resolveRoleSlug, memoFilePath } from "../core/paths.js";
import type { MemoFrontmatter, TemplateType } from "../types.js";

export interface CreateOptions {
  subject: string;
  from: string;
  to: string;
  tags: string[];
  replyTo: string | null;
  template: TemplateType;
  public?: boolean;
  body?: string; // If provided, use this instead of template
}

export function createMemo(options: CreateOptions): string {
  const id = generateMemoId();
  const fromSlug = resolveRoleSlug(options.from);
  const toSlug = resolveRoleSlug(options.to);

  // Auto-prefix "Re: " for replies
  let subject = options.subject;
  if (options.replyTo && !subject.startsWith("Re: ")) {
    subject = `Re: ${subject}`;
  }

  // Auto-add "reply" tag for replies
  const tags = [...options.tags];
  if (options.replyTo && !tags.includes("reply")) {
    tags.unshift("reply");
  }

  const frontmatter: MemoFrontmatter = {
    id,
    subject,
    from: fromSlug,
    to: toSlug,
    created_at: formatTimestamp(),
    tags,
    reply_to: options.replyTo,
    public: options.public,
  };

  const yaml = serializeFrontmatter(frontmatter);
  const body = options.body ?? getTemplate(options.template);
  const content = options.body ? `${yaml}\n\n${body}\n` : `${yaml}\n${body}`;

  const filePath = memoFilePath(toSlug, id, subject);
  const dir = path.dirname(filePath);

  // Ensure directory exists
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(filePath, content, "utf-8");

  return filePath;
}
