import type { CharFeedback, YojiGuessFeedback } from "./types";

/**
 * Evaluate a 4-character guess against the target yoji.
 *
 * For each position:
 * - "correct" = character matches at this position
 * - "present" = character exists in target but at a different position
 * - "absent"  = character does not exist in target
 *
 * Handles duplicate characters correctly:
 * If target is "一期一会" and guess is "一一一一":
 *   Position 0: correct (一 is at position 0 in target)
 *   Position 1: absent  (一 is not at position 1, and the 2nd 一 in target is at position 2)
 *   Position 2: correct (一 is at position 2 in target)
 *   Position 3: absent  (no more 一 in target)
 */
export function evaluateGuess(
  guess: string,
  target: string,
): YojiGuessFeedback {
  const guessChars = [...guess];
  const targetChars = [...target];
  const result: CharFeedback[] = ["absent", "absent", "absent", "absent"];

  // Track which target positions have been "used"
  const targetUsed = [false, false, false, false];

  // Pass 1: Mark correct positions
  for (let i = 0; i < 4; i++) {
    if (guessChars[i] === targetChars[i]) {
      result[i] = "correct";
      targetUsed[i] = true;
    }
  }

  // Pass 2: Mark present (wrong position)
  for (let i = 0; i < 4; i++) {
    if (result[i] === "correct") continue;
    for (let j = 0; j < 4; j++) {
      if (!targetUsed[j] && guessChars[i] === targetChars[j]) {
        result[i] = "present";
        targetUsed[j] = true;
        break;
      }
    }
  }

  return {
    guess,
    charFeedbacks: result as [
      CharFeedback,
      CharFeedback,
      CharFeedback,
      CharFeedback,
    ],
  };
}

/**
 * Validate that the input is exactly 4 characters and
 * each character is a CJK Unified Ideograph (kanji).
 */
export function isValidYojiInput(input: string): boolean {
  const chars = [...input];
  if (chars.length !== 4) return false;
  // Accept CJK Unified Ideographs (U+4E00 to U+9FFF) and
  // CJK Extension A (U+3400 to U+4DBF)
  return chars.every((ch) => {
    const code = ch.codePointAt(0) ?? 0;
    return (
      (code >= 0x4e00 && code <= 0x9fff) || (code >= 0x3400 && code <= 0x4dbf)
    );
  });
}
