import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect } from "vitest";
import AccordionItem from "../index";

describe("AccordionItem", () => {
  describe("初期レンダリング", () => {
    it("title が表示される", () => {
      render(<AccordionItem title="テストタイトル">内容</AccordionItem>);
      expect(screen.getByText("テストタイトル")).toBeInTheDocument();
    });

    it("defaultOpen=false（デフォルト）のとき children が非表示", () => {
      render(<AccordionItem title="タイトル">折りたたみ内容</AccordionItem>);
      // hidden 属性で非表示。getByRole は hidden: true で取得し、not.toBeVisible() で確認する
      const region = screen.getByRole("region", { hidden: true });
      expect(region).not.toBeVisible();
    });

    it("defaultOpen=true のとき children が表示される", () => {
      render(
        <AccordionItem title="タイトル" defaultOpen>
          開いている内容
        </AccordionItem>,
      );
      expect(screen.getByText("開いている内容")).toBeVisible();
    });
  });

  describe("開閉動作", () => {
    it("トリガーをクリックすると開く", async () => {
      const user = userEvent.setup();
      render(<AccordionItem title="タイトル">クリック後の内容</AccordionItem>);

      const trigger = screen.getByRole("button", { name: /タイトル/ });
      await user.click(trigger);

      expect(screen.getByText("クリック後の内容")).toBeVisible();
    });

    it("開いた状態でトリガーをクリックすると閉じる", async () => {
      const user = userEvent.setup();
      render(
        <AccordionItem title="タイトル" defaultOpen>
          開閉テスト内容
        </AccordionItem>,
      );

      const trigger = screen.getByRole("button", { name: /タイトル/ });
      await user.click(trigger);

      // hidden 属性で非表示になる
      const region = screen.getByRole("region", { hidden: true });
      expect(region).not.toBeVisible();
    });

    it("キーボード Space で開閉できる", async () => {
      const user = userEvent.setup();
      render(
        <AccordionItem title="タイトル">キーボードテスト内容</AccordionItem>,
      );

      const trigger = screen.getByRole("button", { name: /タイトル/ });
      trigger.focus();
      await user.keyboard(" ");

      expect(screen.getByText("キーボードテスト内容")).toBeVisible();
    });

    it("キーボード Enter で開閉できる", async () => {
      const user = userEvent.setup();
      render(
        <AccordionItem title="タイトル">
          キーボードEnterテスト内容
        </AccordionItem>,
      );

      const trigger = screen.getByRole("button", { name: /タイトル/ });
      trigger.focus();
      await user.keyboard("{Enter}");

      expect(screen.getByText("キーボードEnterテスト内容")).toBeVisible();
    });
  });

  describe("aria 属性", () => {
    it("閉じているとき aria-expanded=false", () => {
      render(<AccordionItem title="タイトル">内容</AccordionItem>);
      const trigger = screen.getByRole("button", { name: /タイトル/ });
      expect(trigger).toHaveAttribute("aria-expanded", "false");
    });

    it("開いているとき aria-expanded=true", () => {
      render(
        <AccordionItem title="タイトル" defaultOpen>
          内容
        </AccordionItem>,
      );
      const trigger = screen.getByRole("button", { name: /タイトル/ });
      expect(trigger).toHaveAttribute("aria-expanded", "true");
    });

    it("トリガーのクリック後に aria-expanded が true に変わる", async () => {
      const user = userEvent.setup();
      render(<AccordionItem title="タイトル">内容</AccordionItem>);
      const trigger = screen.getByRole("button", { name: /タイトル/ });

      expect(trigger).toHaveAttribute("aria-expanded", "false");
      await user.click(trigger);
      expect(trigger).toHaveAttribute("aria-expanded", "true");
    });

    it("閉じている状態でも aria-controls が region の ID を指している（WAI-ARIA APG 準拠）", () => {
      render(<AccordionItem title="タイトル">内容</AccordionItem>);
      const trigger = screen.getByRole("button", { name: /タイトル/ });
      const controlsId = trigger.getAttribute("aria-controls");
      expect(controlsId).not.toBeNull();
      // hidden 属性がついていても DOM に存在する
      const region = document.getElementById(controlsId!);
      expect(region).toBeInTheDocument();
    });

    it("開いている状態でも aria-controls が region の ID を指している", () => {
      render(
        <AccordionItem title="タイトル" defaultOpen>
          内容
        </AccordionItem>,
      );
      const trigger = screen.getByRole("button", { name: /タイトル/ });
      const controlsId = trigger.getAttribute("aria-controls");
      expect(controlsId).not.toBeNull();
      const region = document.getElementById(controlsId!);
      expect(region).toBeInTheDocument();
    });

    it("region は aria-labelledby でトリガーを参照している", () => {
      render(
        <AccordionItem title="タイトル" defaultOpen>
          内容
        </AccordionItem>,
      );
      const trigger = screen.getByRole("button", { name: /タイトル/ });
      const region = screen.getByRole("region");
      expect(region).toHaveAttribute("aria-labelledby", trigger.id);
    });
  });

  describe("focus 管理", () => {
    it("トリガーがキーボードフォーカス可能（tabIndex が -1 でない）", () => {
      render(<AccordionItem title="タイトル">内容</AccordionItem>);
      const trigger = screen.getByRole("button", { name: /タイトル/ });
      expect(trigger).not.toHaveAttribute("tabindex", "-1");
    });

    it("開いているとき children 内のフォーカス可能要素が Tab 順に入る", async () => {
      const user = userEvent.setup();
      render(
        <AccordionItem title="タイトル" defaultOpen>
          <button type="button">children 内ボタン</button>
        </AccordionItem>,
      );
      // region が visible なので内部ボタンも Tab 対象になる
      const innerButton = screen.getByRole("button", {
        name: "children 内ボタン",
      });
      await user.tab();
      await user.tab();
      expect(innerButton).toHaveFocus();
    });

    it("閉じているとき children 内のフォーカス可能要素が Tab 順に入らない", async () => {
      const user = userEvent.setup();
      render(
        <AccordionItem title="タイトル">
          <button type="button">children 内ボタン</button>
        </AccordionItem>,
      );
      // hidden 属性により内部要素はフォーカス不可
      await user.tab();
      const innerButton = screen.getByRole("button", {
        name: "children 内ボタン",
        hidden: true,
      });
      expect(innerButton).not.toHaveFocus();
    });
  });

  describe("children のレンダリング", () => {
    it("children として複数要素を受け取れる", () => {
      render(
        <AccordionItem title="タイトル" defaultOpen>
          <p>段落1</p>
          <p>段落2</p>
        </AccordionItem>,
      );
      expect(screen.getByText("段落1")).toBeInTheDocument();
      expect(screen.getByText("段落2")).toBeInTheDocument();
    });
  });
});
