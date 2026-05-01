import type { Metadata } from "next";
import DndSpikeContent from "./DndSpikeContent";

/**
 * dnd-kit スパイク検証ページ。
 * 本番には公開しないが bundle size 計測のため (new) ルートに配置。
 * ロボット noindex / nofollow で来訪者の目に触れないようにする。
 * スパイク完了後に削除予定。
 */
export const metadata: Metadata = {
  title: "DnD Spike（開発者向け検証）",
  robots: { index: false, follow: false },
};

export default function DndSpikePage() {
  return <DndSpikeContent />;
}
