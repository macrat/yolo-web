import { describe, test, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

/**
 * Header/Footer are provided by the root layout (src/app/layout.tsx).
 * This test verifies that section layouts do NOT duplicate Header/Footer,
 * and that the root layout properly includes them.
 */
describe("root layout provides Header/Footer", () => {
  const appDir = path.resolve(__dirname, "..");

  test("root layout.tsx imports Header and Footer", () => {
    const content = fs.readFileSync(path.join(appDir, "layout.tsx"), "utf-8");
    expect(content).toContain(
      'import Header from "@/components/common/Header"',
    );
    expect(content).toContain(
      'import Footer from "@/components/common/Footer"',
    );
    expect(content).toContain("<Header");
    expect(content).toContain("<Footer");
  });

  // Get all immediate subdirectories of src/app/ that contain layout.tsx
  const EXCLUDED = ["__tests__"];

  const sectionDirs = fs
    .readdirSync(appDir, { withFileTypes: true })
    .filter((d) => d.isDirectory() && !EXCLUDED.includes(d.name))
    .map((d) => d.name);

  for (const section of sectionDirs) {
    const layoutPath = path.join(appDir, section, "layout.tsx");
    if (!fs.existsSync(layoutPath)) continue;

    test(`${section}/layout.tsx does not import Header or Footer`, () => {
      const content = fs.readFileSync(layoutPath, "utf-8");
      expect(content).not.toContain(
        'import Header from "@/components/common/Header"',
      );
      expect(content).not.toContain(
        'import Footer from "@/components/common/Footer"',
      );
    });
  }
});

/**
 * AiDisclaimer was removed in favor of the footer disclaimer text.
 * This test ensures AiDisclaimer is not re-introduced in any source file.
 */
describe("AiDisclaimer is not used anywhere", () => {
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
      path.join(srcDir, "components/tools/AiDisclaimer.tsx"),
      path.join(srcDir, "components/tools/AiDisclaimer.module.css"),
    ];
    for (const p of componentPaths) {
      expect(
        fs.existsSync(p),
        `${path.relative(srcDir, p)} should not exist`,
      ).toBe(false);
    }
  });
});
