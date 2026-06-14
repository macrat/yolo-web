/**
 * codegen ロジックの回帰テスト（in-memory テスト）
 *
 * buildToolsRegistryContent() を直接呼び出し、slugs 配列の増減が
 * 生成コンテンツに正しく反映されることを確認する。
 * これにより「dummy を追加すれば含まれる / 削除すれば消える」が
 * CI で自動検証される。
 */
import { describe, expect, test } from "vitest";

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
