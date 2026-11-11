import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import Textarea from "../index";

describe("Textarea", () => {
  it("textarea を描き、入力欄の共通の見え方（data-field）に乗る", () => {
    render(<Textarea aria-label="本文" />);
    const textarea = screen.getByRole("textbox");
    expect(textarea.tagName).toBe("TEXTAREA");
    expect(textarea).toHaveAttribute("data-field");
  });

  it("controlled で value と onChange が働く", () => {
    const handleChange = vi.fn();
    render(
      <Textarea aria-label="本文" value="hello" onChange={handleChange} />,
    );
    const textarea = screen.getByRole("textbox");
    expect(textarea).toHaveValue("hello");
    fireEvent.change(textarea, { target: { value: "world" } });
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it("uncontrolled で defaultValue が入る", () => {
    render(<Textarea aria-label="本文" defaultValue="初期値" />);
    expect(screen.getByRole("textbox")).toHaveValue("初期値");
  });

  it("error のときだけ aria-invalid を付ける", () => {
    const { rerender } = render(<Textarea aria-label="本文" error />);
    expect(screen.getByRole("textbox")).toHaveAttribute("aria-invalid", "true");
    rerender(<Textarea aria-label="本文" />);
    expect(screen.getByRole("textbox")).not.toHaveAttribute("aria-invalid");
  });

  it("variant='mono' のときだけ等幅のクラスを付ける", () => {
    const { rerender } = render(<Textarea aria-label="本文" variant="mono" />);
    expect(screen.getByRole("textbox").className).toMatch(/mono/);
    rerender(<Textarea aria-label="本文" />);
    expect(screen.getByRole("textbox").className).not.toMatch(/mono/);
  });

  it("readOnly・rows・disabled・ほかの属性をそのまま渡す", () => {
    render(
      <Textarea
        aria-label="本文"
        readOnly
        rows={8}
        spellCheck={false}
        name="content"
        aria-describedby="hint"
      />,
    );
    const textarea = screen.getByRole("textbox");
    expect(textarea).toHaveAttribute("readonly");
    expect(textarea).toHaveAttribute("rows", "8");
    expect(textarea).toHaveAttribute("spellcheck", "false");
    expect(textarea).toHaveAttribute("name", "content");
    expect(textarea).toHaveAttribute("aria-describedby", "hint");
  });

  it("ref が textarea に届く", () => {
    const ref = { current: null as HTMLTextAreaElement | null };
    render(<Textarea aria-label="本文" ref={ref} />);
    expect(ref.current?.tagName).toBe("TEXTAREA");
  });
});
