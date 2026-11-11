/**
 * FAQ の問い（アコーディオンのラベル）を、見出しと同じく文節で区切る（DESIGN.md §4）。問いはデータ（道具・ゲーム・
 * 診断・辞典の meta.faq）から来るので、FAQ を置くサーバーの器がここで区切って FaqSection に渡す。区切りは
 * splitIntoPhrases（server-only）で作るので、クライアントからは読み込まない。
 */
import type { PhrasedFaqEntry } from "@/components/FaqSection";
import { splitIntoPhrases } from "@/lib/phrase-breaks";
import type { FaqEntry } from "@/lib/seo";

/** FAQ の問いを文節で区切る。答えはそのまま渡す。FAQ を持たないもの（undefined）は空の並びにする。 */
export function phraseFaq(faq: readonly FaqEntry[] = []): PhrasedFaqEntry[] {
  return faq.map(({ question, answer }) => ({
    question: splitIntoPhrases(question),
    answer,
  }));
}
