import { expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import { HEADER_NAV_ITEMS } from "@/lib/site-frame";
import NotFound, { metadata } from "../not-found";
import { followsPhraseRules } from "@/lib/phrase-breaks";

test("404 のページは主見出しを持つ", () => {
  render(<NotFound />);
  expect(
    screen.getByRole("heading", {
      level: 1,
      name: "ページが見つかりません",
    }),
  ).toBeInTheDocument();
});

test("404 のページの metadata は題を持ち、robots を null にしてルートのレイアウトの index, follow を受け継がない", () => {
  expect(metadata.robots).toBeNull();
  expect(metadata.title).toBe("ページが見つかりません | yolos.net");
});

test("404 の一覧へのリンクは、上端のナビと同じ名前と行き先を持つ", () => {
  render(<NotFound />);

  expect(screen.getByRole("link", { name: "ホーム" })).toHaveAttribute(
    "href",
    "/",
  );
  const names = screen
    .getAllByRole("link")
    .map((link) => link.textContent)
    .filter((name) => name !== "ホーム");
  for (const name of names) {
    const navItem = HEADER_NAV_ITEMS.find((item) => item.label === name);
    expect(navItem, name ?? "").toBeDefined();
    expect(screen.getByRole("link", { name: name ?? "" })).toHaveAttribute(
      "href",
      navItem?.href,
    );
  }
  expect(names).toEqual(["ツール", "遊び", "ブログ"]);
});

test("見出しは書き手が分けた文節の切れ目でだけ折れる（DESIGN.md §4）", () => {
  render(<NotFound />);
  const headings: string[][] = [
    ["ページが", "見つかりません"],
    ["主要", "コンテンツ"],
  ];
  for (const phrases of headings) {
    expect(followsPhraseRules(phrases), phrases.join("|")).toBe(true);
    const heading = screen.getByRole("heading", { name: phrases.join("") });
    expect(heading.innerHTML).toBe(phrases.join("<wbr>"));
  }
});
