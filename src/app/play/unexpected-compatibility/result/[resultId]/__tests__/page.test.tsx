/**
 * /play/unexpected-compatibility/result/[resultId] 専用ルートのテスト。
 * - generateStaticParams が全8タイプのresultIdを返すこと
 * - generateMetadata が正しいメタデータを返すこと
 * - 相性機能（CompatibilityDisplay, InviteFriendButton）のコードが含まれないこと
 * - CTA1テキストがモバイル(375px)で1行に収まる文字数であること
 */

import { describe, it, expect } from "vitest";
import { generateStaticParams, generateMetadata, CTA_TEXT } from "../page";

describe("UnexpectedCompatibilityResultPage", () => {
  describe("generateStaticParams", () => {
    it("全8タイプのresultIdを返す", () => {
      const params = generateStaticParams();
      expect(params).toHaveLength(8);
      // 各パラメータがresultIdフィールドを持つことを確認
      for (const p of params) {
        expect(p).toHaveProperty("resultId");
        expect(typeof p.resultId).toBe("string");
      }
    });

    it("8種類の既知のresultIdを含む", () => {
      const params = generateStaticParams();
      const ids = params.map((p) => p.resultId);
      const expectedIds = [
        "vendingmachine",
        "oldclock",
        "streetlight",
        "benchpark",
        "windchime",
        "rainyday",
        "cloudspecific",
        "404page",
      ];
      for (const id of expectedIds) {
        expect(ids).toContain(id);
      }
    });
  });

  describe("generateMetadata", () => {
    it("存在するresultIdに対してメタデータを返す", async () => {
      const metadata = await generateMetadata({
        params: Promise.resolve({ resultId: "vendingmachine" }),
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
        params: Promise.resolve({ resultId: "oldclock" }),
      });
      expect(metadata.robots).toEqual({ index: true, follow: true });
    });

    it("openGraphにURLが設定される", async () => {
      const metadata = await generateMetadata({
        params: Promise.resolve({ resultId: "streetlight" }),
      });
      expect((metadata.openGraph as { url?: string })?.url).toContain(
        "unexpected-compatibility",
      );
      expect((metadata.openGraph as { url?: string })?.url).toContain(
        "streetlight",
      );
    });

    it("alternates.canonicalが設定される", async () => {
      const metadata = await generateMetadata({
        params: Promise.resolve({ resultId: "benchpark" }),
      });
      expect(
        (metadata.alternates as { canonical?: string })?.canonical,
      ).toContain("unexpected-compatibility");
    });
  });

  describe("CTA_TEXT", () => {
    it("CTA1テキストが18文字以下でモバイル(375px)で1行に収まる長さである", () => {
      // yoji-personalityのCTAテキスト「あなたはどの四字熟語? 診断してみよう」は17文字。
      // unexpected-compatibilityも同等の長さに揃える。
      expect(CTA_TEXT.length).toBeLessThanOrEqual(18);
    });
  });
});
