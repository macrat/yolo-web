/**
 * 索引の語（DESIGN.md §7）を、名前に括弧で数を添えたものの区切り（§4）で分ける。語はデータ（分類・タグ・カテゴリ・
 * 学年・同じ仲間の語）から組むので、索引を置くサーバーの部品が、組んだ語をここで区切って LinkIndex と IndexAccordion
 * に渡す。区切りは splitIntoPhrases（server-only）で作るので、クライアントからは読み込まない。語を組む一覧の定義は
 * クライアントの道具からも読み込まれるので、区切る前の語（IndexEntry）を返し、区切りはここに任せる。
 */
import type { LinkIndexGroup, LinkIndexItem } from "@/components/LinkIndex";
import { splitIntoPhrases } from "@/lib/phrase-breaks";

/** 区切る前の索引の語。 */
export interface IndexEntry {
  /** 語の字。 */
  label: string;
  href: string;
  /** 順を持たない分類で、その語に属する項目の数。語の後ろに添える。 */
  count?: number;
}

/** 区切る前の語を、並びの値ごとに区切りの見出しの下に並べたもの。 */
export interface IndexEntryGroup extends Omit<LinkIndexGroup, "items"> {
  items: IndexEntry[];
}

/** 語を、名前の中の語の切れ目で区切る。数は LinkIndex が始め括弧の前で区切って添える。 */
export function phraseIndexEntries(
  entries: readonly IndexEntry[],
): LinkIndexItem[] {
  return entries.map(({ label, ...entry }) => ({
    ...entry,
    name: splitIntoPhrases(label, { countedName: true }),
  }));
}

/** 区切りの見出しの下の語を、名前の中の語の切れ目で区切る。 */
export function phraseIndexGroups(
  groups: readonly IndexEntryGroup[],
): LinkIndexGroup[] {
  return groups.map((group) => ({
    ...group,
    items: phraseIndexEntries(group.items),
  }));
}
