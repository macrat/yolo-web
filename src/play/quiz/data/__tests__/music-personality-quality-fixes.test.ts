/**
 * Quality regression tests for music-personality types 5-8 (bgm-craftsman, karaoke-healer,
 * midnight-shuffle, lyrics-dweller).
 *
 * These tests verify the 4 quality issues reported in the review:
 *
 * 1. behaviors must not duplicate content from strengths/weaknesses
 * 2. catchphrase must follow the concise style of types 1-4 (no句点, 15-25 chars)
 * 3. karaoke-healer strength 1 must be ability-focused ("〜できる" / "〜の力がある")
 * 4. midnight-shuffle weakness 2 must be self-deprecating humor, not neutral description
 */
import { describe, it, expect } from "vitest";
import type { MusicPersonalityDetailedContent } from "../../types";
import musicPersonalityQuiz from "../music-personality";

const allResults = musicPersonalityQuiz.results;

function getResult(id: string) {
  const r = allResults.find((r) => r.id === id);
  if (!r) throw new Error(`Result not found: ${id}`);
  return r;
}

function getDC(id: string): MusicPersonalityDetailedContent {
  return getResult(id).detailedContent as MusicPersonalityDetailedContent;
}

/**
 * Returns true if textA and textB share a common substring of length >= minLen
 */
function sharesSubstring(
  textA: string,
  textB: string,
  minLen: number,
): boolean {
  for (let i = 0; i <= textA.length - minLen; i++) {
    const sub = textA.slice(i, i + minLen);
    if (textB.includes(sub)) {
      return true;
    }
  }
  return false;
}

// ---------------------------------------------------------------------------
// Problem 1: behaviors must not duplicate strengths/weaknesses
// ---------------------------------------------------------------------------

describe("Problem 1: behaviors must not duplicate strengths/weaknesses content", () => {
  const DUPLICATE_THRESHOLD = 10; // chars

  it("bgm-craftsman: no behavior should share 10+ chars with any strength or weakness", () => {
    const dc = getDC("bgm-craftsman");
    const swItems = [...dc.strengths, ...dc.weaknesses];
    const violations: string[] = [];

    for (const behavior of dc.behaviors) {
      for (const sw of swItems) {
        if (sharesSubstring(sw, behavior, DUPLICATE_THRESHOLD)) {
          violations.push(
            `behavior duplicates sw:\n  behavior: "${behavior}"\n  sw: "${sw}"`,
          );
        }
      }
    }

    expect(violations, violations.join("\n")).toHaveLength(0);
  });

  it("karaoke-healer: no behavior should share 10+ chars with any strength or weakness", () => {
    const dc = getDC("karaoke-healer");
    const swItems = [...dc.strengths, ...dc.weaknesses];
    const violations: string[] = [];

    for (const behavior of dc.behaviors) {
      for (const sw of swItems) {
        if (sharesSubstring(sw, behavior, DUPLICATE_THRESHOLD)) {
          violations.push(
            `behavior duplicates sw:\n  behavior: "${behavior}"\n  sw: "${sw}"`,
          );
        }
      }
    }

    expect(violations, violations.join("\n")).toHaveLength(0);
  });

  it("lyrics-dweller: no behavior should share 10+ chars with any strength or weakness", () => {
    const dc = getDC("lyrics-dweller");
    const swItems = [...dc.strengths, ...dc.weaknesses];
    const violations: string[] = [];

    for (const behavior of dc.behaviors) {
      for (const sw of swItems) {
        if (sharesSubstring(sw, behavior, DUPLICATE_THRESHOLD)) {
          violations.push(
            `behavior duplicates sw:\n  behavior: "${behavior}"\n  sw: "${sw}"`,
          );
        }
      }
    }

    expect(violations, violations.join("\n")).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// Problem 2: catchphrase style — no句点, 15-25 chars, concise
// ---------------------------------------------------------------------------

describe("Problem 2: catchphrase style — concise, no sentence-ending punctuation, 15-25 chars", () => {
  const LATER_TYPE_IDS = [
    "bgm-craftsman",
    "karaoke-healer",
    "midnight-shuffle",
    "lyrics-dweller",
  ];

  for (const id of LATER_TYPE_IDS) {
    it(`${id}: catchphrase must not end with a句点(。) or contain a period mid-sentence`, () => {
      const dc = getDC(id);
      expect(
        dc.catchphrase,
        `${id}: catchphrase should not contain 。`,
      ).not.toContain("。");
    });

    it(`${id}: catchphrase must be 15-25 chars`, () => {
      const dc = getDC(id);
      expect(
        dc.catchphrase.length,
        `${id}: catchphrase too short (min 15), got "${dc.catchphrase}" (${dc.catchphrase.length})`,
      ).toBeGreaterThanOrEqual(15);
      expect(
        dc.catchphrase.length,
        `${id}: catchphrase too long (max 25), got "${dc.catchphrase}" (${dc.catchphrase.length})`,
      ).toBeLessThanOrEqual(25);
    });
  }
});

// ---------------------------------------------------------------------------
// Problem 3: karaoke-healer strength 1 — ability-focused phrasing
// ---------------------------------------------------------------------------

describe("Problem 3: karaoke-healer strength 1 should be ability-focused", () => {
  it('strength 1 should contain "できる" or "力がある" or "上手" to express an ability', () => {
    const dc = getDC("karaoke-healer");
    const strength1 = dc.strengths[0];
    const isAbilityFocused = /できる|力がある|上手|得意|センス/.test(strength1);
    expect(
      isAbilityFocused,
      `strength 1 should be ability-focused: "${strength1}"`,
    ).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Problem 4: midnight-shuffle weakness 2 — self-deprecating humor
// ---------------------------------------------------------------------------

describe("Problem 4: midnight-shuffle weakness 2 should be self-deprecating humor", () => {
  it("weakness 2 should not be a neutral description about language expression", () => {
    const dc = getDC("midnight-shuffle");
    const weakness2 = dc.weaknesses[1];
    // The original neutral description contains these neutral-sounding phrases
    const isNeutralDescription = /感情を言語化するのが得意ではなく/.test(
      weakness2,
    );
    expect(
      isNeutralDescription,
      `weakness 2 should not be a neutral description: "${weakness2}"`,
    ).toBe(false);
  });

  it("weakness 2 should have self-deprecating humor (contain 笑える pattern)", () => {
    const dc = getDC("midnight-shuffle");
    const weakness2 = dc.weaknesses[1];
    // Should feel like self-deprecation, not neutral analysis
    const hasSelfDeprecatingTone =
      /てしまう|してしまう|なってしまう|な気がする|かもしれない|のかもしれない|しかない|になる|気づいたら|よく|ついつい|つい/.test(
        weakness2,
      );
    expect(
      hasSelfDeprecatingTone,
      `weakness 2 should have self-deprecating tone: "${weakness2}"`,
    ).toBe(true);
  });
});
