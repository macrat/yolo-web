import { expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import AboutPage, { metadata } from "../page";

// cycle-279 フェーズR: docs/site-concept.md の現行自己定義「AIが営む、
// 『やってみる』のよろず屋」に合わせて自己紹介の文章を全面的に書き直した。
// 旧テストは cycle-277 決定(a)「自分を知り、楽しむ場所」= 診断中心コンセプトの
// 文言を検査しており、現行コンセプトと食い違っていたため置き換える。

test("About page renders heading", () => {
  render(<AboutPage />);
  expect(
    screen.getByRole("heading", { level: 1, name: /このサイトについて/ }),
  ).toBeInTheDocument();
});

test("About page introduces the site as an AI-run yorozuya (everything store)", () => {
  render(<AboutPage />);
  expect(screen.getByText(/「AIが営むよろず屋」です/)).toBeInTheDocument();
});

test("About page explains the name origin (YOLO x よろず)", () => {
  render(<AboutPage />);
  expect(
    screen.getByRole("heading", { name: "名前の由来" }),
  ).toBeInTheDocument();
  expect(screen.getByText(/運営のすべてをAIに任せた実験/)).toBeInTheDocument();
});

test("About page does not define the site as diagnosis-centered (superseded concept)", () => {
  const { container } = render(<AboutPage />);
  // 旧コンセプトの正典フレーズが残っていないこと
  expect(container.textContent).not.toMatch(/「自分を知り、楽しむ」ための場所/);
  expect(
    screen.queryByRole("heading", { name: "診断とゲームを楽しむ" }),
  ).not.toBeInTheDocument();
});

test("About page links to play, dictionary, tools, and blog", () => {
  render(<AboutPage />);
  expect(
    screen.getByRole("link", { name: "診断・占い・あそび" }),
  ).toHaveAttribute("href", "/play");
  expect(screen.getByRole("link", { name: "辞典" })).toHaveAttribute(
    "href",
    "/dictionary",
  );
  expect(screen.getByRole("link", { name: "道具" })).toHaveAttribute(
    "href",
    "/tools",
  );
  const blogLinks = screen.getAllByRole("link", { name: "ブログ" });
  expect(blogLinks.length).toBeGreaterThan(0);
  for (const blogLink of blogLinks) {
    expect(blogLink).toHaveAttribute("href", "/blog");
  }
});

test("About page renders an honest AI-operation disclosure", () => {
  render(<AboutPage />);
  expect(
    screen.getByRole("heading", { name: "AIが運営しています" }),
  ).toBeInTheDocument();
  expect(
    screen.getByText(
      /AIエージェントが企画からデザイン、記事の執筆までをほぼひとりで手がけています/,
    ),
  ).toBeInTheDocument();
  expect(
    screen.getByText(
      /内容に誤りがあったり、表示が崩れていたりすることがあります/,
    ),
  ).toBeInTheDocument();
});

test("About page frames diagnoses/fortunes as entertainment, not psychological assessment", () => {
  // 害防止（constitution rule 2 / DESIGN.md §7 レッドライン）
  render(<AboutPage />);
  expect(
    screen.getByText(/心理学的な検査や専門的な鑑定ではない/),
  ).toBeInTheDocument();
  expect(
    screen.getByText(/大切な決めごとの判断には使わないでください/),
  ).toBeInTheDocument();
});

test("About page disclaims tool result accuracy and liability", () => {
  render(<AboutPage />);
  expect(
    screen.getByText(/間違いがないことを保証するものではありません/),
  ).toBeInTheDocument();
  expect(
    screen.getByText(
      /本サイトの利用によって生じた損害について、運営者は責任を負いません/,
    ),
  ).toBeInTheDocument();
});

test("About page links to the privacy policy", () => {
  render(<AboutPage />);
  expect(
    screen.getByRole("link", { name: "プライバシーポリシー" }),
  ).toHaveAttribute("href", "/privacy");
});

test("About page renders GitHub link", () => {
  render(<AboutPage />);
  const link = screen.getByRole("link", { name: /GitHubリポジトリ/ });
  expect(link).toHaveAttribute("href", "https://github.com/macrat/yolo-web");
  expect(link).toHaveAttribute("target", "_blank");
  expect(link).toHaveAttribute("rel", "noopener noreferrer");
});

test("metadata reflects the yorozuya concept", () => {
  const description = metadata.description ?? "";
  expect(description).toContain("よろず屋");
  expect(description).toContain("AI");
  expect(metadata.title).toBe("サイト紹介 | yolos.net");
});
