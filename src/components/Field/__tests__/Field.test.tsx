import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Field from "../index";
import phrasedStyles from "@/components/PhrasedText/PhrasedText.module.css";
import { followsPhraseRules } from "@/lib/phrase-breaks";
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

  it("無効のとき欄に disabled を渡し、理由を欄の直下に置いて欄の説明にする", () => {
    render(
      <Field
        label="枚数"
        disabled
        disabledReason="「自分で決める」を選ぶと書き込めます"
      >
        {(c) => <Input {...c} />}
      </Field>,
    );
    const input = screen.getByRole("textbox", { name: "枚数" });
    expect(input).toBeDisabled();
    expect(input).toHaveAccessibleDescription(
      "「自分で決める」を選ぶと書き込めます",
    );
  });

  it("無効でないときは理由を出さない", () => {
    render(
      <Field label="枚数" disabledReason="「自分で決める」を選ぶと書き込めます">
        {(c) => <Input {...c} />}
      </Field>,
    );
    expect(screen.getByRole("textbox")).toBeEnabled();
    expect(
      screen.queryByText("「自分で決める」を選ぶと書き込めます"),
    ).not.toBeInTheDocument();
  });

  it("「（必須）」を名前の後ろの1つの文節にし、名前の中と括弧の中では折らない", () => {
    const { container } = render(
      <Field label="生年月日" required>
        {(c) => <Input {...c} type="date" />}
      </Field>,
    );
    const name = container.querySelector("label > span")!;
    expect(name.innerHTML).toBe("生年月日<wbr>（必須）");
    expect(name).toHaveClass(phrasedStyles.phrased);
    expect(screen.getByLabelText("生年月日（必須）")).toHaveAttribute(
      "type",
      "date",
    );
    expect(followsPhraseRules(["生年月日", "（必須）"])).toBe(true);
  });

  it("区切りの並びの名前は文節で折り、必須なら「（必須）」を最後の文節に足す", () => {
    const phrases = ["基準日を", "変える"];
    const { container, rerender } = render(
      <Field label={phrases}>{(c) => <Input {...c} />}</Field>,
    );
    expect(container.querySelector("label")!.innerHTML).toContain(
      "基準日を<wbr>変える</span>",
    );
    rerender(
      <Field label={phrases} required>
        {(c) => <Input {...c} />}
      </Field>,
    );
    expect(container.querySelector("label > span")!.innerHTML).toBe(
      "基準日を<wbr>変える<wbr>（必須）",
    );
    expect(followsPhraseRules([...phrases, "（必須）"])).toBe(true);
  });

  it("必須でない文字列の名前は、区切りの無い1つの文節として文節で折るクラスで組む", () => {
    const { container } = render(
      <Field label="名前">{(c) => <Input {...c} />}</Field>,
    );
    const name = container.querySelector("label > span")!;
    expect(name.innerHTML).toBe("名前");
    expect(name).toHaveClass(phrasedStyles.phrased);
  });
});
