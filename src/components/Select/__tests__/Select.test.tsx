import { createRef } from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import Select from "../index";

describe("Select", () => {
  it("select と候補を描き、入力欄の共通の見え方（data-field）に乗る", () => {
    render(
      <Select aria-label="果物">
        <option value="apple">りんご</option>
        <option value="banana">バナナ</option>
      </Select>,
    );
    const select = screen.getByRole("combobox", { name: "果物" });
    expect(select).toHaveAttribute("data-field");
    expect(screen.getByText("りんご")).toBeInTheDocument();
    expect(screen.getByText("バナナ")).toBeInTheDocument();
  });

  it("controlled で value と onChange が働く", () => {
    const handleChange = vi.fn();
    render(
      <Select aria-label="選択" value="b" onChange={handleChange}>
        <option value="a">A</option>
        <option value="b">B</option>
      </Select>,
    );
    const select = screen.getByRole("combobox");
    expect(select).toHaveValue("b");
    fireEvent.change(select, { target: { value: "a" } });
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it("uncontrolled で defaultValue が入る", () => {
    render(
      <Select aria-label="選択" defaultValue="b">
        <option value="a">A</option>
        <option value="b">B</option>
      </Select>,
    );
    expect(screen.getByRole("combobox")).toHaveValue("b");
  });

  it("error のときだけ aria-invalid を付ける", () => {
    const { rerender } = render(
      <Select aria-label="選択" error>
        <option value="a">A</option>
      </Select>,
    );
    expect(screen.getByRole("combobox")).toHaveAttribute(
      "aria-invalid",
      "true",
    );
    rerender(
      <Select aria-label="選択">
        <option value="a">A</option>
      </Select>,
    );
    expect(screen.getByRole("combobox")).not.toHaveAttribute("aria-invalid");
  });

  it("ほかの属性と className をそのまま渡す", () => {
    render(
      <Select
        aria-label="選択"
        name="fruit"
        disabled
        className="custom"
        aria-describedby="desc"
      >
        <option value="a">A</option>
      </Select>,
    );
    const select = screen.getByRole("combobox");
    expect(select).toHaveAttribute("name", "fruit");
    expect(select).toHaveAttribute("aria-describedby", "desc");
    expect(select).toHaveClass("custom");
    expect(select).toBeDisabled();
  });

  it("ref が select に届く", () => {
    const ref = createRef<HTMLSelectElement>();
    render(
      <Select aria-label="選択" ref={ref}>
        <option value="a">A</option>
      </Select>,
    );
    expect(ref.current?.tagName).toBe("SELECT");
  });
});
