import { expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import { readFileSync } from "fs";
import { resolve } from "path";
import Footer from "../Footer";

const footerCssContent = readFileSync(
  resolve(__dirname, "../Footer.module.css"),
  "utf-8",
);

test("Footer renders disclaimer text about AI experiment", () => {
  render(<Footer />);
  expect(
    screen.getByText(
      /このサイトはAIによる実験的プロジェクトです。コンテンツはAIが生成しており、内容が壊れていたり不正確な場合があります。/,
    ),
  ).toBeInTheDocument();
});

test("Footer has contentinfo role", () => {
  render(<Footer />);
  expect(screen.getByRole("contentinfo")).toBeInTheDocument();
});

test("Footer renders navigation links", () => {
  render(<Footer />);
  const nav = screen.getByRole("navigation", {
    name: "フッターナビゲーション",
  });
  expect(nav).toBeInTheDocument();

  expect(screen.getByRole("link", { name: "ツール一覧" })).toHaveAttribute(
    "href",
    "/tools",
  );
  expect(screen.getByRole("link", { name: "チートシート" })).toHaveAttribute(
    "href",
    "/cheatsheets",
  );
  expect(screen.getByRole("link", { name: "遊ぶ一覧" })).toHaveAttribute(
    "href",
    "/play",
  );
  expect(screen.getByRole("link", { name: "ブログ" })).toHaveAttribute(
    "href",
    "/blog",
  );
  expect(
    screen.getByRole("link", { name: "このサイトについて" }),
  ).toHaveAttribute("href", "/about");
});

test("Footer renders SECTION_LINKS in correct order: 遊ぶ / ツール / 辞典 / その他", () => {
  render(<Footer />);
  const nav = screen.getByRole("navigation", {
    name: "フッターナビゲーション",
  });
  const headings = Array.from(nav.querySelectorAll("h3")).map(
    (h) => h.textContent,
  );
  expect(headings).toEqual(["遊ぶ", "ツール", "辞典", "その他"]);
});

test("Footer renders play category anchor links in 遊ぶ section", () => {
  render(<Footer />);
  expect(screen.getByRole("link", { name: "占い" })).toHaveAttribute(
    "href",
    "/play#fortune",
  );
  expect(screen.getByRole("link", { name: "性格診断" })).toHaveAttribute(
    "href",
    "/play#personality",
  );
  expect(screen.getByRole("link", { name: "知識テスト" })).toHaveAttribute(
    "href",
    "/play#knowledge",
  );
  expect(screen.getByRole("link", { name: "ゲーム" })).toHaveAttribute(
    "href",
    "/play#game",
  );
});

test("Footer renders privacy policy link", () => {
  render(<Footer />);
  expect(
    screen.getByRole("link", { name: "プライバシーポリシー" }),
  ).toHaveAttribute("href", "/privacy");
});

test("Footer does not render クイズ・診断 link", () => {
  render(<Footer />);
  expect(screen.queryByRole("link", { name: "クイズ・診断" })).toBeNull();
});

// ===== CSS品質: タップターゲット・アクセシビリティ =====

test("Footer CSS: sectionLink padding is 0.75rem 0 for 44px tap target", () => {
  // タップターゲット44px以上確保のためpaddingを0.65rem→0.75remに拡大
  expect(footerCssContent).toMatch(
    /\.sectionLink\s*\{[^}]*padding:\s*0\.75rem\s+0/,
  );
});

test("Footer CSS: sectionLink has focus-visible outline for keyboard accessibility", () => {
  // キーボードナビゲーション時のフォーカスリングが定義されていること
  expect(footerCssContent).toMatch(
    /\.sectionLink:focus-visible\s*\{[^}]*outline:\s*2px\s+solid\s+var\(--color-primary\)/,
  );
});
