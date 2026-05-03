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

// ---------------------------------------------------------------------------
// buildToolsRegistryContent のテスト
// ---------------------------------------------------------------------------

import { buildToolsRegistryContent } from "../generate-toolbox-registry";

describe("buildToolsRegistryContent", () => {
  const TOOL_SLUGS = ["json-formatter", "char-count", "base64"];

  test("AUTO-GENERATED ヘッダコメントが含まれる", () => {
    const content = buildToolsRegistryContent(TOOL_SLUGS);
    expect(content).toContain("AUTO-GENERATED FILE — DO NOT EDIT MANUALLY");
  });

  test("tool slug が meta import 文として出力される", () => {
    const content = buildToolsRegistryContent(TOOL_SLUGS);
    expect(content).toContain(
      'import { meta as json_formatter } from "@/tools/json-formatter/meta";',
    );
    expect(content).toContain(
      'import { meta as char_count } from "@/tools/char-count/meta";',
    );
    expect(content).toContain(
      'import { meta as base64 } from "@/tools/base64/meta";',
    );
  });

  test("ToolDefinition と ToolMeta の型 import が含まれる", () => {
    const content = buildToolsRegistryContent(TOOL_SLUGS);
    expect(content).toContain("ToolDefinition");
    expect(content).toContain("ToolMeta");
  });

  test("toolsBySlug が export される", () => {
    const content = buildToolsRegistryContent(TOOL_SLUGS);
    expect(content).toContain("export const toolsBySlug");
  });

  test("allToolMetas が export される", () => {
    const content = buildToolsRegistryContent(TOOL_SLUGS);
    expect(content).toContain("export const allToolMetas");
  });

  test("getAllToolSlugs 関数が export される", () => {
    const content = buildToolsRegistryContent(TOOL_SLUGS);
    expect(content).toContain("export function getAllToolSlugs");
  });

  test("新しい tool slug を追加すると生成コンテンツに追加される", () => {
    const withoutNew = buildToolsRegistryContent(TOOL_SLUGS);
    const withNew = buildToolsRegistryContent([
      ...TOOL_SLUGS,
      "new-dummy-tool",
    ]);

    expect(withoutNew).not.toContain("new-dummy-tool");
    expect(withNew).toContain(
      'import { meta as new_dummy_tool } from "@/tools/new-dummy-tool/meta";',
    );
  });

  test("ハイフンはアンダースコアに変換されて import 名になる", () => {
    const content = buildToolsRegistryContent(["my-complex-tool-name"]);
    // 変数名（import の左辺）はアンダースコア区切りになっていること
    expect(content).toContain("my_complex_tool_name");
    // 変数名にハイフンが含まれないこと（import path の kebab-case は除外して検査）
    // "import { meta as <varName> }" の varName 部分のみを検査する
    const importStatements = content
      .split("\n")
      .filter((line) => line.startsWith("import { meta as "));
    expect(importStatements.length).toBeGreaterThan(0);
    for (const line of importStatements) {
      // "import { meta as " と " }" の間の変数名を抽出
      const varNameMatch = line.match(/^import \{ meta as (\S+) \}/);
      expect(varNameMatch).not.toBeNull();
      if (varNameMatch) {
        expect(varNameMatch[1]).not.toContain("-");
      }
    }
  });

  test("空配列でも正常に出力される（export 定義は含まれる）", () => {
    const content = buildToolsRegistryContent([]);
    expect(content).toContain("export const toolsBySlug");
    expect(content).toContain("export const allToolMetas");
    expect(content).toContain("export function getAllToolSlugs");
  });
});

// ---------------------------------------------------------------------------
// buildCheatsheetRegistryContent のテスト
// ---------------------------------------------------------------------------

import { buildCheatsheetRegistryContent } from "../generate-toolbox-registry";

describe("buildCheatsheetRegistryContent", () => {
  const CHEATSHEET_SLUGS = ["git", "regex", "markdown"];

  test("AUTO-GENERATED ヘッダコメントが含まれる", () => {
    const content = buildCheatsheetRegistryContent(CHEATSHEET_SLUGS);
    expect(content).toContain("AUTO-GENERATED FILE — DO NOT EDIT MANUALLY");
  });

  test("cheatsheet slug が meta import 文として出力される", () => {
    const content = buildCheatsheetRegistryContent(CHEATSHEET_SLUGS);
    expect(content).toContain(
      'import { meta as git } from "@/cheatsheets/git/meta";',
    );
    expect(content).toContain(
      'import { meta as regex } from "@/cheatsheets/regex/meta";',
    );
    expect(content).toContain(
      'import { meta as markdown } from "@/cheatsheets/markdown/meta";',
    );
  });

  test("CheatsheetDefinition と CheatsheetMeta の型 import が含まれる", () => {
    const content = buildCheatsheetRegistryContent(CHEATSHEET_SLUGS);
    expect(content).toContain("CheatsheetDefinition");
    expect(content).toContain("CheatsheetMeta");
  });

  test("cheatsheetsBySlug が export される", () => {
    const content = buildCheatsheetRegistryContent(CHEATSHEET_SLUGS);
    expect(content).toContain("export const cheatsheetsBySlug");
  });

  test("allCheatsheetMetas が export される", () => {
    const content = buildCheatsheetRegistryContent(CHEATSHEET_SLUGS);
    expect(content).toContain("export const allCheatsheetMetas");
  });

  test("getAllCheatsheetSlugs 関数が export される", () => {
    const content = buildCheatsheetRegistryContent(CHEATSHEET_SLUGS);
    expect(content).toContain("export function getAllCheatsheetSlugs");
  });

  test("新しい cheatsheet slug を追加すると生成コンテンツに追加される", () => {
    const withoutNew = buildCheatsheetRegistryContent(CHEATSHEET_SLUGS);
    const withNew = buildCheatsheetRegistryContent([
      ...CHEATSHEET_SLUGS,
      "new-dummy-sheet",
    ]);

    expect(withoutNew).not.toContain("new-dummy-sheet");
    expect(withNew).toContain(
      'import { meta as new_dummy_sheet } from "@/cheatsheets/new-dummy-sheet/meta";',
    );
  });

  test("空配列でも正常に出力される（export 定義は含まれる）", () => {
    const content = buildCheatsheetRegistryContent([]);
    expect(content).toContain("export const cheatsheetsBySlug");
    expect(content).toContain("export const allCheatsheetMetas");
    expect(content).toContain("export function getAllCheatsheetSlugs");
  });
});
