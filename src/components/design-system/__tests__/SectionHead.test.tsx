import { describe, test, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { readFileSync } from "fs";
import { resolve } from "path";
import SectionHead from "../SectionHead";

describe("SectionHead", () => {
  // --- レンダリング ---

  test("renders title text", () => {
    render(<SectionHead title="使い方" />);
    expect(screen.getByText("使い方")).toBeInTheDocument();
  });

  test("renders title as heading", () => {
    render(<SectionHead title="使い方" />);
    expect(screen.getByRole("heading", { name: "使い方" })).toBeInTheDocument();
  });

  test("renders meta text when provided", () => {
    render(<SectionHead title="使い方" meta="3 steps" />);
    expect(screen.getByText("3 steps")).toBeInTheDocument();
  });

  test("does not render meta element when meta not provided", () => {
    render(<SectionHead title="使い方" />);
    // meta が無い場合は追加のspan等が存在しない
    expect(screen.queryByTestId("section-head-meta")).toBeNull();
  });

  // --- heading level ---

  test("renders as h2 by default", () => {
    render(<SectionHead title="タイトル" />);
    expect(
      screen.getByRole("heading", { level: 2, name: "タイトル" }),
    ).toBeInTheDocument();
  });

  test("renders as h3 when level=3", () => {
    render(<SectionHead title="タイトル" level={3} />);
    expect(
      screen.getByRole("heading", { level: 3, name: "タイトル" }),
    ).toBeInTheDocument();
  });

  // --- E-1: モバイル幅レイアウト（CSS 構造テスト） ---

  test("SectionHead.module.css contains @media (min-width: query or JSDoc note for mobile-first", () => {
    // SectionHead は flex + border-bottom のシンプルな構造。
    // タイトルに white-space: nowrap があるため、モバイルで折り返し対応が必要。
    const cssPath = resolve(__dirname, "../SectionHead.module.css");
    const css = readFileSync(cssPath, "utf-8");
    const hasMediaQuery = /@media\s*\(min-width:/.test(css);
    const hasMobileNote = /モバイル基準/.test(css);
    expect(hasMediaQuery || hasMobileNote).toBe(true);
  });
});
