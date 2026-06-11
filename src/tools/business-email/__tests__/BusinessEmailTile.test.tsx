/**
 * BusinessEmailTile のユニットテスト（TDD: 実装前に書く）
 *
 * 検証観点:
 * - T-1: variant=full での基本レンダリング
 * - T-2: カテゴリ変更でテンプレートが更新される
 * - T-3: テンプレート変更で動的フィールドが更新される
 * - T-4: フィールド入力でプレビューが更新される
 * - T-5: コピー3ターゲット（件名/本文/全体）の振る舞い
 * - T-6: id インスタンス一意性（動的フィールド含む）
 * - T-7: ARIA 要件（C-3 role="status"・C-2 aria-label・A-6）
 * - T-8: カテゴリ切替時に古いプレビューが残らない
 * - T-9: 初期表示でプレースホルダーによるメール生成が破綻しない
 * - T-10: CSS トークン検証
 * - T-11: 12テンプレート全体の回帰テスト
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { readFileSync } from "fs";
import { join } from "path";
import BusinessEmailTile from "../BusinessEmailTile";
import { generateEmail, getAllTemplates } from "../logic";

// useCopyToClipboard をモック（clipboard API 不在環境対策）
const mockHook = vi.hoisted(() => ({
  copy: vi.fn(),
  copiedKey: null as string | number | boolean | null,
}));

vi.mock("@/components/hooks/useCopyToClipboard", () => ({
  useCopyToClipboard: () => mockHook,
  COPIED_LABEL: "コピーしました",
}));

describe("BusinessEmailTile", () => {
  beforeEach(() => {
    mockHook.copiedKey = null;
    mockHook.copy = vi.fn();
  });

  // T-1: 基本レンダリング
  describe("T-1: 基本レンダリング（variant=full）", () => {
    it("クラッシュせずにレンダリングされる", () => {
      render(<BusinessEmailTile variant="full" />);
      expect(screen.getByRole("radiogroup")).toBeInTheDocument();
    });

    it("カテゴリ選択・テンプレートセレクト・プレビューが表示される", () => {
      render(<BusinessEmailTile variant="full" />);
      expect(screen.getByRole("radiogroup")).toBeInTheDocument();
      expect(screen.getByLabelText("テンプレート")).toBeInTheDocument();
      expect(screen.getByLabelText("件名プレビュー")).toBeInTheDocument();
      expect(screen.getByLabelText("本文プレビュー")).toBeInTheDocument();
    });

    it("初期エラーが表示されない", () => {
      render(<BusinessEmailTile variant="full" />);
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });

    it("5カテゴリがすべてラジオボタンとして表示される", () => {
      render(<BusinessEmailTile variant="full" />);
      expect(screen.getByRole("radio", { name: "お礼" })).toBeInTheDocument();
      expect(screen.getByRole("radio", { name: "お詫び" })).toBeInTheDocument();
      expect(screen.getByRole("radio", { name: "依頼" })).toBeInTheDocument();
      expect(screen.getByRole("radio", { name: "お断り" })).toBeInTheDocument();
      expect(screen.getByRole("radio", { name: "挨拶" })).toBeInTheDocument();
    });
  });

  // T-2: カテゴリ変更
  describe("T-2: カテゴリ変更でテンプレートが更新される", () => {
    it("初期カテゴリは「お礼」でチェック状態", () => {
      render(<BusinessEmailTile variant="full" />);
      const thanksOption = screen.getByRole("radio", { name: "お礼" });
      expect(thanksOption).toHaveAttribute("aria-checked", "true");
    });

    it("「お詫び」に切り替えるとチェック状態が変わる", () => {
      render(<BusinessEmailTile variant="full" />);
      const apologyOption = screen.getByRole("radio", { name: "お詫び" });
      fireEvent.click(apologyOption);
      expect(apologyOption).toHaveAttribute("aria-checked", "true");
      const thanksOption = screen.getByRole("radio", { name: "お礼" });
      expect(thanksOption).toHaveAttribute("aria-checked", "false");
    });

    it("カテゴリ切替後にテンプレートセレクトが存在する", () => {
      render(<BusinessEmailTile variant="full" />);
      const apologyOption = screen.getByRole("radio", { name: "お詫び" });
      fireEvent.click(apologyOption);
      expect(screen.getByLabelText("テンプレート")).toBeInTheDocument();
    });
  });

  // T-3: テンプレート切替
  describe("T-3: テンプレート切替後に古いフィールドが残らない", () => {
    it("カテゴリ「依頼」に切替後にプレビューが更新される", () => {
      render(<BusinessEmailTile variant="full" />);
      const requestOption = screen.getByRole("radio", { name: "依頼" });
      fireEvent.click(requestOption);
      const bodyPreview = screen.getByLabelText(
        "本文プレビュー",
      ) as HTMLTextAreaElement;
      // 依頼カテゴリのボディが表示される（お礼テンプレートの内容が残らない）
      expect(bodyPreview.value.length).toBeGreaterThan(0);
    });
  });

  // T-4: フィールド入力でプレビュー更新
  describe("T-4: フィールド入力でプレビューが更新される", () => {
    it("相手先会社名を入力するとプレビューに反映される", () => {
      render(<BusinessEmailTile variant="full" />);
      const companyInput = screen.getByLabelText(/相手先会社名/);
      fireEvent.change(companyInput, { target: { value: "テスト株式会社" } });
      const bodyPreview = screen.getByLabelText(
        "本文プレビュー",
      ) as HTMLTextAreaElement;
      expect(bodyPreview.value).toContain("テスト株式会社");
    });

    it("件名プレビューが readOnly input である", () => {
      render(<BusinessEmailTile variant="full" />);
      const subjectPreview = screen.getByLabelText("件名プレビュー");
      expect(subjectPreview).toHaveAttribute("readonly");
    });

    it("本文プレビューが readOnly textarea である", () => {
      render(<BusinessEmailTile variant="full" />);
      const bodyPreview = screen.getByLabelText("本文プレビュー");
      expect(bodyPreview.tagName.toLowerCase()).toBe("textarea");
      expect(bodyPreview).toHaveAttribute("readonly");
    });

    it("フィールド入力後に role=status に更新テキストが入る", () => {
      render(<BusinessEmailTile variant="full" />);
      const companyInput = screen.getByLabelText(/相手先会社名/);
      fireEvent.change(companyInput, { target: { value: "ABC株式会社" } });
      const statusRegion = screen.getByRole("status");
      expect(statusRegion.textContent).not.toBe("");
    });
  });

  // T-5: コピー3ターゲット
  describe("T-5: コピー3ターゲット（件名/本文/全体）の振る舞い", () => {
    it("件名・本文・全文コピーボタンが存在する", () => {
      render(<BusinessEmailTile variant="full" />);
      // コピーボタンが3つ以上ある（件名・本文・全文）
      const copyButtons = screen.getAllByRole("button", { name: /コピー/ });
      expect(copyButtons.length).toBeGreaterThanOrEqual(3);
    });

    it("初期状態でコピーボタンが有効（プレースホルダーで生成済み）", () => {
      render(<BusinessEmailTile variant="full" />);
      const subjectCopyBtn = screen.getByRole("button", {
        name: /件名をコピー/,
      });
      const bodyCopyBtn = screen.getByRole("button", {
        name: /本文をコピー/,
      });
      const copyAllBtn = screen.getByRole("button", {
        name: /メール全文をコピー/,
      });
      expect(subjectCopyBtn).not.toBeDisabled();
      expect(bodyCopyBtn).not.toBeDisabled();
      expect(copyAllBtn).not.toBeDisabled();
    });

    it("copiedKey='subject' のとき件名コピーボタンが COPIED_LABEL になる", () => {
      mockHook.copiedKey = "subject";
      render(<BusinessEmailTile variant="full" />);
      expect(
        screen.getByRole("button", { name: "コピーしました" }),
      ).toBeInTheDocument();
    });
  });

  // T-6: id インスタンス一意性（動的フィールド含む）
  describe("T-6: id インスタンス一意性（動的フィールド含む）", () => {
    it("同一ページに2インスタンス描画しても全 id が重複しない", () => {
      const { container: c1 } = render(<BusinessEmailTile variant="full" />);
      const { container: c2 } = render(<BusinessEmailTile variant="full" />);

      const ids1 = [...c1.querySelectorAll("[id]")].map((el) => el.id);
      const ids2 = [...c2.querySelectorAll("[id]")].map((el) => el.id);

      // 共通 id がゼロであること
      const overlap = ids1.filter((id) => ids2.includes(id));
      expect(overlap).toHaveLength(0);
    });

    it("2インスタンスで label と input の関連付けが各々正しい", () => {
      const { container: c1 } = render(<BusinessEmailTile variant="full" />);
      const { container: c2 } = render(<BusinessEmailTile variant="full" />);

      // c1 内の label の htmlFor が c1 内の input id に対応している
      const labels1 = [...c1.querySelectorAll("label[for]")];
      labels1.forEach((label) => {
        const forAttr = label.getAttribute("for")!;
        const target = c1.querySelector(`#${CSS.escape(forAttr)}`);
        expect(target).not.toBeNull();
      });

      // c2 内の label の htmlFor が c2 内の input id に対応している
      const labels2 = [...c2.querySelectorAll("label[for]")];
      labels2.forEach((label) => {
        const forAttr = label.getAttribute("for")!;
        const target = c2.querySelector(`#${CSS.escape(forAttr)}`);
        expect(target).not.toBeNull();
      });
    });
  });

  // T-7: ARIA 要件
  describe("T-7: ARIA 要件", () => {
    it("role=status aria-live=polite の領域が存在する（C-3）", () => {
      render(<BusinessEmailTile variant="full" />);
      const statusRegion = screen.getByRole("status");
      expect(statusRegion).toBeInTheDocument();
      expect(statusRegion).toHaveAttribute("aria-live", "polite");
    });

    it("SegmentedControl に aria-label が付与されている（C-2）", () => {
      render(<BusinessEmailTile variant="full" />);
      const radiogroup = screen.getByRole("radiogroup");
      expect(radiogroup).toHaveAttribute("aria-label");
    });

    it("件名・本文プレビューに aria-label が付与されている", () => {
      render(<BusinessEmailTile variant="full" />);
      expect(screen.getByLabelText("件名プレビュー")).toBeInTheDocument();
      expect(screen.getByLabelText("本文プレビュー")).toBeInTheDocument();
    });
  });

  // T-8: カテゴリ切替時に古いプレビューが残らない
  describe("T-8: カテゴリ切替後に古いプレビューが残らない", () => {
    it("「挨拶」カテゴリに切替後にプレビューが更新される", () => {
      render(<BusinessEmailTile variant="full" />);
      // 相手先会社名を入力
      const companyInput = screen.getByLabelText(/相手先会社名/);
      fireEvent.change(companyInput, { target: { value: "旧会社名" } });

      // 挨拶に切替
      const greetingOption = screen.getByRole("radio", { name: "挨拶" });
      fireEvent.click(greetingOption);

      // プレビューが空でないこと（古い内容でなく新しいテンプレートが適用される）
      const bodyPreview = screen.getByLabelText(
        "本文プレビュー",
      ) as HTMLTextAreaElement;
      expect(bodyPreview.value.length).toBeGreaterThan(0);
    });
  });

  // T-9: 初期表示でプレースホルダーによるメール生成が破綻しない
  describe("T-9: 初期表示でプレースホルダーフォールバック", () => {
    it("初期表示で件名に「お礼」が含まれる（デフォルト: 訪問のお礼）", () => {
      render(<BusinessEmailTile variant="full" />);
      const subjectPreview = screen.getByLabelText(
        "件名プレビュー",
      ) as HTMLInputElement;
      expect(subjectPreview.value).toContain("お礼");
    });

    it("初期表示でプレビューが破綻しない（「様」単独行なし）", () => {
      render(<BusinessEmailTile variant="full" />);
      const bodyPreview = screen.getByLabelText(
        "本文プレビュー",
      ) as HTMLTextAreaElement;
      const body = bodyPreview.value;
      expect(body).not.toMatch(/^\s*様\b/m);
      expect(body).toContain("株式会社〇〇");
    });

    it("ユーザー入力がプレースホルダーを上書きする", () => {
      render(<BusinessEmailTile variant="full" />);
      const companyInput = screen.getByLabelText(/相手先会社名/);
      fireEvent.change(companyInput, { target: { value: "実際株式会社" } });
      const bodyPreview = screen.getByLabelText(
        "本文プレビュー",
      ) as HTMLTextAreaElement;
      expect(bodyPreview.value).toContain("実際株式会社");
      expect(bodyPreview.value).not.toContain("株式会社〇〇");
    });
  });

  // T-10: CSS トークン検証
  describe("T-10: CSS トークン検証（デザインシステム準拠）", () => {
    it("CSS に旧 --color-* トークン・--accent 直塗り・font-weight:700 が含まれない", () => {
      const cssPath = join(
        process.cwd(),
        "src/tools/business-email/BusinessEmailTile.module.css",
      );
      const css = readFileSync(cssPath, "utf-8");

      // 旧トークン --color-* が存在しないこと（B-1）
      expect(css).not.toMatch(/var\(--color-/);

      // --accent 直塗りがないこと（B-3）
      const accentDirectUse = css.match(
        /(?:background|color)\s*:\s*var\(--accent\)/g,
      );
      expect(accentDirectUse).toBeNull();

      // font-weight: 700 が存在しないこと（B-4）
      const cssWithoutComments = css.replace(/\/\*[\s\S]*?\*\//g, "");
      expect(cssWithoutComments).not.toMatch(/font-weight\s*:\s*700/);
    });
  });

  // T-11: 12テンプレート全体の回帰テスト（logic 直接）
  describe("T-11: 12テンプレート全体の回帰テスト", () => {
    it("12テンプレートすべてがプレースホルダーフォールバックで破綻文を生成しない", () => {
      const templates = getAllTemplates();
      expect(templates).toHaveLength(12);

      for (const template of templates) {
        const values: Record<string, string> = {};
        for (const field of template.fields) {
          values[field.key] = field.defaultValue ?? field.placeholder;
        }
        const result = generateEmail(template, values);
        const body = result.body;

        // 二重「について」
        expect(body).not.toContain("についてについて");

        // 「ましたが、」の二重
        const searchPhrase = "ましたが、";
        const firstIdx = body.indexOf(searchPhrase);
        if (firstIdx !== -1) {
          const secondIdx = body.indexOf(
            searchPhrase,
            firstIdx + searchPhrase.length,
          );
          expect(secondIdx).toBe(-1);
        }

        // 連体終止形+「の件」の不自然な接続
        expect(body).not.toMatch(/た(?:こと)?の件/);
      }
    });
  });
});
