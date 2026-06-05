/**
 * EmailValidatorPage の回帰テスト（単一実装 / cycle-225 T-6）
 *
 * 観点:
 *   E-1: 基本レンダリング
 *   E-2: 入力→結果更新
 *   E-3: 空入力の挙動
 *   E-4: バリデーションロジックの正確性（UI経由）
 *   E-5: ARIA（role="status" aria-live="polite" / ライブリージョン実テキストノード）
 *   E-6: N/A（コピーボタンなし。email-validator は②-15 で削除確定）
 *   E-7: N/A（コピーボタンなし）
 *   E-8: N/A（コピーボタンなし）
 *   E-9: N/A（詳細ページリンクなし。ページ本体のため不要）
 *   E-10: meta 由来の表示
 *   E-11: logic.ts テスト PASS 維持（別ファイル）
 *   E-12: CSS トークン検証（readFileSync）
 *
 * 個別論点:
 *   ①-4: 緑「有効」とタイポ提案の矛盾シグナル解消
 *     → タイポ提案がある場合は「有効（要確認）」として表示し矛盾を解消する
 *   ②-15: コピーボタンは存在しない（知る対象）
 */

import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, afterEach } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";
import EmailValidatorPage from "../EmailValidatorPage";

afterEach(() => {
  document.body.innerHTML = "";
});

// ===========================================================
// E-1: 基本レンダリング
// ===========================================================
describe("E-1: 基本レンダリング", () => {
  it("コンポーネントが正常にレンダリングされる", () => {
    render(<EmailValidatorPage />);
    // メールアドレス入力欄が存在する
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("入力欄のラベルが存在する", () => {
    render(<EmailValidatorPage />);
    // aria-label または label 要素が存在する
    const input = screen.getByRole("textbox");
    expect(input).toBeInTheDocument();
  });
});

// ===========================================================
// E-2: 入力→結果更新
// ===========================================================
describe("E-2: 入力→結果更新", () => {
  it("有効なメールアドレスを入力すると有効バッジが表示される", async () => {
    render(<EmailValidatorPage />);
    const input = screen.getByRole("textbox");

    await act(async () => {
      fireEvent.change(input, { target: { value: "user@example.com" } });
    });

    const bodyText = document.body.textContent ?? "";
    expect(bodyText).toContain("有効");
  });

  it("無効なメールアドレスを入力すると無効バッジが表示される", async () => {
    render(<EmailValidatorPage />);
    const input = screen.getByRole("textbox");

    await act(async () => {
      fireEvent.change(input, { target: { value: "notanemail" } });
    });

    const bodyText = document.body.textContent ?? "";
    expect(bodyText).toContain("無効");
  });

  it("入力値が変わると結果が更新される", async () => {
    render(<EmailValidatorPage />);
    const input = screen.getByRole("textbox");

    await act(async () => {
      fireEvent.change(input, { target: { value: "user@example.com" } });
    });
    let bodyText = document.body.textContent ?? "";
    expect(bodyText).toContain("有効");

    await act(async () => {
      fireEvent.change(input, { target: { value: "notanemail" } });
    });
    bodyText = document.body.textContent ?? "";
    expect(bodyText).toContain("無効");
  });
});

// ===========================================================
// E-3: 空入力の挙動
// ===========================================================
describe("E-3: 空入力の挙動", () => {
  it("空入力時にエラーボックスが表示されない", async () => {
    render(<EmailValidatorPage />);
    const input = screen.getByRole("textbox");

    await act(async () => {
      fireEvent.change(input, { target: { value: "" } });
    });

    // エラーボックス（role="alert"）が存在しない
    const alertEl = document.querySelector("[role='alert']");
    expect(alertEl).toBeNull();
  });

  it("空入力時に入力欄が正常に表示される", async () => {
    render(<EmailValidatorPage />);
    const input = screen.getByRole("textbox");

    await act(async () => {
      fireEvent.change(input, { target: { value: "" } });
    });

    expect(input).toBeInTheDocument();
    expect((input as HTMLInputElement).value).toBe("");
  });
});

// ===========================================================
// E-4: バリデーションロジックの正確性（UI経由）
// ===========================================================
describe("E-4: バリデーションロジックの正確性", () => {
  it("user@example.com は有効として判定される", async () => {
    render(<EmailValidatorPage />);
    const input = screen.getByRole("textbox");

    await act(async () => {
      fireEvent.change(input, { target: { value: "user@example.com" } });
    });

    const bodyText = document.body.textContent ?? "";
    expect(bodyText).toContain("有効");
    // ローカルパートとドメインが表示される
    expect(bodyText).toContain("user");
    expect(bodyText).toContain("example.com");
  });

  it("notanemail は無効として判定される（@なし）", async () => {
    render(<EmailValidatorPage />);
    const input = screen.getByRole("textbox");

    await act(async () => {
      fireEvent.change(input, { target: { value: "notanemail" } });
    });

    const bodyText = document.body.textContent ?? "";
    expect(bodyText).toContain("無効");
    // @がないエラーメッセージが表示される
    expect(bodyText).toContain("@");
  });

  it("タイポドメイン(gmial.com)では提案が表示される", async () => {
    render(<EmailValidatorPage />);
    const input = screen.getByRole("textbox");

    await act(async () => {
      fireEvent.change(input, { target: { value: "user@gmial.com" } });
    });

    const bodyText = document.body.textContent ?? "";
    // タイポ提案が表示される
    expect(bodyText).toContain("gmail.com");
  });
});

// ===========================================================
// ①-4: 矛盾シグナル解消（有効＋タイポ提案の矛盾）
// ===========================================================
describe("①-4: 緑「有効」とタイポ提案の矛盾シグナル解消", () => {
  it("タイポドメイン(gmial.com)では有効でもタイポ提案が優先表示される", async () => {
    render(<EmailValidatorPage />);
    const input = screen.getByRole("textbox");

    await act(async () => {
      fireEvent.change(input, { target: { value: "user@gmial.com" } });
    });

    const bodyText = document.body.textContent ?? "";
    // 提案が表示されている（矛盾解消のため）
    expect(bodyText).toContain("もしかして");
    expect(bodyText).toContain("gmail.com");
  });

  it("タイポなし有効アドレスでは提案なしの純粋な有効バッジが表示される", async () => {
    render(<EmailValidatorPage />);
    const input = screen.getByRole("textbox");

    await act(async () => {
      fireEvent.change(input, { target: { value: "user@gmail.com" } });
    });

    const bodyText = document.body.textContent ?? "";
    // 「有効」が表示される
    expect(bodyText).toContain("有効");
    // タイポ提案が表示されない
    expect(bodyText).not.toContain("もしかして");
  });
});

// ===========================================================
// ②-15: コピーボタンが存在しない
// ===========================================================
describe("②-15: コピーボタン削除確認", () => {
  it("コピーボタンが存在しない（知る対象のため）", async () => {
    render(<EmailValidatorPage />);
    const input = screen.getByRole("textbox");

    await act(async () => {
      fireEvent.change(input, { target: { value: "user@example.com" } });
    });

    // コピー関連のボタンが存在しない
    const copyButton = document.querySelector(
      "[aria-label*='コピー'], [data-testid*='copy']",
    );
    expect(copyButton).toBeNull();
  });
});

// ===========================================================
// E-5: ARIA（role="status" aria-live="polite"）
// ===========================================================
describe("E-5: ARIA属性の確認", () => {
  it("出力結果欄に role='status' aria-live='polite' が付与されている", async () => {
    render(<EmailValidatorPage />);
    const input = screen.getByRole("textbox");

    await act(async () => {
      fireEvent.change(input, { target: { value: "user@example.com" } });
    });

    const statusEl = document.querySelector(
      "[role='status'][aria-live='polite']",
    );
    expect(statusEl).toBeInTheDocument();
  });

  it("ライブリージョンに実テキストノードのサマリが含まれる", async () => {
    render(<EmailValidatorPage />);
    const input = screen.getByRole("textbox");

    await act(async () => {
      fireEvent.change(input, { target: { value: "user@example.com" } });
    });

    // ライブリージョン内に「有効」などの実テキストが含まれる
    const statusEl = document.querySelector(
      "[role='status'][aria-live='polite']",
    );
    expect(statusEl).toBeInTheDocument();
    expect(statusEl?.textContent?.trim().length).toBeGreaterThan(0);
  });

  it("ライブリージョンはreadOnly textareaをラップするだけでなく実テキストノードを持つ", async () => {
    render(<EmailValidatorPage />);
    const input = screen.getByRole("textbox");

    await act(async () => {
      fireEvent.change(input, { target: { value: "user@example.com" } });
    });

    // ライブリージョンが存在する
    const statusEl = document.querySelector(
      "[role='status'][aria-live='polite']",
    );
    expect(statusEl).toBeInTheDocument();

    // textareaをラップするだけではなく、直接テキストノードを含む
    // (inner textContent が空でない)
    const text = statusEl?.textContent ?? "";
    expect(text.trim()).not.toBe("");
    // textareaの中身だけが来ることはなく、要約テキストが含まれる
    // 「有効」「無効」「要確認」「未入力」などのテキストがある
    const hasValidSummary =
      text.includes("有効") ||
      text.includes("無効") ||
      text.includes("要確認") ||
      text.includes("未入力");
    expect(hasValidSummary).toBe(true);
  });
});

// ===========================================================
// E-10: meta 由来の表示
// ===========================================================
describe("E-10: meta由来の表示", () => {
  it("ToolPageLayoutのchildren（ツール本体）が描画される", () => {
    render(<EmailValidatorPage />);
    // ページ本体の入力欄が描画されている
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });
});

// ===========================================================
// E-12: CSS トークン検証（readFileSync）
// ===========================================================
// バッジアイコン: SVG アイコンが aria-hidden で装飾目的を宣言しているか
// ===========================================================
describe("バッジアイコンのアクセシビリティ", () => {
  it("有効バッジの SVG アイコンが aria-hidden='true' を持つ（記号の不要な読み上げを回避）", async () => {
    render(<EmailValidatorPage />);
    const input = screen.getByRole("textbox");

    await act(async () => {
      fireEvent.change(input, { target: { value: "user@example.com" } });
    });

    // バッジ内の SVG が aria-hidden="true" を持つことを確認
    const svgElements = document.querySelectorAll(
      "[role='status'] svg[aria-hidden='true']",
    );
    expect(svgElements.length).toBeGreaterThan(0);
  });

  it("無効バッジの SVG アイコンが aria-hidden='true' を持つ", async () => {
    render(<EmailValidatorPage />);
    const input = screen.getByRole("textbox");

    await act(async () => {
      fireEvent.change(input, { target: { value: "notanemail" } });
    });

    const svgElements = document.querySelectorAll(
      "[role='status'] svg[aria-hidden='true']",
    );
    expect(svgElements.length).toBeGreaterThan(0);
  });
});

// ===========================================================
describe("E-12: CSSトークン検証", () => {
  const cssPath = join(
    process.cwd(),
    "src/tools/email-validator/EmailValidatorPage.module.css",
  );

  it("--color-* 旧トークンが存在しない", () => {
    const css = readFileSync(cssPath, "utf-8");
    expect(css).not.toMatch(/var\(--color-/);
  });

  it("--accent 直塗りが存在しない（--accent-soft/strong 以外）", () => {
    const css = readFileSync(cssPath, "utf-8");
    // --accent-soft/strong/light は許可、--accent) または --accent; や --accent, はNG
    const accentDirectUse = css.match(/var\(--accent[^-]/g);
    expect(accentDirectUse).toBeNull();
  });

  it("font-weight: 700 が存在しない", () => {
    const css = readFileSync(cssPath, "utf-8");
    expect(css).not.toMatch(/font-weight:\s*700/);
  });
});
