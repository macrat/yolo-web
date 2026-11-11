import type { Metadata } from "next";
import { yojiListMetadata } from "@/dictionary/_lib/yoji-list";
import YojiListView from "@/dictionary/_components/yoji/YojiListView";

export const metadata: Metadata = yojiListMetadata({ type: "all" }, 1);

/** /dictionary/yoji は四字熟語の全体の一覧の1ページ目。 */
export default function YojiIndexPage() {
  return <YojiListView scope={{ type: "all" }} page={1} />;
}
