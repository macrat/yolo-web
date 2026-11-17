import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import Input from "../index";

describe("Input", () => {
  it("既定で type=text の input を描く", () => {
    render(<Input aria-label="名前" />);
    expect(screen.getByRole("textbox")).toHaveAttribute("type", "text");
  });

  it.each(["email", "password", "number", "date"] as const)(
    "type=%s を input に渡す",
    (type) => {
      const { container } = render(<Input type={type} aria-label="欄" />);
      expect(container.querySelector("input")).toHaveAttribute("type", type);
    },
  );

  it("入力欄の共通の見え方（data-field）に乗る", () => {
    render(<Input aria-label="名前" />);
    expect(screen.getByRole("textbox")).toHaveAttribute("data-field");
  });

  it("controlled で value と onChange が働く", () => {
    const handleChange = vi.fn();
    render(<Input aria-label="名前" value="hello" onChange={handleChange} />);
    const input = screen.getByRole("textbox");
    expect(input).toHaveValue("hello");
    fireEvent.change(input, { target: { value: "world" } });
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it("uncontrolled で defaultValue が入る", () => {
    render(<Input aria-label="名前" defaultValue="初期値" />);
    expect(screen.getByRole("textbox")).toHaveValue("初期値");
  });

  it("error のときだけ aria-invalid を付ける", () => {
    const { rerender } = render(<Input aria-label="名前" error />);
    expect(screen.getByRole("textbox")).toHaveAttribute("aria-invalid", "true");
    rerender(<Input aria-label="名前" />);
    expect(screen.getByRole("textbox")).not.toHaveAttribute("aria-invalid");
  });

  it("ほかの属性と className をそのまま渡す", () => {
    render(
      <Input
        aria-label="名前"
        name="username"
        className="custom"
        disabled
        autoComplete="name"
      />,
    );
    const input = screen.getByRole("textbox");
    expect(input).toHaveAttribute("name", "username");
    expect(input).toHaveAttribute("autocomplete", "name");
    expect(input).toHaveClass("custom");
    expect(input).toBeDisabled();
  });
});
