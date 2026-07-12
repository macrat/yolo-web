/**
 * Tests for extractWithParam logic in the result page.
 *
 * extractWithParam validates the ?with= query parameter based on the quiz slug.
 * - music-personality: validates against isValidMusicTypeId
 * - character-personality has its own dedicated route, so it is not handled here.
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
    it("returns undefined for character-personality slug (handled by dedicated route)", () => {
      // character-personality has its own dedicated route at
      // /play/character-personality/result/[resultId], so the dynamic route
      // no longer handles this slug.
      const result = extractWithParam(
        { with: "blazing-strategist" },
        "character-personality",
        "careful-scholar",
      );
      expect(result).toBeUndefined();
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
