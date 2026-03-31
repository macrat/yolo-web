/**
 * Quality tests for traits/advice (standard format) and characterMessage (CharacterFortune format).
 *
 * R2-1: traits (standard results only) must not be paraphrases of description.
 *       Each trait item must not share a 15+ character exact substring with description.
 *
 * R2-2: action orientation check.
 *       - For CharacterFortuneDetailedContent results: characterMessage must contain a specific action suggestion.
 *       At least 5 out of 6 results must satisfy this criterion.
 *
 * Note: All 6 results now use CharacterFortuneDetailedContent (variant: "character-fortune").
 */
import { describe, it, expect } from "vitest";
import type {
  QuizResultDetailedContent,
  CharacterFortuneDetailedContent,
} from "../../types";
import characterFortuneQuiz from "../character-fortune";

const allResults = characterFortuneQuiz.results;

/** IDs that use CharacterFortuneDetailedContent — currently all 6 results */
const characterFortuneIds = new Set([
  "commander",
  "professor",
  "dreamer",
  "artist",
  "trickster",
  "guardian",
]);

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
  it("each trait must not share a 15+ char exact substring with its description", () => {
    const violations: string[] = [];
    for (const result of allResults) {
      if (characterFortuneIds.has(result.id)) continue; // CharacterFortune results have no traits
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

describe("R2-2: action orientation check", () => {
  /**
   * Pattern for specific action suggestions.
   * Matches phrases that suggest doing something new or different.
   */
  const ACTION_ADVICE_PATTERN =
    /してみて|てみて|してみよう|してみると|してあげて|してあげよう|を試して|を試してみて|に挑戦|してみる価値|を伝えて|を見せて|を使って|を活かして|踏み出|を始めて|に話して|を教えて|を磨いて|を広げて|を深めて|を書いて|動き出|を動かして|声に出|に出かけ|誰かに|一歩|を開いて|を試す|動いてみ|やってみ|みてほしい|してみな/;

  it("at least 5 out of 6 results contain a specific action suggestion in advice or characterMessage", () => {
    const actionResults = allResults.filter((r) => {
      if (characterFortuneIds.has(r.id)) {
        // Use characterMessage for CharacterFortuneDetailedContent results
        return ACTION_ADVICE_PATTERN.test(
          (r.detailedContent as CharacterFortuneDetailedContent)
            ?.characterMessage ?? "",
        );
      } else {
        // Use advice for standard results
        return ACTION_ADVICE_PATTERN.test(
          (r.detailedContent as QuizResultDetailedContent)?.advice ?? "",
        );
      }
    });

    const actionItems = actionResults.map((r) => {
      const text = characterFortuneIds.has(r.id)
        ? (r.detailedContent as CharacterFortuneDetailedContent)
            ?.characterMessage
        : (r.detailedContent as QuizResultDetailedContent)?.advice;
      return `${r.id}: ${text}`;
    });

    expect(
      actionResults.length,
      `Only ${actionResults.length}/6 results contain action suggestions. Need at least 5.\nAction items found:\n${actionItems.join("\n")}`,
    ).toBeGreaterThanOrEqual(5);
  });

  it("advice/characterMessage must not use the generic template '才能です' or '強みです' for all 6 results", () => {
    const GENERIC_TEMPLATE = /才能です|強みです/;
    const genericCount = allResults.filter((r) => {
      const text = characterFortuneIds.has(r.id)
        ? ((r.detailedContent as CharacterFortuneDetailedContent)
            ?.characterMessage ?? "")
        : ((r.detailedContent as QuizResultDetailedContent)?.advice ?? "");
      return GENERIC_TEMPLATE.test(text);
    }).length;

    // Allow at most 2 out of 6 to use this pattern (majority must be different)
    expect(
      genericCount,
      `${genericCount}/6 results use generic '才能です/強みです' template. Must be 2 or fewer.`,
    ).toBeLessThanOrEqual(2);
  });
});
