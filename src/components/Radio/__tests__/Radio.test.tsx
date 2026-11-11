import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Radio from "../index";

describe("Radio", () => {
  it("同じ name のラジオボタンが1組になり、ラベルを押すと選ばれる", () => {
    render(
      <fieldset>
        <legend>並び順</legend>
        <Radio name="order" value="new" label="新しい順" defaultChecked />
        <Radio name="order" value="old" label="古い順" />
      </fieldset>,
    );
    const newer = screen.getByRole("radio", { name: "新しい順" });
    const older = screen.getByRole("radio", { name: "古い順" });
    expect(newer).toBeChecked();
    fireEvent.click(screen.getByText("古い順"));
    expect(older).toBeChecked();
    expect(newer).not.toBeChecked();
  });

  it("ラベルを含む行全体が1つの label", () => {
    render(<Radio name="order" value="new" label="新しい順" />);
    expect(screen.getByText("新しい順").closest("label")).toHaveAttribute(
      "data-text-box",
      "inline",
    );
  });

  it("無効の理由を入力の説明として読ませる", () => {
    render(
      <Radio
        name="order"
        label="古い順"
        disabled
        disabledReason="記事が2件以上あると選べます"
      />,
    );
    expect(
      screen.getByRole("radio", { name: "古い順" }),
    ).toHaveAccessibleDescription("記事が2件以上あると選べます");
  });
});
