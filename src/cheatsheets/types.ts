import type { TrustLevel } from "@/lib/trust-levels";

export type CheatsheetCategory = "developer" | "writing" | "devops";

export interface CheatsheetSection {
  id: string;
  title: string;
}

export interface CheatsheetMeta {
  slug: string;
  name: string;
  nameEn: string;
  description: string;
  shortDescription: string;
  keywords: string[];
  category: CheatsheetCategory;
  relatedToolSlugs: string[];
  relatedCheatsheetSlugs: string[];
  sections: CheatsheetSection[];
  publishedAt: string;
  /** Content trust level */
  trustLevel: TrustLevel;
}

export interface CheatsheetDefinition {
  meta: CheatsheetMeta;
  componentImport: () => Promise<{ default: React.ComponentType }>;
}
