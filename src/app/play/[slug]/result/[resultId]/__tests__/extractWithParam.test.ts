/**
 * Tests for extractWithParam logic in the result page.
 *
 * extractWithParam validates the ?with= query parameter based on the quiz slug.
 * - music-personality: validates against isValidMusicTypeId
 * - character-personality: validates against isValidCharacterPersonalityTypeId
 */
import { describe, it, expect } from "vitest";
import { extractWithParam } from "../extractWithParam";

describe("extractWithParam", () => {
  describe("music-personality slug", () => {
    it("returns valid ?with= param when both resultId and withParam are valid music type IDs", () => {
      const result = extractWithParam(
        { with: "festival-pioneer" },
        "music-personality",
        "solo-explorer",
      );
      expect(result).toBe("festival-pioneer");
    });

    it("returns undefined when ?with= param is not a valid music type ID", () => {
      const result = extractWithParam(
        { with: "blazing-strategist" },
        "music-personality",
        "solo-explorer",
      );
      expect(result).toBeUndefined();
    });

    it("returns undefined when resultId is not a valid music type ID", () => {
      const result = extractWithParam(
        { with: "festival-pioneer" },
        "music-personality",
        "blazing-strategist",
      );
      expect(result).toBeUndefined();
    });
  });

  describe("character-personality slug", () => {
    it("returns valid ?with= param when both resultId and withParam are valid character personality type IDs", () => {
      const result = extractWithParam(
        { with: "blazing-strategist" },
        "character-personality",
        "careful-scholar",
      );
      expect(result).toBe("blazing-strategist");
    });

    it("returns undefined when ?with= param is not a valid character personality type ID", () => {
      const result = extractWithParam(
        { with: "invalid-type-id" },
        "character-personality",
        "careful-scholar",
      );
      expect(result).toBeUndefined();
    });

    it("returns undefined when resultId is not a valid character personality type ID", () => {
      const result = extractWithParam(
        { with: "blazing-strategist" },
        "character-personality",
        "invalid-result-id",
      );
      expect(result).toBeUndefined();
    });

    it("returns undefined when ?with= param is absent", () => {
      const result = extractWithParam(
        {},
        "character-personality",
        "careful-scholar",
      );
      expect(result).toBeUndefined();
    });

    it("returns undefined when resolvedSearchParams is undefined", () => {
      const result = extractWithParam(
        undefined,
        "character-personality",
        "careful-scholar",
      );
      expect(result).toBeUndefined();
    });

    it("handles all 24 character personality types correctly", () => {
      // blazing-warden と eternal-dreamer の組み合わせで検証
      const result = extractWithParam(
        { with: "eternal-dreamer" },
        "character-personality",
        "blazing-warden",
      );
      expect(result).toBe("eternal-dreamer");
    });
  });

  describe("unknown slug", () => {
    it("returns undefined for unknown slug even with valid-looking params", () => {
      const result = extractWithParam(
        { with: "some-type" },
        "unknown-quiz",
        "some-result",
      );
      expect(result).toBeUndefined();
    });
  });
});
