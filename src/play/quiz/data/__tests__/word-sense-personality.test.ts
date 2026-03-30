/**
 * Tests for word-sense-personality.ts — 言葉センス診断
 *
 * Validates:
 * - meta fields
 * - questions structure and point distribution
 * - results structure
 * - compatibilityMatrix coverage and format
 * - exported utility functions
 */
import { describe, it, expect } from "vitest";
import wordSensePersonalityQuiz, {
  WORD_SENSE_TYPE_IDS,
  getCompatibility,
  isValidWordSenseTypeId,
  compatibilityMatrix,
} from "../word-sense-personality";

const TYPE_IDS = [
  "elegant-precise",
  "warm-empathy",
  "creative-playful",
  "logical-clear",
  "poetic-sensory",
  "bold-impact",
  "humor-wit",
  "gentle-indirect",
] as const;

// All 36 compatibility keys (sorted, separated by --)
const COMPATIBILITY_KEYS = [
  "bold-impact--creative-playful",
  "bold-impact--elegant-precise",
  "bold-impact--gentle-indirect",
  "bold-impact--humor-wit",
  "bold-impact--logical-clear",
  "bold-impact--poetic-sensory",
  "bold-impact--warm-empathy",
  "bold-impact--bold-impact",
  "creative-playful--elegant-precise",
  "creative-playful--gentle-indirect",
  "creative-playful--humor-wit",
  "creative-playful--logical-clear",
  "creative-playful--poetic-sensory",
  "creative-playful--warm-empathy",
  "creative-playful--creative-playful",
  "elegant-precise--gentle-indirect",
  "elegant-precise--humor-wit",
  "elegant-precise--logical-clear",
  "elegant-precise--poetic-sensory",
  "elegant-precise--warm-empathy",
  "elegant-precise--elegant-precise",
  "gentle-indirect--humor-wit",
  "gentle-indirect--logical-clear",
  "gentle-indirect--poetic-sensory",
  "gentle-indirect--warm-empathy",
  "gentle-indirect--gentle-indirect",
  "humor-wit--logical-clear",
  "humor-wit--poetic-sensory",
  "humor-wit--warm-empathy",
  "humor-wit--humor-wit",
  "logical-clear--poetic-sensory",
  "logical-clear--warm-empathy",
  "logical-clear--logical-clear",
  "poetic-sensory--warm-empathy",
  "poetic-sensory--poetic-sensory",
  "warm-empathy--warm-empathy",
];

describe("word-sense-personality — meta", () => {
  it("has correct slug", () => {
    expect(wordSensePersonalityQuiz.meta.slug).toBe("word-sense-personality");
  });

  it("has type 'personality'", () => {
    expect(wordSensePersonalityQuiz.meta.type).toBe("personality");
  });

  it("has category 'personality'", () => {
    expect(wordSensePersonalityQuiz.meta.category).toBe("personality");
  });

  it("has questionCount 10", () => {
    expect(wordSensePersonalityQuiz.meta.questionCount).toBe(10);
  });

  it("has faq with at least 4 entries", () => {
    expect(wordSensePersonalityQuiz.meta.faq?.length).toBeGreaterThanOrEqual(4);
  });
});

describe("word-sense-personality — questions", () => {
  it("has exactly 10 questions", () => {
    expect(wordSensePersonalityQuiz.questions.length).toBe(10);
  });

  it("question IDs are q1 through q10", () => {
    for (let i = 1; i <= 10; i++) {
      expect(wordSensePersonalityQuiz.questions[i - 1].id).toBe(`q${i}`);
    }
  });

  it("each question has exactly 4 choices", () => {
    for (const q of wordSensePersonalityQuiz.questions) {
      expect(q.choices.length, `Question ${q.id} should have 4 choices`).toBe(
        4,
      );
    }
  });

  it("choice IDs follow q<n>-a/b/c/d pattern", () => {
    for (const q of wordSensePersonalityQuiz.questions) {
      const suffixes = ["a", "b", "c", "d"];
      for (let i = 0; i < 4; i++) {
        expect(q.choices[i].id).toBe(`${q.id}-${suffixes[i]}`);
      }
    }
  });

  it("each choice has a points object with at least 2 entries", () => {
    for (const q of wordSensePersonalityQuiz.questions) {
      for (const choice of q.choices) {
        expect(
          Object.keys(choice.points ?? {}).length,
          `Choice ${choice.id} must have points`,
        ).toBeGreaterThanOrEqual(2);
      }
    }
  });

  it("each choice has one point value of 2 (primary) and one of 1 (secondary)", () => {
    for (const q of wordSensePersonalityQuiz.questions) {
      for (const choice of q.choices) {
        const values = Object.values(choice.points ?? {});
        expect(values, `Choice ${choice.id} must have a primary (2)`).toContain(
          2,
        );
        expect(
          values,
          `Choice ${choice.id} must have a secondary (1)`,
        ).toContain(1);
      }
    }
  });

  it("all point type IDs are valid WordSenseTypeIds", () => {
    for (const q of wordSensePersonalityQuiz.questions) {
      for (const choice of q.choices) {
        for (const typeId of Object.keys(choice.points ?? {})) {
          expect(
            (TYPE_IDS as readonly string[]).includes(typeId),
            `Invalid type ID "${typeId}" in choice ${choice.id}`,
          ).toBe(true);
        }
      }
    }
  });

  it("each type appears as primary exactly 5 times across all questions", () => {
    const primaryCounts: Record<string, number> = {};
    for (const typeId of TYPE_IDS) {
      primaryCounts[typeId] = 0;
    }
    for (const q of wordSensePersonalityQuiz.questions) {
      for (const choice of q.choices) {
        const pts = choice.points ?? {};
        for (const [typeId, score] of Object.entries(pts)) {
          if (score === 2) {
            primaryCounts[typeId] = (primaryCounts[typeId] ?? 0) + 1;
          }
        }
      }
    }
    for (const typeId of TYPE_IDS) {
      expect(
        primaryCounts[typeId],
        `Type ${typeId} should appear as primary exactly 5 times, got ${primaryCounts[typeId]}`,
      ).toBe(5);
    }
  });

  it("within each question, no two choices share the same primary type", () => {
    for (const q of wordSensePersonalityQuiz.questions) {
      const primaries = q.choices.map((c) => {
        const pts = c.points ?? {};
        return Object.entries(pts).find(([, v]) => v === 2)?.[0];
      });
      const unique = new Set(primaries);
      expect(
        unique.size,
        `Question ${q.id} has duplicate primary types: ${primaries.join(", ")}`,
      ).toBe(4);
    }
  });
});

describe("word-sense-personality — results", () => {
  it("has exactly 8 results", () => {
    expect(wordSensePersonalityQuiz.results.length).toBe(8);
  });

  it("result IDs match TYPE_IDS", () => {
    const resultIds = wordSensePersonalityQuiz.results.map((r) => r.id);
    for (const typeId of TYPE_IDS) {
      expect(resultIds, `Missing result for type ${typeId}`).toContain(typeId);
    }
  });

  it("each result has a non-empty title, description, color, icon", () => {
    for (const result of wordSensePersonalityQuiz.results) {
      expect(
        result.title.length,
        `Empty title for ${result.id}`,
      ).toBeGreaterThan(0);
      expect(
        result.description.length,
        `Empty description for ${result.id}`,
      ).toBeGreaterThan(0);
      expect(result.color, `Missing color for ${result.id}`).toBeTruthy();
      expect(result.icon, `Missing icon for ${result.id}`).toBeTruthy();
    }
  });

  it("each description is 300-500 characters", () => {
    for (const result of wordSensePersonalityQuiz.results) {
      expect(
        result.description.length,
        `Description too short for ${result.id}: ${result.description.length} chars`,
      ).toBeGreaterThanOrEqual(300);
      expect(
        result.description.length,
        `Description too long for ${result.id}: ${result.description.length} chars`,
      ).toBeLessThanOrEqual(500);
    }
  });

  it("each result has recommendation and recommendationLink", () => {
    for (const result of wordSensePersonalityQuiz.results) {
      expect(
        result.recommendation,
        `Missing recommendation for ${result.id}`,
      ).toBeTruthy();
      expect(
        result.recommendationLink,
        `Missing recommendationLink for ${result.id}`,
      ).toBeTruthy();
    }
  });
});

describe("word-sense-personality — compatibility matrix", () => {
  it("has exactly 36 entries", () => {
    expect(Object.keys(compatibilityMatrix).length).toBe(36);
  });

  it("contains all expected keys", () => {
    for (const key of COMPATIBILITY_KEYS) {
      expect(compatibilityMatrix[key], `Missing key: ${key}`).toBeDefined();
    }
  });

  it("each entry has a non-empty label (max 10 characters)", () => {
    for (const [key, entry] of Object.entries(compatibilityMatrix)) {
      expect(entry.label.length, `Empty label for ${key}`).toBeGreaterThan(0);
      expect(
        entry.label.length,
        `Label too long for ${key}: "${entry.label}"`,
      ).toBeLessThanOrEqual(10);
    }
  });

  it("each entry has a description of 50-100 characters", () => {
    for (const [key, entry] of Object.entries(compatibilityMatrix)) {
      expect(
        entry.description.length,
        `Description too short for ${key}: ${entry.description.length} chars`,
      ).toBeGreaterThanOrEqual(50);
      expect(
        entry.description.length,
        `Description too long for ${key}: ${entry.description.length} chars`,
      ).toBeLessThanOrEqual(100);
    }
  });
});

describe("word-sense-personality — getCompatibility", () => {
  it("returns correct entry for same-order pair", () => {
    const entry = getCompatibility("bold-impact", "elegant-precise");
    expect(entry).toBeDefined();
    expect(entry?.label.length).toBeGreaterThan(0);
  });

  it("returns same entry for reversed pair", () => {
    const a = getCompatibility("bold-impact", "elegant-precise");
    const b = getCompatibility("elegant-precise", "bold-impact");
    expect(a).toEqual(b);
  });

  it("returns entry for same-type pair", () => {
    const entry = getCompatibility("humor-wit", "humor-wit");
    expect(entry).toBeDefined();
  });

  it("returns undefined for invalid type ID", () => {
    const entry = getCompatibility("unknown-type", "humor-wit");
    expect(entry).toBeUndefined();
  });
});

describe("word-sense-personality — WORD_SENSE_TYPE_IDS", () => {
  it("contains all 8 type IDs", () => {
    expect(WORD_SENSE_TYPE_IDS.length).toBe(8);
    for (const typeId of TYPE_IDS) {
      expect(WORD_SENSE_TYPE_IDS as readonly string[]).toContain(typeId);
    }
  });
});

describe("word-sense-personality — isValidWordSenseTypeId", () => {
  it("returns true for valid type IDs", () => {
    for (const typeId of TYPE_IDS) {
      expect(isValidWordSenseTypeId(typeId)).toBe(true);
    }
  });

  it("returns false for invalid type IDs", () => {
    expect(isValidWordSenseTypeId("unknown")).toBe(false);
    expect(isValidWordSenseTypeId("")).toBe(false);
  });
});
