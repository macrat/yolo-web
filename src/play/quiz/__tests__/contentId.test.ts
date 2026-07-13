import { describe, it, expect } from "vitest";
import { contentIdForQuiz } from "@/play/quiz/contentId";

describe("contentIdForQuiz", () => {
  it("prefixes the slug with 'quiz-'", () => {
    expect(contentIdForQuiz("character-personality")).toBe(
      "quiz-character-personality",
    );
  });

  it("matches the canonical literal used at existing call sites", () => {
    // Guards against drift from the "quiz-" + slug literals in
    // QuizContainer / ResultCard / ResultPageShell.
    const slug = "kanji-level";
    expect(contentIdForQuiz(slug)).toBe(`quiz-${slug}`);
  });

  it("does not mutate an already-prefixed-looking slug", () => {
    // The helper is a pure formatter: it always prepends the prefix and
    // never tries to detect or dedupe an existing one.
    expect(contentIdForQuiz("quiz-foo")).toBe("quiz-quiz-foo");
  });
});
