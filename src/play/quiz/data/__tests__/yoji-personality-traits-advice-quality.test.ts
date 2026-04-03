/**
 * Quality tests for traits and advice in yoji-personality results.
 *
 * NOTE: As of the new variant format rollout, the first 4 results (shoshikantetsu,
 * tenshinranman, sessatakuma, ichigoichie) use YojiPersonalityDetailedContent format
 * which has no traits/advice fields. These tests apply only to results still in the
 * old QuizResultDetailedContent format (variant === undefined).
 *
 * R2-1: traits must not be paraphrases of description.
 *       Each trait item must not share a 15+ character exact substring with description.
 *
 * R2-2: advice must be diverse and action-oriented, not just generic praise.
 *       Results still in old format must contain a specific action suggestion.
 */
import { describe, it, expect } from "vitest";
import type { QuizResultDetailedContent } from "../../types";
import yojiPersonalityQuiz from "../yoji-personality";

const allResults = yojiPersonalityQuiz.results;

/** Results still using old QuizResultDetailedContent format (no variant field) */
const oldFormatResults = allResults.filter(
  (r) => r.detailedContent?.variant === undefined,
);

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

describe("R2-1: traits must not paraphrase description", () => {
  it("each trait (old format only) must not share a 15+ char exact substring with its description", () => {
    const violations: string[] = [];
    for (const result of oldFormatResults) {
      const traits =
        (result.detailedContent as QuizResultDetailedContent)?.traits ?? [];
      for (const trait of traits) {
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

describe("R2-2: advice must be diverse and action-oriented", () => {
  /**
   * Pattern for specific action suggestions.
   * Matches phrases that suggest doing something new or different.
   */
  const ACTION_ADVICE_PATTERN =
    /してみて|てみて|してみよう|してみると|してあげて|してあげよう|を試して|を試してみて|に挑戦|してみる価値|を伝えて|を見せて|を使って|を活かして|踏み出|を始めて|に話して|を教えて|を磨いて|を広げて|を深めて|を書いて|動き出|を動かして|声に出|に出かけ|誰かに|一歩|を開いて|を試す|動いてみ|やってみ|みてほしい|してみな/;

  it("all old-format results contain a specific action suggestion in advice", () => {
    const actionAdvices = oldFormatResults.filter((r) =>
      ACTION_ADVICE_PATTERN.test(
        (r.detailedContent as QuizResultDetailedContent)?.advice ?? "",
      ),
    );

    const actionItems = actionAdvices.map(
      (r) =>
        `${r.id}: ${(r.detailedContent as QuizResultDetailedContent)?.advice}`,
    );

    expect(
      actionAdvices.length,
      `Only ${actionAdvices.length}/${oldFormatResults.length} advices contain action suggestions. Need all.\nAction advices found:\n${actionItems.join("\n")}`,
    ).toBeGreaterThanOrEqual(oldFormatResults.length);
  });

  it("advice must not use the generic template '才能です' or '強みです'", () => {
    const GENERIC_TEMPLATE = /才能です|強みです/;
    const genericCount = oldFormatResults.filter((r) =>
      GENERIC_TEMPLATE.test(
        (r.detailedContent as QuizResultDetailedContent)?.advice ?? "",
      ),
    ).length;

    // Allow at most 1 out of old-format results to use this pattern
    expect(
      genericCount,
      `${genericCount}/${oldFormatResults.length} advices use generic '才能です/強みです' template. Must be 1 or fewer.`,
    ).toBeLessThanOrEqual(1);
  });
});
