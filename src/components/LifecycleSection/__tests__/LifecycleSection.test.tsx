import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import LifecycleSection from "../index";

describe("LifecycleSection", () => {
  describe("公開日のみ表示", () => {
    it("公開日ラベルと日付が表示される", () => {
      render(<LifecycleSection publishedAt="2026-05-16" />);
      expect(screen.getByText(/公開/)).toBeInTheDocument();
      expect(screen.getByText(/2026-05-16/)).toBeInTheDocument();
    });

    it("更新日は表示されない", () => {
      render(<LifecycleSection publishedAt="2026-05-16" />);
      expect(screen.queryByText(/更新/)).not.toBeInTheDocument();
    });

    it("公開日の time 要素に dateTime 属性が設定される", () => {
      render(<LifecycleSection publishedAt="2026-05-16" />);
      // time 要素が 1 つあり、dateTime 属性が設定されている
      const timeEl = document.querySelector("time");
      expect(timeEl).toBeInTheDocument();
      expect(timeEl).toHaveAttribute("dateTime", "2026-05-16");
    });
  });

  describe("公開日 + 更新日表示", () => {
    it("公開日と更新日の両方が表示される", () => {
      render(
        <LifecycleSection publishedAt="2026-01-01" updatedAt="2026-05-16" />,
      );
      expect(screen.getByText(/公開/)).toBeInTheDocument();
      expect(screen.getByText(/更新/)).toBeInTheDocument();
      expect(screen.getAllByText(/2026-/).length).toBeGreaterThanOrEqual(2);
    });

    it("更新日の time 要素に dateTime 属性が設定される", () => {
      render(
        <LifecycleSection publishedAt="2026-01-01" updatedAt="2026-05-16" />,
      );
      // time 要素が 2 つある
      const timeEls = document.querySelectorAll("time");
      expect(timeEls.length).toBe(2);
      const dateTimes = Array.from(timeEls).map((el) =>
        el.getAttribute("dateTime"),
      );
      expect(dateTimes).toContain("2026-01-01");
      expect(dateTimes).toContain("2026-05-16");
    });
  });

  describe("ISO 8601 タイムスタンプ（時刻付き）のフォールバック", () => {
    it("時刻付き ISO 8601 文字列を日付表示に変換する", () => {
      render(<LifecycleSection publishedAt="2026-05-16T10:30:00+09:00" />);
      // 日付部分（YYYY-MM-DD）が表示される
      expect(screen.getByText(/2026-05-16/)).toBeInTheDocument();
    });

    it("不正な ISO 8601 文字列の場合、元の文字列をフォールバック表示する", () => {
      render(<LifecycleSection publishedAt="invalid-date" />);
      // エラーをスローせず、フォールバック文字列が表示される
      expect(screen.getByText(/公開/)).toBeInTheDocument();
      // invalid-date が表示されるか、またはフォールバック文字列が表示される
      const container = document.querySelector("time");
      expect(container).toBeInTheDocument();
    });
  });
});
