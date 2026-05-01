/**
 * codegen ロジックの回帰テスト（案 a: in-memory テスト）
 *
 * buildRegistryContent() を直接呼び出し、slugs 配列の増減が
 * 生成コンテンツに正しく反映されることを確認する。
 * これにより「dummy を追加すれば含まれる / 削除すれば消える」が
 * CI で自動検証される。
 */
import { describe, expect, test } from "vitest";
import { buildRegistryContent } from "../generate-toolbox-registry";

describe("buildRegistryContent", () => {
  const BASE_TOOLS = ["json-formatter", "char-count"];
  const BASE_CHEATSHEETS = ["git"];
  const PLAY_COUNT = 5;

  test("tool slug が import 文として出力される", () => {
    const content = buildRegistryContent(
      BASE_TOOLS,
      BASE_CHEATSHEETS,
      PLAY_COUNT,
    );
    expect(content).toContain(
      'import { meta as tool_json_formatter } from "@/tools/json-formatter/meta";',
    );
    expect(content).toContain(
      'import { meta as tool_char_count } from "@/tools/char-count/meta";',
    );
  });

  test("cheatsheet slug が import 文として出力される", () => {
    const content = buildRegistryContent(
      BASE_TOOLS,
      BASE_CHEATSHEETS,
      PLAY_COUNT,
    );
    expect(content).toContain(
      'import { meta as cheatsheet_git } from "@/cheatsheets/git/meta";',
    );
  });

  test("toolTileables 配列に tool slug が含まれる", () => {
    const content = buildRegistryContent(
      BASE_TOOLS,
      BASE_CHEATSHEETS,
      PLAY_COUNT,
    );
    expect(content).toContain('toTileable(tool_json_formatter, "tool")');
    expect(content).toContain('toTileable(tool_char_count, "tool")');
  });

  test("cheatsheetTileables 配列に cheatsheet slug が含まれる", () => {
    const content = buildRegistryContent(
      BASE_TOOLS,
      BASE_CHEATSHEETS,
      PLAY_COUNT,
    );
    expect(content).toContain('toTileable(cheatsheet_git, "cheatsheet")');
  });

  test("新しい tool slug を追加すると生成コンテンツに追加される", () => {
    const withoutNew = buildRegistryContent(
      BASE_TOOLS,
      BASE_CHEATSHEETS,
      PLAY_COUNT,
    );
    const withNew = buildRegistryContent(
      [...BASE_TOOLS, "new-dummy-tool"],
      BASE_CHEATSHEETS,
      PLAY_COUNT,
    );

    expect(withoutNew).not.toContain("new-dummy-tool");
    expect(withNew).toContain(
      'import { meta as tool_new_dummy_tool } from "@/tools/new-dummy-tool/meta";',
    );
    expect(withNew).toContain('toTileable(tool_new_dummy_tool, "tool")');
  });

  test("tool slug を削除すると生成コンテンツから消える", () => {
    const before = buildRegistryContent(
      [...BASE_TOOLS, "to-be-removed"],
      BASE_CHEATSHEETS,
      PLAY_COUNT,
    );
    const after = buildRegistryContent(
      BASE_TOOLS,
      BASE_CHEATSHEETS,
      PLAY_COUNT,
    );

    expect(before).toContain("to-be-removed");
    expect(after).not.toContain("to-be-removed");
  });

  test("ハイフンはアンダースコアに変換されて import 名になる", () => {
    const content = buildRegistryContent(
      ["my-complex-tool-name"],
      [],
      PLAY_COUNT,
    );
    expect(content).toContain("tool_my_complex_tool_name");
    expect(content).not.toContain("tool_my-complex-tool-name");
  });

  test("生成時点のカウントコメントが含まれる", () => {
    const content = buildRegistryContent(
      BASE_TOOLS,
      BASE_CHEATSHEETS,
      PLAY_COUNT,
    );
    expect(content).toContain(
      `tools=${BASE_TOOLS.length}, play=${PLAY_COUNT} (from src/play/registry.ts), cheatsheets=${BASE_CHEATSHEETS.length}`,
    );
  });

  test("AUTO-GENERATED ヘッダコメントが含まれる", () => {
    const content = buildRegistryContent(
      BASE_TOOLS,
      BASE_CHEATSHEETS,
      PLAY_COUNT,
    );
    expect(content).toContain("AUTO-GENERATED FILE — DO NOT EDIT MANUALLY");
  });

  test("空の tool/cheatsheet 配列でも正常に出力される", () => {
    const content = buildRegistryContent([], [], 0);
    expect(content).toContain("export const toolTileables: Tileable[] = [");
    expect(content).toContain(
      "export const cheatsheetTileables: Tileable[] = [",
    );
  });
});
