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
  test("解き終えた画面では、来訪者と友達の立場で2人のタイプを言い、相性の名前を h3 にする", () => {
    render(<CompatibilitySection {...props} placement="solvedScreen" />);
    expect(screen.getByText("友達との相性")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 3, name: "静と動の名コンビ" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("あなたは「タイプA」、友達は「タイプB」。"),
    ).toBeInTheDocument();
    expect(screen.getByText("説明の文")).toBeInTheDocument();
    expect(screen.getByTestId("share")).toHaveTextContent(
      "私は「タイプA」、友達は「タイプB」。相性は「静と動の名コンビ」でした！",
    );
  });

  test("結果のページでは、立場を言わずに2人のタイプを並べ、相性の名前を区切りどおりの h3 にする", () => {
    render(
      <CompatibilitySection
        {...props}
        placement="resultPage"
        labelHeading={{ phrases: ["静と動の", "名コンビ"] }}
      />,
    );
    expect(
      screen.getByText("「タイプA」と「タイプB」の相性"),
    ).toBeInTheDocument();
    expect(screen.queryByText(/あなた|友達との/)).toBeNull();
    const heading = screen.getByRole("heading", {
      level: 3,
      name: "静と動の名コンビ",
    });
    expect(heading.querySelectorAll("wbr")).toHaveLength(1);
  });
});
