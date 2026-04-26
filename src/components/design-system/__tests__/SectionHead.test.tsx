import { describe, test, expect } from "vitest";
import { render, screen } from "@testing-library/react";
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
});
