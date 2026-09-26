import { describe, test, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import SeriesNav from "@/blog/_components/SeriesNav";
import type { BlogPostMeta } from "@/blog/_lib/blog";

/** Helper to create a minimal BlogPostMeta for testing. */
function makeMeta(
  overrides: Partial<BlogPostMeta> & { slug: string; title: string },
): BlogPostMeta {
  return {
    description: "",
    published_at: "2026-01-01",
    updated_at: "2026-01-01",
    tags: [],
    category: "dev-notes",
    related_tool_slugs: [],
    draft: false,
    readingTime: 5,
    series: "test-series",
    ...overrides,
  };
}

const mockPosts: BlogPostMeta[] = [
  makeMeta({ slug: "post-1", title: "First Post", published_at: "2026-01-01" }),
  makeMeta({
    slug: "post-2",
    title: "Second Post",
    published_at: "2026-01-02",
  }),
  makeMeta({ slug: "post-3", title: "Third Post", published_at: "2026-01-03" }),
];

describe("SeriesNav", () => {
  test("the toggle names the series from SERIES_LABELS and its number of parts", () => {
    render(
      <SeriesNav
        seriesId="ai-agent-ops"
        currentSlug="post-2"
        seriesPosts={mockPosts}
      />,
    );
    expect(
      screen.getByText("連載「AIエージェント運用記」（全3回）"),
    ).toBeInTheDocument();
  });

  test("falls back to seriesId when not in SERIES_LABELS", () => {
    render(
      <SeriesNav
        seriesId="unknown-series"
        currentSlug="post-2"
        seriesPosts={mockPosts}
      />,
    );
    expect(
      screen.getByText("連載「unknown-series」（全3回）"),
    ).toBeInTheDocument();
  });

  test("displays all posts in the list", () => {
    render(
      <SeriesNav
        seriesId="ai-agent-ops"
        currentSlug="post-1"
        seriesPosts={mockPosts}
      />,
    );
    // Posts may appear both in the article list and in quick nav,
    // so use getAllByText to verify at least one instance exists.
    expect(screen.getAllByText("First Post").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Second Post").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Third Post").length).toBeGreaterThanOrEqual(1);
  });

  test("marks the current post as the current page", () => {
    render(
      <SeriesNav
        seriesId="ai-agent-ops"
        currentSlug="post-2"
        seriesPosts={mockPosts}
      />,
    );
    const currentLink = screen.getByRole("link", { current: "page" });
    expect(currentLink).toHaveAccessibleName("Second Post");
    expect(currentLink).toHaveAttribute("href", "/blog/post-2");
  });

  test("other posts are links", () => {
    render(
      <SeriesNav
        seriesId="ai-agent-ops"
        currentSlug="post-2"
        seriesPosts={mockPosts}
      />,
    );
    const listItems = screen.getByRole("list").querySelectorAll("a");
    const hrefs = Array.from(listItems).map((a) => a.getAttribute("href"));
    expect(hrefs).toContain("/blog/post-1");
    expect(hrefs).toContain("/blog/post-3");
  });

  test("prev/next links are correct for a middle post", () => {
    render(
      <SeriesNav
        seriesId="ai-agent-ops"
        currentSlug="post-2"
        seriesPosts={mockPosts}
      />,
    );
    expect(screen.getByText("連載の前の回")).toBeInTheDocument();
    expect(screen.getByText("連載の次の回")).toBeInTheDocument();

    // Verify quick nav links point to the correct posts
    const allPost1Links = screen.getAllByText("First Post");
    const prevLink = allPost1Links.find(
      (el) => el.closest("a")?.getAttribute("href") === "/blog/post-1",
    );
    expect(prevLink).toBeTruthy();

    const allPost3Links = screen.getAllByText("Third Post");
    const nextLink = allPost3Links.find(
      (el) => el.closest("a")?.getAttribute("href") === "/blog/post-3",
    );
    expect(nextLink).toBeTruthy();
  });

  test("first post has no 'prev' link", () => {
    render(
      <SeriesNav
        seriesId="ai-agent-ops"
        currentSlug="post-1"
        seriesPosts={mockPosts}
      />,
    );
    expect(screen.queryByText("連載の前の回")).toBeNull();
    expect(screen.getByText("連載の次の回")).toBeInTheDocument();
  });

  test("last post has no 'next' link", () => {
    render(
      <SeriesNav
        seriesId="ai-agent-ops"
        currentSlug="post-3"
        seriesPosts={mockPosts}
      />,
    );
    expect(screen.getByText("連載の前の回")).toBeInTheDocument();
    expect(screen.queryByText("連載の次の回")).toBeNull();
  });

  test("returns null when seriesPosts has 0 posts", () => {
    const { container } = render(
      <SeriesNav
        seriesId="ai-agent-ops"
        currentSlug="post-1"
        seriesPosts={[]}
      />,
    );
    expect(container.innerHTML).toBe("");
  });

  test("returns null when seriesPosts has only 1 post (R1)", () => {
    const singlePost = [mockPosts[0]];
    const { container } = render(
      <SeriesNav
        seriesId="ai-agent-ops"
        currentSlug="post-1"
        seriesPosts={singlePost}
      />,
    );
    expect(container.innerHTML).toBe("");
  });

  test("returns null when currentSlug is not found in seriesPosts", () => {
    const { container } = render(
      <SeriesNav
        seriesId="ai-agent-ops"
        currentSlug="non-existent-slug"
        seriesPosts={mockPosts}
      />,
    );
    expect(container.innerHTML).toBe("");
  });

  test("displays position label correctly", () => {
    render(
      <SeriesNav
        seriesId="ai-agent-ops"
        currentSlug="post-2"
        seriesPosts={mockPosts}
      />,
    );
    expect(screen.getByText("この記事は第2回")).toBeInTheDocument();
  });

  test("has aria-label for accessibility", () => {
    render(
      <SeriesNav
        seriesId="ai-agent-ops"
        currentSlug="post-2"
        seriesPosts={mockPosts}
      />,
    );
    const nav = screen.getByRole("navigation", {
      name: "連載",
    });
    expect(nav).toBeInTheDocument();
  });

  test("the list is ordered, named by the toggle, and each link is named by the title only", () => {
    render(
      <SeriesNav
        seriesId="ai-agent-ops"
        currentSlug="post-2"
        seriesPosts={mockPosts}
      />,
    );
    const list = screen.getByRole("list", {
      name: "連載「AIエージェント運用記」（全3回）",
    });
    expect(list.tagName).toBe("OL");
    const names = Array.from(list.querySelectorAll("a")).map((a) =>
      a.textContent?.trim(),
    );
    expect(names).toEqual(["First Post", "Second Post", "Third Post"]);
  });
});
