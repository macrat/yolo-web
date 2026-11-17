import { describe, expect, test } from "vitest";
import { BLOG_SORTS } from "@/blog/_lib/blog-list";
import {
  colorListCategories,
  colorListSorts,
} from "@/dictionary/_lib/color-list";
import { kanjiListSorts } from "@/dictionary/_lib/kanji-list";
import { YOJI_LIST_SORTS } from "@/dictionary/_lib/yoji-list";
import { HUMOR_LIST_SORTS } from "@/humor-dict/_lib/humor-list";
import {
  controlsLabel,
  type BrowseChoice,
  type BrowseSort,
  type BrowseSpec,
} from "@/lib/list-browse";
import { followsPhraseRules, splitIntoPhrases } from "@/lib/phrase-breaks";
import { phrasedNameText, type PhrasedName } from "@/lib/phrased-name";
import { PLAY_KINDS, PLAY_SORTS } from "@/play/play-list";
import { TOOL_KINDS, TOOL_SORTS } from "@/tools/_lib/tool-list";
import { KEIGO_LIST_SPEC } from "@/tools/keigo-reference/logic";
import { PALETTE_SPEC } from "@/tools/traditional-color-palette/palette-list";
import { YOJI_SEARCH_SPEC } from "@/tools/yoji-search/logic";

function sortsOnly(sorts: BrowseSort[]): BrowseSpec {
  return { kinds: [], filterGroups: [], sorts };
}

/** 一覧のページの、種別の組と並び順の定義のすべて。 */
const LIST_PAGE_SPECS: Record<string, BrowseSpec> = {
  tools: { kinds: TOOL_KINDS, filterGroups: [], sorts: TOOL_SORTS },
  play: { kinds: PLAY_KINDS, filterGroups: [], sorts: PLAY_SORTS },
  blog: sortsOnly(BLOG_SORTS),
  humor: sortsOnly(HUMOR_LIST_SORTS),
  yoji: sortsOnly(YOJI_LIST_SORTS),
  "kanji(all)": sortsOnly(kanjiListSorts({ type: "all" })),
  "kanji(grade)": sortsOnly(kanjiListSorts({ type: "grade", grade: 1 })),
  "kanji(radical)": sortsOnly(
    kanjiListSorts({ type: "radical", radical: "人" }),
  ),
  "kanji(stroke)": sortsOnly(
    kanjiListSorts({ type: "stroke", strokeCount: 5 }),
  ),
  "colors(all)": sortsOnly(colorListSorts({ type: "all" })),
  ...Object.fromEntries(
    colorListCategories().map((category) => [
      `colors(${category})`,
      sortsOnly(colorListSorts({ type: "category", category })),
    ]),
  ),
};

/** 開閉のボタンのラベルを組むすべての一覧（一覧のページと、一覧を持つ道具）。 */
const ALL_SPECS: Record<string, BrowseSpec> = {
  ...LIST_PAGE_SPECS,
  keigo: KEIGO_LIST_SPEC,
  palette: PALETTE_SPEC,
  "yoji-search": YOJI_SEARCH_SPEC,
};

describe("一覧のページの組の選択肢と並び順の名前", () => {
  test.each(Object.entries(LIST_PAGE_SPECS))(
    "%s: 2文節以上の名前は区切りの並びで書き、並びは禁則を満たす",
    (_, spec) => {
      for (const { name } of [...spec.kinds, ...spec.sorts]) {
        if (typeof name === "string") {
          expect(splitIntoPhrases(name), name).toHaveLength(1);
        } else {
          expect(followsPhraseRules(name), phrasedNameText(name)).toBe(true);
        }
      }
    },
  );
});

/** 組ごとに「すべて」かどれか1つを選んだ、すべての組み合わせの、絞っている選択の名前。 */
function selections(
  groups: readonly (readonly BrowseChoice[])[],
): PhrasedName[][] {
  return groups.reduce<PhrasedName[][]>(
    (combos, options) =>
      combos.flatMap((combo) => [
        combo,
        ...options.map((option) => [...combo, option.name]),
      ]),
    [[]],
  );
}

describe("開閉のボタンのラベル", () => {
  test.each(Object.entries(ALL_SPECS))(
    "%s: どの選択の組でも、名前と丸括弧の一続きのあいだと、一続きの中の区切りが禁則を満たす",
    (_, spec) => {
      const groups = [
        ...(spec.kinds.length >= 2 ? [spec.kinds] : []),
        ...spec.filterGroups.map((group) => group.options),
      ];
      const sortNames: (PhrasedName | undefined)[] =
        spec.sorts.length >= 2
          ? spec.sorts.map((sort) => sort.name)
          : [undefined];
      for (const selectedFilters of selections(groups)) {
        for (const sortName of sortNames) {
          if (groups.length === 0 && sortName === undefined) continue;
          const { name, selection } = controlsLabel({
            hasFilterGroups: groups.length > 0,
            selectedFilters,
            sortName,
          });
          const whole = selection.join("");
          const text = `${name.join("")}${whole}`;
          expect(whole.startsWith("（") && whole.endsWith("）"), text).toBe(
            true,
          );
          // 丸括弧の一続きを1つの文節とした、ラベルの全体の区切り。
          expect(followsPhraseRules([...name, whole]), text).toBe(true);
          // 一続きが1行に収まらないときに使う、括弧の中の区切り。
          const inner = [...selection];
          inner[0] = inner[0].slice(1);
          inner[inner.length - 1] = inner[inner.length - 1].slice(0, -1);
          expect(followsPhraseRules(inner), text).toBe(true);
        }
      }
    },
  );
});
