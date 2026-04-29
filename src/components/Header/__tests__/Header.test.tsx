import { expect, test, describe, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import Header from "@/components/Header";

// Next.js の Link コンポーネントをモック
vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
    [key: string]: unknown;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe("Header", () => {
  test("ロゴ/サイト名のリンクが存在し、href が '/' である", () => {
    render(<Header />);
    const logoLink = screen.getByRole("link", { name: /yolos\.net/i });
    expect(logoLink).toBeInTheDocument();
    expect(logoLink).toHaveAttribute("href", "/");
  });

  test("内部固定のナビゲーション項目（遊ぶ・ツール・ブログ）が描画される", () => {
    render(<Header />);
    expect(screen.getByRole("link", { name: "遊ぶ" })).toHaveAttribute(
      "href",
      "/play",
    );
    expect(screen.getByRole("link", { name: "ツール" })).toHaveAttribute(
      "href",
      "/tools",
    );
    expect(screen.getByRole("link", { name: "ブログ" })).toHaveAttribute(
      "href",
      "/blog",
    );
  });

  test("actions prop の内容が描画される", () => {
    render(<Header actions={<button>テーマ切替</button>} />);
    expect(
      screen.getByRole("button", { name: "テーマ切替" }),
    ).toBeInTheDocument();
  });

  test("actions を渡さないと actions スロットは描画されない", () => {
    render(<Header />);
    // ボタンは出ない（ロゴ・ナビはリンクのみ）
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
