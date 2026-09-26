import { render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import CompatibilitySection from "../CompatibilitySection";

vi.mock("@/components/ShareButtons", () => ({
  default: ({ text }: { text: string }) => <p data-testid="share">{text}</p>,
}));

const props = {
  myType: { id: "a", title: "タイプA" },
  friendType: { id: "b", title: "タイプB" },
  compatibility: { label: "静と動の名コンビ", description: "説明の文" },
  quizTitle: "テスト診断",
  quizSlug: "test-quiz",
};

describe("CompatibilitySection", () => {
  test("相性の名前を見出しにし、2人のタイプと説明を続ける", () => {
    render(<CompatibilitySection {...props} />);
    expect(
      screen.getByRole("heading", { level: 3, name: "静と動の名コンビ" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("あなたは「タイプA」、友達は「タイプB」。"),
    ).toBeInTheDocument();
    expect(screen.getByText("説明の文")).toBeInTheDocument();
    expect(screen.getByTestId("share")).toHaveTextContent(
      "私は「タイプA」、友達は「タイプB」。相性は「静と動の名コンビ」でした!",
    );
  });

  test("結果のページでは、相性の名前の見出しが h2 になる", () => {
    render(<CompatibilitySection {...props} placement="resultPage" />);
    expect(
      screen.getByRole("heading", { level: 2, name: "静と動の名コンビ" }),
    ).toBeInTheDocument();
  });
});
