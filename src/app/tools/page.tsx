import type { Metadata } from "next";
import ToolListView from "@/tools/_components/ToolListView";
import { toolListMetadata } from "@/tools/_lib/tool-list";

export const metadata: Metadata = toolListMetadata(1);

/** /tools はツールの一覧の1ページ目。 */
export default function ToolsPage() {
  return <ToolListView page={1} />;
}
