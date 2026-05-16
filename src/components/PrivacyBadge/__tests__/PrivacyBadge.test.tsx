import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import PrivacyBadge from "../index";

describe("PrivacyBadge", () => {
  it("「ブラウザ内で完結」の趣旨テキストが表示される", () => {
    render(<PrivacyBadge />);
    expect(screen.getByText(/ブラウザ内で完結/)).toBeInTheDocument();
  });

  it("「外部に送信されません」の趣旨テキストが表示される", () => {
    render(<PrivacyBadge />);
    expect(screen.getByText(/外部に送信/)).toBeInTheDocument();
  });

  it("className prop が渡されたとき、ルート要素に追加クラスが付与される", () => {
    const { container } = render(<PrivacyBadge className="custom-class" />);
    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("className prop がないとき、ルート要素に追加クラスは付与されない", () => {
    const { container } = render(<PrivacyBadge />);
    expect(container.firstChild).not.toHaveClass("custom-class");
  });

  it("役割を示す role 属性または landmark が存在しないが、テキストが読み取り可能", () => {
    render(<PrivacyBadge />);
    // テキストが DOM に存在すること（スクリーンリーダーが読める）
    const el = screen.getByText(/ブラウザ内で完結/);
    expect(el).toBeInTheDocument();
  });
});
