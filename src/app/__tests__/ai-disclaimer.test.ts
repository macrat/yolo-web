import { describe, test, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

/**
 * The AI-run notice lives in the footer text, not in an AiDisclaimer component.
 * This test ensures no source file under src/ uses AiDisclaimer.
 */
describe("AiDisclaimer is not used anywhere", () => {
  // src/ directory: src/app/__tests__ から 2段上に上がる
  const srcDir = path.resolve(__dirname, "../..");

  function collectTsxFiles(dir: string): string[] {
    const results: string[] = [];
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === "node_modules" || entry.name === "__tests__") {
          continue;
        }
        results.push(...collectTsxFiles(fullPath));
      } else if (/\.(tsx?|jsx?)$/.test(entry.name)) {
        results.push(fullPath);
      }
    }
    return results;
  }

  const allFiles = collectTsxFiles(srcDir);

  test("no source file imports AiDisclaimer", () => {
    const offending: string[] = [];
    for (const filePath of allFiles) {
      const content = fs.readFileSync(filePath, "utf-8");
      if (/import\s+.*AiDisclaimer/.test(content)) {
        offending.push(path.relative(srcDir, filePath));
      }
    }
    expect(
      offending,
      `AiDisclaimer import found in: ${offending.join(", ")}. ` +
        "The footer disclaimer covers all pages. Do not add AiDisclaimer to individual pages.",
    ).toEqual([]);
  });

  test("AiDisclaimer component files do not exist", () => {
    const componentPaths = [
      path.join(srcDir, "components/common/AiDisclaimer.tsx"),
      path.join(srcDir, "components/common/AiDisclaimer.module.css"),
      path.join(srcDir, "tools/_components/AiDisclaimer.tsx"),
      path.join(srcDir, "tools/_components/AiDisclaimer.module.css"),
    ];
    for (const p of componentPaths) {
      expect(
        fs.existsSync(p),
        `${path.relative(srcDir, p)} should not exist`,
      ).toBe(false);
    }
  });
});
