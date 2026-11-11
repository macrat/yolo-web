import type { Metadata } from "next";
import { colorListMetadata } from "@/dictionary/_lib/color-list";
import ColorListView from "@/dictionary/_components/color/ColorListView";

export const metadata: Metadata = colorListMetadata({ type: "all" }, 1);

/** /dictionary/colors は伝統色の全体の一覧の1ページ目。 */
export default function ColorsIndexPage() {
  return <ColorListView scope={{ type: "all" }} page={1} />;
}
