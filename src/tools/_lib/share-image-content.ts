import type { ShareImageContent } from "@/lib/share-image";
import type { ToolMeta } from "@/tools/types";

/**
 * 道具のページの画像に書く中身。名前は道具のページの h1 と同じ名前で、副題に h1 の下の短い説明を添える。画像の
 * ルートは、同じ中身から画像と代替テキストを作る。
 */
export function toolShareImageContent(
  meta: Pick<ToolMeta, "name" | "shortDescription">,
): ShareImageContent {
  return {
    aux: "ツール",
    name: meta.name,
    subtitle: meta.shortDescription,
  };
}
