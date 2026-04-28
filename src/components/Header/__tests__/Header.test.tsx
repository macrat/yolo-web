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
    // ロゴリンク: aria-label または text で検索
    const logoLink = screen.getByRole("link", { name: /yolos\.net/i });
    expect(logoLink).toBeInTheDocument();
    expect(logoLink).toHaveAttribute("href", "/");
  });

  test("渡した nav 項目が描画される", () => {
    const nav = [
      { label: "遊ぶ", href: "/play" },
      { label: "ツール", href: "/tools" },
      { label: "ブログ", href: "/blog" },
    ];
    render(<Header nav={nav} />);

    for (const item of nav) {
      const link = screen.getByRole("link", { name: item.label });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute("href", item.href);
    }
  });

  test("nav を渡さないとデフォルトのナビが描画される", () => {
    render(<Header />);
    // デフォルトナビが存在することを確認（何かリンクが存在する）
    const links = screen.getAllByRole("link");
    // ロゴリンクを含めて少なくとも2つ以上のリンクがある
    expect(links.length).toBeGreaterThanOrEqual(2);
  });

  test("actions prop の内容が描画される", () => {
    render(<Header actions={<button>テーマ切替</button>} />);
    expect(
      screen.getByRole("button", { name: "テーマ切替" }),
    ).toBeInTheDocument();
  });
});
