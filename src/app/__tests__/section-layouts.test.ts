import { describe, test, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

/**
 * Ensures every section directory under src/app/ that contains route pages
 * has a layout.tsx providing Header/Footer, either directly or via
 * a parent section layout.
 *
 * Sections that embed Header/Footer inline in their page.tsx (e.g. about)
 * are also accepted, but layout.tsx is the preferred pattern.
 */
describe("section layout coverage", () => {
  const appDir = path.resolve(__dirname, "..");

  // Get all immediate subdirectories of src/app/ that contain page.tsx
  // (i.e., they are route sections), excluding special directories
  const EXCLUDED = ["__tests__"];

  const sectionDirs = fs
    .readdirSync(appDir, { withFileTypes: true })
    .filter((d) => d.isDirectory() && !EXCLUDED.includes(d.name))
    .map((d) => d.name);

  for (const section of sectionDirs) {
    const sectionPath = path.join(appDir, section);
    const hasPageTsx = fs.existsSync(path.join(sectionPath, "page.tsx"));
    const hasSubPages =
      fs.existsSync(sectionPath) &&
      fs.readdirSync(sectionPath).some((sub) => {
        const subPath = path.join(sectionPath, sub);
        return (
          fs.statSync(subPath).isDirectory() &&
          fs.existsSync(path.join(subPath, "page.tsx"))
        );
      });

    if (!hasPageTsx && !hasSubPages) continue;

    test(`${section}/ has Header/Footer via layout.tsx or inline in page.tsx`, () => {
      const layoutPath = path.join(sectionPath, "layout.tsx");
      const pagePath = path.join(sectionPath, "page.tsx");
      const hasLayout = fs.existsSync(layoutPath);
      let hasInlineHeader = false;

      if (!hasLayout && fs.existsSync(pagePath)) {
        const pageContent = fs.readFileSync(pagePath, "utf-8");
        hasInlineHeader =
          pageContent.includes("Header") && pageContent.includes("Footer");
      }

      expect(
        hasLayout || hasInlineHeader,
        `Section "${section}" must have a layout.tsx with Header/Footer, ` +
          `or include Header/Footer inline in page.tsx. ` +
          `Create src/app/${section}/layout.tsx following the pattern in src/app/tools/layout.tsx.`,
      ).toBe(true);
    });

    if (fs.existsSync(path.join(sectionPath, "layout.tsx"))) {
      test(`${section}/layout.tsx imports Header and Footer`, () => {
        const content = fs.readFileSync(
          path.join(sectionPath, "layout.tsx"),
          "utf-8",
        );
        expect(content).toContain("Header");
        expect(content).toContain("Footer");
      });
    }
  }
});
