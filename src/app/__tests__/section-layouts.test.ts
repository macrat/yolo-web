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
