import { describe, test, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import ReservedResultArea from "@/play/games/shared/_components/new/ReservedResultArea";
import { resultAreaNames } from "@/play/games/shared/_lib/savedLayout";

const NAMES = resultAreaNames("game");

beforeEach(() => {
  localStorage.clear();
});

describe("ReservedResultArea", () => {
  test("keeps the reserved height and hides the input while it waits for the result", () => {
    render(
      <ReservedResultArea
        names={NAMES}
        showsResult={false}
        date="2026-09-27"
        difficulty="intermediate"
      >
        <p>入力欄</p>
      </ReservedResultArea>,
    );
    const content = screen.getByText("入力欄").parentElement!;
    expect(content.className).toMatch(/waiting/);
    // 部品の CSS が読む決まった名前の値に、このゲームの値の名前を写す。
    const style = content.parentElement!.getAttribute("style");
    expect(style).toContain(
      "--reserved-input-visibility: var(--game-input-visibility, visible)",
    );
    expect(style).toContain("--reserved-height: var(--game-result-height, 0)");
    expect(localStorage.getItem(NAMES.storageKey)).toBeNull();
  });

  test("remembers the height of the result it shows, with the day, difficulty and screen", () => {
    render(
      <ReservedResultArea
        names={NAMES}
        showsResult
        date="2026-09-27"
        difficulty="advanced"
      >
        <p>結果</p>
      </ReservedResultArea>,
    );
    expect(screen.getByText("結果").parentElement!.className).toBe("");
    const saved = JSON.parse(localStorage.getItem(NAMES.storageKey)!);
    expect(saved).toMatchObject({
      date: "2026-09-27",
      difficulty: "advanced",
      viewportWidth: window.innerWidth,
      height: 0,
    });
  });
});
