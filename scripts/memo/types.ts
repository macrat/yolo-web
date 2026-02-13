export interface MemoFrontmatter {
  id: string;
  subject: string;
  from: string;
  to: string;
  created_at: string;
  tags: string[];
  reply_to: string | null;
  public?: boolean;
}

export interface Memo {
  frontmatter: MemoFrontmatter;
  body: string;
  filePath: string;
}

export const VALID_TEMPLATES = [
  "task",
  "reply",
  "research",
  "planning",
  "implementation",
  "review",
  "process",
] as const;

export type TemplateType = (typeof VALID_TEMPLATES)[number];

export const VALID_ROLES = [
  "owner",
  "project-manager",
  "researcher",
  "planner",
  "builder",
  "reviewer",
  "process-engineer",
] as const;

export type RoleSlug = (typeof VALID_ROLES)[number];

/** Map display names to directory slugs */
export const ROLE_SLUG_MAP: Record<string, RoleSlug> = {
  owner: "owner",
  "project manager": "project-manager",
  "project-manager": "project-manager",
  researcher: "researcher",
  planner: "planner",
  builder: "builder",
  reviewer: "reviewer",
  "process engineer": "process-engineer",
  "process-engineer": "process-engineer",
};
