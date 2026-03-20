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

    expect(screen.getByText("最高の相性")).toBeInTheDocument();
    expect(screen.getByText("相性の説明")).toBeInTheDocument();
    expect(screen.getByText("タイプA")).toBeInTheDocument();
    expect(screen.getByText("タイプB")).toBeInTheDocument();
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

    expect(screen.getByText("リズムの相性")).toBeInTheDocument();
    expect(screen.getByText("ロックタイプ")).toBeInTheDocument();
    expect(screen.getByText("ジャズタイプ")).toBeInTheDocument();
  });
});
