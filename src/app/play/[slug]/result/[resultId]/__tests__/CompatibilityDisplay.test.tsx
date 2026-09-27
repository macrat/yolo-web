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
    // 開くのは共有を受け取った人なので、2人のタイプを立場を言わずに並べる
    expect(
      screen.getByText("「タイプA」と「タイプB」の相性"),
    ).toBeInTheDocument();
    expect(screen.queryByText(/あなたは/)).toBeNull();
  });

  it("相性の名前の見出しを、サーバーで作った文節の区切りで組む", () => {
    render(
      <CompatibilityDisplay
        quizSlug="animal-personality"
        quizTitle="日本の固有種診断"
        compatibility={{
          label: "静かな書斎と賑やかな寄席",
          description: "説明",
        }}
        myType={{ id: "a", title: "A" }}
        friendType={{ id: "b", title: "B" }}
      />,
    );
    const heading = screen.getByRole("heading", {
      level: 2,
      name: "静かな書斎と賑やかな寄席",
    });
    expect(heading.querySelectorAll("wbr").length).toBeGreaterThan(0);
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
      screen.getByText("「ロックタイプ」と「ジャズタイプ」の相性"),
    ).toBeInTheDocument();
  });
});
