import { describe, expect, test, vi } from "vitest";
import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { CATEGORY_LABELS, getAllBlogPosts } from "@/blog/_lib/blog";
import {
  BLOG_LIST_PER_PAGE,
  blogIndexEntries,
  blogListPosts,
} from "@/blog/_lib/blog-list";
import BlogListView from "../BlogListView";

const navigation = vi.hoisted(() => ({ pathname: "/blog" }));

vi.mock("next/navigation", () => ({
  usePathname: () => navigation.pathname,
}));

function visit(path: string) {
  navigation.pathname = path;
  window.history.replaceState(null, "", path);
}

function rows(): HTMLElement[] {
  return within(screen.getByRole("list", { name: "記事の一覧" })).getAllByRole(
    "listitem",
  );
}

describe("BlogListView", () => {
  test("/blog は新しい順の1ページ目を並べ、行のリンクの名前は題名だけである", () => {
    visit("/blog");
    render(<BlogListView scope={{ type: "all" }} page={1} />);
    const posts = getAllBlogPosts();

    expect(
      screen.getByRole("heading", { level: 1, name: "ブログ" }),
    ).toBeInTheDocument();
    const listRows = rows();
    expect(listRows).toHaveLength(Math.min(posts.length, BLOG_LIST_PER_PAGE));
    listRows.forEach((row, index) => {
      const links = within(row).getAllByRole("link");
      expect(links).toHaveLength(1);
      expect(links[0]).toHaveAccessibleName(posts[index].title);
      expect(links[0]).toHaveAttribute("href", `/blog/${posts[index].slug}`);
    });
  });

  test("行は分類・公開日・読了時間を持ち、「新着」の印を持たない", () => {
    visit("/blog");
    render(<BlogListView scope={{ type: "all" }} page={1} />);
    const [post] = getAllBlogPosts();
    const [row] = rows();

    expect(row).toHaveTextContent(CATEGORY_LABELS[post.category]);
    expect(row).toHaveTextContent(`${post.readingTime}分で読める`);
    expect(row.querySelector("time")).toHaveAttribute(
      "datetime",
      post.published_at,
    );
    expect(row).toHaveTextContent(post.description);
    expect(screen.queryByText("新着")).not.toBeInTheDocument();
  });

  test("件数の行が全件を言い、ページ送りが2ページ目へのリンクを持つ", () => {
    visit("/blog");
    render(<BlogListView scope={{ type: "all" }} page={1} />);
    const total = getAllBlogPosts().length;

    expect(document.querySelector('p[tabindex="-1"]')).toHaveTextContent(
      new RegExp(`^全${total}件のうち1〜50件目$`),
    );
    const pages = screen.getByRole("navigation", {
      name: "ページナビゲーション",
    });
    expect(
      within(pages).getByRole("link", { name: "次へ（ページ2）" }),
    ).toHaveAttribute("href", "/blog/page/2");
  });

  test("一覧の上に、分類とタグの索引を閉じたアコーディオンで置き、語を記事の多い順に並べる", () => {
    visit("/blog");
    const { container } = render(
      <BlogListView scope={{ type: "all" }} page={1} />,
    );
    const index = blogIndexEntries();

    const details = container.querySelector("details");
    expect(details).not.toHaveAttribute("open");
    expect(details?.querySelector("summary")).toHaveTextContent(
      "分類・タグから探す",
    );
    const categories = screen.getByRole("list", {
      name: `分類（${index.categories.length}）`,
    });
    const tags = screen.getByRole("list", {
      name: `タグ（${index.tags.length}）`,
    });
    for (const list of [categories, tags]) {
      const counts = within(list)
        .getAllByRole("link")
        .map((link) => Number(/（(\d+)）$/.exec(link.textContent ?? "")?.[1]));
      expect(counts).toEqual([...counts].sort((a, b) => b - a));
    }
    // 索引の語は一覧の上にだけ置き、行の中にタグのリンクを置かない。
    expect(details?.compareDocumentPosition(rows()[0])).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
  });

  test("分類のページは、パンくずでブログへ戻れ、分類の名前を見出しにし、索引のその分類を現在地にして、行に種別を出さない", () => {
    visit("/blog/category/dev-notes");
    render(
      <BlogListView
        scope={{ type: "category", category: "dev-notes" }}
        page={1}
      />,
    );
    const posts = blogListPosts({ type: "category", category: "dev-notes" });

    const breadcrumb = screen.getByRole("navigation", {
      name: "パンくずリスト",
    });
    expect(
      within(breadcrumb).getByRole("link", { name: "ブログ" }),
    ).toHaveAttribute("href", "/blog");
    expect(within(breadcrumb).getByText("開発ノート")).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(
      screen.getByRole("heading", { level: 1, name: "開発ノート" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /^開発ノート（\d+）$/ }),
    ).toHaveAttribute("aria-current", "page");
    expect(rows()).toHaveLength(posts.length);
    expect(within(rows()[0]).queryByText("開発ノート")).not.toBeInTheDocument();
  });

  test("タグのページは、パンくずでブログへ戻れ、タグの名前を見出しにする", () => {
    visit("/blog/tag/Web%E9%96%8B%E7%99%BA");
    render(<BlogListView scope={{ type: "tag", tag: "Web開発" }} page={1} />);

    const breadcrumb = screen.getByRole("navigation", {
      name: "パンくずリスト",
    });
    expect(
      within(breadcrumb).getByRole("link", { name: "ブログ" }),
    ).toHaveAttribute("href", "/blog");
    expect(
      screen.getByRole("heading", { level: 1, name: "Web開発" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /^Web開発（\d+）$/ }),
    ).toHaveAttribute("aria-current", "page");
    expect(rows()).toHaveLength(
      blogListPosts({ type: "tag", tag: "Web開発" }).length,
    );
  });

  test("記事の一覧は、索引の見出しの後ろに自分の見出しを持つ", () => {
    visit("/blog");
    render(<BlogListView scope={{ type: "all" }} page={1} />);

    const headings = screen
      .getAllByRole("heading", { level: 2 })
      .map((heading) => heading.textContent);
    expect(headings.at(-1)).toBe("記事の一覧");
    expect(
      screen
        .getByRole("heading", { level: 2, name: "記事の一覧" })
        .compareDocumentPosition(rows()[0]),
    ).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
  });

  test("/blog のパンくずは、上端のナビと同じ「ブログ」を、いま開いているページの現在地にする", () => {
    visit("/blog/page/2");
    render(<BlogListView scope={{ type: "all" }} page={2} />);

    const breadcrumb = screen.getByRole("navigation", {
      name: "パンくずリスト",
    });
    const links = within(breadcrumb).getAllByRole("link");
    expect(links.map((link) => link.textContent)).toEqual(["ホーム", "ブログ"]);
    expect(links[1]).toHaveAttribute("href", "/blog/page/2");
    expect(links[1]).toHaveAttribute("aria-current", "page");
  });

  test("名前の欄は分類の名前でも探せる", () => {
    vi.useFakeTimers();
    try {
      visit("/blog");
      render(<BlogListView scope={{ type: "all" }} page={1} />);
      const label = "開発ノート";
      const expected = getAllBlogPosts().filter(
        (post) => CATEGORY_LABELS[post.category] === label,
      );

      fireEvent.change(
        screen.getByRole("searchbox", {
          name: "題名・説明・分類・タグ・連載名で探す",
        }),
        { target: { value: label } },
      );
      act(() => {
        vi.runAllTimers();
      });

      const shownTitles = rows().map(
        (row) => within(row).getByRole("link").textContent,
      );
      expect(expected.length).toBeGreaterThan(0);
      expect(shownTitles).toEqual(
        expect.arrayContaining(expected.map((post) => post.title)),
      );
    } finally {
      vi.useRealTimers();
    }
  });
});
