/**
 * Integration tests for character-personality-compatibility.ts
 * Verifies that the merged compatibilityMatrix contains all 300 entries:
 *   - 24 self-pairs (Batch 1)
 *   - 124 shared-archetype pairs (Batch 2)
 *   - 152 completely-different-archetype pairs (Batch 3)
 */
import { describe, it, expect } from "vitest";
import { compatibilityMatrix } from "../character-personality-compatibility";
import { getCompatibility } from "../character-personality";

// ── All 300 expected keys ──────────────────────────────────────────────────

const SELF_PAIR_KEYS = [
  "blazing-strategist--blazing-strategist",
  "blazing-poet--blazing-poet",
  "blazing-schemer--blazing-schemer",
  "blazing-warden--blazing-warden",
  "blazing-canvas--blazing-canvas",
  "dreaming-scholar--dreaming-scholar",
  "contrarian-professor--contrarian-professor",
  "careful-scholar--careful-scholar",
  "academic-artist--academic-artist",
  "star-chaser--star-chaser",
  "tender-dreamer--tender-dreamer",
  "dreaming-canvas--dreaming-canvas",
  "clever-guardian--clever-guardian",
  "creative-disruptor--creative-disruptor",
  "gentle-fortress--gentle-fortress",
  "ultimate-commander--ultimate-commander",
  "endless-researcher--endless-researcher",
  "eternal-dreamer--eternal-dreamer",
  "ultimate-trickster--ultimate-trickster",
  "ultimate-guardian--ultimate-guardian",
  "ultimate-artist--ultimate-artist",
  "data-fortress--data-fortress",
  "vibe-rebel--vibe-rebel",
  "guardian-charger--guardian-charger",
] as const;

const SHARED_ARCHETYPE_KEYS = [
  "blazing-poet--blazing-strategist",
  "blazing-schemer--blazing-strategist",
  "blazing-strategist--blazing-warden",
  "blazing-canvas--blazing-strategist",
  "blazing-strategist--ultimate-commander",
  "blazing-strategist--guardian-charger",
  "blazing-poet--blazing-schemer",
  "blazing-poet--blazing-warden",
  "blazing-canvas--blazing-poet",
  "blazing-poet--ultimate-commander",
  "blazing-poet--guardian-charger",
  "blazing-schemer--blazing-warden",
  "blazing-canvas--blazing-schemer",
  "blazing-schemer--ultimate-commander",
  "blazing-schemer--guardian-charger",
  "blazing-canvas--blazing-warden",
  "blazing-warden--ultimate-commander",
  "blazing-warden--guardian-charger",
  "blazing-canvas--ultimate-commander",
  "blazing-canvas--guardian-charger",
  "guardian-charger--ultimate-commander",
  "blazing-strategist--dreaming-scholar",
  "blazing-strategist--contrarian-professor",
  "blazing-strategist--careful-scholar",
  "academic-artist--blazing-strategist",
  "blazing-strategist--endless-researcher",
  "blazing-strategist--data-fortress",
  "contrarian-professor--dreaming-scholar",
  "careful-scholar--dreaming-scholar",
  "academic-artist--dreaming-scholar",
  "dreaming-scholar--endless-researcher",
  "data-fortress--dreaming-scholar",
  "careful-scholar--contrarian-professor",
  "academic-artist--contrarian-professor",
  "contrarian-professor--endless-researcher",
  "contrarian-professor--data-fortress",
  "academic-artist--careful-scholar",
  "careful-scholar--endless-researcher",
  "careful-scholar--data-fortress",
  "academic-artist--endless-researcher",
  "academic-artist--data-fortress",
  "data-fortress--endless-researcher",
  "blazing-poet--dreaming-scholar",
  "blazing-poet--star-chaser",
  "blazing-poet--tender-dreamer",
  "blazing-poet--dreaming-canvas",
  "blazing-poet--eternal-dreamer",
  "dreaming-scholar--star-chaser",
  "dreaming-scholar--tender-dreamer",
  "dreaming-canvas--dreaming-scholar",
  "dreaming-scholar--eternal-dreamer",
  "star-chaser--tender-dreamer",
  "dreaming-canvas--star-chaser",
  "eternal-dreamer--star-chaser",
  "dreaming-canvas--tender-dreamer",
  "eternal-dreamer--tender-dreamer",
  "dreaming-canvas--eternal-dreamer",
  "blazing-schemer--contrarian-professor",
  "blazing-schemer--star-chaser",
  "blazing-schemer--clever-guardian",
  "blazing-schemer--creative-disruptor",
  "blazing-schemer--ultimate-trickster",
  "blazing-schemer--vibe-rebel",
  "contrarian-professor--star-chaser",
  "clever-guardian--contrarian-professor",
  "contrarian-professor--creative-disruptor",
  "contrarian-professor--ultimate-trickster",
  "contrarian-professor--vibe-rebel",
  "clever-guardian--star-chaser",
  "creative-disruptor--star-chaser",
  "star-chaser--ultimate-trickster",
  "star-chaser--vibe-rebel",
  "clever-guardian--creative-disruptor",
  "clever-guardian--ultimate-trickster",
  "clever-guardian--vibe-rebel",
  "creative-disruptor--ultimate-trickster",
  "creative-disruptor--vibe-rebel",
  "ultimate-trickster--vibe-rebel",
  "blazing-warden--careful-scholar",
  "blazing-warden--tender-dreamer",
  "blazing-warden--clever-guardian",
  "blazing-warden--gentle-fortress",
  "blazing-warden--ultimate-guardian",
  "blazing-warden--data-fortress",
  "careful-scholar--tender-dreamer",
  "careful-scholar--clever-guardian",
  "careful-scholar--gentle-fortress",
  "careful-scholar--ultimate-guardian",
  "careful-scholar--guardian-charger",
  "clever-guardian--tender-dreamer",
  "gentle-fortress--tender-dreamer",
  "tender-dreamer--ultimate-guardian",
  "data-fortress--tender-dreamer",
  "guardian-charger--tender-dreamer",
  "clever-guardian--gentle-fortress",
  "clever-guardian--ultimate-guardian",
  "clever-guardian--data-fortress",
  "clever-guardian--guardian-charger",
  "gentle-fortress--ultimate-guardian",
  "data-fortress--gentle-fortress",
  "gentle-fortress--guardian-charger",
  "data-fortress--ultimate-guardian",
  "guardian-charger--ultimate-guardian",
  "data-fortress--guardian-charger",
  "academic-artist--blazing-canvas",
  "blazing-canvas--dreaming-canvas",
  "blazing-canvas--creative-disruptor",
  "blazing-canvas--gentle-fortress",
  "blazing-canvas--ultimate-artist",
  "blazing-canvas--vibe-rebel",
  "academic-artist--dreaming-canvas",
  "academic-artist--creative-disruptor",
  "academic-artist--gentle-fortress",
  "academic-artist--ultimate-artist",
  "academic-artist--vibe-rebel",
  "creative-disruptor--dreaming-canvas",
  "dreaming-canvas--gentle-fortress",
  "dreaming-canvas--ultimate-artist",
  "dreaming-canvas--vibe-rebel",
  "creative-disruptor--gentle-fortress",
  "creative-disruptor--ultimate-artist",
  "gentle-fortress--ultimate-artist",
  "gentle-fortress--vibe-rebel",
  "ultimate-artist--vibe-rebel",
] as const;

const DIFFERENT_PAIR_KEYS = [
  "blazing-strategist--star-chaser",
  "blazing-strategist--tender-dreamer",
  "blazing-strategist--dreaming-canvas",
  "blazing-strategist--clever-guardian",
  "blazing-strategist--creative-disruptor",
  "blazing-strategist--gentle-fortress",
  "blazing-strategist--eternal-dreamer",
  "blazing-strategist--ultimate-trickster",
  "blazing-strategist--ultimate-guardian",
  "blazing-strategist--ultimate-artist",
  "blazing-strategist--vibe-rebel",
  "blazing-poet--contrarian-professor",
  "blazing-poet--careful-scholar",
  "academic-artist--blazing-poet",
  "blazing-poet--clever-guardian",
  "blazing-poet--creative-disruptor",
  "blazing-poet--gentle-fortress",
  "blazing-poet--endless-researcher",
  "blazing-poet--ultimate-trickster",
  "blazing-poet--ultimate-guardian",
  "blazing-poet--ultimate-artist",
  "blazing-poet--data-fortress",
  "blazing-poet--vibe-rebel",
  "blazing-schemer--dreaming-scholar",
  "blazing-schemer--careful-scholar",
  "academic-artist--blazing-schemer",
  "blazing-schemer--tender-dreamer",
  "blazing-schemer--dreaming-canvas",
  "blazing-schemer--gentle-fortress",
  "blazing-schemer--endless-researcher",
  "blazing-schemer--eternal-dreamer",
  "blazing-schemer--ultimate-guardian",
  "blazing-schemer--ultimate-artist",
  "blazing-schemer--data-fortress",
  "blazing-warden--dreaming-scholar",
  "blazing-warden--contrarian-professor",
  "academic-artist--blazing-warden",
  "blazing-warden--star-chaser",
  "blazing-warden--dreaming-canvas",
  "blazing-warden--creative-disruptor",
  "blazing-warden--endless-researcher",
  "blazing-warden--eternal-dreamer",
  "blazing-warden--ultimate-trickster",
  "blazing-warden--ultimate-artist",
  "blazing-warden--vibe-rebel",
  "blazing-canvas--dreaming-scholar",
  "blazing-canvas--contrarian-professor",
  "blazing-canvas--careful-scholar",
  "blazing-canvas--star-chaser",
  "blazing-canvas--tender-dreamer",
  "blazing-canvas--clever-guardian",
  "blazing-canvas--endless-researcher",
  "blazing-canvas--eternal-dreamer",
  "blazing-canvas--ultimate-trickster",
  "blazing-canvas--ultimate-guardian",
  "blazing-canvas--data-fortress",
  "clever-guardian--dreaming-scholar",
  "creative-disruptor--dreaming-scholar",
  "dreaming-scholar--gentle-fortress",
  "dreaming-scholar--ultimate-commander",
  "dreaming-scholar--ultimate-trickster",
  "dreaming-scholar--ultimate-guardian",
  "dreaming-scholar--ultimate-artist",
  "dreaming-scholar--vibe-rebel",
  "dreaming-scholar--guardian-charger",
  "contrarian-professor--tender-dreamer",
  "contrarian-professor--dreaming-canvas",
  "contrarian-professor--gentle-fortress",
  "contrarian-professor--ultimate-commander",
  "contrarian-professor--eternal-dreamer",
  "contrarian-professor--ultimate-guardian",
  "contrarian-professor--ultimate-artist",
  "contrarian-professor--guardian-charger",
  "careful-scholar--star-chaser",
  "careful-scholar--dreaming-canvas",
  "careful-scholar--creative-disruptor",
  "careful-scholar--ultimate-commander",
  "careful-scholar--eternal-dreamer",
  "careful-scholar--ultimate-trickster",
  "careful-scholar--ultimate-artist",
  "careful-scholar--vibe-rebel",
  "academic-artist--star-chaser",
  "academic-artist--tender-dreamer",
  "academic-artist--clever-guardian",
  "academic-artist--ultimate-commander",
  "academic-artist--eternal-dreamer",
  "academic-artist--ultimate-trickster",
  "academic-artist--ultimate-guardian",
  "academic-artist--guardian-charger",
  "gentle-fortress--star-chaser",
  "star-chaser--ultimate-commander",
  "endless-researcher--star-chaser",
  "star-chaser--ultimate-guardian",
  "star-chaser--ultimate-artist",
  "data-fortress--star-chaser",
  "guardian-charger--star-chaser",
  "creative-disruptor--tender-dreamer",
  "tender-dreamer--ultimate-commander",
  "endless-researcher--tender-dreamer",
  "tender-dreamer--ultimate-trickster",
  "tender-dreamer--ultimate-artist",
  "tender-dreamer--vibe-rebel",
  "clever-guardian--dreaming-canvas",
  "dreaming-canvas--ultimate-commander",
  "dreaming-canvas--endless-researcher",
  "dreaming-canvas--ultimate-trickster",
  "dreaming-canvas--ultimate-guardian",
  "data-fortress--dreaming-canvas",
  "dreaming-canvas--guardian-charger",
  "clever-guardian--ultimate-commander",
  "clever-guardian--endless-researcher",
  "clever-guardian--eternal-dreamer",
  "clever-guardian--ultimate-artist",
  "creative-disruptor--ultimate-commander",
  "creative-disruptor--endless-researcher",
  "creative-disruptor--eternal-dreamer",
  "creative-disruptor--ultimate-guardian",
  "creative-disruptor--data-fortress",
  "creative-disruptor--guardian-charger",
  "gentle-fortress--ultimate-commander",
  "endless-researcher--gentle-fortress",
  "eternal-dreamer--gentle-fortress",
  "gentle-fortress--ultimate-trickster",
  "endless-researcher--ultimate-commander",
  "eternal-dreamer--ultimate-commander",
  "ultimate-commander--ultimate-trickster",
  "ultimate-commander--ultimate-guardian",
  "ultimate-artist--ultimate-commander",
  "data-fortress--ultimate-commander",
  "ultimate-commander--vibe-rebel",
  "endless-researcher--eternal-dreamer",
  "endless-researcher--ultimate-trickster",
  "endless-researcher--ultimate-guardian",
  "endless-researcher--ultimate-artist",
  "endless-researcher--vibe-rebel",
  "endless-researcher--guardian-charger",
  "eternal-dreamer--ultimate-trickster",
  "eternal-dreamer--ultimate-guardian",
  "eternal-dreamer--ultimate-artist",
  "data-fortress--eternal-dreamer",
  "eternal-dreamer--vibe-rebel",
  "eternal-dreamer--guardian-charger",
  "ultimate-guardian--ultimate-trickster",
  "ultimate-artist--ultimate-trickster",
  "data-fortress--ultimate-trickster",
  "guardian-charger--ultimate-trickster",
  "ultimate-artist--ultimate-guardian",
  "ultimate-guardian--vibe-rebel",
  "data-fortress--ultimate-artist",
  "guardian-charger--ultimate-artist",
  "data-fortress--vibe-rebel",
  "guardian-charger--vibe-rebel",
] as const;

const ALL_EXPECTED_KEYS = [
  ...SELF_PAIR_KEYS,
  ...SHARED_ARCHETYPE_KEYS,
  ...DIFFERENT_PAIR_KEYS,
];

// ── Tests ──────────────────────────────────────────────────────────────────

describe("character-personality-compatibility — merged matrix (all 300 entries)", () => {
  it("contains all 24 self-pair entries", () => {
    for (const key of SELF_PAIR_KEYS) {
      expect(
        compatibilityMatrix[key],
        `Missing self-pair key: ${key}`,
      ).toBeDefined();
    }
  });

  it("contains all 124 shared-archetype entries", () => {
    for (const key of SHARED_ARCHETYPE_KEYS) {
      expect(
        compatibilityMatrix[key],
        `Missing shared-archetype key: ${key}`,
      ).toBeDefined();
    }
  });

  it("contains all 152 different-archetype entries", () => {
    for (const key of DIFFERENT_PAIR_KEYS) {
      expect(
        compatibilityMatrix[key],
        `Missing different-archetype key: ${key}`,
      ).toBeDefined();
    }
  });

  it("has exactly 300 entries in total", () => {
    expect(Object.keys(compatibilityMatrix).length).toBe(300);
  });

  it("has no duplicate keys across all batches", () => {
    const keySet = new Set(ALL_EXPECTED_KEYS);
    expect(keySet.size).toBe(300);
  });

  it("each entry has a non-empty label", () => {
    for (const [key, entry] of Object.entries(compatibilityMatrix)) {
      expect(entry.label.length, `Empty label for ${key}`).toBeGreaterThan(0);
    }
  });

  it("each entry has a non-empty description", () => {
    for (const [key, entry] of Object.entries(compatibilityMatrix)) {
      expect(
        entry.description.length,
        `Empty description for ${key}`,
      ).toBeGreaterThan(0);
    }
  });
});

describe("getCompatibility — looks up from merged matrix", () => {
  it("returns an entry for a self-pair", () => {
    const result = getCompatibility("blazing-strategist", "blazing-strategist");
    expect(result).toBeDefined();
    expect(result?.label).toBe("締切3分前の頭脳戦争");
  });

  it("returns the same entry regardless of argument order", () => {
    const a = getCompatibility("blazing-poet", "blazing-strategist");
    const b = getCompatibility("blazing-strategist", "blazing-poet");
    expect(a).toBeDefined();
    expect(a).toEqual(b);
  });

  it("returns an entry for a shared-archetype pair", () => {
    const result = getCompatibility("blazing-schemer", "blazing-strategist");
    expect(result).toBeDefined();
  });

  it("returns an entry for a different-archetype pair", () => {
    const result = getCompatibility("blazing-strategist", "star-chaser");
    expect(result).toBeDefined();
  });

  it("returns undefined for an invalid type ID", () => {
    const result = getCompatibility("unknown-type", "blazing-strategist");
    expect(result).toBeUndefined();
  });
});
