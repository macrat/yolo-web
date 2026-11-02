/**
 * QuestionCard — 問の見出しと選択肢の面の区切り。受け取った区切りのあいだにだけ <wbr> を置き、押す前のボタンの面と
 * 答えたあとの字を同じ区切りで組む（DESIGN.md §4）。全15本の全問で確かめる。
 */
import { describe, expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import QuestionCard from "../QuestionCard";
import { joinDashes } from "@/lib/phrase-dashes";
import { questionPhrases } from "../../questionPhrases";
import { quizBySlug } from "../../registry";
import type { QuizDefinition, QuizQuestion } from "../../types";

/**
 * 要素の中を <wbr> で分けた字の並び。中は字と <wbr> だけで、<wbr> が頭・終わり・続けて現れると空の字が並びに入る。
 */
function segmentsOf(element: Element): string[] {
  const segments = [""];
  for (const node of element.childNodes) {
    if (node.nodeName === "WBR") {
      segments.push("");
    } else if (node.nodeType === Node.TEXT_NODE) {
      segments[segments.length - 1] += node.textContent;
    } else {
      throw new Error(`字と <wbr> のほかの要素がある: ${node.nodeName}`);
    }
  }
  return segments;
}

/** 選択肢の行の、面の字を組む要素（ボタンの中か、答えたあとの字の箱の中の span）。 */
function faceTextOf(row: Element): Element {
  const face = row.querySelector("button > span, li > span > span");
  if (!face) throw new Error("面の字が無い");
  return face;
}

function renderQuestion(
  quiz: QuizDefinition,
  question: QuizQuestion,
  answeredChoiceId: string | undefined,
): void {
  render(
    <QuestionCard
      question={question}
      phrases={questionPhrases(quiz)[question.id]}
      quizType={quiz.meta.type}
      answeredChoiceId={answeredChoiceId}
      onAnswer={() => {}}
      onNext={() => {}}
      headingRef={null}
      choicesRef={null}
      pressedRowRef={null}
      correctRowRef={null}
      nextButtonRef={null}
    />,
  );
}

/** 選択肢ごとの、区切りのあいだで分けた字の並びを、並びの順に依らない形にしたもの。 */
function sortedFaces(faces: string[][]): string[] {
  return faces.map((face) => JSON.stringify(face)).sort();
}

const questions = [...quizBySlug.values()].flatMap((quiz) =>
  quiz.questions.map(
    (question) => [`${quiz.meta.slug}/${question.id}`, quiz, question] as const,
  ),
);

describe("QuestionCard — 区切り", () => {
  test.each(questions)(
    "%s: 見出しと選択肢の面は、受け取った区切りのあいだにだけ <wbr> を置く",
    (_label, quiz, question) => {
      const phrases = questionPhrases(quiz)[question.id];
      const expectedFaces = sortedFaces(
        question.choices.map((choice) =>
          phrases.choices[choice.id].map(joinDashes),
        ),
      );
      const facesOnScreen = (): string[] =>
        sortedFaces(
          screen
            .getAllByRole("listitem")
            .map((row) => segmentsOf(faceTextOf(row))),
        );

      renderQuestion(quiz, question, undefined);
      const heading = screen.getByRole("heading", { level: 2 });
      expect(segmentsOf(heading)).toEqual(
        phrases.heading.phrases.map(joinDashes),
      );
      expect(screen.getAllByRole("button")).toHaveLength(
        question.choices.length,
      );
      expect(facesOnScreen()).toEqual(expectedFaces);
    },
  );

  test.each(questions)(
    "%s: 答えたあとの字も、ボタンの面と同じ区切りで組む",
    (_label, quiz, question) => {
      const phrases = questionPhrases(quiz)[question.id];
      renderQuestion(quiz, question, question.choices[0].id);
      expect(
        screen.queryAllByRole("button", { name: question.choices[0].text }),
      ).toHaveLength(0);
      expect(
        sortedFaces(
          screen
            .getAllByRole("listitem")
            .map((row) => segmentsOf(faceTextOf(row))),
        ),
      ).toEqual(
        sortedFaces(
          question.choices.map((choice) =>
            phrases.choices[choice.id].map(joinDashes),
          ),
        ),
      );
    },
  );

  test("見出しは書体の属性を受け取ったとおりに持つ", () => {
    const quiz = [...quizBySlug.values()][0];
    const question = quiz.questions[0];
    const phrases = questionPhrases(quiz)[question.id];
    render(
      <QuestionCard
        question={question}
        phrases={{
          ...phrases,
          heading: { ...phrases.heading, "data-heading-font": "fallback" },
        }}
        quizType={quiz.meta.type}
        answeredChoiceId={undefined}
        onAnswer={() => {}}
        onNext={() => {}}
        headingRef={null}
        choicesRef={null}
        pressedRowRef={null}
        correctRowRef={null}
        nextButtonRef={null}
      />,
    );
    expect(screen.getByRole("heading", { level: 2 })).toHaveAttribute(
      "data-heading-font",
      "fallback",
    );
  });
});
