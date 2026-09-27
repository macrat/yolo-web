import { afterEach, expect, test, vi } from "vitest";
import { act, render, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import NextPuzzleTime from "../NextPuzzleTime";

afterEach(() => {
  vi.useRealTimers();
});

test("次の問題が出る日本時間の時刻を1つの文で言う", () => {
  vi.useFakeTimers({ toFake: ["Date"] });
  // 2026-09-26 23:59:59 JST
  vi.setSystemTime(new Date("2026-09-26T14:59:59Z"));
  render(<NextPuzzleTime />);
  expect(
    screen.getByText("次の問題は 9月27日 0:00（日本時間）に出ます"),
  ).toBeInTheDocument();
});

test("日本時間の日付が替わった直後は、次の日の時刻を言う", () => {
  vi.useFakeTimers({ toFake: ["Date"] });
  // 2026-09-27 00:00:00 JST
  vi.setSystemTime(new Date("2026-09-26T15:00:00Z"));
  render(<NextPuzzleTime />);
  expect(
    screen.getByText("次の問題は 9月28日 0:00（日本時間）に出ます"),
  ).toBeInTheDocument();
});

test("時刻を刻み続けない（1秒たっても同じ文のまま、書き換わる時刻の表示を持たない）", () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-09-26T10:00:00Z"));
  const { container } = render(<NextPuzzleTime />);
  const before = container.textContent;
  vi.advanceTimersByTime(1000);
  expect(container.textContent).toBe(before);
  expect(container.textContent).not.toMatch(/\d{2}:\d{2}:\d{2}/);
});

test("開いたまま日本時間の 0:00 を過ぎたら、次の日の時刻に替わる", () => {
  vi.useFakeTimers();
  // 2026-09-26 23:50 JST
  vi.setSystemTime(new Date("2026-09-26T14:50:00Z"));
  render(<NextPuzzleTime />);
  expect(
    screen.getByText("次の問題は 9月27日 0:00（日本時間）に出ます"),
  ).toBeInTheDocument();

  act(() => {
    vi.advanceTimersByTime(10 * 60 * 1000);
  });
  expect(
    screen.getByText("次の問題は 9月28日 0:00（日本時間）に出ます"),
  ).toBeInTheDocument();

  act(() => {
    vi.advanceTimersByTime(24 * 60 * 60 * 1000);
  });
  expect(
    screen.getByText("次の問題は 9月29日 0:00（日本時間）に出ます"),
  ).toBeInTheDocument();
});

test("待つのは次の 0:00 の1つだけで、外したら止める", () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-09-26T10:00:00Z"));
  const { unmount } = render(<NextPuzzleTime />);
  expect(vi.getTimerCount()).toBe(1);
  unmount();
  expect(vi.getTimerCount()).toBe(0);
});

test("サーバーでは描かない（端末の今から決まる時刻を、水和で食い違わせない）", () => {
  expect(renderToString(<NextPuzzleTime />)).toBe("");
});
