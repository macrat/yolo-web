import type { Metadata } from "next";
import { kanjiListMetadata } from "@/dictionary/_lib/kanji-list";
import KanjiListView from "@/dictionary/_components/kanji/KanjiListView";

export const metadata: Metadata = kanjiListMetadata({ type: "all" }, 1);

/** /dictionary/kanji は常用漢字の全体の一覧の1ページ目。 */
export default function KanjiIndexPage() {
  return <KanjiListView scope={{ type: "all" }} page={1} />;
}
