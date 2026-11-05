import { expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import AboutPage, { metadata } from "../page";
import { followsPhraseRules } from "@/lib/phrase-breaks";
import phrasedStyles from "@/components/PhrasedText/PhrasedText.module.css";

// 自己紹介の文章が docs/site-concept.md の自己定義「AIが営む、『やってみる』のよろず屋」に
// 沿い、サイトを診断中心の場所として定義しないことを確かめる。

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

test("About page does not define the site as diagnosis-centered", () => {
  const { container } = render(<AboutPage />);
  // 診断中心の場所として定義する言い回しを持たないこと
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
  // 害防止（constitution rule 2）
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

test("見出しは書き手が分けた文節の切れ目でだけ折れる（DESIGN.md §4）", () => {
  render(<AboutPage />);
  const headings: string[][] = [
    ["この", "サイトに", "ついて"],
    ["名前の", "由来"],
    ["何が", "置いて", "あるか"],
    ["AIが", "運営して", "います"],
    ["診断・", "占い・", "道具に", "ついて"],
    ["プライバシーに", "ついて"],
    ["お問い", "合わせ"],
  ];
  for (const phrases of headings) {
    expect(followsPhraseRules(phrases), phrases.join("|")).toBe(true);
    const heading = screen.getByRole("heading", { name: phrases.join("") });
    expect(heading.innerHTML).toBe(phrases.join("<wbr>"));
  }
});

test("どの見出しも文節で折る部品で組み、ブラウザの辞書の区切り（auto-phrase）に任せない（DESIGN.md §4）", () => {
  render(<AboutPage />);
  const headings = screen.getAllByRole("heading");
  expect(headings).toHaveLength(7);
  for (const heading of headings) {
    expect(heading, heading.textContent ?? "").toHaveClass(
      phrasedStyles.phrased,
    );
  }
});

test("章ごとにセクションを分け、2つ目からのセクションは章の見出し（h2）で始まる（DESIGN.md §5）", () => {
  const { container } = render(<AboutPage />);
  const sections = container.querySelectorAll("section");
  expect(sections).toHaveLength(7);
  for (const section of Array.from(sections).slice(1)) {
    expect(section.firstElementChild?.tagName).toBe("H2");
  }
});
