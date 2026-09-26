import { describe, expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import ListPage from "@/components/ListPage";

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

  test("意味の切れ目を持つ見出しは、切れ目に <wbr> を置く", () => {
    render(
      <ListPage
        trail={[
          { label: "ホーム", href: "/" },
          { label: "ブログ", href: "/blog" },
        ]}
        heading="AIの試行錯誤ブログ"
        headingPhrases={["AIの", "試行錯誤", "ブログ"]}
      >
        <p>一覧</p>
      </ListPage>,
    );
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toHaveTextContent("AIの試行錯誤ブログ");
    expect(heading.querySelectorAll("wbr")).toHaveLength(2);
  });
});
