import { describe, test, expect } from "vitest";
import { BASE_URL, SITE_NAME } from "@/lib/constants";

describe("constants", () => {
  test("BASE_URL falls back to yolos.net", () => {
    expect(BASE_URL).toMatch(/yolos\.net|localhost/);
  });

  test("SITE_NAME is defined", () => {
    expect(SITE_NAME).toBe("yolos.net");
  });
});
