import { expect, test, describe, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import Pagination from "../Pagination";

describe("Pagination (link mode)", () => {
  test("renders null when totalPages is 1", () => {
    const { container } = render(
      <Pagination currentPage={1} totalPages={1} basePath="/blog" />,
    );
    expect(container.innerHTML).toBe("");
  });

  test("renders navigation with correct aria-label", () => {
    render(<Pagination currentPage={1} totalPages={3} basePath="/blog" />);
    expect(
      screen.getByRole("navigation", { name: "ページナビゲーション" }),
    ).toBeInTheDocument();
  });

  test("renders page number links with correct hrefs", () => {
    render(<Pagination currentPage={2} totalPages={3} basePath="/blog" />);
    // Page 1 should link to basePath
    const page1 = screen.getByRole("link", { name: "ページ1" });
    expect(page1).toHaveAttribute("href", "/blog");

    // Page 2 should link to /blog/page/2
    // Page 2 is current, so it should have active class (not a link)
    // Page 3 should link to /blog/page/3
    const page3 = screen.getByRole("link", { name: "ページ3" });
    expect(page3).toHaveAttribute("href", "/blog/page/3");
  });

  test("disables previous button on first page", () => {
    render(<Pagination currentPage={1} totalPages={3} basePath="/blog" />);
    const prevButton = screen.getByLabelText("前のページ");
    expect(prevButton).toHaveAttribute("aria-disabled", "true");
    // On first page, prev should be a span (not a link)
    expect(prevButton.tagName).toBe("SPAN");
  });

  test("disables next button on last page", () => {
    render(<Pagination currentPage={3} totalPages={3} basePath="/blog" />);
    const nextButton = screen.getByLabelText("次のページ");
    expect(nextButton).toHaveAttribute("aria-disabled", "true");
    expect(nextButton.tagName).toBe("SPAN");
  });

  test("enables both prev and next on middle page", () => {
    render(<Pagination currentPage={2} totalPages={3} basePath="/blog" />);
    const prev = screen.getByRole("link", { name: "前のページ" });
    expect(prev).toHaveAttribute("href", "/blog");

    const next = screen.getByRole("link", { name: "次のページ" });
    expect(next).toHaveAttribute("href", "/blog/page/3");
  });

  test("renders ellipsis when there are many pages", () => {
    render(<Pagination currentPage={5} totalPages={10} basePath="/blog" />);
    const ellipses = screen.getAllByText("...");
    expect(ellipses.length).toBeGreaterThanOrEqual(1);
    for (const el of ellipses) {
      expect(el).toHaveAttribute("aria-hidden", "true");
    }
  });

  test("marks current page with active styling", () => {
    render(<Pagination currentPage={2} totalPages={5} basePath="/blog" />);
    // The current page element should exist and have aria-label
    const currentPageEl = screen.getByLabelText("ページ2");
    expect(currentPageEl).toBeInTheDocument();
    // It should have pointer-events: none via the active class
    // (CSS Modules class names are hashed, so we check the element exists)
  });

  test("handles basePath with category", () => {
    render(
      <Pagination
        currentPage={1}
        totalPages={3}
        basePath="/blog/category/tech"
      />,
    );
    const page2 = screen.getByRole("link", { name: "ページ2" });
    expect(page2).toHaveAttribute("href", "/blog/category/tech/page/2");
  });

  test("page 1 links to basePath without /page/1 suffix", () => {
    render(<Pagination currentPage={2} totalPages={3} basePath="/tools" />);
    const page1 = screen.getByRole("link", { name: "ページ1" });
    expect(page1).toHaveAttribute("href", "/tools");
  });

  test("renders mobile indicator with correct text", () => {
    const { container } = render(
      <Pagination currentPage={3} totalPages={10} basePath="/blog" />,
    );
    // The mobile indicator is hidden via CSS but still in DOM
    // Find the one that contains "3 / 10"
    const mobileIndicator = Array.from(
      container.querySelectorAll("[aria-hidden='true']"),
    ).find((el) => el.textContent === "3 / 10");
    expect(mobileIndicator).toBeTruthy();
  });
});

describe("Pagination (button mode)", () => {
  test("renders buttons instead of links", () => {
    const onPageChange = vi.fn();
    render(
      <Pagination
        mode="button"
        currentPage={2}
        totalPages={5}
        onPageChange={onPageChange}
      />,
    );
    // Page numbers should be buttons, not links
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThan(0);

    // Should not have any links
    const links = screen.queryAllByRole("link");
    expect(links).toHaveLength(0);
  });

  test("calls onPageChange when a page button is clicked", () => {
    const onPageChange = vi.fn();
    render(
      <Pagination
        mode="button"
        currentPage={2}
        totalPages={5}
        onPageChange={onPageChange}
      />,
    );

    const page3Button = screen.getByRole("button", { name: "ページ3" });
    fireEvent.click(page3Button);
    expect(onPageChange).toHaveBeenCalledWith(3);
  });

  test("calls onPageChange with previous page on prev click", () => {
    const onPageChange = vi.fn();
    render(
      <Pagination
        mode="button"
        currentPage={3}
        totalPages={5}
        onPageChange={onPageChange}
      />,
    );

    const prevButton = screen.getByRole("button", { name: "前のページ" });
    fireEvent.click(prevButton);
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  test("calls onPageChange with next page on next click", () => {
    const onPageChange = vi.fn();
    render(
      <Pagination
        mode="button"
        currentPage={2}
        totalPages={5}
        onPageChange={onPageChange}
      />,
    );

    const nextButton = screen.getByRole("button", { name: "次のページ" });
    fireEvent.click(nextButton);
    expect(onPageChange).toHaveBeenCalledWith(3);
  });

  test("disables previous button on first page", () => {
    const onPageChange = vi.fn();
    render(
      <Pagination
        mode="button"
        currentPage={1}
        totalPages={3}
        onPageChange={onPageChange}
      />,
    );

    const prevButton = screen.getByRole("button", { name: "前のページ" });
    expect(prevButton).toBeDisabled();
  });

  test("disables next button on last page", () => {
    const onPageChange = vi.fn();
    render(
      <Pagination
        mode="button"
        currentPage={3}
        totalPages={3}
        onPageChange={onPageChange}
      />,
    );

    const nextButton = screen.getByRole("button", { name: "次のページ" });
    expect(nextButton).toBeDisabled();
  });

  test("renders null when totalPages is 1", () => {
    const onPageChange = vi.fn();
    const { container } = render(
      <Pagination
        mode="button"
        currentPage={1}
        totalPages={1}
        onPageChange={onPageChange}
      />,
    );
    expect(container.innerHTML).toBe("");
  });
});
