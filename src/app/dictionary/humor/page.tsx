import type { Metadata } from "next";
import { humorListMetadata } from "@/humor-dict/_lib/humor-list";
import HumorListView from "@/humor-dict/_components/HumorListView";

export const metadata: Metadata = humorListMetadata(1);

/** /dictionary/humor はユーモア辞典の見出し語の一覧の1ページ目。 */
export default function HumorDictIndexPage() {
  return <HumorListView page={1} />;
}
