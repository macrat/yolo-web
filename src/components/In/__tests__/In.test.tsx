import { expect, test, describe } from "vitest";
import { render, screen } from "@testing-library/react";
import In from "@/components/In";

describe("In（印）", () => {
  test("一文字を表示する", () => {
    const { container } = render(<In char="診" label="印 診" />);
    expect(container.textContent).toContain("診");
  });

  test("§4「文字1字」——2文字以上は先頭1文字に切り詰める", () => {
    const { container } = render(<In char="診断" />);
    expect(container.textContent).toBe("診");
  });

  test("サロゲートペアの1書記素も1文字として扱う", () => {
    const { container } = render(<In char="𠮷野" />);
    expect(container.textContent).toBe("𠮷");
  });

  test("§4「±8°以内」——範囲外の角度はクランプされる", () => {
    const { container } = render(<In char="吉" rotateDeg={45} />);
    const el = container.querySelector("span");
    // クランプ後 +8deg がカスタムプロパティに入る
    expect(el?.getAttribute("style")).toContain("8deg");
    expect(el?.getAttribute("style")).not.toContain("45deg");
  });

  test("負の範囲外もクランプされる", () => {
    const { container } = render(<In char="吉" rotateDeg={-45} />);
    const el = container.querySelector("span");
    expect(el?.getAttribute("style")).toContain("-8deg");
  });

  test("size をカスタムプロパティで受け取る", () => {
    const { container } = render(<In char="吉" size="100%" />);
    const el = container.querySelector("span");
    expect(el?.getAttribute("style")).toContain("100%");
  });

  test("円環は SVG の circle で描く（border-radius:50% を使わない・§8-5 回避）", () => {
    const { container } = render(<In char="吉" />);
    expect(container.querySelector("svg circle")).not.toBeNull();
  });

  test("label があれば role=img とラベルを付ける", () => {
    render(<In char="吉" label="印 吉" />);
    expect(screen.getByRole("img", { name: "印 吉" })).toBeInTheDocument();
  });

  test("label が無ければ装飾として aria-hidden にする", () => {
    const { container } = render(<In char="吉" />);
    const el = container.querySelector("span");
    expect(el?.getAttribute("aria-hidden")).toBe("true");
  });
});
