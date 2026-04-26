import { describe, test, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import ArticleArea from "../ArticleArea";

describe("ArticleArea", () => {
  // --- レンダリング ---

  test("renders children", () => {
    render(<ArticleArea>記事本文</ArticleArea>);
    expect(screen.getByText("記事本文")).toBeInTheDocument();
  });

  test("renders title when provided", () => {
    render(<ArticleArea title="タイトル">content</ArticleArea>);
    expect(screen.getByText("タイトル")).toBeInTheDocument();
  });

  test("does not render title element when title not provided", () => {
    render(<ArticleArea>content</ArticleArea>);
    // titleがない場合、h1/h2要素が存在しない
    expect(screen.queryByRole("heading")).toBeNull();
  });

  test("renders meta when provided alongside title", () => {
    // meta は title と組み合わせてタイトル行に表示される。title なしでは非表示。
    render(
      <ArticleArea title="タイトル" meta="2026-04-27">
        content
      </ArticleArea>,
    );
    expect(screen.getByText("2026-04-27")).toBeInTheDocument();
  });

  test("renders steps list when steps provided", () => {
    const steps = ["手順1", "手順2", "手順3"];
    render(<ArticleArea steps={steps}>content</ArticleArea>);
    expect(screen.getByText("手順1")).toBeInTheDocument();
    expect(screen.getByText("手順2")).toBeInTheDocument();
    expect(screen.getByText("手順3")).toBeInTheDocument();
  });

  test("renders step numbers with zero-padding", () => {
    const steps = ["手順1"];
    render(<ArticleArea steps={steps}>content</ArticleArea>);
    expect(screen.getByText("01")).toBeInTheDocument();
  });

  test("renders related items when provided", () => {
    const related = [
      { href: "/tools/timer", label: "タイマー", tag: "ツール" },
    ];
    render(<ArticleArea related={related}>content</ArticleArea>);
    expect(screen.getByText("タイマー")).toBeInTheDocument();
  });

  // --- アクセシビリティ ---

  test("renders as article landmark", () => {
    render(<ArticleArea>content</ArticleArea>);
    expect(screen.getByRole("article")).toBeInTheDocument();
  });

  test("title is rendered as heading", () => {
    render(<ArticleArea title="見出し">content</ArticleArea>);
    expect(screen.getByRole("heading", { name: "見出し" })).toBeInTheDocument();
  });

  test("steps section has accessible heading", () => {
    render(<ArticleArea steps={["手順"]}>content</ArticleArea>);
    // ステップセクションに見出しが付いている
    expect(screen.getByRole("heading", { name: /使い方/ })).toBeInTheDocument();
  });

  test("steps section aria-labelledby references the section heading id", () => {
    render(<ArticleArea steps={["手順"]}>content</ArticleArea>);
    const heading = screen.getByRole("heading", { name: /使い方/ });
    const headingId = heading.getAttribute("id");
    // id が存在する
    expect(headingId).toBeTruthy();
    // section の aria-labelledby が同じ id を参照している
    const section = heading.closest("section");
    expect(section).toHaveAttribute("aria-labelledby", headingId);
  });

  test("related section has accessible heading", () => {
    const related = [{ href: "/tools/a", label: "A", tag: "ツール" }];
    render(<ArticleArea related={related}>content</ArticleArea>);
    expect(screen.getByRole("heading", { name: /関連/ })).toBeInTheDocument();
  });

  test("related section aria-labelledby references the section heading id", () => {
    const related = [{ href: "/tools/a", label: "A", tag: "ツール" }];
    render(<ArticleArea related={related}>content</ArticleArea>);
    const heading = screen.getByRole("heading", { name: /関連/ });
    const headingId = heading.getAttribute("id");
    expect(headingId).toBeTruthy();
    const section = heading.closest("section");
    expect(section).toHaveAttribute("aria-labelledby", headingId);
  });

  test("multiple ArticleArea instances generate unique section IDs", () => {
    // 同一ページに複数 ArticleArea が描画されたとき、ID 重複がないことを確認
    const { container } = render(
      <div>
        <ArticleArea steps={["手順A"]}>content A</ArticleArea>
        <ArticleArea steps={["手順B"]}>content B</ArticleArea>
      </div>,
    );
    const ids = Array.from(container.querySelectorAll("[id]")).map((el) =>
      el.getAttribute("id"),
    );
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });
});
