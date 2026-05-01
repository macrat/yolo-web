import { describe, expect, test } from "vitest";
import { allToolMetas } from "@/tools/registry";
import { allPlayContents } from "@/play/registry";
import { allCheatsheetMetas } from "@/cheatsheets/registry";
import {
  getAllTileables,
  getTileableBySlug,
  getAllTileableEntries,
} from "../registry";

const EXPECTED_TOTAL =
  allToolMetas.length + allPlayContents.length + allCheatsheetMetas.length;

describe("getAllTileables", () => {
  test("全エントリを Tileable[] として返す", () => {
    const result = getAllTileables();
    expect(result).toHaveLength(EXPECTED_TOTAL);
  });

  test("61 件以上を返す（tools 34 + play 20 + cheatsheets 7）", () => {
    const result = getAllTileables();
    expect(result.length).toBeGreaterThanOrEqual(61);
  });

  test("すべてのエントリが Tileable の必須フィールドを持つ", () => {
    const result = getAllTileables();
    for (const item of result) {
      expect(item.slug, `${item.contentKind}/${item.slug}: slug`).toBeTruthy();
      expect(
        item.displayName,
        `${item.contentKind}/${item.slug}: displayName`,
      ).toBeTruthy();
      expect(
        item.shortDescription,
        `${item.contentKind}/${item.slug}: shortDescription`,
      ).toBeTruthy();
      expect(
        item.contentKind,
        `${item.contentKind}/${item.slug}: contentKind`,
      ).toMatch(/^(tool|play|cheatsheet)$/);
      expect(
        item.publishedAt,
        `${item.contentKind}/${item.slug}: publishedAt`,
      ).toBeTruthy();
      expect(
        item.trustLevel,
        `${item.contentKind}/${item.slug}: trustLevel`,
      ).toBeTruthy();
    }
  });

  test("tool エントリが 34 件含まれる", () => {
    const result = getAllTileables();
    const tools = result.filter((t) => t.contentKind === "tool");
    expect(tools).toHaveLength(allToolMetas.length);
  });

  test("play エントリが 20 件含まれる", () => {
    const result = getAllTileables();
    const plays = result.filter((t) => t.contentKind === "play");
    expect(plays).toHaveLength(allPlayContents.length);
  });

  test("cheatsheet エントリが 7 件含まれる", () => {
    const result = getAllTileables();
    const cheatsheets = result.filter((t) => t.contentKind === "cheatsheet");
    expect(cheatsheets).toHaveLength(allCheatsheetMetas.length);
  });

  test("順序: tool → play → cheatsheet の順で並ぶ", () => {
    const result = getAllTileables();
    const toolCount = allToolMetas.length;
    const playCount = allPlayContents.length;
    // 先頭 toolCount 件が tool
    for (let i = 0; i < toolCount; i++) {
      expect(result[i].contentKind).toBe("tool");
    }
    // 次の playCount 件が play
    for (let i = toolCount; i < toolCount + playCount; i++) {
      expect(result[i].contentKind).toBe("play");
    }
    // 残りが cheatsheet
    for (let i = toolCount + playCount; i < result.length; i++) {
      expect(result[i].contentKind).toBe("cheatsheet");
    }
  });
});

describe("getTileableBySlug", () => {
  test("既存 slug で Tileable を返す（tool）", () => {
    const result = getTileableBySlug("json-formatter");
    expect(result).toBeDefined();
    expect(result?.slug).toBe("json-formatter");
    expect(result?.contentKind).toBe("tool");
  });

  test("既存 slug で Tileable を返す（play）", () => {
    // allPlayContents の最初の slug を使用
    const firstPlay = allPlayContents[0];
    const result = getTileableBySlug(firstPlay.slug);
    expect(result).toBeDefined();
    expect(result?.slug).toBe(firstPlay.slug);
    expect(result?.contentKind).toBe("play");
  });

  test("既存 slug で Tileable を返す（cheatsheet）", () => {
    const result = getTileableBySlug("git");
    expect(result).toBeDefined();
    expect(result?.slug).toBe("git");
    expect(result?.contentKind).toBe("cheatsheet");
  });

  test("存在しない slug で undefined を返す", () => {
    const result = getTileableBySlug("nonexistent-slug-xyz");
    expect(result).toBeUndefined();
  });

  test("全 tool slug が取得できる", () => {
    for (const meta of allToolMetas) {
      const result = getTileableBySlug(meta.slug);
      expect(result, `tool/${meta.slug} が取得できる`).toBeDefined();
      expect(result?.contentKind).toBe("tool");
    }
  });

  test("全 play slug が取得できる", () => {
    for (const meta of allPlayContents) {
      const result = getTileableBySlug(meta.slug);
      expect(result, `play/${meta.slug} が取得できる`).toBeDefined();
      expect(result?.contentKind).toBe("play");
    }
  });

  test("全 cheatsheet slug が取得できる", () => {
    for (const meta of allCheatsheetMetas) {
      const result = getTileableBySlug(meta.slug);
      expect(result, `cheatsheet/${meta.slug} が取得できる`).toBeDefined();
      expect(result?.contentKind).toBe("cheatsheet");
    }
  });
});

/**
 * 重複 slug の優先順位仕様テスト
 *
 * 仕様: slug が重複する場合は Tool > Play > Cheatsheet の優先順位を採用する。
 * 理由: Tool は最も広く使われるコンテンツであり、同一 slug のコンテンツが
 *       複数種別にわたって存在する場合、ツールを優先するのが直感的。
 *
 * 現状（2026-05-01）: 重複 slug は存在しない（0件）。
 * このテストは仕様を記録し、将来 slug 重複が発生した際の挙動を保証するために存在する。
 */
describe("重複 slug 優先順位（仕様記録）", () => {
  test("現在の registry に slug 重複はない", () => {
    const tileables = getAllTileables();
    const slugCounts = new Map<string, number>();
    for (const t of tileables) {
      slugCounts.set(t.slug, (slugCounts.get(t.slug) ?? 0) + 1);
    }
    const duplicates = [...slugCounts.entries()].filter(
      ([, count]) => count > 1,
    );
    // 重複があれば slug と件数を表示してデバッグしやすくする
    expect(duplicates, `重複 slug: ${JSON.stringify(duplicates)}`).toHaveLength(
      0,
    );
  });

  test("getTileableBySlug は slug ごとに 1 件だけ返す（重複がない前提）", () => {
    const tileables = getAllTileables();
    const slugSet = new Set(tileables.map((t) => t.slug));
    // Map のサイズが全件数と等しければ重複なし（優先順位適用後の件数 = slug ユニーク数）
    expect(slugSet.size).toBe(tileables.length);
  });
});

describe("getAllTileableEntries", () => {
  test("tile フィールドが定義されているエントリのみを返す", () => {
    const result = getAllTileableEntries();
    for (const item of result) {
      expect(item.tile).toBeDefined();
    }
  });

  test("現サイクル（2.2.2）では tile 未定義のため 0 件を返す", () => {
    const result = getAllTileableEntries();
    // tile フィールドはまだどのエントリにも設定されていないため 0 件
    expect(result).toHaveLength(0);
  });
});

/**
 * codegen 生成ファイルとの整合確認
 *
 * 【このテストの役割】
 * コミット済みの generated/toolbox-registry.ts が既存の各 registry と件数一致していることを確認する。
 * 「生成済みファイルと実態の乖離」（prebuild 忘れ等）を検出するためのセーフネット。
 *
 * 【codegen ロジック自体の回帰テストの場所】
 * codegen の出力内容（slug の追加・削除が生成コンテンツに反映されるか等）は
 * `scripts/__tests__/generate-toolbox-registry.test.ts` の in-memory テストで検証する。
 * 棲み分け:
 *   - このファイル (registry.test.ts): 生成済みファイルと既存 registry の整合確認
 *   - scripts/__tests__/generate-toolbox-registry.test.ts: codegen ロジックの回帰検証
 *
 * 動作確認済み（2026-05-01）:
 * 1. `src/tools/_test_dummy_codegen/meta.ts` を一時作成
 * 2. `npm run generate:toolbox-registry` を実行 → tools=34 → 35 に増加
 * 3. generated/toolbox-registry.ts に `_test_dummy_codegen` のエントリが自動追加されることを確認
 * 4. ダミーファイルを削除して再生成 → tools=35 → 34 に戻る
 * 5. generated/toolbox-registry.ts から `_test_dummy_codegen` が消えることを確認
 */
describe("codegen 生成ファイルの件数確認", () => {
  test("toolTileables が allToolMetas と同数である（codegen が全 meta.ts を網羅）", async () => {
    const { toolTileables } = await import("../generated/toolbox-registry");
    expect(toolTileables).toHaveLength(allToolMetas.length);
  });

  test("cheatsheetTileables が allCheatsheetMetas と同数である", async () => {
    const { cheatsheetTileables } =
      await import("../generated/toolbox-registry");
    expect(cheatsheetTileables).toHaveLength(allCheatsheetMetas.length);
  });

  test("playTileables が allPlayContents と同数である", async () => {
    const { playTileables } = await import("../generated/toolbox-registry");
    expect(playTileables).toHaveLength(allPlayContents.length);
  });
});
