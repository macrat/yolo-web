import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import RadioGroup from "@/components/RadioGroup";

const options = [
  { label: "新しい順", value: "new" },
  { label: "古い順", value: "old" },
  { label: "名前の順", value: "name" },
];

describe("RadioGroup", () => {
  it("見出しを組の名前として読ませる", () => {
    render(
      <RadioGroup
        legend="並び順"
        options={options}
        value="new"
        onChange={vi.fn()}
      />,
    );
    const group = screen.getByRole("radiogroup", { name: "並び順" });
    expect(group.tagName).toBe("FIELDSET");
    expect(screen.getByText("並び順").tagName).toBe("LEGEND");
  });

  it("value の選択肢だけが選ばれている", () => {
    render(
      <RadioGroup
        legend="並び順"
        options={options}
        value="old"
        onChange={vi.fn()}
      />,
    );
    expect(screen.getByRole("radio", { name: "新しい順" })).not.toBeChecked();
    expect(screen.getByRole("radio", { name: "古い順" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "名前の順" })).not.toBeChecked();
  });

  it("選択肢は同じ name を持つ1組で、組ごとに name が違う", () => {
    render(
      <>
        <RadioGroup
          legend="A"
          options={options}
          value="new"
          onChange={vi.fn()}
        />
        <RadioGroup
          legend="B"
          options={options}
          value="new"
          onChange={vi.fn()}
        />
      </>,
    );
    const [a, b] = screen.getAllByRole("radiogroup");
    const namesA = new Set(
      Array.from(a.querySelectorAll("input")).map((input) => input.name),
    );
    const namesB = new Set(
      Array.from(b.querySelectorAll("input")).map((input) => input.name),
    );
    expect(namesA.size).toBe(1);
    expect(namesB.size).toBe(1);
    expect([...namesA][0]).not.toBe([...namesB][0]);
  });

  it("ラベルを押すと、その選択肢の値を onChange に渡す", () => {
    const handleChange = vi.fn();
    render(
      <RadioGroup
        legend="並び順"
        options={options}
        value="new"
        onChange={handleChange}
      />,
    );
    fireEvent.click(screen.getByText("名前の順"));
    expect(handleChange).toHaveBeenCalledWith("name");
  });
});
