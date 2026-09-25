import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Field from "../index";
import Input from "@/components/Input";
import Select from "@/components/Select";

describe("Field", () => {
  it("ラベルが欄の名前になる", () => {
    render(
      <Field label="生年月日">{(c) => <Input {...c} type="date" />}</Field>,
    );
    expect(screen.getByLabelText("生年月日")).toHaveAttribute("type", "date");
  });

  it("ラベルを欄より前（上）に置く", () => {
    const { container } = render(
      <Field label="名前">{(c) => <Input {...c} />}</Field>,
    );
    const label = container.querySelector("label")!;
    const input = container.querySelector("input")!;
    expect(
      label.compareDocumentPosition(input) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it("必須を文字で示し、aria-required を付ける", () => {
    render(
      <Field label="名前" required>
        {(c) => <Input {...c} />}
      </Field>,
    );
    expect(screen.getByText(/必須/)).toBeInTheDocument();
    expect(screen.getByRole("textbox")).toHaveAttribute(
      "aria-required",
      "true",
    );
  });

  it("エラーのあいだ、欄を aria-invalid にし、欄の直下の理由の文を欄の説明にする", () => {
    const { container } = render(
      <Field label="年齢" error="数字で入力してください。">
        {(c) => <Input {...c} />}
      </Field>,
    );
    const input = screen.getByRole("textbox");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAccessibleDescription("数字で入力してください。");
    expect(input.nextElementSibling).toBe(
      container.querySelector('[role="alert"]'),
    );
  });

  it("エラーが無いときは理由の文も aria-invalid も持たない", () => {
    render(<Field label="年齢">{(c) => <Input {...c} />}</Field>);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.getByRole("textbox")).not.toHaveAttribute("aria-invalid");
  });

  it("選ぶ欄にも同じように付く", () => {
    render(
      <Field label="言語" error="言語を選んでください。">
        {(c) => (
          <Select {...c}>
            <option value="">選んでください</option>
          </Select>
        )}
      </Field>,
    );
    const select = screen.getByRole("combobox", { name: "言語" });
    expect(select).toHaveAttribute("aria-invalid", "true");
  });
});
