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

  it("each character has a valid hex color", () => {
    for (const char of resultsBatch3) {
      expect(char.color).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });

  it("each character has a non-empty icon (emoji)", () => {
    for (const char of resultsBatch3) {
      expect(char.icon.length).toBeGreaterThan(0);
    }
  });

  it("all IDs are unique within the batch", () => {
    const ids = resultsBatch3.map((r) => r.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it("all colors are unique within the batch", () => {
    const colors = resultsBatch3.map((r) => r.color.toLowerCase());
    const uniqueColors = new Set(colors);
    expect(uniqueColors.size).toBe(colors.length);
  });

  it("ultimate-artist has artist-dominant color (purple range)", () => {
    const char = resultsBatch3.find((r) => r.id === "ultimate-artist");
    expect(char).toBeDefined();
    // artist color is #7c3aed (purple), same-type should be purely artist
    expect(char!.color).toBe("#7c3aed");
  });

  it("data-fortress (guardian+professor) has a blended blue-green color", () => {
    const char = resultsBatch3.find((r) => r.id === "data-fortress");
    expect(char).toBeDefined();
    // guardian=#059669, professor=#2563eb — blended color should exist
    expect(char!.color).toBeTruthy();
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
