import type { RadicalGroup } from "./types";

/**
 * Super-groups define which radical groups are "related" (close)
 * for the feedback system. If two radical groups share a super-group,
 * the category feedback is "close" (yellow).
 */
export const categorySuperGroups: Record<string, RadicalGroup[]> = {
  // A: 人体系 — 人の体・心・動作に関わるグループ
  human: [1, 2, 3, 4, 5, 6],
  // B: 自然系 — 自然界の要素・生物に関わるグループ
  nature: [7, 8, 9, 10, 11, 12],
  // C: 文明系 — 人間が作り出した道具・制度に関わるグループ
  civilization: [13, 14, 15, 16, 17, 18, 19],
  // D: 抽象系 — 抽象的・記号的な部首のグループ
  abstract: [20],
};

/**
 * Display names for each radical group (Japanese).
 */
export const radicalGroupNames: Record<RadicalGroup, string> = {
  1: "人・家族",
  2: "体・器官",
  3: "手・力・動作",
  4: "心・感情",
  5: "口・言語",
  6: "足・移動",
  7: "水・液体",
  8: "火・光",
  9: "木・植物",
  10: "土・山・地形",
  11: "天・気象",
  12: "動物",
  13: "建物・場所",
  14: "布・衣服",
  15: "刀・武器",
  16: "金・素材",
  17: "食・飲",
  18: "乗り物・道具",
  19: "社会・制度",
  20: "抽象・記号",
};

/**
 * Check if two radical groups are in the same super-group.
 * Returns true if they share at least one super-group.
 */
export function areCategoriesRelated(
  a: RadicalGroup,
  b: RadicalGroup,
): boolean {
  if (a === b) return true;
  for (const group of Object.values(categorySuperGroups)) {
    if (group.includes(a) && group.includes(b)) {
      return true;
    }
  }
  return false;
}
