import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import CompatibilityDisplay from "../CompatibilityDisplay";

describe("CompatibilityDisplay", () => {
  it("renders compatibility section with required props", () => {
    render(
      <CompatibilityDisplay
        quizSlug="character-personality"
        quizTitle="あなたに似たキャラ診断"
        compatibility={{
          label: "最高の相性",
          description: "相性の説明",
        }}
        myType={{ id: "type-a", title: "タイプA", icon: "🌟" }}
        friendType={{ id: "type-b", title: "タイプB", icon: "🎯" }}
      />,
    );

    // 結果のページではタイプ名が h1 なので、相性の見出しはその下の h2
    expect(
      screen.getByRole("heading", { level: 2, name: "最高の相性" }),
    ).toBeInTheDocument();
    expect(screen.getByText("相性の説明")).toBeInTheDocument();
    expect(
      screen.getByText("あなたは「タイプA」、友達は「タイプB」。"),
    ).toBeInTheDocument();
  });

  it("renders compatibility section for music-personality quiz", () => {
    render(
      <CompatibilityDisplay
        quizSlug="music-personality"
        quizTitle="音楽パーソナリティ診断"
        compatibility={{
          label: "リズムの相性",
          description: "音楽的に相性がいい",
        }}
        myType={{ id: "type-x", title: "ロックタイプ" }}
        friendType={{ id: "type-y", title: "ジャズタイプ" }}
      />,
    );

    expect(
      screen.getByRole("heading", { level: 2, name: "リズムの相性" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("あなたは「ロックタイプ」、友達は「ジャズタイプ」。"),
    ).toBeInTheDocument();
  });
});
