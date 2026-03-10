import type { RadicalGroup } from "./types";

/**
 * Super-groups define which radical groups are "related" (close)
 * for the feedback system. If two radical groups share a super-group,
 * the category feedback is "close" (yellow).
 */
export const categorySuperGroups: Record<string, RadicalGroup[]> = {
  basicHuman: [1, 2, 3],
  mouthAstro: [4, 5],
  terrainAction: [6, 7],
  cultureNature: [8, 9],
  lifeCreature: [10, 11],
  senseMaterial: [12, 13],
  bodyMovement: [14, 15],
  langEconomy: [16, 17],
  metalWeather: [18, 19],
  bioOther: [20],
};

/**
 * Display names for each radical group (Japanese).
 */
export const radicalGroupNames: Record<RadicalGroup, string> = {
  1: "基本図形",
  2: "人と体上部",
  3: "刃物と力",
  4: "口と囲い",
  5: "天文と時間",
  6: "山と川",
  7: "動作基本",
  8: "打撃と文",
  9: "木と欠",
  10: "爪と父",
  11: "瓜と生",
  12: "目と矢",
  13: "米と糸",
  14: "筆と肉",
  15: "草と虫",
  16: "見と言",
  17: "足と身",
  18: "金と門",
  19: "面と革",
  20: "魚と鳥",
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
