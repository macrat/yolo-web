/**
 * Quality tests for traits and advice in character-personality results.
 *
 * R1-1: traits must not be paraphrases of description.
 *       Each trait item must not share a 15+ character exact substring with description.
 *
 * R1-4: advice must be diverse and action-oriented, not just generic praise.
 *       At least 8 out of 24 results must contain a specific action suggestion
 *       (e.g., "〜してみて", "〜してみよう", "〜してあげて", "〜を試して", etc.)
 *       rather than only affirming the current state.
 */
import { describe, it, expect } from "vitest";
import { resultsBatch1 } from "../character-personality-results-batch1";
import { resultsBatch2 } from "../character-personality-results-batch2";
import { resultsBatch3 } from "../character-personality-results-batch3";

const allResults = [...resultsBatch1, ...resultsBatch2, ...resultsBatch3];

/**
 * Returns true if str contains any substring of length >= minLen from source.
 */
function hasLongOverlap(source: string, str: string, minLen: number): boolean {
  for (let i = 0; i <= source.length - minLen; i++) {
    const sub = source.slice(i, i + minLen);
    if (str.includes(sub)) {
      return true;
    }
  }
  return false;
}

describe("R1-1: traits must not paraphrase description", () => {
  it("each trait must not share a 15+ char exact substring with its description", () => {
    const violations: string[] = [];
    for (const result of allResults) {
      for (const trait of result.detailedContent.traits) {
        if (hasLongOverlap(result.description, trait, 15)) {
          violations.push(
            `${result.id}: trait overlaps with description — "${trait.slice(0, 40)}..."`,
          );
        }
      }
    }
    expect(violations, violations.join("\n")).toHaveLength(0);
  });
});

describe("R1-4: advice must be diverse and action-oriented", () => {
  /**
   * Pattern for specific action suggestions.
   * Matches phrases that suggest doing something new or different.
   */
  const ACTION_ADVICE_PATTERN =
    /してみて|してみよう|してみると|してあげて|してあげると|を試して|を試してみて|に挑戦|してみる価値|を伝えて|を見せて|を使って|を活かして|踏み出|を始めて|に話して|を教えて|を磨いて|を広げて|を深めて|を書いて|動き出|を動かして|声に出|に出かけ|次の.*計画|誰かに|一歩|を開いて|を試す/;

  it("at least 8 out of 24 results contain a specific action suggestion in advice", () => {
    const actionAdvices = allResults.filter((r) =>
      ACTION_ADVICE_PATTERN.test(r.detailedContent.advice),
    );

    const actionItems = actionAdvices.map(
      (r) => `${r.id}: ${r.detailedContent.advice}`,
    );

    expect(
      actionAdvices.length,
      `Only ${actionAdvices.length}/24 advices contain action suggestions. Need at least 8.\nAction advices found:\n${actionItems.join("\n")}`,
    ).toBeGreaterThanOrEqual(8);
  });
});
