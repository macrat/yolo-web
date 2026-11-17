import type { ShareImageContent } from "@/lib/share-image";
import type { HumorDictionaryEntry } from "@/humor-dict/types";

/**
 * ユーモア辞典の語の画像に書く中身。名前は語のページの h1 と同じ見出し語で、読みを添え、副題にユーモアの
 * 定義を置く。画像の Route Handler と、語のページのメタデータが、同じ中身から画像と代替テキストと URL を作る。
 */
export function humorShareImageContent(
  entry: Pick<HumorDictionaryEntry, "word" | "reading" | "definition">,
): ShareImageContent {
  return {
    aux: "ユーモア辞典",
    name: entry.word,
    reading: entry.reading,
    subtitle: entry.definition,
  };
}
