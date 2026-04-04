/**
 * Quality tests for behaviors and lifeAdvice in unexpected-compatibility results.
 *
 * R2-1: behaviors must not be paraphrases of description.
 *       Each item must not share a 15+ character exact substring with description.
 *       Applies to all 8 results (all in new variant format).
 *
 * R2-2: lifeAdvice must be diverse and action-oriented, not just generic praise.
 *       All 8 results use the new variant format with lifeAdvice.
 *       At least 6 out of 8 results must contain a specific action suggestion.
 *
 * All 8 results have been migrated to the new "unexpected-compatibility" variant format.
 */
import { describe, it, expect } from "vitest";
import type { UnexpectedCompatibilityDetailedContent } from "../../types";
import unexpectedCompatibilityQuiz from "../unexpected-compatibility";

const allResults = unexpectedCompatibilityQuiz.results;

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

describe("R2-1: behaviors must not paraphrase description", () => {
  it("all results: each behavior must not share a 15+ char exact substring with its description", () => {
    const violations: string[] = [];
    for (const result of allResults) {
      const behaviors = result.detailedContent?.behaviors ?? [];
      for (const behavior of behaviors) {
        if (hasLongOverlap(result.description, behavior, 15)) {
          violations.push(
            `${result.id}: behavior overlaps with description — "${behavior.slice(0, 40)}..."`,
          );
        }
      }
    }
    expect(violations, violations.join("\n")).toHaveLength(0);
  });
});

describe("R2-2: lifeAdvice must be diverse and action-oriented", () => {
  /**
   * Pattern for specific action suggestions.
   * Matches phrases that suggest doing something new or different.
   */
  const ACTION_ADVICE_PATTERN =
    /してみて|てみて|してみよう|してみると|してあげて|てあげて|してあげよう|を試して|を試してみて|に挑戦|してみる価値|を伝えて|を見せて|を使って|を活かして|踏み出|を始めて|に話して|を教えて|を磨いて|を広げて|を深めて|を書いて|動き出|を動かして|声に出|に出かけ|誰かに|一歩|を開いて|を試す|動いてみ|やってみ|みてほしい|してみな|を作って/;

  it("all results: at least 6 out of 8 contain a specific action suggestion in lifeAdvice", () => {
    const actionAdvices = allResults.filter((r) =>
      ACTION_ADVICE_PATTERN.test(
        (r.detailedContent as UnexpectedCompatibilityDetailedContent)
          ?.lifeAdvice ?? "",
      ),
    );

    const actionItems = actionAdvices.map(
      (r) =>
        `${r.id}: ${(r.detailedContent as UnexpectedCompatibilityDetailedContent)?.lifeAdvice}`,
    );

    expect(
      actionAdvices.length,
      `Only ${actionAdvices.length}/8 lifeAdvice texts contain action suggestions. Need at least 6.\nAction advices found:\n${actionItems.join("\n")}`,
    ).toBeGreaterThanOrEqual(6);
  });

  it("all results: lifeAdvice must not use the generic template '才能です' or '強みです'", () => {
    const GENERIC_TEMPLATE = /才能です|強みです/;
    const genericCount = allResults.filter((r) =>
      GENERIC_TEMPLATE.test(
        (r.detailedContent as UnexpectedCompatibilityDetailedContent)
          ?.lifeAdvice ?? "",
      ),
    ).length;

    // None should use this generic pattern
    expect(
      genericCount,
      `${genericCount}/8 lifeAdvice texts use generic '才能です/強みです' template. Must be 0.`,
    ).toBe(0);
  });
});
