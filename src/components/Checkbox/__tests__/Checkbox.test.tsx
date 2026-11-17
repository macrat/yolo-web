import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import Checkbox from "../index";
import phrasedStyles from "@/components/PhrasedText/PhrasedText.module.css";
import { followsPhraseRules } from "@/lib/phrase-breaks";

describe("Checkbox", () => {
  it("ラベルを名前に持つチェックボックスを描く", () => {
    render(<Checkbox label="記号を含める" />);
    expect(
      screen.getByRole("checkbox", { name: "記号を含める" }),
    ).toBeInTheDocument();
  });

  it("ラベルを含む行全体が1つの label で、行のどこを押しても切り替わる", () => {
    const handleChange = vi.fn();
    render(<Checkbox label="記号を含める" onChange={handleChange} />);
    const row = screen.getByText("記号を含める").closest("label")!;
    expect(row).toHaveAttribute("data-text-box", "inline");
    fireEvent.click(row);
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it("defaultChecked・checked・disabled・id をそのまま渡す", () => {
    const { rerender } = render(
      <Checkbox label="通知" defaultChecked id="notify" />,
    );
    const checkbox = screen.getByRole("checkbox") as HTMLInputElement;
    expect(checkbox.checked).toBe(true);
    expect(checkbox.id).toBe("notify");
    rerender(<Checkbox label="通知" checked={false} disabled readOnly />);
    expect(screen.getByRole("checkbox")).toBeDisabled();
  });

  it("無効のあいだだけ理由を行の外に出し、入力の説明として読ませる", () => {
    const { rerender } = render(
      <Checkbox
        label="通知"
        disabled
        disabledReason="ログインすると選べます"
      />,
    );
    const checkbox = screen.getByRole("checkbox", { name: "通知" });
    expect(checkbox).toHaveAccessibleDescription("ログインすると選べます");
    expect(
      screen.getByText("ログインすると選べます").closest("label"),
    ).toBeNull();
    rerender(<Checkbox label="通知" disabledReason="ログインすると選べます" />);
    expect(
      screen.queryByText("ログインすると選べます"),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("checkbox")).not.toHaveAttribute(
      "aria-describedby",
    );
    expect(screen.getByRole("checkbox")).toBe(checkbox);
  });

  it("区切りの並びのラベルは文節で折り、読み上げの名前は元の文", () => {
    const phrases = ["連続する", "改行を", "まとめる"];
    render(<Checkbox label={phrases} />);
    const checkbox = screen.getByRole("checkbox", {
      name: "連続する改行をまとめる",
    });
    expect(checkbox.closest("label")!.innerHTML).toContain(
      "連続する<wbr>改行を<wbr>まとめる",
    );
    expect(followsPhraseRules(phrases)).toBe(true);
  });

  it("文字列のラベルは1つの文節として文節で折るクラスで組み、要素のラベルはそのまま組む", () => {
    const { container } = render(
      <>
        <Checkbox label="記号を含める" />
        <Checkbox
          label={
            <>
              <code>g</code> 全体
            </>
          }
        />
      </>,
    );
    const [plain, element] = container.querySelectorAll("label");
    const plainLabel = plain.lastElementChild!;
    expect(plainLabel.innerHTML).toBe("記号を含める");
    expect(plainLabel).toHaveClass(phrasedStyles.phrased);
    const elementLabel = element.lastElementChild!;
    expect(elementLabel.innerHTML).toBe("<code>g</code> 全体");
    expect(elementLabel).not.toHaveClass(phrasedStyles.phrased);
  });

  it("ラベルの折り方は PhrasedText だけが持ち、auto-phrase に頼らない", () => {
    const css = readFileSync(
      resolve(__dirname, "../../ChoiceRow/ChoiceRow.module.css"),
      "utf-8",
    );
    expect(css).not.toMatch(/auto-phrase/);
  });
});
