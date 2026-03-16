/**
 * Tests for character-personality-compat-different.ts — Completely Different Archetype Pairs (Batch 3: 152 entries)
 *
 * Completely different pairs: character pairs that share no archetypes (neither primary nor secondary).
 * e.g. blazing-canvas (commander+artist) and tender-dreamer (dreamer+guardian) → all four archetypes differ.
 */
import { describe, it, expect } from "vitest";
import { differentArchetypeCompatibility } from "../character-personality-compat-different";

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

describe("character-personality-compat-different — completely different archetype pairs", () => {
  it("contains all 152 completely-different-pair entries", () => {
    for (const key of DIFFERENT_PAIR_KEYS) {
      expect(
        differentArchetypeCompatibility[key],
        `Missing key: ${key}`,
      ).toBeDefined();
    }
  });

  it("has exactly 152 entries (no extra keys)", () => {
    expect(Object.keys(differentArchetypeCompatibility).length).toBe(152);
  });

  it("each entry has a non-empty label", () => {
    for (const key of DIFFERENT_PAIR_KEYS) {
      const entry = differentArchetypeCompatibility[key];
      if (!entry) continue;
      expect(entry.label.length, `Empty label for ${key}`).toBeGreaterThan(0);
    }
  });

  it("each label is between 5 and 20 characters", () => {
    for (const key of DIFFERENT_PAIR_KEYS) {
      const entry = differentArchetypeCompatibility[key];
      if (!entry) continue;
      expect(
        entry.label.length,
        `Label too short for ${key}: "${entry.label}"`,
      ).toBeGreaterThanOrEqual(5);
      expect(
        entry.label.length,
        `Label too long for ${key}: "${entry.label}"`,
      ).toBeLessThanOrEqual(20);
    }
  });

  it("each entry has a non-empty description", () => {
    for (const key of DIFFERENT_PAIR_KEYS) {
      const entry = differentArchetypeCompatibility[key];
      if (!entry) continue;
      expect(
        entry.description.length,
        `Empty description for ${key}`,
      ).toBeGreaterThan(0);
    }
  });

  it("each description is between 50 and 120 characters", () => {
    for (const key of DIFFERENT_PAIR_KEYS) {
      const entry = differentArchetypeCompatibility[key];
      if (!entry) continue;
      expect(
        entry.description.length,
        `Description too short for ${key}: "${entry.description}"`,
      ).toBeGreaterThanOrEqual(50);
      expect(
        entry.description.length,
        `Description too long for ${key}: "${entry.description}"`,
      ).toBeLessThanOrEqual(120);
    }
  });

  it("labels are not generic — must not contain '相性抜群' or '最高の相性'", () => {
    for (const key of DIFFERENT_PAIR_KEYS) {
      const entry = differentArchetypeCompatibility[key];
      if (!entry) continue;
      expect(entry.label, `Generic label detected for ${key}`).not.toMatch(
        /相性抜群|最高の相性|相性ゼロ|最悪の相性/,
      );
    }
  });

  it("all 152 labels are unique", () => {
    const labels = DIFFERENT_PAIR_KEYS.map(
      (key) => differentArchetypeCompatibility[key]?.label ?? "",
    ).filter(Boolean);
    const uniqueLabels = new Set(labels);
    expect(uniqueLabels.size).toBe(labels.length);
  });
});
