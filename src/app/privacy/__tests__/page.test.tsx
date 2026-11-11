import { expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import PrivacyPage from "../page";
import { followsPhraseRules } from "@/lib/phrase-breaks";
import phrasedStyles from "@/components/PhrasedText/PhrasedText.module.css";

test("Privacy page renders heading", () => {
  render(<PrivacyPage />);
  expect(
    screen.getByRole("heading", { level: 1, name: /プライバシーポリシー/ }),
  ).toBeInTheDocument();
});

test("Privacy page renders main sections", () => {
  render(<PrivacyPage />);
  expect(
    screen.getByRole("heading", { level: 2, name: /収集する情報/ }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("heading", { level: 2, name: /Cookieについて/ }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("heading", { level: 2, name: /第三者サービスの利用/ }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("heading", { level: 2, name: /利用目的/ }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("heading", { level: 2, name: /情報の管理と安全管理措置/ }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("heading", {
      level: 2,
      name: /個人情報の開示・訂正・削除/,
    }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("heading", {
      level: 2,
      name: /プライバシーポリシーの変更/,
    }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("heading", { level: 2, name: /お問い合わせ/ }),
  ).toBeInTheDocument();
});

test("Privacy page renders external links with correct attributes", () => {
  render(<PrivacyPage />);

  const githubLink = screen.getByRole("link", {
    name: /GitHubリポジトリのIssues/,
  });
  expect(githubLink).toHaveAttribute(
    "href",
    "https://github.com/macrat/yolo-web/issues",
  );
  expect(githubLink).toHaveAttribute("target", "_blank");
  expect(githubLink).toHaveAttribute("rel", "noopener noreferrer");

  const googleAdsLink = screen.getByRole("link", {
    name: /Googleの広告設定/,
  });
  expect(googleAdsLink).toHaveAttribute(
    "href",
    "https://www.google.com/settings/ads",
  );
  expect(googleAdsLink).toHaveAttribute("target", "_blank");

  const naiLink = screen.getByRole("link", { name: /aboutads\.info/ });
  expect(naiLink).toHaveAttribute("href", "https://www.aboutads.info");
  expect(naiLink).toHaveAttribute("target", "_blank");

  const googlePrivacyLink = screen.getByRole("link", {
    name: /Googleのプライバシーポリシー/,
  });
  expect(googlePrivacyLink).toHaveAttribute(
    "href",
    "https://policies.google.com/privacy",
  );
  expect(googlePrivacyLink).toHaveAttribute("target", "_blank");

  const optoutLink = screen.getByRole("link", {
    name: /Googleアナリティクスオプトアウトアドオン/,
  });
  expect(optoutLink).toHaveAttribute(
    "href",
    "https://tools.google.com/dlpage/gaoptout",
  );
  expect(optoutLink).toHaveAttribute("target", "_blank");
});

test("Privacy page renders enactment date", () => {
  render(<PrivacyPage />);
  expect(screen.getByText(/制定日: 2026年3月7日/)).toBeInTheDocument();
});

test("見出しは書き手が分けた文節の切れ目でだけ折れる（DESIGN.md §4）", () => {
  render(<PrivacyPage />);
  const headings: string[][] = [
    ["プライバシー", "ポリシー"],
    ["収集する", "情報"],
    ["Google Analyticsに", "よる", "アクセス情報"],
    ["ブラウザ内に", "保存される", "データ"],
    ["収集していない", "データ"],
    ["利用目的"],
    ["Cookieに", "ついて"],
    ["第三者", "サービスの", "利用"],
    ["アクセス解析"],
    ["広告"],
    ["情報の", "管理と", "安全管理措置"],
    ["個人情報の", "開示・", "訂正・", "削除"],
    ["プライバシー", "ポリシーの", "変更"],
    ["お問い", "合わせ"],
  ];
  for (const phrases of headings) {
    expect(followsPhraseRules(phrases), phrases.join("|")).toBe(true);
    const heading = screen.getByRole("heading", { name: phrases.join("") });
    expect(heading.innerHTML).toBe(phrases.join("<wbr>"));
  }
});

test("どの見出しも文節で折る部品で組み、ブラウザの辞書の区切り（auto-phrase）に任せない（DESIGN.md §4）", () => {
  render(<PrivacyPage />);
  const headings = screen.getAllByRole("heading");
  expect(headings).toHaveLength(14);
  for (const heading of headings) {
    expect(heading, heading.textContent ?? "").toHaveClass(
      phrasedStyles.phrased,
    );
  }
});

test("冒頭の段落は主見出しのすぐ下に置き、「はじめに」の見出しを持たない", () => {
  render(<PrivacyPage />);
  expect(
    screen.queryByRole("heading", { name: "はじめに" }),
  ).not.toBeInTheDocument();
  expect(
    screen.getByText(/個人情報の取り扱いについて定めるものです/),
  ).toBeInTheDocument();
});

test("章ごとにセクションを分け、2つ目からのセクションは章の見出し（h2）で始まる（DESIGN.md §5）", () => {
  const { container } = render(<PrivacyPage />);
  const sections = container.querySelectorAll("section");
  expect(sections).toHaveLength(9);
  for (const section of Array.from(sections).slice(1)) {
    expect(section.firstElementChild?.tagName).toBe("H2");
  }
});

test("小見出し（h3）はどれも和文を含み、第三者サービスの章の2つはサービスの用途を言う", () => {
  render(<PrivacyPage />);
  const subheadings = screen.getAllByRole("heading", { level: 3 });
  expect(subheadings.map((heading) => heading.textContent)).toEqual([
    "Google Analyticsによるアクセス情報",
    "ブラウザ内に保存されるデータ",
    "収集していないデータ",
    "アクセス解析",
    "広告",
  ]);
  for (const heading of subheadings) {
    expect(heading.textContent).toMatch(
      /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]/u,
    );
    expect(heading).not.toHaveAttribute("data-heading-font");
  }
});

test("サイト紹介へのリンクはサイトの中のリンクとして /about を指す", () => {
  render(<PrivacyPage />);
  const aboutLink = screen.getByRole("link", { name: "このサイトについて" });
  expect(aboutLink).toHaveAttribute("href", "/about");
  expect(aboutLink).not.toHaveAttribute("target");
});

test("制定日は最後のセクションの末尾に置く", () => {
  const { container } = render(<PrivacyPage />);
  const sections = container.querySelectorAll("section");
  const lastSection = sections[sections.length - 1];
  const enacted = screen.getByText(/制定日: 2026年3月7日/);
  expect(lastSection).toContainElement(enacted);
  expect(enacted.nextElementSibling).toBeNull();
});
