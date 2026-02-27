import { expect, test, describe } from "vitest";
import { generateCheatsheetMetadata, generateCheatsheetJsonLd } from "../seo";
import type { CheatsheetMeta } from "@/cheatsheets/types";

const mockMeta: CheatsheetMeta = {
  slug: "regex",
  name: "正規表現チートシート",
  nameEn: "Regex Cheatsheet",
  description: "正規表現の基本構文と実例集。",
  shortDescription: "正規表現の基本構文と実例集",
  keywords: ["正規表現", "regex"],
  category: "developer",
  relatedToolSlugs: ["regex-tester"],
  relatedCheatsheetSlugs: ["git"],
  sections: [{ id: "basics", title: "基本" }],
  publishedAt: "2026-02-19",
  trustLevel: "curated",
};

describe("generateCheatsheetMetadata", () => {
  test("returns correct title format", () => {
    const result = generateCheatsheetMetadata(mockMeta);
    expect(result.title).toBe(
      "正規表現チートシート - チートシート | yolos.net",
    );
  });

  test("returns correct description", () => {
    const result = generateCheatsheetMetadata(mockMeta);
    expect(result.description).toBe("正規表現の基本構文と実例集。");
  });

  test("includes OGP data", () => {
    const result = generateCheatsheetMetadata(mockMeta);
    expect(result.openGraph).toBeDefined();
    expect(result.openGraph?.title).toBe("正規表現チートシート - チートシート");
    expect(
      (result.openGraph as Record<string, unknown> | undefined)?.type,
    ).toBe("article");
  });

  test("includes canonical URL", () => {
    const result = generateCheatsheetMetadata(mockMeta);
    expect(result.alternates?.canonical).toContain("/cheatsheets/regex");
  });
});

describe("generateCheatsheetJsonLd", () => {
  test("returns Article type", () => {
    const result = generateCheatsheetJsonLd(mockMeta) as Record<
      string,
      unknown
    >;
    expect(result["@type"]).toBe("Article");
    expect(result["@context"]).toBe("https://schema.org");
  });

  test("includes datePublished", () => {
    const result = generateCheatsheetJsonLd(mockMeta) as Record<
      string,
      unknown
    >;
    expect(result.datePublished).toBe("2026-02-19");
  });

  test("includes inLanguage", () => {
    const result = generateCheatsheetJsonLd(mockMeta) as Record<
      string,
      unknown
    >;
    expect(result.inLanguage).toBe("ja");
  });

  test("includes articleSection", () => {
    const result = generateCheatsheetJsonLd(mockMeta) as Record<
      string,
      unknown
    >;
    expect(result.articleSection).toBe("チートシート");
  });

  test("includes correct URL", () => {
    const result = generateCheatsheetJsonLd(mockMeta) as Record<
      string,
      unknown
    >;
    expect(result.url).toContain("/cheatsheets/regex");
  });

  test("includes correct author", () => {
    const result = generateCheatsheetJsonLd(mockMeta) as Record<
      string,
      unknown
    >;
    expect(result.author).toMatchObject({
      "@type": "Organization",
      name: "yolos.net (AI Experiment)",
    });
  });
});
