import { expect, test, describe } from "vitest";
import { render, screen } from "@testing-library/react";
import Footer from "@/components/Footer";

describe("Footer", () => {
  test("デフォルトでサイト名と著作権表示が描画される", () => {
    render(<Footer />);
    // サイト名と著作権がフッター内に含まれることを確認
    const footer = screen.getByRole("contentinfo");
    expect(footer.textContent).toContain("yolos.net");
  });

  test("著作権マーク（©）が描画される", () => {
    render(<Footer />);
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
    expect(screen.getByRole("contentinfo").textContent).toContain("©");
  });

  test("props で渡した links が href を含めて描画される", () => {
    const links = [
      { label: "About", href: "/about" },
      { label: "Privacy", href: "/privacy" },
    ];
    render(<Footer links={links} />);
    const aboutLink = screen.getByRole("link", { name: "About" });
    expect(aboutLink).toBeInTheDocument();
    expect(aboutLink).toHaveAttribute("href", "/about");

    const privacyLink = screen.getByRole("link", { name: "Privacy" });
    expect(privacyLink).toBeInTheDocument();
    expect(privacyLink).toHaveAttribute("href", "/privacy");
  });

  test("links を渡さない場合はデフォルトのリンクが描画される", () => {
    render(<Footer />);
    expect(screen.getByRole("link", { name: "About" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Privacy" })).toBeInTheDocument();
  });

  test("note prop でカスタム注記が描画される", () => {
    render(<Footer note="カスタム注記テキスト" />);
    expect(screen.getByText("カスタム注記テキスト")).toBeInTheDocument();
  });

  test("note を渡さない場合はデフォルトの AI 運営注記が描画される", () => {
    render(<Footer />);
    // デフォルト注記に AI に関する文言が含まれる
    expect(screen.getByRole("contentinfo").textContent).toContain("AI");
  });

  test("footer 要素が role='contentinfo' を持つ", () => {
    render(<Footer />);
    const footer = screen.getByRole("contentinfo");
    expect(footer.tagName.toLowerCase()).toBe("footer");
  });
});
