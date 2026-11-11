import type { Metadata } from "next";
import PlayListView from "@/play/_components/PlayListView";
import { playListMetadata } from "@/play/play-list";

export const metadata: Metadata = playListMetadata(1);

/** /play は遊びの一覧の1ページ目。 */
export default function PlayPage() {
  return <PlayListView page={1} />;
}
