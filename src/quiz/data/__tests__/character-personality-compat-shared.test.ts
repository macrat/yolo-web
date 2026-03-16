import { describe, it, expect } from "vitest";
import { sharedArchetypeCompatibility } from "../character-personality-compat-shared";

/**
 * 24キャラの主副アーキタイプ一覧
 * (共通アーキタイプペア網羅チェックに使用)
 */
const CHARACTERS: Array<{ id: string; primary: string; secondary: string }> = [
  { id: "blazing-strategist", primary: "commander", secondary: "professor" },
  { id: "blazing-poet", primary: "commander", secondary: "dreamer" },
  { id: "blazing-schemer", primary: "commander", secondary: "trickster" },
  { id: "blazing-warden", primary: "commander", secondary: "guardian" },
  { id: "blazing-canvas", primary: "commander", secondary: "artist" },
  { id: "dreaming-scholar", primary: "professor", secondary: "dreamer" },
  { id: "contrarian-professor", primary: "professor", secondary: "trickster" },
  { id: "careful-scholar", primary: "professor", secondary: "guardian" },
  { id: "academic-artist", primary: "professor", secondary: "artist" },
  { id: "star-chaser", primary: "dreamer", secondary: "trickster" },
  { id: "tender-dreamer", primary: "dreamer", secondary: "guardian" },
  { id: "dreaming-canvas", primary: "dreamer", secondary: "artist" },
  { id: "clever-guardian", primary: "trickster", secondary: "guardian" },
  { id: "creative-disruptor", primary: "trickster", secondary: "artist" },
  { id: "gentle-fortress", primary: "guardian", secondary: "artist" },
  { id: "ultimate-commander", primary: "commander", secondary: "commander" },
  { id: "endless-researcher", primary: "professor", secondary: "professor" },
  { id: "eternal-dreamer", primary: "dreamer", secondary: "dreamer" },
  { id: "ultimate-trickster", primary: "trickster", secondary: "trickster" },
  { id: "ultimate-guardian", primary: "guardian", secondary: "guardian" },
  { id: "ultimate-artist", primary: "artist", secondary: "artist" },
  { id: "data-fortress", primary: "guardian", secondary: "professor" },
  { id: "vibe-rebel", primary: "artist", secondary: "trickster" },
  { id: "guardian-charger", primary: "guardian", secondary: "commander" },
];

/**
 * 2つのキャラが共通アーキタイプを持つかチェック。
 * 主副いずれかが一致していればtrue。自己ペアは対象外。
 */
function sharesArchetype(
  a: { primary: string; secondary: string },
  b: { primary: string; secondary: string },
): boolean {
  const archetypesA = new Set([a.primary, a.secondary]);
  const archetypesB = new Set([b.primary, b.secondary]);
  for (const arch of archetypesA) {
    if (archetypesB.has(arch)) return true;
  }
  return false;
}

/**
 * 全ての共通アーキタイプペアのキーリストを生成する。
 * 自己ペア(xxx--xxx)は除外。
 */
function buildExpectedKeys(): string[] {
  const keys: string[] = [];
  for (let i = 0; i < CHARACTERS.length; i++) {
    for (let j = i + 1; j < CHARACTERS.length; j++) {
      const a = CHARACTERS[i];
      const b = CHARACTERS[j];
      if (a.id === b.id) continue;
      if (!sharesArchetype(a, b)) continue;
      const key = [a.id, b.id].sort().join("--");
      keys.push(key);
    }
  }
  return keys;
}

const expectedKeys = buildExpectedKeys();

describe("sharedArchetypeCompatibility", () => {
  it("exports a non-empty object", () => {
    expect(typeof sharedArchetypeCompatibility).toBe("object");
    expect(Object.keys(sharedArchetypeCompatibility).length).toBeGreaterThan(0);
  });

  it("does not contain self-pairs (xxx--xxx)", () => {
    for (const key of Object.keys(sharedArchetypeCompatibility)) {
      const parts = key.split("--");
      expect(parts[0]).not.toBe(parts[parts.length - 1]);
    }
  });

  it("all keys are alphabetically sorted pairs joined with --", () => {
    for (const key of Object.keys(sharedArchetypeCompatibility)) {
      const parts = key.split("--");
      expect(parts.length).toBe(2);
      expect(parts[0] <= parts[1]).toBe(true);
    }
  });

  it("contains all expected shared-archetype pairs", () => {
    for (const key of expectedKeys) {
      expect(sharedArchetypeCompatibility).toHaveProperty(key);
    }
  });

  it("does not contain pairs that share no archetype", () => {
    const charMap = new Map(CHARACTERS.map((c) => [c.id, c]));
    for (const key of Object.keys(sharedArchetypeCompatibility)) {
      const [idA, idB] = key.split("--");
      const a = charMap.get(idA);
      const b = charMap.get(idB);
      if (a && b) {
        expect(sharesArchetype(a, b)).toBe(true);
      }
    }
  });

  it("each entry has a label between 5 and 15 characters", () => {
    for (const entry of Object.values(sharedArchetypeCompatibility)) {
      expect(entry.label.length).toBeGreaterThanOrEqual(5);
      expect(entry.label.length).toBeLessThanOrEqual(15);
    }
  });

  it("each entry has a description between 40 and 120 characters", () => {
    for (const entry of Object.values(sharedArchetypeCompatibility)) {
      expect(entry.description.length).toBeGreaterThanOrEqual(40);
      expect(entry.description.length).toBeLessThanOrEqual(120);
    }
  });

  it("no two entries have identical labels", () => {
    const labels = Object.values(sharedArchetypeCompatibility).map(
      (e) => e.label,
    );
    const unique = new Set(labels);
    expect(unique.size).toBe(labels.length);
  });

  it("no two entries have identical descriptions", () => {
    const descriptions = Object.values(sharedArchetypeCompatibility).map(
      (e) => e.description,
    );
    const unique = new Set(descriptions);
    expect(unique.size).toBe(descriptions.length);
  });

  it("expected key count is in the range 100-180", () => {
    expect(expectedKeys.length).toBeGreaterThanOrEqual(100);
    expect(expectedKeys.length).toBeLessThanOrEqual(180);
  });

  it("actual entry count matches expected key count", () => {
    const actual = Object.keys(sharedArchetypeCompatibility).length;
    expect(actual).toBe(expectedKeys.length);
  });
});
