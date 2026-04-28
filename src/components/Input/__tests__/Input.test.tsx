import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import Input from "../index";

describe("Input", () => {
  it("デフォルトで type=text の input をレンダリングする", () => {
    render(<Input />);
    const input = screen.getByRole("textbox");
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute("type", "text");
  });

  it("type prop で input の type 属性が変わる", () => {
    render(<Input type="email" />);
    const input = screen.getByRole("textbox");
    expect(input).toHaveAttribute("type", "email");
  });

  it("type=password のとき input の type が password になる", () => {
    const { container } = render(<Input type="password" />);
    const input = container.querySelector("input");
    expect(input).toHaveAttribute("type", "password");
  });

  it("type=number のとき input の type が number になる", () => {
    const { container } = render(<Input type="number" />);
    const input = container.querySelector("input");
    expect(input).toHaveAttribute("type", "number");
  });

  it("controlled component として value/onChange が機能する", () => {
    const handleChange = vi.fn();
    render(<Input value="hello" onChange={handleChange} />);
    const input = screen.getByRole("textbox");
    expect(input).toHaveValue("hello");

    fireEvent.change(input, { target: { value: "world" } });
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it("uncontrolled component として defaultValue が反映される", () => {
    render(<Input defaultValue="初期値" />);
    const input = screen.getByRole("textbox");
    expect(input).toHaveValue("初期値");
  });

  it("disabled 時に input が disabled になる", () => {
    render(<Input disabled />);
    const input = screen.getByRole("textbox");
    expect(input).toBeDisabled();
  });

  it("error prop が true のとき aria-invalid が true になる", () => {
    render(<Input error />);
    const input = screen.getByRole("textbox");
    expect(input).toHaveAttribute("aria-invalid", "true");
  });

  it("error prop が false のとき aria-invalid が設定されない", () => {
    render(<Input />);
    const input = screen.getByRole("textbox");
    expect(input).not.toHaveAttribute("aria-invalid");
  });

  it("placeholder が正しく渡される", () => {
    render(<Input placeholder="入力してください" />);
    const input = screen.getByPlaceholderText("入力してください");
    expect(input).toBeInTheDocument();
  });

  it("その他の HTML 属性が透過される（...rest）", () => {
    render(<Input data-testid="my-input" name="username" />);
    const input = screen.getByTestId("my-input");
    expect(input).toHaveAttribute("name", "username");
  });
});
