import { expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import AboutPage, { metadata } from "../page";

test("About page renders heading", () => {
  render(<AboutPage />);
  expect(
    screen.getByRole("heading", { level: 1, name: /このサイトについて/ }),
  ).toBeInTheDocument();
});

test("About page describes the diagnosis-centered concept (know yourself, enjoy)", () => {
  // cycle-277 決定(a): 自己定義を道具箱中心から「自分を知り、楽しむ場所」へ是正
  render(<AboutPage />);
  expect(
    screen.getByText(/「自分を知り、楽しむ」ための場所/),
  ).toBeInTheDocument();
});

test("About page highlights diagnoses and games as the heart", () => {
  render(<AboutPage />);
  expect(
    screen.getByRole("heading", { name: /診断とゲームを楽しむ/ }),
  ).toBeInTheDocument();
  expect(screen.getByText(/性格診断・キャラクター診断/)).toBeInTheDocument();
});

test("About page frames diagnoses as entertainment, not psychological assessment", () => {
  // 害防止（DESIGN.md §7 レッドライン）: 診断が娯楽であり心理検査でない旨を面で伝える
  render(<AboutPage />);
  expect(
    screen.getByText(
      /心理検査のように優劣や向き不向きを判定するものではありません/,
    ),
  ).toBeInTheDocument();
});

test("About page does not define the site as merely a toolbox / online tools collection", () => {
  const { container } = render(<AboutPage />);
  // 旧自己定義（道具箱-as-core）のキャッチフレーズが残っていないこと
  expect(container.textContent).not.toMatch(
    /日常のちょっとした作業の傍で使える道具を集めたサイト/,
  );
  expect(container.textContent).not.toMatch(/道具箱（トップページ）の使い方/);
});

test("About page links to tools, blog, and play", () => {
  render(<AboutPage />);
  // cycle-279 フェーズ R: 道具箱ダッシュボードは完全撤去。ツールは /tools 一覧へ。
  expect(
    screen.queryByRole("link", { name: "道具箱" }),
  ).not.toBeInTheDocument();
  expect(screen.getByRole("link", { name: "ツール一覧" })).toHaveAttribute(
    "href",
    "/tools",
  );
  // /blog へのリンクは「サイトの歩き方」と「AIによる運営について」の2箇所にある
  const blogLinks = screen.getAllByRole("link", { name: "ブログ" });
  expect(blogLinks.length).toBeGreaterThan(0);
  for (const blogLink of blogLinks) {
    expect(blogLink).toHaveAttribute("href", "/blog");
  }
  expect(screen.getByRole("link", { name: "遊び" })).toHaveAttribute(
    "href",
    "/play",
  );
});

test("About page renders AI disclaimer section", () => {
  render(<AboutPage />);
  expect(
    screen.getByText(/AIエージェントが自律的に企画・開発・運営/),
  ).toBeInTheDocument();
});

test("About page renders disclaimer section", () => {
  render(<AboutPage />);
  expect(
    screen.getByText(/正確性、完全性、有用性を保証するものではありません/),
  ).toBeInTheDocument();
  // 診断・占いの結果は娯楽であり根拠を示すものではない旨の免責（診断中心化に伴い追加）
  expect(
    screen.getByText(/娯楽としてお楽しみいただくためのもの/),
  ).toBeInTheDocument();
});

test("About page renders GitHub link", () => {
  render(<AboutPage />);
  const link = screen.getByRole("link", { name: /GitHubリポジトリ/ });
  expect(link).toHaveAttribute("href", "https://github.com/macrat/yolo-web");
  expect(link).toHaveAttribute("target", "_blank");
  expect(link).toHaveAttribute("rel", "noopener noreferrer");
});

test("metadata reflects the diagnosis-centered concept (cycle-277 決定(a))", () => {
  const description = metadata.description ?? "";
  // 新コンセプト: 自分を知り、楽しむ（診断中心）
  expect(description).toContain("診断");
  expect(description).toContain("自分を知り");
  // 実用層の道具にも触れつつ、AI 実験の明示（constitution rule 3）を保つ
  expect(description).toContain("AI");
  expect(metadata.title).toBe("このサイトについて | yolos.net");
});
