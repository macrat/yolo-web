import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Panel from "../index";

describe("Panel", () => {
  it("デフォルトで section タグでレンダリングされる", () => {
    render(<Panel>content</Panel>);
    const el = screen.getByText("content").closest("section");
    expect(el).toBeInTheDocument();
  });

  it("as prop でタグを変更できる", () => {
    render(<Panel as="article">content</Panel>);
    const el = screen.getByText("content").closest("article");
    expect(el).toBeInTheDocument();
  });

  it("className prop が結合される", () => {
    render(<Panel className="extra">content</Panel>);
    const el = screen.getByText("content").closest("section");
    expect(el?.className).toContain("extra");
  });

  it("padding='comfortable' のとき paddingComfortable クラスが付与される", () => {
    render(<Panel padding="comfortable">content</Panel>);
    const el = screen.getByText("content").closest("section");
    // CSS Modules のクラス名はビルド時にハッシュされるため、
    // 存在チェックは "comfortable" 文字を含むクラス名で代用する
    expect(el?.className).toMatch(/comfortable/i);
  });

  it("padding='normal'（デフォルト）のとき paddingComfortable クラスが付与されない", () => {
    render(<Panel>content</Panel>);
    const el = screen.getByText("content").closest("section");
    expect(el?.className).not.toMatch(/comfortable/i);
  });
});
