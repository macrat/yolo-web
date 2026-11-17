import { describe, test, expect } from "vitest";
import { gameBySlug } from "@/play/games/registry";
import { FEEDBACK_MARKS } from "../feedbackMarks";

describe("FEEDBACK_MARKS", () => {
  test("uses the same marks and words as the legend above the board", () => {
    const legend = gameBySlug.get("yoji-kimeru")!.legend!;
    expect([
      FEEDBACK_MARKS.correct,
      FEEDBACK_MARKS.present,
      FEEDBACK_MARKS.absent,
    ]).toEqual(legend.entries);
  });
});
