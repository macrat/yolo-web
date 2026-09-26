import { expect, test, describe } from "vitest";
import {
  generateHumorDictEntryMetadata,
  generateHumorDictJsonLd,
} from "../seo";

const mockEntry = {
  slug: "monday",
  word: "月曜日",
  reading: "げつようび",
  definition:
    "週7日の中で、存在するだけで周囲の気温を2度下げると言われている唯一の曜日。",
};

describe("generateHumorDictEntryMetadata (エントリページ)", () => {
  test("タイトルに見出し語が含まれる", () => {
    const result = generateHumorDictEntryMetadata(mockEntry);
    expect(result.title).toContain("月曜日");
  });

  test("タイトルに「ユーモア辞典」と「yolos.net」が含まれる", () => {
    const result = generateHumorDictEntryMetadata(mockEntry);
    expect(result.title).toContain("ユーモア辞典");
    expect(result.title).toContain("yolos.net");
  });

  test("canonicalに/dictionary/humor/monday が含まれる", () => {
    const result = generateHumorDictEntryMetadata(mockEntry);
    expect(String(result.alternates?.canonical)).toContain(
      "/dictionary/humor/monday",
    );
  });

  test("og:urlがcanonicalと一致する", () => {
    const result = generateHumorDictEntryMetadata(mockEntry);
    const og = result.openGraph as Record<string, unknown> | undefined;
    expect(og?.url).toBe(result.alternates?.canonical);
  });

  test("og:siteNameがyolos.netである", () => {
    const result = generateHumorDictEntryMetadata(mockEntry);
    const og = result.openGraph as Record<string, unknown> | undefined;
    expect(og?.siteName).toBe("yolos.net");
  });
});

describe("generateHumorDictJsonLd (エントリページ)", () => {
  test("@typeがDefinedTermである", () => {
    const result = generateHumorDictJsonLd(mockEntry) as Record<
      string,
      unknown
    >;
    expect(result["@type"]).toBe("DefinedTerm");
    expect(result["@context"]).toBe("https://schema.org");
  });

  test("nameが見出し語である", () => {
    const result = generateHumorDictJsonLd(mockEntry) as Record<
      string,
      unknown
    >;
    expect(result.name).toBe("月曜日");
  });

  test("URLに/dictionary/humor/monday が含まれる", () => {
    const result = generateHumorDictJsonLd(mockEntry) as Record<
      string,
      unknown
    >;
    expect(String(result.url)).toContain("/dictionary/humor/monday");
  });

  test("inDefinedTermSetがユーモア辞典を指している", () => {
    const result = generateHumorDictJsonLd(mockEntry) as Record<
      string,
      unknown
    >;
    const set = result.inDefinedTermSet as Record<string, unknown>;
    expect(set["@type"]).toBe("DefinedTermSet");
    expect(String(set.url)).toContain("/dictionary/humor");
  });

  test("inLanguageがjaである", () => {
    const result = generateHumorDictJsonLd(mockEntry) as Record<
      string,
      unknown
    >;
    expect(result.inLanguage).toBe("ja");
  });
});
