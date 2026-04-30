import { expect, test, describe, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import Pagination from "@/components/Pagination";

describe("Pagination", () => {
  describe("totalPages <= 1 のとき null を返す", () => {
    test("totalPages=1 のとき null", () => {
      const { container } = render(
        <Pagination currentPage={1} totalPages={1} basePath="/blog" />,
      );
      expect(container.firstChild).toBeNull();
    });

    test("totalPages=0 のとき null", () => {
      const { container } = render(
        <Pagination currentPage={1} totalPages={0} basePath="/blog" />,
      );
      expect(container.firstChild).toBeNull();
    });
  });

  describe("link モード（デフォルト）", () => {
    test("nav 要素が aria-label='ページナビゲーション' を持つ", () => {
      render(<Pagination currentPage={1} totalPages={5} basePath="/blog" />);
      expect(
        screen.getByRole("navigation", { name: "ページナビゲーション" }),
      ).toBeInTheDocument();
    });

    test("ページ番号リンクが totalPages 分生成される（5 ページ）", () => {
      render(<Pagination currentPage={3} totalPages={5} basePath="/blog" />);
      // 5 ページのとき省略なし: 1,2,3,4,5 のリンクが存在
      // + 前へ/次へリンクも含む
      const link2 = screen.getByRole("link", { name: "ページ2" });
      expect(link2).toHaveAttribute("href", "/blog/page/2");
      const link1 = screen.getByRole("link", { name: "ページ1" });
      expect(link1).toHaveAttribute("href", "/blog");
    });

    test("currentPage=1 のとき basePath 自体をリンク先とする", () => {
      render(<Pagination currentPage={2} totalPages={5} basePath="/blog" />);
      const page1Link = screen.getByRole("link", { name: "ページ1" });
      expect(page1Link).toHaveAttribute("href", "/blog");
    });

    test("currentPage=2 以上のとき /page/N をリンク先とする", () => {
      render(<Pagination currentPage={1} totalPages={5} basePath="/blog" />);
      const page2Link = screen.getByRole("link", { name: "ページ2" });
      expect(page2Link).toHaveAttribute("href", "/blog/page/2");
    });

    test("現在ページの要素は aria-current='page' を持つ", () => {
      render(<Pagination currentPage={3} totalPages={5} basePath="/blog" />);
      const current = screen.getByLabelText("ページ3");
      expect(current).toHaveAttribute("aria-current", "page");
    });

    test("前のページが存在しないとき「前へ」は <span> でレンダリングされ <a> ではない", () => {
      render(<Pagination currentPage={1} totalPages={5} basePath="/blog" />);
      // disabled 状態の prev は span（linkではない）でレンダリングされる
      // role="link" を持つ要素としては存在しないことを確認
      const prevLink = screen.queryByRole("link", { name: "前のページ" });
      expect(prevLink).toBeNull();
      // span として存在し aria-disabled を持つ
      const prevSpan = screen.getByLabelText("前のページ");
      expect(prevSpan.tagName.toLowerCase()).toBe("span");
      expect(prevSpan).toHaveAttribute("aria-disabled", "true");
    });

    test("次のページが存在しないとき「次へ」は <span> でレンダリングされ <a> ではない", () => {
      render(<Pagination currentPage={5} totalPages={5} basePath="/blog" />);
      const nextLink = screen.queryByRole("link", { name: "次のページ" });
      expect(nextLink).toBeNull();
      const nextSpan = screen.getByLabelText("次のページ");
      expect(nextSpan.tagName.toLowerCase()).toBe("span");
      expect(nextSpan).toHaveAttribute("aria-disabled", "true");
    });

    test("1 ページ目で「前へ」の span が href を持たない（不正 URL を生成しない）", () => {
      render(<Pagination currentPage={1} totalPages={5} basePath="/blog" />);
      const prevSpan = screen.getByLabelText("前のページ");
      expect(prevSpan).not.toHaveAttribute("href");
    });

    test("最終ページで「次へ」の span が href を持たない（不正 URL を生成しない）", () => {
      render(<Pagination currentPage={5} totalPages={5} basePath="/blog" />);
      const nextSpan = screen.getByLabelText("次のページ");
      expect(nextSpan).not.toHaveAttribute("href");
    });

    test("前のページが存在するとき「前へ」リンクが機能する href を持つ", () => {
      render(<Pagination currentPage={3} totalPages={5} basePath="/blog" />);
      const prev = screen.getByRole("link", { name: "前のページ" });
      expect(prev).not.toHaveAttribute("aria-disabled");
      expect(prev).toHaveAttribute("href", "/blog/page/2");
    });

    test("次のページが存在するとき「次へ」リンクが機能する href を持つ", () => {
      render(<Pagination currentPage={3} totalPages={5} basePath="/blog" />);
      const next = screen.getByRole("link", { name: "次のページ" });
      expect(next).not.toHaveAttribute("aria-disabled");
      expect(next).toHaveAttribute("href", "/blog/page/4");
    });

    test("10 ページの中間では省略記号が表示される", () => {
      render(<Pagination currentPage={5} totalPages={10} basePath="/blog" />);
      // generatePageNumbers が返す ... (ellipsis) が表示される
      const ellipses = screen.getAllByText("...");
      expect(ellipses.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("モバイルインジケータの a11y", () => {
    test(".mobileIndicator が aria-hidden 属性を持たない", () => {
      const { container } = render(
        <Pagination currentPage={3} totalPages={10} basePath="/blog" />,
      );
      // data-testid なしで CSS クラス名で特定（モジュール CSS のため実際のクラス名はハッシュ付き）
      // aria-hidden が付いていないことを確認する
      const nav = container.querySelector("nav");
      expect(nav).not.toBeNull();
      // aria-hidden="true" の要素が「X / Y」テキストを含む span に付いていないこと
      const hiddenElements = container.querySelectorAll('[aria-hidden="true"]');
      for (const el of hiddenElements) {
        // mobileIndicator の内容（数字/スラッシュ形式）を持つ要素が aria-hidden でないことを確認
        const text = el.textContent ?? "";
        // "3 / 10" のようなパターン（数字 / 数字）を含む要素は aria-hidden であってはならない
        expect(text).not.toMatch(/^\d+ \/ \d+$/);
      }
    });
  });

  describe("button モード", () => {
    test("onPageChange が渡されたページ番号で呼ばれる", () => {
      const handlePageChange = vi.fn();
      render(
        <Pagination
          mode="button"
          currentPage={1}
          totalPages={5}
          onPageChange={handlePageChange}
        />,
      );
      fireEvent.click(screen.getByRole("button", { name: "ページ2" }));
      expect(handlePageChange).toHaveBeenCalledWith(2);
    });

    test("disabled 状態のボタンは disabled 属性を持つ", () => {
      const handlePageChange = vi.fn();
      render(
        <Pagination
          mode="button"
          currentPage={1}
          totalPages={5}
          onPageChange={handlePageChange}
        />,
      );
      const prevBtn = screen.getByRole("button", { name: "前のページ" });
      expect(prevBtn).toBeDisabled();
    });

    test("disabled ボタンをクリックしても onPageChange が呼ばれない", () => {
      const handlePageChange = vi.fn();
      render(
        <Pagination
          mode="button"
          currentPage={1}
          totalPages={5}
          onPageChange={handlePageChange}
        />,
      );
      fireEvent.click(screen.getByRole("button", { name: "前のページ" }));
      expect(handlePageChange).not.toHaveBeenCalled();
    });

    test("「次へ」ボタンで currentPage+1 が渡される", () => {
      const handlePageChange = vi.fn();
      render(
        <Pagination
          mode="button"
          currentPage={3}
          totalPages={5}
          onPageChange={handlePageChange}
        />,
      );
      fireEvent.click(screen.getByRole("button", { name: "次のページ" }));
      expect(handlePageChange).toHaveBeenCalledWith(4);
    });
  });
});
