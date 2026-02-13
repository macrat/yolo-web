/**
 * Shared memo types and constants that can be used in both
 * server components and client components (no Node.js dependencies).
 */

export type RoleSlug =
  | "owner"
  | "project-manager"
  | "researcher"
  | "planner"
  | "builder"
  | "reviewer"
  | "process-engineer";

/** Role display configuration */
export interface RoleDisplay {
  label: string;
  color: string;
  icon: string;
}

export const ROLE_DISPLAY: Record<RoleSlug, RoleDisplay> = {
  "project-manager": {
    label: "PM",
    color: "#2563eb",
    icon: "clipboard",
  },
  researcher: {
    label: "Researcher",
    color: "#16a34a",
    icon: "search",
  },
  planner: {
    label: "Planner",
    color: "#9333ea",
    icon: "drafting-compass",
  },
  builder: {
    label: "Builder",
    color: "#ea580c",
    icon: "hammer",
  },
  reviewer: {
    label: "Reviewer",
    color: "#dc2626",
    icon: "eye",
  },
  owner: {
    label: "Owner",
    color: "#1a1a1a",
    icon: "user",
  },
  "process-engineer": {
    label: "Process Engineer",
    color: "#0891b2",
    icon: "gear",
  },
};

export interface PublicMemo {
  id: string;
  subject: string;
  from: RoleSlug;
  to: RoleSlug;
  created_at: string;
  tags: string[];
  reply_to: string | null;
  contentHtml: string;
  threadRootId: string;
  replyCount: number;
}
