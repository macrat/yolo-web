/**
 * Header コンポーネントのテスト。
 * 折り返しは CSS が担い JSDOM では確かめられないので、項目がすべて描かれることと現在地の扱いを見る。
 */

import { render, screen, within } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import Header from "../index";

// next/link をシンプルな <a> タグにモック
vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    className,
    "aria-current": ariaCurrent,
  }: {
    href: string;
    children: React.ReactNode;
    className?: string;
    "aria-current"?: React.AriaAttributes["aria-current"];
  }) => (
    <a href={href} className={className} aria-current={ariaCurrent}>
      {children}
    </a>
  ),
}));

let mockPathname = "/";
vi.mock("next/navigation", () => ({
  usePathname: () => mockPathname,
}));

const NAV_LABELS = ["遊び", "ツール", "ブログ", "サイト紹介"];

describe("Header", () => {
  beforeEach(() => {
    mockPathname = "/";
  });

  it("header 要素が role='banner' を持つ", () => {
    render(<Header />);
    expect(screen.getByRole("banner")).toBeInTheDocument();
  });

  it("サイト名がトップへのリンクになる", () => {
    mockPathname = "/tools";
    render(<Header />);
    const siteName = screen.getByRole("link", { name: "yolos.net" });
    expect(siteName).toHaveAttribute("href", "/");
    expect(siteName).not.toHaveAttribute("aria-current");
  });

  it("ナビの項目を隠さず、すべてリンクとして描く", () => {
    render(<Header />);
    const nav = screen.getByRole("navigation", {
      name: "メインナビゲーション",
    });
    const labels = within(nav)
      .getAllByRole("link")
      .map((a) => a.textContent);
    expect(labels).toEqual(NAV_LABELS);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("トップではサイト名が現在地になる", () => {
    render(<Header />);
    expect(screen.getByRole("link", { name: "yolos.net" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("/tools ではツールだけが現在地になり、リンクのまま残る", () => {
    mockPathname = "/tools";
    render(<Header />);
    const tools = screen.getByRole("link", { name: "ツール" });
    expect(tools).toHaveAttribute("aria-current", "page");
    expect(tools).toHaveAttribute("href", "/tools");
    expect(screen.getByRole("link", { name: "ブログ" })).not.toHaveAttribute(
      "aria-current",
    );
  });
});
