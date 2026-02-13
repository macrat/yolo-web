import { describe, test, expect } from "vitest";
import { BASE_URL, SITE_NAME } from "@/lib/constants";

describe("constants", () => {
  test("BASE_URL falls back to yolo.macr.app", () => {
    expect(BASE_URL).toMatch(/yolo\.macr\.app|localhost/);
  });

  test("SITE_NAME is defined", () => {
    expect(SITE_NAME).toBe("Yolo-Web");
  });
});
