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
  publishedAt: "2026-02-19T09:27:40+09:00",
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

  test("og:urlが存在しcanonicalと一致する", () => {
    const result = generateCheatsheetMetadata(mockMeta);
    const og = result.openGraph as Record<string, unknown> | undefined;
    expect(og?.url).toBeDefined();
    expect(og?.url).toBe(result.alternates?.canonical);
  });

  test("og:siteNameがyolos.netである", () => {
    const result = generateCheatsheetMetadata(mockMeta);
    const og = result.openGraph as Record<string, unknown> | undefined;
    expect(og?.siteName).toBe("yolos.net");
  });

  test("OGP publishedTimeが含まれる", () => {
    const result = generateCheatsheetMetadata(mockMeta);
    const og = result.openGraph as Record<string, unknown> | undefined;
    expect(og?.publishedTime).toBe("2026-02-19T09:27:40+09:00");
  });

  test("OGP modifiedTimeが含まれる（updatedAtがない場合はpublishedAt）", () => {
    const result = generateCheatsheetMetadata(mockMeta);
    const og = result.openGraph as Record<string, unknown> | undefined;
    expect(og?.modifiedTime).toBe("2026-02-19T09:27:40+09:00");
  });

  test("OGP modifiedTimeがupdatedAtを使う（updatedAtがある場合）", () => {
    const metaWithUpdated: CheatsheetMeta = {
      ...mockMeta,
      updatedAt: "2026-02-28T08:10:50+09:00",
    };
    const result = generateCheatsheetMetadata(metaWithUpdated);
    const og = result.openGraph as Record<string, unknown> | undefined;
    expect(og?.modifiedTime).toBe("2026-02-28T08:10:50+09:00");
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
    expect(result.datePublished).toBe("2026-02-19T09:27:40+09:00");
  });

  test("includes dateModified (fallback to publishedAt when no updatedAt)", () => {
    const result = generateCheatsheetJsonLd(mockMeta) as Record<
      string,
      unknown
    >;
    expect(result.dateModified).toBe("2026-02-19T09:27:40+09:00");
  });

  test("includes dateModified with updatedAt when provided", () => {
    const metaWithUpdated: CheatsheetMeta = {
      ...mockMeta,
      updatedAt: "2026-02-28T08:10:50+09:00",
    };
    const result = generateCheatsheetJsonLd(metaWithUpdated) as Record<
      string,
      unknown
    >;
    expect(result.dateModified).toBe("2026-02-28T08:10:50+09:00");
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
