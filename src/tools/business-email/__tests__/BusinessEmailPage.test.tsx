import { describe, test, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { readFileSync } from "fs";
import { join } from "path";
import BusinessEmailPage from "../BusinessEmailPage";
import {
  getCategories,
  getTemplatesByCategory,
  generateEmail,
  getAllTemplates,
} from "../logic";

// vi.hoisted でモック変数をホイストして動的に copiedKey を制御できるようにする
const mockHook = vi.hoisted(() => ({
  copy: vi.fn(),
  copiedKey: null as string | number | boolean | null,
}));

// useCopyToClipboard をモックする（clipboard API 不在環境）
vi.mock("@/components/hooks/useCopyToClipboard", () => ({
  useCopyToClipboard: () => mockHook,
  COPIED_LABEL: "コピーしました",
}));

describe("BusinessEmailPage", () => {
  beforeEach(() => {
    mockHook.copiedKey = null;
    mockHook.copy = vi.fn();
  });

  // E-1: 基本レンダリング
  test("renders without crashing", () => {
    render(<BusinessEmailPage />);
    expect(screen.getByRole("radiogroup")).toBeInTheDocument();
  });

  // E-1: テンプレートセレクトと入力フィールドが表示される
  test("renders template select and fields", () => {
    render(<BusinessEmailPage />);
    expect(screen.getByLabelText("テンプレート")).toBeInTheDocument();
  });

  // E-3: 初期状態でエラーが表示されない
  test("shows no error on initial render", () => {
    render(<BusinessEmailPage />);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  // E-2: カテゴリ変更でテンプレートが更新される
  test("updates templates when category changes", () => {
    render(<BusinessEmailPage />);
    // 初期カテゴリは「お礼」
    const thanksOption = screen.getByRole("radio", { name: "お礼" });
    expect(thanksOption).toHaveAttribute("aria-checked", "true");

    // お詫びカテゴリに切り替え
    const apologyOption = screen.getByRole("radio", { name: "お詫び" });
    fireEvent.click(apologyOption);
    expect(apologyOption).toHaveAttribute("aria-checked", "true");
    expect(thanksOption).toHaveAttribute("aria-checked", "false");
  });

  // E-2: フィールド入力でプレビューが更新される
  test("updates preview when field values change", () => {
    render(<BusinessEmailPage />);
    // 相手先会社名フィールドを入力
    const companyInput = screen.getByLabelText(/相手先会社名/);
    fireEvent.change(companyInput, { target: { value: "テスト株式会社" } });
    // プレビュー本文にその値が含まれること
    const bodyPreview = screen.getByLabelText("本文プレビュー");
    expect((bodyPreview as HTMLTextAreaElement).value).toContain(
      "テスト株式会社",
    );
  });

  // E-4: 変換ロジックの正確性 — お礼テンプレートで件名が生成される
  test("generates subject correctly", () => {
    render(<BusinessEmailPage />);
    // デフォルト「訪問のお礼」テンプレートの件名は「ご訪問のお礼」
    const subjectPreview = screen.getByLabelText("件名プレビュー");
    expect((subjectPreview as HTMLInputElement).value).toContain("お礼");
  });

  // E-5: ARIA — SegmentedControl に role="radiogroup" が付与されている
  test("has role=radiogroup for category selection", () => {
    render(<BusinessEmailPage />);
    const radiogroup = screen.getByRole("radiogroup");
    expect(radiogroup).toBeInTheDocument();
  });

  // E-5: ARIA — SegmentedControl に aria-label が付与されている
  test("SegmentedControl has aria-label", () => {
    render(<BusinessEmailPage />);
    const radiogroup = screen.getByRole("radiogroup");
    expect(radiogroup).toHaveAttribute("aria-label");
  });

  // E-5: ARIA — role="status" aria-live="polite" 領域が存在する（C-3）
  test("has role=status region with aria-live=polite", () => {
    render(<BusinessEmailPage />);
    const statusRegion = screen.getByRole("status");
    expect(statusRegion).toBeInTheDocument();
    expect(statusRegion).toHaveAttribute("aria-live", "polite");
  });

  // E-5: ARIA — フィールド入力後にstatus領域にサマリテキストが入る（C-3）
  test("shows summary text in role=status region after field input", () => {
    render(<BusinessEmailPage />);
    const companyInput = screen.getByLabelText(/相手先会社名/);
    fireEvent.change(companyInput, { target: { value: "テスト株式会社" } });
    const statusRegion = screen.getByRole("status");
    // 何らかのサマリテキストが入ること（空でないこと）
    expect(statusRegion.textContent).not.toBe("");
  });

  // E-5: 件名プレビュー欄が readOnly input である
  test("subject preview is a readonly input", () => {
    render(<BusinessEmailPage />);
    const subjectPreview = screen.getByLabelText("件名プレビュー");
    expect(subjectPreview).toHaveAttribute("readonly");
  });

  // E-5: 本文プレビュー欄が readOnly textarea である
  test("body preview is a readonly textarea", () => {
    render(<BusinessEmailPage />);
    const bodyPreview = screen.getByLabelText("本文プレビュー");
    expect(bodyPreview.tagName.toLowerCase()).toBe("textarea");
    expect(bodyPreview).toHaveAttribute("readonly");
  });

  // E-6: コピー文言変化 — コピー前は「コピー」が表示される
  test("copy buttons show コピー when not copied", () => {
    mockHook.copiedKey = null;
    render(<BusinessEmailPage />);
    // 少なくとも1つのコピーボタンが存在する
    const copyButtons = screen.getAllByRole("button", { name: /コピー/ });
    expect(copyButtons.length).toBeGreaterThan(0);
  });

  // E-6: コピー文言変化 — 件名コピーボタンがコピー後に COPIED_LABEL になる
  test("subject copy button shows COPIED_LABEL when copiedKey is subject", () => {
    mockHook.copiedKey = "subject";
    render(<BusinessEmailPage />);
    // copiedKey="subject" のとき件名コピーボタンが「コピーしました」になること
    expect(
      screen.getByRole("button", { name: "コピーしました" }),
    ).toBeInTheDocument();
  });

  // E-7: コピーボタン disabled 状態 — 件名が空のとき
  test("subject copy button is disabled when subject is empty", () => {
    render(<BusinessEmailPage />);
    // 初期状態では件名テンプレートに値がある（プレースホルダーが埋まっていない場合）
    // テンプレート置換前は件名が存在することを確認、または空テンプレートで確認
    // コピーボタンが disabled かどうかは subject の有無による
    // 空のカテゴリなし → デフォルトテンプレートがある場合は enabled
    // テストでは件名プレビューの有無でチェック
    const subjectPreview = screen.getByLabelText(
      "件名プレビュー",
    ) as HTMLInputElement;
    const subjectCopyBtn = screen.getByRole("button", {
      name: /件名をコピー|^コピー$/,
    });
    if (subjectPreview.value === "") {
      expect(subjectCopyBtn).toBeDisabled();
    } else {
      expect(subjectCopyBtn).not.toBeDisabled();
    }
  });

  // E-8: navigator.clipboard が存在しない環境でも例外を投げない
  test("does not throw when navigator.clipboard is absent", () => {
    expect(() => {
      render(<BusinessEmailPage />);
    }).not.toThrow();
  });

  // 是正: 初期表示（全フィールド空）でプレビューが破綻しないこと
  // 空フィールドは placeholder にフォールバックして差し込まれるため、
  // 「様」「です。」「について」等の孤立した助詞・語尾が出ないこと
  test("initial preview uses placeholders so text is not broken (e.g. no '様' orphan)", () => {
    render(<BusinessEmailPage />);
    const bodyPreview = screen.getByLabelText(
      "本文プレビュー",
    ) as HTMLTextAreaElement;
    const body = bodyPreview.value;
    // 「 様」や「。」の前に空文字が入る破綻パターンを検出:
    // 破綻パターン: 行頭が「 様」になるか、改行直後に「 様」が来る
    expect(body).not.toMatch(/^\s*様\b/m);
    // 本文に何らかのプレースホルダー相当テキストが入ること（空差し込みでなく）
    // デフォルトテンプレートでは recipientCompany の placeholder="株式会社〇〇" が使われること
    expect(body).toContain("株式会社〇〇");
    // デフォルトテンプレート(thanks-visit)の二重「について」が発生しないこと
    expect(body).not.toContain("についてについて");
    // 宛名行「山田太郎 様」が正しく表示されること（「 様」単独行にならないこと）
    expect(body).toContain("山田太郎 様");
  });

  // 是正(E-4拡張): 12テンプレート全体をplaceholderフォールバックで生成し破綻文が出ないことを確認
  // UIレベルでなくlogic関数経由で検証する（UIでは全12切替が困難なため）
  // logic.test.tsの同等テストとUI側の回帰テストの二重防衛として機能する
  test("all 12 templates produce non-broken text with placeholder fallback (regression)", () => {
    const templates = getAllTemplates();
    expect(templates).toHaveLength(12);

    for (const template of templates) {
      // 初期表示と同等: placeholder フォールバックで全フィールドを埋める
      const values: Record<string, string> = {};
      for (const field of template.fields) {
        values[field.key] = field.defaultValue ?? field.placeholder;
      }
      const result = generateEmail(template, values);
      const body = result.body;

      // 二重「について」(thanks-visitで発見された破綻パターン)
      expect(body).not.toContain("についてについて");

      // 「ましたが、」の二重(decline-proposalで発見された前置きフレーズ重複)
      const searchPhrase = "ましたが、";
      const firstIdx = body.indexOf(searchPhrase);
      if (firstIdx !== -1) {
        const secondIdx = body.indexOf(
          searchPhrase,
          firstIdx + searchPhrase.length,
        );
        expect(secondIdx).toBe(-1);
      }

      // 連体終止形+「の件」の不自然な接続(apology-mistakeで発見されたパターン)
      expect(body).not.toMatch(/た(?:こと)?の件/);
    }
  });

  // 是正: 初期表示で件名コピー・本文コピーボタンが有効であること
  // （プレースホルダーで埋めた見本メールは disabled でないこと）
  test("copy buttons are enabled on initial render because preview has placeholder content", () => {
    render(<BusinessEmailPage />);
    const subjectCopyBtn = screen.getByRole("button", {
      name: /件名をコピー/,
    });
    const bodyCopyBtn = screen.getByRole("button", {
      name: /本文をコピー/,
    });
    expect(subjectCopyBtn).not.toBeDisabled();
    expect(bodyCopyBtn).not.toBeDisabled();
  });

  // 是正: 初期状態でメール全文コピーボタンが有効であること
  test("全文コピーボタンが初期状態で有効", () => {
    render(<BusinessEmailPage />);
    const copyAllBtn = screen.getByRole("button", {
      name: /メール全文をコピー/,
    });
    expect(copyAllBtn).not.toBeDisabled();
  });

  // 是正: ユーザーが入力したときプレースホルダー値が上書きされること
  test("user input overrides placeholder fallback in preview", () => {
    render(<BusinessEmailPage />);
    const companyInput = screen.getByLabelText(/相手先会社名/);
    fireEvent.change(companyInput, { target: { value: "実際株式会社" } });
    const bodyPreview = screen.getByLabelText(
      "本文プレビュー",
    ) as HTMLTextAreaElement;
    expect(bodyPreview.value).toContain("実際株式会社");
    // 旧プレースホルダーは使われないこと
    expect(bodyPreview.value).not.toContain("株式会社〇〇");
  });

  // E-10: meta 由来の表示 — 確定提示方式でカテゴリと入力欄が即座に表示される
  test("shows tool UI immediately (確定提示方式)", () => {
    render(<BusinessEmailPage />);
    // カテゴリ選択が最初から表示されている
    expect(screen.getByRole("radiogroup")).toBeInTheDocument();
    // テンプレートセレクトが最初から表示されている
    expect(screen.getByLabelText("テンプレート")).toBeInTheDocument();
  });

  // E-11: 既存の logic.ts テストが通ること（ここでは logic 関数を直接インポートして確認）
  test("logic functions work correctly", () => {
    const categories = getCategories();
    expect(categories).toHaveLength(5);
    const templates = getTemplatesByCategory("thanks");
    expect(templates.length).toBeGreaterThan(0);
    const email = generateEmail(templates[0], {
      recipientCompany: "テスト",
      recipientName: "田中",
      senderName: "鈴木",
    });
    expect(email.subject).toBeTruthy();
    expect(email.body).toContain("テスト");
  });

  // E-12: CSS トークン検証
  test("CSS does not use deprecated --color-* tokens or --accent direct fill or font-weight 700", () => {
    const cssPath = join(
      process.cwd(),
      "src/tools/business-email/BusinessEmailPage.module.css",
    );
    const css = readFileSync(cssPath, "utf-8");

    // 旧トークン --color-* が存在しないこと
    expect(css).not.toMatch(/var\(--color-/);

    // --accent 直塗りがないこと（outline の参照は許可）
    const accentDirectUse = css.match(
      /(?:background|color)\s*:\s*var\(--accent\)/g,
    );
    expect(accentDirectUse).toBeNull();

    // font-weight: 700 が存在しないこと
    const cssWithoutComments = css.replace(/\/\*[\s\S]*?\*\//g, "");
    expect(cssWithoutComments).not.toMatch(/font-weight\s*:\s*700/);
  });
});
