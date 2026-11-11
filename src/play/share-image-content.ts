import type { ShareImageContent } from "@/lib/share-image";
import { resolveDisplayCategory } from "./seo";
import type { PlayContentMeta } from "./types";

/**
 * 遊びのページ（診断・クイズ・占い・パズル）の画像に書く中身。補助情報はページの種類（「診断」「クイズ」
 * 「運勢」「パズル」）、名前はページの h1 と同じ題で、副題に短い説明を添える。画像のルートと、ページの
 * メタデータが、同じ中身から画像と代替テキストと URL を作る。
 */
export function playShareImageContent(
  meta: PlayContentMeta,
): ShareImageContent {
  return {
    aux: resolveDisplayCategory(meta),
    name: meta.title,
    subtitle: meta.shortDescription,
  };
}
