/**
 * toolbox-presets のユニットテスト
 *
 * 検証観点:
 * - プリセット定義の整合: id の形式と一意性、名称・説明文の体裁、
 *   収録規模（6〜8枚＝「ひと目で見渡せる出発点」の設計方針）
 * - カタログとの整合: 全 itemIds が TOOLBOX_CATALOG に実在する id のみで
 *   構成される・プリセット内に id 重複なし
 * - 設計の不変条件: 同一ツール（slug）の full と固定 variant が
 *   同じプリセットに同居しない（「似たタイルが並んで迷わせる」の構造的防止）
 * - デフォルト構成（cycle-232 T-2 決定）: DEFAULT_TOOLBOX_ITEM_IDS が
 *   daily-life プリセットの定義参照である（重複保持しない）こと
 * - 選択ロジックの純関数: sameItemIds / findAppliedPreset / isHandCraftedConfig
 *   （UI 側の上書き確認の要否はこの判定に委譲されるため、ここで網羅する）
 */
import { describe, expect, it } from "vitest";

import { TOOLBOX_CATALOG_BY_ID, TOOLBOX_CATALOG_IDS } from "../toolbox-catalog";
import {
  DEFAULT_TOOLBOX_ITEM_IDS,
  DEFAULT_TOOLBOX_PRESET,
  findAppliedPreset,
  isHandCraftedConfig,
  sameItemIds,
  TOOLBOX_PRESETS,
} from "../toolbox-presets";

describe("toolbox-presets: プリセット定義の整合", () => {
  it("ペルソナ5プリセットが定義順（選択 UI の表示順）で存在する", () => {
    expect(TOOLBOX_PRESETS.map((preset) => preset.id)).toEqual([
      "writing",
      "development",
      "office",
      "daily-life",
      "design",
    ]);
  });

  it("id は slug 形式（小文字英字とハイフン）で一意", () => {
    const ids = TOOLBOX_PRESETS.map((preset) => preset.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) {
      expect(id).toMatch(/^[a-z]+(-[a-z]+)*$/);
    }
  });

  it("name / description は空でなく、name はプリセット間で一意", () => {
    const names = TOOLBOX_PRESETS.map((preset) => preset.name);
    expect(new Set(names).size).toBe(names.length);
    for (const preset of TOOLBOX_PRESETS) {
      expect(preset.name.length).toBeGreaterThan(0);
      expect(preset.description.length).toBeGreaterThan(0);
    }
  });

  it("収録は6〜8枚（ひと目で見渡せる出発点の規模方針）", () => {
    for (const preset of TOOLBOX_PRESETS) {
      expect(preset.itemIds.length, preset.id).toBeGreaterThanOrEqual(6);
      expect(preset.itemIds.length, preset.id).toBeLessThanOrEqual(8);
    }
  });
});

describe("toolbox-presets: カタログとの整合", () => {
  it("全プリセットの itemIds はカタログに実在する id のみで構成される", () => {
    for (const preset of TOOLBOX_PRESETS) {
      for (const id of preset.itemIds) {
        expect(
          TOOLBOX_CATALOG_IDS.has(id),
          `${preset.id} の ${id} はカタログに実在する`,
        ).toBe(true);
      }
    }
  });

  it("プリセット内に id の重複がない", () => {
    for (const preset of TOOLBOX_PRESETS) {
      expect(new Set(preset.itemIds).size, preset.id).toBe(
        preset.itemIds.length,
      );
    }
  });

  it("同一ツール（slug）の full と固定 variant が同じプリセットに同居しない", () => {
    for (const preset of TOOLBOX_PRESETS) {
      const slugs = preset.itemIds.map(
        (id) => TOOLBOX_CATALOG_BY_ID.get(id)?.slug,
      );
      expect(new Set(slugs).size, preset.id).toBe(slugs.length);
    }
  });
});

describe("toolbox-presets: デフォルト構成（cycle-232 T-2 決定 = daily-life）", () => {
  it("DEFAULT_TOOLBOX_PRESET は daily-life で、選択 UI のプリセット一覧にも並ぶ", () => {
    expect(DEFAULT_TOOLBOX_PRESET.id).toBe("daily-life");
    expect(TOOLBOX_PRESETS).toContain(DEFAULT_TOOLBOX_PRESET);
  });

  it("DEFAULT_TOOLBOX_ITEM_IDS はプリセット定義への同一参照（構成を重複保持しない）", () => {
    expect(DEFAULT_TOOLBOX_ITEM_IDS).toBe(DEFAULT_TOOLBOX_PRESET.itemIds);
  });

  it("デフォルト構成の全 id はカタログに実在し、重複がない", () => {
    for (const id of DEFAULT_TOOLBOX_ITEM_IDS) {
      expect(TOOLBOX_CATALOG_IDS.has(id), id).toBe(true);
    }
    expect(new Set(DEFAULT_TOOLBOX_ITEM_IDS).size).toBe(
      DEFAULT_TOOLBOX_ITEM_IDS.length,
    );
  });

  it("daily-life 以外のプリセットはデフォルト構成と一致しない", () => {
    for (const preset of TOOLBOX_PRESETS) {
      if (preset.id === DEFAULT_TOOLBOX_PRESET.id) continue;
      expect(
        sameItemIds(preset.itemIds, DEFAULT_TOOLBOX_ITEM_IDS),
        preset.id,
      ).toBe(false);
    }
  });
});

describe("toolbox-presets: sameItemIds", () => {
  it("同じ id・同じ並びのときだけ true を返す", () => {
    expect(sameItemIds(["a:full", "b:full"], ["a:full", "b:full"])).toBe(true);
    expect(sameItemIds([], [])).toBe(true);
    // 並びが違う・部分集合・空との比較はすべて別構成
    expect(sameItemIds(["a:full", "b:full"], ["b:full", "a:full"])).toBe(false);
    expect(sameItemIds(["a:full", "b:full"], ["a:full"])).toBe(false);
    expect(sameItemIds(["a:full"], [])).toBe(false);
  });
});

describe("toolbox-presets: findAppliedPreset（「適用中」判定）", () => {
  it("プリセットと完全一致する構成ではそのプリセットを返す", () => {
    for (const preset of TOOLBOX_PRESETS) {
      expect(findAppliedPreset([...preset.itemIds])).toBe(preset);
    }
  });

  it("デフォルト構成では daily-life を返す（デフォルト = daily-life プリセット）", () => {
    expect(findAppliedPreset(DEFAULT_TOOLBOX_ITEM_IDS)).toBe(
      DEFAULT_TOOLBOX_PRESET,
    );
  });

  it("空・並び替え・一部削除の構成では undefined を返す", () => {
    expect(findAppliedPreset([])).toBeUndefined();

    const writing = TOOLBOX_PRESETS[0];
    expect(findAppliedPreset([...writing.itemIds].reverse())).toBeUndefined();
    expect(findAppliedPreset(writing.itemIds.slice(1))).toBeUndefined();
  });
});

describe("toolbox-presets: isHandCraftedConfig（上書き確認の要否）", () => {
  it("デフォルト構成（リセットで復元可能）は手作業構成ではない", () => {
    expect(
      isHandCraftedConfig(DEFAULT_TOOLBOX_ITEM_IDS, DEFAULT_TOOLBOX_ITEM_IDS),
    ).toBe(false);
  });

  it("適用済みプリセットそのもの（再選択で復元可能）は手作業構成ではない", () => {
    for (const preset of TOOLBOX_PRESETS) {
      expect(
        isHandCraftedConfig([...preset.itemIds], DEFAULT_TOOLBOX_ITEM_IDS),
        preset.id,
      ).toBe(false);
    }
  });

  it("プリセットから1枚外した構成は手作業構成（確認が必要）", () => {
    const writing = TOOLBOX_PRESETS[0];
    expect(
      isHandCraftedConfig(writing.itemIds.slice(1), DEFAULT_TOOLBOX_ITEM_IDS),
    ).toBe(true);
  });

  it("全タイルを外した空構成も手作業構成（意図して空にした状態を守る）", () => {
    expect(isHandCraftedConfig([], DEFAULT_TOOLBOX_ITEM_IDS)).toBe(true);
  });

  it("デフォルトから1枚外した構成は手作業構成（確認が必要）", () => {
    expect(
      isHandCraftedConfig(
        DEFAULT_TOOLBOX_ITEM_IDS.slice(1),
        DEFAULT_TOOLBOX_ITEM_IDS,
      ),
    ).toBe(true);
  });
});
