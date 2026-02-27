import type { TrustLevel } from "@/lib/trust-levels";

export type ToolCategory =
  | "text"
  | "encoding"
  | "developer"
  | "security"
  | "generator";

export interface ToolMeta {
  slug: string;
  name: string; // Japanese display name
  nameEn: string; // English name (for potential i18n)
  description: string; // Japanese, 120-160 chars for meta description
  shortDescription: string; // Japanese, ~50 chars for cards
  keywords: string[]; // Japanese SEO keywords
  category: ToolCategory;
  relatedSlugs: string[]; // slugs of related tools
  publishedAt: string; // ISO date
  structuredDataType?: string; // JSON-LD @type (e.g., "WebApplication")
  trustLevel: TrustLevel;
}

export interface ToolDefinition {
  meta: ToolMeta;
  componentImport: () => Promise<{ default: React.ComponentType }>;
}
