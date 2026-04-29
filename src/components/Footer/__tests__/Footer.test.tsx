import { expect, test, describe } from "vitest";
import { render, screen } from "@testing-library/react";
import Footer from "@/components/Footer";

describe("Footer", () => {
  test("サイト名「yolos.net」が描画される", () => {
    render(<Footer />);
    const footer = screen.getByRole("contentinfo");
    expect(footer.textContent).toContain("yolos.net");
  });

  test("著作権マーク（©）が描画される", () => {
    render(<Footer />);
    expect(screen.getByRole("contentinfo").textContent).toContain("©");
  });

  test("内部固定のリンク（About / Privacy）が描画される", () => {
    render(<Footer />);
    const aboutLink = screen.getByRole("link", { name: "About" });
    expect(aboutLink).toHaveAttribute("href", "/about");

    const privacyLink = screen.getByRole("link", { name: "Privacy" });
    expect(privacyLink).toHaveAttribute("href", "/privacy");
  });

  test("AI 運営の注記が描画される（constitution Rule 3 の安全装置）", () => {
    render(<Footer />);
    const footer = screen.getByRole("contentinfo");
    // 上書き不可・固定文言。「AI」と「不正確」の語を含むことを確認
    expect(footer.textContent).toContain("AI");
    expect(footer.textContent).toContain("不正確");
  });

  test("footer 要素が role='contentinfo' を持つ", () => {
    render(<Footer />);
    const footer = screen.getByRole("contentinfo");
    expect(footer.tagName.toLowerCase()).toBe("footer");
  });
});
