"use client";

import dynamic from "next/dynamic";
import { cheatsheetsBySlug } from "@/cheatsheets/registry";

const dynamicComponentsBySlug: Record<string, React.ComponentType> = {};
for (const [slug, cheatsheet] of cheatsheetsBySlug.entries()) {
  dynamicComponentsBySlug[slug] = dynamic(cheatsheet.componentImport, {
    loading: () => <div>Loading...</div>,
  });
}

interface CheatsheetRendererProps {
  slug: string;
}

export default function CheatsheetRenderer({ slug }: CheatsheetRendererProps) {
  const CheatsheetComponent = dynamicComponentsBySlug[slug];
  if (!CheatsheetComponent) return null;
  return <CheatsheetComponent />;
}
