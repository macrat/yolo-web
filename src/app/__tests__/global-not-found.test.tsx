import { expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import { HEADER_NAV_ITEMS } from "@/lib/site-frame";
import GlobalNotFound from "../global-not-found-content";

test("404 page renders heading", () => {
  render(<GlobalNotFound />);
  expect(
    screen.getByRole("heading", {
      level: 1,
      name: "ページが見つかりませんでした",
    }),
  ).toBeInTheDocument();
});

test("404 の一覧へのリンクは、上端のナビと同じ名前と行き先を持つ", () => {
  render(<GlobalNotFound />);

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
