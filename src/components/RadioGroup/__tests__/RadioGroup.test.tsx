import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import RadioGroup from "@/components/RadioGroup";
import { followsPhraseRules } from "@/lib/phrase-breaks";

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
    expect(group.querySelector("legend")).toHaveTextContent("並び順");
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

  it("区切りの並びの見出しと選択肢は文節で折り、読み上げの名前は元の文", () => {
    const legend = ["キーワードの", "書き方"];
    const choice = ["大文字に", "そろえる"];
    render(
      <RadioGroup
        legend={legend}
        options={[
          { label: choice, value: "upper" },
          { label: "そのまま", value: "keep" },
        ]}
        value="upper"
        onChange={vi.fn()}
      />,
    );
    const group = screen.getByRole("radiogroup", {
      name: "キーワードの書き方",
    });
    expect(group.querySelector("legend")!.innerHTML).toContain(
      "キーワードの<wbr>書き方",
    );
    const radio = screen.getByRole("radio", { name: "大文字にそろえる" });
    expect(radio.closest("label")!.innerHTML).toContain(
      "大文字に<wbr>そろえる",
    );
    expect(
      screen.getByRole("radio", { name: "そのまま" }).closest("label")!
        .innerHTML,
    ).not.toContain("<wbr>");
    expect(followsPhraseRules(legend)).toBe(true);
    expect(followsPhraseRules(choice)).toBe(true);
  });
});
