/**
 * Quality tests for diagnosisCore/traits and practicalTip/advice in impossible-advice results.
 *
 * R2-1: diagnosisCore (converted results) and traits (standard results) must not be paraphrases
 *       of the result's description.
 *       Each item must not share a 15+ character exact substring with description.
 *
 * R2-2: practicalTip (converted results) and advice (standard results) must be action-oriented.
 *       At least 5 out of 7 results must contain a specific action suggestion.
 *       Generic template ('才能です/強みです') must be used in 3 or fewer results.
 */
import { describe, it, expect } from "vitest";
import type { ImpossibleAdviceDetailedContent } from "../../types";
import impossibleAdviceQuiz from "../impossible-advice";

const allResults = impossibleAdviceQuiz.results;

/** IDs converted to ImpossibleAdviceDetailedContent variant (all 7) */
const CONVERTED_IDS = [
  "timemagician",
  "gravityfighter",
  "digitalmonk",
  "sleeparchitect",
  "conversationsamurai",
  "weathercontroller",
  "snackphilosopher",
];

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

describe("R2-1: diagnosisCore/traits and behaviors must not paraphrase description", () => {
  it("diagnosisCore must not share a 15+ char exact substring with its description (converted results)", () => {
    const violations: string[] = [];
    for (const result of allResults.filter((r) =>
      CONVERTED_IDS.includes(r.id),
    )) {
      const { diagnosisCore } =
        result.detailedContent as ImpossibleAdviceDetailedContent;
      if (hasLongOverlap(result.description, diagnosisCore, 15)) {
        violations.push(
          `${result.id}: diagnosisCore overlaps with description — "${diagnosisCore.slice(0, 40)}..."`,
        );
      }
    }
    expect(violations, violations.join("\n")).toHaveLength(0);
  });

  it("each behavior must not share a 15+ char exact substring with its description", () => {
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

describe("R2-2: practicalTip/advice must be diverse and action-oriented", () => {
  /**
   * Pattern for specific action suggestions.
   * Matches phrases that suggest doing something new or different.
   */
  const ACTION_ADVICE_PATTERN =
    /してみて|てみて|してみよう|してみると|してあげて|してあげよう|を試して|を試してみて|に挑戦|してみる価値|を伝えて|を見せて|を使って|を活かして|踏み出|を始めて|に話して|を教えて|を磨いて|を広げて|を深めて|を書いて|動き出|を動かして|声に出|に出かけ|誰かに|一歩|を開いて|を試す|動いてみ|やってみ|みてほしい|してみな|置いてみ/;

  /**
   * Get the action-oriented text for a result (practicalTip from converted format).
   */
  function getActionText(result: (typeof allResults)[0]): string {
    return (
      (result.detailedContent as ImpossibleAdviceDetailedContent)
        ?.practicalTip ?? ""
    );
  }

  it("at least 5 out of 7 results contain a specific action suggestion in practicalTip/advice", () => {
    const actionResults = allResults.filter((r) =>
      ACTION_ADVICE_PATTERN.test(getActionText(r)),
    );

    const actionItems = actionResults.map(
      (r) => `${r.id}: ${getActionText(r)}`,
    );

    expect(
      actionResults.length,
      `Only ${actionResults.length}/7 have action suggestions. Need at least 5.\nAction items found:\n${actionItems.join("\n")}`,
    ).toBeGreaterThanOrEqual(5);
  });

  it("practicalTip/advice must not use the generic template '才能です' or '強みです' for all 7 results", () => {
    const GENERIC_TEMPLATE = /才能です|強みです/;
    const genericCount = allResults.filter((r) =>
      GENERIC_TEMPLATE.test(getActionText(r)),
    ).length;

    // Allow at most 3 out of 7 to use this pattern (majority must be different)
    expect(
      genericCount,
      `${genericCount}/7 use generic '才能です/強みです' template. Must be 3 or fewer.`,
    ).toBeLessThanOrEqual(3);
  });
});
