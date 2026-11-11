import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { readFileSync } from "fs";
import { resolve } from "path";
import ToolErrorBoundary from "../ErrorBoundary";
import styles from "../ErrorBoundary.module.css";

function Broken(): never {
  throw new Error("描けない");
}

const css = readFileSync(
  resolve(__dirname, "../ErrorBoundary.module.css"),
  "utf-8",
);

describe("ToolErrorBoundary", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("子が投げなければ、子をそのまま描く", () => {
    render(
      <ToolErrorBoundary>
        <p>道具の本体</p>
      </ToolErrorBoundary>,
    );
    expect(screen.getByText("道具の本体")).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("子が投げたら、知らせの中に小見出しの h2 と、どうすればよいかを言う文を出す", () => {
    // React が投げられた例外を console.error に書くので、試験の出力から外す
    vi.spyOn(console, "error").mockImplementation(() => {});
    render(
      <ToolErrorBoundary>
        <Broken />
      </ToolErrorBoundary>,
    );
    const alert = screen.getByRole("alert");
    const heading = within(alert).getByRole("heading", { level: 2 });
    expect(heading).toHaveTextContent("ツールの読み込みでエラーが発生しました");
    expect(heading.innerHTML).toBe(
      ["ツールの", "読み込みで", "エラーが", "発生しました"].join("<wbr>"),
    );
    const text = within(alert).getByText(
      "ページを再読み込みしてください。問題が続く場合は、しばらく時間をおいてからお試しください。",
    );
    expect(text.tagName).toBe("P");
    expect(heading).toHaveClass(styles.heading);
    expect(text).toHaveClass(styles.text);
  });

  it("知らせは枠や地の見た目を持たない（クラスを付けない）", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    render(
      <ToolErrorBoundary>
        <Broken />
      </ToolErrorBoundary>,
    );
    expect(screen.getByRole("alert")).not.toHaveAttribute("class");
  });

  it("CSS: 見出しはセクションの中の小見出しの段で、行間は h2 の既定（§4 の 1.25）に任せる", () => {
    const heading = css.match(/\.heading\s*\{[^}]*\}/)?.[0] ?? "";
    expect(heading).toContain("font-size: var(--text-heading-sub)");
    expect(heading).not.toMatch(/line-height|font-family|color\s*:/);
  });

  it("CSS: 文は本文の大きさと色のまま（§8）、本文の幅で折り返す", () => {
    const text = css.match(/\.text\s*\{[^}]*\}/)?.[0] ?? "";
    expect(text).toContain("max-width: var(--measure)");
    expect(text).not.toMatch(/font-size|color\s*:/);
  });

  it("CSS: 枠・角丸・地・強調の色を持たない（DESIGN.md §5・§8）", () => {
    expect(css).not.toMatch(/border|radius|background|--accent|box-shadow/);
  });
});
