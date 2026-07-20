import fs from "node:fs";
import path from "node:path";
import { describe, expect, test } from "vitest";

describe("public static assets", () => {
  test("ads.txt is provided as a static public file", () => {
    const adsPath = path.join(process.cwd(), "public", "ads.txt");
    expect(fs.existsSync(adsPath)).toBe(true);

    const content = fs.readFileSync(adsPath, "utf-8").trim();
    expect(content).toBe(
      "google.com, pub-3422033280057965, DIRECT, f08c47fec0942fa0",
    );
  });
});
