import { expect, test, describe } from "vitest";
import { render, screen } from "@testing-library/react";
import StorybookPage from "../page";

describe("StorybookPage — Panel wrapping (指摘1)", () => {
  test("preview label for each section is rendered", () => {
    render(<StorybookPage />);

    // 各 preview セクションに Panel ラベルが表示されていること
    // (Panel コンポーネントの内側先頭に配置する previewLabel)
    expect(screen.getByText("Preview: Button")).toBeInTheDocument();
    expect(screen.getByText("Preview: Input")).toBeInTheDocument();
    expect(screen.getByText("Preview: Breadcrumb")).toBeInTheDocument();
    expect(screen.getByText("Preview: ToggleSwitch")).toBeInTheDocument();
    expect(screen.getByText("Preview: Panel")).toBeInTheDocument();
    expect(screen.getByText("Preview: カラーパレット")).toBeInTheDocument();
    expect(screen.getByText("Preview: 角丸・影")).toBeInTheDocument();
    expect(screen.getByText("Preview: 概要")).toBeInTheDocument();
  });

  test("overview text is rendered within the page", () => {
    render(<StorybookPage />);
    // 概要セクション内のテキストが存在すること
    expect(
      screen.getByText(/このページは開発者向けの参照ページで/),
    ).toBeInTheDocument();
  });
});

describe("StorybookPage — structure", () => {
  test("renders all section headings (h2)", () => {
    render(<StorybookPage />);
    // heading ロールで取得することで目次のリンクテキストと区別する
    expect(
      screen.getByRole("heading", { name: "2. カラーパレット" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "3. 角丸 / 影" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "4. Panel" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "5. Button" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "6. Input" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "7. Breadcrumb" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "8. ToggleSwitch" }),
    ).toBeInTheDocument();
  });

  test("renders page title (h1)", () => {
    render(<StorybookPage />);
    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Storybook（開発者向け）",
      }),
    ).toBeInTheDocument();
  });
});
