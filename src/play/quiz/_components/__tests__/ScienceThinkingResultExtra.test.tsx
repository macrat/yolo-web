import { render, screen, within } from "@testing-library/react";
import { beforeAll, describe, expect, test, vi } from "vitest";
import scienceThinkingQuiz from "@/play/quiz/data/science-thinking";
import { renderScienceThinkingExtra } from "../ScienceThinkingResultExtra";

vi.mock("../InviteFriendButton", () => ({
  default: () => <div data-testid="invite" />,
}));

// jsdom は字を組まないので、Range の矩形を持たない（量の帯が字の幅を測る）。
beforeAll(() => {
  Range.prototype.getBoundingClientRect = function (this: Range) {
    const width = (this.startContainer.textContent ?? "").length * 10;
    return { width } as DOMRect;
  };
});

const firstChoices = scienceThinkingQuiz.questions.map((question) => ({
  questionId: question.id,
  choiceId: question.choices[0].id,
}));

function renderExtra(answers = firstChoices) {
  const resultId = scienceThinkingQuiz.results[0].id;
  return render(
    <>{renderScienceThinkingExtra(undefined, answers)(resultId)}</>,
  );
}

describe("ScienceThinkingResultExtra", () => {
  test("スコアの帯は軸ごとに満点に対する割合を言い、レーダーと同じ数値を持つ", () => {
    renderExtra();
    const list = screen.getByRole("list", { name: "あなたの思考プロフィール" });
    const rows = within(list)
      .getAllByRole("listitem")
      .map((item) => item.textContent ?? "");
    expect(rows.map((row) => row.replace(/\d+%$/, ""))).toEqual([
      "理論",
      "実験",
      "数値化",
      "観察",
      "創造",
    ]);
    for (const row of rows) {
      expect(row).toMatch(/^\D+\d{1,3}%$/);
      expect(row).not.toContain("/");
    }
    const radar = screen.getByRole("img");
    for (const row of rows) {
      expect(radar.textContent).toContain(row);
    }
  });

  test("答えが無いときは招待だけを出す", () => {
    renderExtra([]);
    expect(screen.getByTestId("invite")).toBeInTheDocument();
    expect(screen.queryByRole("list")).toBeNull();
  });
});
