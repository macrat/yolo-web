"use client";

import dynamic from "next/dynamic";
import { toolsBySlug } from "@/tools/registry";
import ToolErrorBoundary from "@/components/tools/ErrorBoundary";

// Pre-build all dynamic components at module level (outside any render)
// to satisfy the react-hooks/static-components ESLint rule.
const dynamicComponentsBySlug: Record<string, React.ComponentType> = {};
for (const [slug, tool] of toolsBySlug.entries()) {
  dynamicComponentsBySlug[slug] = dynamic(tool.componentImport, {
    loading: () => <div>Loading...</div>,
  });
}

interface ToolRendererProps {
  slug: string;
}

export default function ToolRenderer({ slug }: ToolRendererProps) {
  const ToolComponent = dynamicComponentsBySlug[slug];
  if (!ToolComponent) return null;

  return (
    <ToolErrorBoundary>
      <ToolComponent />
    </ToolErrorBoundary>
  );
}
