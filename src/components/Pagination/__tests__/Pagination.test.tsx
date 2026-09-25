import { expect, test, describe, vi } from "vitest";
import { useState } from "react";
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

    test("1 ページ目では「前へ」を置かない", () => {
      render(<Pagination currentPage={1} totalPages={5} basePath="/blog" />);
      expect(screen.queryByLabelText("前のページ")).toBeNull();
    });

    test("最終ページでは「次へ」を置かない", () => {
      render(<Pagination currentPage={5} totalPages={5} basePath="/blog" />);
      expect(screen.queryByLabelText("次のページ")).toBeNull();
    });

    test("端では「前へ」「次へ」の代わりに、読み上げずフォーカスも受けない場所取りを置く", () => {
      const { container } = render(
        <Pagination currentPage={1} totalPages={5} basePath="/blog" />,
      );
      const nav = container.querySelector("nav");
      const first = nav?.firstElementChild;
      expect(first?.tagName).toBe("SPAN");
      expect(first).toHaveAttribute("aria-hidden", "true");
      expect(first).not.toHaveAttribute("tabindex");
      expect(first).toHaveTextContent("前へ");
    });

    test("前のページが存在するとき「前へ」リンクが機能する href を持つ", () => {
      render(<Pagination currentPage={3} totalPages={5} basePath="/blog" />);
      const prev = screen.getByRole("link", { name: "前のページ" });
      expect(prev).toHaveAttribute("href", "/blog/page/2");
    });

    test("次のページが存在するとき「次へ」リンクが機能する href を持つ", () => {
      render(<Pagination currentPage={3} totalPages={5} basePath="/blog" />);
      const next = screen.getByRole("link", { name: "次のページ" });
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

    // role を持たない span の aria-label は読まれないので、読ませる文を文字で持つ
    test("「n / N」は aria-label を持たず、文字で「ページ n / N」と読ませる", () => {
      const { container } = render(
        <Pagination currentPage={3} totalPages={10} basePath="/blog" />,
      );
      const indicator = Array.from(
        container.querySelectorAll("nav > span"),
      ).find((el) => /\d+ \/ \d+$/.test(el.textContent ?? ""));
      expect(indicator).toBeDefined();
      expect(indicator).not.toHaveAttribute("aria-label");
      expect(indicator).toHaveTextContent("ページ 3 / 10");
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

    test("1 ページ目では「前へ」のボタンを置かない", () => {
      render(
        <Pagination
          mode="button"
          currentPage={1}
          totalPages={5}
          onPageChange={vi.fn()}
        />,
      );
      expect(screen.queryByRole("button", { name: "前のページ" })).toBeNull();
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

    test("端に着いて「次へ」が消えたら、フォーカスをいまのページに移す", () => {
      function Controlled() {
        const [page, setPage] = useState(4);
        return (
          <Pagination
            mode="button"
            currentPage={page}
            totalPages={5}
            onPageChange={setPage}
          />
        );
      }
      render(<Controlled />);
      const next = screen.getByRole("button", { name: "次のページ" });
      next.focus();
      fireEvent.click(next);
      expect(screen.queryByRole("button", { name: "次のページ" })).toBeNull();
      expect(document.activeElement).toBe(
        screen.getByRole("button", { name: "ページ5" }),
      );
    });
  });
});
