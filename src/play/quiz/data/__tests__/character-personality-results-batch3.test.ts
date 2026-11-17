import { describe, it, expect } from "vitest";
import { resultsBatch3 } from "../character-personality-results-batch3";

describe("character-personality-results-batch3", () => {
  it("contains exactly 4 characters (#21-#24)", () => {
    expect(resultsBatch3.length).toBe(4);
  });

  it("has the correct IDs in order", () => {
    const ids = resultsBatch3.map((r) => r.id);
    expect(ids).toEqual([
      "ultimate-artist",
      "data-fortress",
      "vibe-rebel",
      "guardian-charger",
    ]);
  });

  it("each character has a non-empty title", () => {
    for (const char of resultsBatch3) {
      expect(char.title.length).toBeGreaterThan(0);
    }
  });

  it("each character description is between 200 and 300 characters", () => {
    for (const char of resultsBatch3) {
      expect(char.description.length).toBeGreaterThanOrEqual(200);
      expect(char.description.length).toBeLessThanOrEqual(300);
    }
  });

  it("all IDs are unique within the batch", () => {
    const ids = resultsBatch3.map((r) => r.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it("descriptions use second-person or character-voice addressing style", () => {
    // Each description should feel like the character is talking to the user
    // Check for typical Japanese second-person/conversational markers
    for (const char of resultsBatch3) {
      // At least one of: あなた, お前, ね, よ, だ, です, ます, か
      const hasConversationalMarker =
        /あなた|お前|ね|よ|だよ|だぜ|ですわ|っしょ|だろ|かな/.test(
          char.description,
        );
      expect(hasConversationalMarker).toBe(true);
    }
  });
});
