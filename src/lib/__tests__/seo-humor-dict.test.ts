import { expect, test, describe } from "vitest";
import { humorShareImageContent } from "@/humor-dict/_lib/share-image-content";
import { shareOpenGraphImage } from "@/lib/share-image";
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

const shareImage = shareOpenGraphImage(
  "/dictionary/humor/monday",
  humorShareImageContent(mockEntry),
);

describe("generateHumorDictEntryMetadata (エントリページ)", () => {
  test("タイトルに見出し語が含まれる", () => {
    const result = generateHumorDictEntryMetadata(mockEntry, shareImage);
    expect(result.title).toContain("月曜日");
  });

  test("タイトルに「ユーモア辞典」と「yolos.net」が含まれる", () => {
    const result = generateHumorDictEntryMetadata(mockEntry, shareImage);
    expect(result.title).toContain("ユーモア辞典");
    expect(result.title).toContain("yolos.net");
  });

  test("canonicalに/dictionary/humor/monday が含まれる", () => {
    const result = generateHumorDictEntryMetadata(mockEntry, shareImage);
    expect(String(result.alternates?.canonical)).toContain(
      "/dictionary/humor/monday",
    );
  });

  test("og:urlがcanonicalと一致する", () => {
    const result = generateHumorDictEntryMetadata(mockEntry, shareImage);
    const og = result.openGraph as Record<string, unknown> | undefined;
    expect(og?.url).toBe(result.alternates?.canonical);
  });

  test("og:siteNameがyolos.netである", () => {
    const result = generateHumorDictEntryMetadata(mockEntry, shareImage);
    const og = result.openGraph as Record<string, unknown> | undefined;
    expect(og?.siteName).toBe("yolos.net");
  });

  test("openGraph.images に語の画像を渡し、twitter は画像を持たない（Next.js が openGraph から補う）", () => {
    const result = generateHumorDictEntryMetadata(mockEntry, shareImage);
    const og = result.openGraph as Record<string, unknown> | undefined;
    expect(og?.images).toEqual([shareImage]);
    expect(
      (result.twitter as Record<string, unknown> | undefined)?.images,
    ).toBeUndefined();
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
