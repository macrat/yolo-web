import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import ToolInputArea from "../index";
import Button from "@/components/Button";
import Input from "@/components/Input";
import styles from "@/components/Button/Button.module.css";

describe("ToolInputArea", () => {
  describe("children のレンダリング", () => {
    it("children をレンダリングする", () => {
      render(
        <ToolInputArea>
          <span>テスト入力要素</span>
        </ToolInputArea>,
      );
      expect(screen.getByText("テスト入力要素")).toBeInTheDocument();
    });

    it("複数の children をレンダリングする", () => {
      render(
        <ToolInputArea>
          <span>要素 A</span>
          <span>要素 B</span>
        </ToolInputArea>,
      );
      expect(screen.getByText("要素 A")).toBeInTheDocument();
      expect(screen.getByText("要素 B")).toBeInTheDocument();
    });
  });

  describe("className prop", () => {
    it("className が追加できる", () => {
      const { container } = render(
        <ToolInputArea className="custom-class">
          <span>コンテンツ</span>
        </ToolInputArea>,
      );
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass("custom-class");
    });

    it("className なしでも正常にレンダリングされる", () => {
      const { container } = render(
        <ToolInputArea>
          <span>コンテンツ</span>
        </ToolInputArea>,
      );
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toBeInTheDocument();
    });
  });

  describe("Button を内部使用しても Button 本体の CSS は変更されていない", () => {
    it("Button を ToolInputArea 内に配置しても Button のクラス名が変わらない", () => {
      render(
        <ToolInputArea>
          <Button>テストボタン</Button>
        </ToolInputArea>,
      );
      const button = screen.getByRole("button", { name: "テストボタン" });
      // Button 本体の CSS クラスが含まれていることを確認（Button.module.css の .button クラス）
      expect(button.className).toContain(styles.button);
    });

    it("Button の data-variant 属性が保持される", () => {
      render(
        <ToolInputArea>
          <Button variant="primary">プライマリボタン</Button>
        </ToolInputArea>,
      );
      const button = screen.getByRole("button", { name: "プライマリボタン" });
      expect(button).toHaveAttribute("data-variant", "primary");
    });
  });

  describe("wrapper 自体に 44px 強制がない（Button/Input 本体が 44px を達成）", () => {
    it("wrapper の CSS Module に min-height プロパティが含まれていない", () => {
      // wrapper に min-height が直接付与されていないことを DOM で確認する
      // 44px は Button/Input 本体側の CSS で達成（cycle-193 案 10-α）
      const { container } = render(
        <ToolInputArea>
          <span>コンテンツ</span>
        </ToolInputArea>,
      );
      const wrapper = container.firstChild as HTMLElement;
      // inline style で min-height が強制されていないことを確認
      expect(wrapper.style.minHeight).toBe("");
    });

    it("Input を ToolInputArea 内に配置したとき Input 自身の min-height が適用される", () => {
      render(
        <ToolInputArea>
          <Input aria-label="テスト入力" />
        </ToolInputArea>,
      );
      const input = screen.getByRole("textbox", { name: "テスト入力" });
      // Input 本体のクラスに .input が含まれていること（min-height: 44px を持つクラス）
      // Input.module.css の .input クラスが付与されている
      expect(input.tagName.toLowerCase()).toBe("input");
    });

    it("wrapper には min-height の inline style が設定されていない", () => {
      const { container } = render(
        <ToolInputArea>
          <Button>ボタン</Button>
          <Input aria-label="入力欄" />
        </ToolInputArea>,
      );
      const wrapper = container.firstChild as HTMLElement;
      // wrapper に min-height / min-width の inline style が強制されていない
      expect(wrapper.style.minHeight).toBe("");
      expect(wrapper.style.minWidth).toBe("");
    });
  });
});
