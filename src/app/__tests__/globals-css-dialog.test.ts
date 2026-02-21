import { expect, test } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";

test("globals.css contains dialog { margin: auto } to prevent wildcard reset from breaking dialog centering", () => {
  const cssPath = resolve(__dirname, "../globals.css");
  const cssContent = readFileSync(cssPath, "utf-8");

  // Verify the dialog margin: auto rule exists to counteract * { margin: 0 }
  expect(cssContent).toMatch(/dialog\s*\{[^}]*margin:\s*auto/);
});
