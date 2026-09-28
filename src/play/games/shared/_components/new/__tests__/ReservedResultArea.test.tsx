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
    expect(content.parentElement!.className).toMatch(/waitingArea/);
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
    const content = screen.getByText("結果").parentElement!;
    expect(content.className).toBe("");
    // 結果が出たら、取っておいた高さを使わない（覚えた高さと合わなくても、結果の下に空きを残さない）。
    expect(content.parentElement!.className).toBe("");
    const saved = JSON.parse(localStorage.getItem(NAMES.storageKey)!);
    expect(saved).toEqual({
      date: "2026-09-27",
      difficulty: "advanced",
      heights: {
        [`${window.innerWidth}|${getComputedStyle(document.documentElement).fontSize}`]: 0,
      },
    });
  });
});
