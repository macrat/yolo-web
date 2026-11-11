import { describe, expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import ListPage from "@/components/ListPage";
import { splitIntoPhrases } from "@/lib/phrase-breaks";

describe("ListPage", () => {
  test("パンくず・主見出し・導入の文・中身を上から積む", () => {
    const { container } = render(
      <ListPage
        trail={[
          { label: "ホーム", href: "/" },
          { label: "ツール", href: "/tools" },
        ]}
        heading="ツール"
        description="登録不要。"
      >
        <p>一覧</p>
      </ListPage>,
    );
    expect(
      screen.getByRole("navigation", { name: "パンくずリスト" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "ツール",
    );
    const texts = [...container.querySelectorAll("nav, h1, p")].map(
      (el) => el.tagName,
    );
    expect(texts).toEqual(["NAV", "H1", "P", "P"]);
    expect(screen.getByText("登録不要。").nextSibling).toBeNull();
  });

  test("導入の文を持たない一覧は、パンくず・見出し・中身だけを積む", () => {
    const { container } = render(
      <ListPage
        trail={[
          { label: "ホーム", href: "/" },
          { label: "ブログ", href: "/blog" },
        ]}
        heading="ブログ"
      >
        <p>一覧</p>
      </ListPage>,
    );
    const texts = [...container.querySelectorAll("nav, h1, p")].map(
      (el) => el.tagName,
    );
    expect(texts).toEqual(["NAV", "H1", "P"]);
  });

  test("主見出しは文節の切れ目でだけ折れる（DESIGN.md §4）", () => {
    render(
      <ListPage
        trail={[{ label: "ホーム", href: "/" }]}
        heading="同じカテゴリの四字熟語"
      >
        <p>一覧</p>
      </ListPage>,
    );
    const title = screen.getByRole("heading", { level: 1 });
    expect(title.innerHTML).toBe(
      splitIntoPhrases(title.textContent ?? "").join("<wbr>"),
    );
    expect(title.querySelectorAll("wbr").length).toBeGreaterThan(0);
  });
});
