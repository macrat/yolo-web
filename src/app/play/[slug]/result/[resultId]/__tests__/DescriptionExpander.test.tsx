import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import DescriptionExpander from "../DescriptionExpander";

describe("DescriptionExpander", () => {
  it("descriptionテキストを表示する", () => {
    render(<DescriptionExpander description="テスト説明文" isLong={false} />);
    expect(screen.getByText("テスト説明文")).toBeInTheDocument();
  });

  it("isLong=falseの場合は「続きを読む」ボタンを表示しない", () => {
    render(<DescriptionExpander description="短い説明文" isLong={false} />);
    expect(screen.queryByText("続きを読む")).not.toBeInTheDocument();
  });

  it("isLong=trueの場合は「続きを読む」ボタンを表示する", () => {
    render(<DescriptionExpander description="長い説明文" isLong={true} />);
    expect(screen.getByText("続きを読む")).toBeInTheDocument();
  });

  it("「続きを読む」ボタンをクリックすると「折りたたむ」ボタンに変わる", () => {
    render(<DescriptionExpander description="長い説明文" isLong={true} />);
    const expandButton = screen.getByText("続きを読む");
    fireEvent.click(expandButton);
    expect(screen.getByText("折りたたむ")).toBeInTheDocument();
    expect(screen.queryByText("続きを読む")).not.toBeInTheDocument();
  });

  it("展開後に「折りたたむ」をクリックすると「続きを読む」ボタンに戻る", () => {
    render(<DescriptionExpander description="長い説明文" isLong={true} />);
    fireEvent.click(screen.getByText("続きを読む"));
    fireEvent.click(screen.getByText("折りたたむ"));
    expect(screen.getByText("続きを読む")).toBeInTheDocument();
  });
});
