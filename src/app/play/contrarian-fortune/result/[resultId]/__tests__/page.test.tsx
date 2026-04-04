/**
 * /play/contrarian-fortune/result/[resultId] 専用ルートのテスト。
 * - generateStaticParams が全8タイプのresultIdを返すこと
 * - generateMetadata が正しいメタデータを返すこと
 * - CTA_TEXTがモバイル(375px)で1行に収まる文字数であること
 */

import { describe, it, expect } from "vitest";
import { generateStaticParams, generateMetadata, CTA_TEXT } from "../page";

describe("ContrarianFortuneResultPage", () => {
  describe("generateStaticParams", () => {
    it("全8タイプのresultIdを返す", () => {
      const params = generateStaticParams();
      expect(params).toHaveLength(8);
      for (const p of params) {
        expect(p).toHaveProperty("resultId");
        expect(typeof p.resultId).toBe("string");
      }
    });

    it("8種類の既知のresultIdを含む", () => {
      const params = generateStaticParams();
      const ids = params.map((p) => p.resultId);
      const expectedIds = [
        "reverseoptimist",
        "overthinker",
        "cosmicworrier",
        "paradoxmaster",
        "accidentalprophet",
        "calmchaos",
        "inversefortune",
        "mundaneoracle",
      ];
      for (const id of expectedIds) {
        expect(ids).toContain(id);
      }
    });
  });

  describe("generateMetadata", () => {
    it("存在するresultIdに対してメタデータを返す", async () => {
      const metadata = await generateMetadata({
        params: Promise.resolve({ resultId: "reverseoptimist" }),
      });
      expect(metadata.title).toBeDefined();
      expect(metadata.description).toBeDefined();
      expect(metadata.openGraph).toBeDefined();
    });

    it("存在しないresultIdに対して空オブジェクトを返す", async () => {
      const metadata = await generateMetadata({
        params: Promise.resolve({ resultId: "nonexistent" }),
      });
      expect(metadata).toEqual({});
    });

    it("robots.indexがtrueに設定される", async () => {
      const metadata = await generateMetadata({
        params: Promise.resolve({ resultId: "overthinker" }),
      });
      expect(metadata.robots).toEqual({ index: true, follow: true });
    });

    it("openGraphにURLが設定される", async () => {
      const metadata = await generateMetadata({
        params: Promise.resolve({ resultId: "cosmicworrier" }),
      });
      expect((metadata.openGraph as { url?: string })?.url).toContain(
        "contrarian-fortune",
      );
      expect((metadata.openGraph as { url?: string })?.url).toContain(
        "cosmicworrier",
      );
    });

    it("alternates.canonicalが設定される", async () => {
      const metadata = await generateMetadata({
        params: Promise.resolve({ resultId: "paradoxmaster" }),
      });
      expect(
        (metadata.alternates as { canonical?: string })?.canonical,
      ).toContain("contrarian-fortune");
    });
  });

  describe("CTA_TEXT", () => {
    it("CTA1テキストが14文字以下でモバイル(375px)で1行に収まる長さである", () => {
      expect(CTA_TEXT.length).toBeLessThanOrEqual(14);
    });
  });
});
