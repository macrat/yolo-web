/**
 * RegexTesterPage 単一実装の回帰テスト
 *
 * 収束チェックリスト E 群（E-1〜E-12）を網羅する。
 * regex-tester は T-4b 方針によりコピーボタンなし（②-15 確定済み）。
 * よって E-6・E-7・E-8（コピー関連）は N/A。
 *
 * useRegexWorker は debounce(300ms) + Worker timeout(500ms) を持つため、
 * vi.useFakeTimers() + vi.runAllTimersAsync() でタイマーを制御する。
 */

import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";
import RegexTesterPage from "../RegexTesterPage";
import { testRegex } from "../logic";

// =========================================================
// Web Worker モック（jsdom は Worker 未サポートのため Blob URL Worker を差し替える）
// useRegexWorker は match/replace 両リクエストを 1 Worker に送るため
// data.type で分岐して応答する。
// =========================================================
interface MockWorkerInstance {
  postMessage: ReturnType<typeof vi.fn>;
  terminate: ReturnType<typeof vi.fn>;
  onmessage: ((e: MessageEvent) => void) | null;
  onerror: ((e: ErrorEvent) => void) | null;
}

const mockWorkerInstances: MockWorkerInstance[] = [];

const MockWorker = vi.fn(function (this: MockWorkerInstance) {
  this.terminate = vi.fn();
  this.onmessage = null;
  this.onerror = null;

  const self = this as MockWorkerInstance;
  this.postMessage = vi.fn(
    (data: {
      type: string;
      pattern: string;
      flags: string;
      testString: string;
      replacement?: string;
    }) => {
      if (data.type === "match") {
        const result = testRegex(data.pattern, data.flags, data.testString);
        queueMicrotask(() => {
          if (self.onmessage) {
            self.onmessage({
              data: { type: "match", matchResult: result },
            } as MessageEvent);
          }
        });
      } else if (data.type === "replace") {
        let replaceResult: { success: boolean; output: string; error?: string };
        try {
          const regex = new RegExp(data.pattern, data.flags);
          const output = data.testString.replace(regex, data.replacement ?? "");
          replaceResult = { success: true, output };
        } catch (e) {
          replaceResult = {
            success: false,
            output: "",
            error: e instanceof Error ? e.message : "Invalid regex",
          };
        }
        queueMicrotask(() => {
          if (self.onmessage) {
            self.onmessage({
              data: { type: "replace", replaceResult },
            } as MessageEvent);
          }
        });
      }
    },
  );
  mockWorkerInstances.push(this);
});

beforeEach(() => {
  // fake timers: useRegexWorker の debounce(300ms) + timeout(500ms) を制御する
  vi.useFakeTimers({ shouldAdvanceTime: false });
  vi.stubGlobal("Worker", MockWorker);
  vi.stubGlobal("URL", {
    createObjectURL: vi.fn().mockReturnValue("blob:mock"),
    revokeObjectURL: vi.fn(),
  });
  mockWorkerInstances.length = 0;
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

/**
 * 入力変更後にデバウンス+Worker処理を完了させるヘルパー。
 * useRegexWorker の debounce(300ms) を超えてから Worker の microtask が解決するまで進める。
 */
async function flushWorker() {
  await vi.runAllTimersAsync();
}

// =========================================================
// E-1: 基本レンダリング
// =========================================================
describe("E-1: 基本レンダリング", () => {
  it("コンポーネントが正常にレンダリングされる", () => {
    render(<RegexTesterPage />);
    expect(
      screen.getByRole("textbox", { name: /正規表現パターン/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("textbox", { name: /テスト文字列/ }),
    ).toBeInTheDocument();
  });
});

// =========================================================
// E-2: 入力→結果更新
// =========================================================
describe("E-2: 入力→結果更新", () => {
  it("パターンとテスト文字列を入力するとマッチ結果が更新される", async () => {
    render(<RegexTesterPage />);

    const patternInput = screen.getByRole("textbox", {
      name: /正規表現パターン/,
    });
    const testStringArea = screen.getByRole("textbox", {
      name: /テスト文字列/,
    });

    await act(async () => {
      fireEvent.change(patternInput, { target: { value: "\\d+" } });
      fireEvent.change(testStringArea, {
        target: { value: "abc 123 def 456" },
      });
      await flushWorker();
    });

    const statusEl = screen.getByRole("status");
    expect(statusEl.textContent).toMatch(/2/);
  });
});

// =========================================================
// E-3: 空入力
// =========================================================
describe("E-3: 空入力", () => {
  it("初期状態でエラーが表示されない", () => {
    render(<RegexTesterPage />);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("初期状態でマッチ件数が表示されない", () => {
    render(<RegexTesterPage />);
    const statusEl = screen.getByRole("status");
    expect(statusEl.textContent).not.toMatch(/件/);
  });
});

// =========================================================
// E-4: 変換ロジックの正確性（UI 経由）
// =========================================================
describe("E-4: 変換ロジックの正確性", () => {
  it("メールアドレスパターンで正しくマッチする（2件）", async () => {
    render(<RegexTesterPage />);

    const patternInput = screen.getByRole("textbox", {
      name: /正規表現パターン/,
    });
    const testStringArea = screen.getByRole("textbox", {
      name: /テスト文字列/,
    });

    await act(async () => {
      fireEvent.change(patternInput, {
        target: { value: "[\\w.-]+@[\\w.-]+\\.\\w+" },
      });
      fireEvent.change(testStringArea, {
        target: { value: "test@example.com foo@bar.jp" },
      });
      await flushWorker();
    });

    const statusEl = screen.getByRole("status");
    expect(statusEl.textContent).toMatch(/2/);
  });

  it("無効な正規表現でエラーが表示される", async () => {
    render(<RegexTesterPage />);

    const patternInput = screen.getByRole("textbox", {
      name: /正規表現パターン/,
    });
    const testStringArea = screen.getByRole("textbox", {
      name: /テスト文字列/,
    });

    await act(async () => {
      fireEvent.change(patternInput, { target: { value: "[unclosed" } });
      fireEvent.change(testStringArea, { target: { value: "test" } });
      await flushWorker();
    });

    const alert = screen.getByRole("alert");
    expect(alert).toBeInTheDocument();
    // A-4: ErrorMessage に渡す文言は日本語・英語例外をそのまま渡さない
    expect(alert.textContent).not.toMatch(/Invalid regular expression/);
    expect(alert.textContent).not.toMatch(/Invalid regex pattern/);
    expect(alert.textContent).toMatch(/正規表現/);
  });
});

// =========================================================
// E-5: ARIA
// =========================================================
describe("E-5: ARIA", () => {
  it("マッチ件数サマリ欄に role=status と aria-live=polite が付与されている", () => {
    render(<RegexTesterPage />);

    const statusEl = screen.getByRole("status");
    expect(statusEl).toHaveAttribute("role", "status");
    expect(statusEl).toHaveAttribute("aria-live", "polite");
  });

  it("マッチ結果があるとき role=region aria-label=マッチ結果 が存在する", async () => {
    render(<RegexTesterPage />);

    const patternInput = screen.getByRole("textbox", {
      name: /正規表現パターン/,
    });
    const testStringArea = screen.getByRole("textbox", {
      name: /テスト文字列/,
    });

    await act(async () => {
      fireEvent.change(patternInput, { target: { value: "\\d+" } });
      fireEvent.change(testStringArea, { target: { value: "123" } });
      await flushWorker();
    });

    expect(
      screen.getByRole("region", { name: /マッチ結果/ }),
    ).toBeInTheDocument();
  });
});

// E-6・E-7・E-8 は N/A: regex-tester はコピーボタンなし（T-4b ②-15 確定済み）
// E-9 は N/A: 単一実装ページ自体が詳細ページのため

// =========================================================
// E-10: meta 由来の表示
// =========================================================
describe("E-10: meta 由来の表示（ToolPageLayout 経由）", () => {
  it("RegexTesterPage の children が正常に描画される", () => {
    render(<RegexTesterPage />);
    // ページ本体の入力欄が描画されること = children が正常にレンダリングされている
    expect(
      screen.getByRole("textbox", { name: /正規表現パターン/ }),
    ).toBeInTheDocument();
  });
});

// E-11: 既存の logic.ts テスト PASS 維持は logic.test.ts で確認

// =========================================================
// E-12: CSS トークン検証（readFileSync）
// =========================================================
describe("E-12: CSS トークン検証", () => {
  const cssPath = resolve(__dirname, "../RegexTesterPage.module.css");

  it("--color-* 旧トークンが存在しない", () => {
    const css = readFileSync(cssPath, "utf-8");
    expect(css).not.toMatch(/var\(--color-/);
  });

  it("--accent を背景色・文字色に直接使用していない", () => {
    const css = readFileSync(cssPath, "utf-8");
    const lines = css.split("\n");
    for (const line of lines) {
      // コメント行はスキップ
      const trimmed = line.trim();
      if (trimmed.startsWith("/*") || trimmed.startsWith("*")) continue;
      if (/background(?:-color)?:\s*var\(--accent\)/.test(line)) {
        throw new Error(`--accent direct background found: ${line}`);
      }
      if (/^(\s*)color:\s*var\(--accent\)/.test(line)) {
        throw new Error(`--accent direct color found: ${line}`);
      }
    }
    expect(true).toBe(true);
  });

  it("font-weight: 700 が存在しない", () => {
    const css = readFileSync(cssPath, "utf-8");
    expect(css).not.toMatch(/font-weight:\s*700/);
  });
});

// =========================================================
// 個別論点: ①-14 既定空状態解消
// =========================================================
describe("①-14: 既定空状態解消", () => {
  it("初期状態でパターン入力欄が空（サンプルが自動入力されない）", () => {
    render(<RegexTesterPage />);
    const patternInput = screen.getByRole("textbox", {
      name: /正規表現パターン/,
    }) as HTMLInputElement;
    expect(patternInput.value).toBe("");
  });

  it("初期状態でテスト文字列が空（サンプルが自動入力されない）", () => {
    render(<RegexTesterPage />);
    const testStringArea = screen.getByRole("textbox", {
      name: /テスト文字列/,
    }) as HTMLTextAreaElement;
    expect(testStringArea.value).toBe("");
  });
});

// =========================================================
// 個別論点: ②-4 置換機能復元
// =========================================================
describe("②-4: 置換機能復元", () => {
  it("置換セクション切替ボタンが存在する", () => {
    render(<RegexTesterPage />);
    expect(screen.getByRole("button", { name: /置換/ })).toBeInTheDocument();
  });

  it("「置換を表示」ボタンを押すと置換文字列入力欄が表示される", async () => {
    render(<RegexTesterPage />);

    const toggleBtn = screen.getByRole("button", { name: /置換を表示/ });
    await act(async () => {
      fireEvent.click(toggleBtn);
    });

    expect(screen.getByLabelText(/置換文字列/)).toBeInTheDocument();
  });

  it("パターン・テスト文字列・置換文字列を入力すると置換結果が表示される", async () => {
    render(<RegexTesterPage />);

    // 置換セクションを開く
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /置換を表示/ }));
    });

    const patternInput = screen.getByRole("textbox", {
      name: /正規表現パターン/,
    });
    const testStringArea = screen.getByRole("textbox", {
      name: /テスト文字列/,
    });
    const replacementInput = screen.getByLabelText(/置換文字列/);

    await act(async () => {
      fireEvent.change(patternInput, { target: { value: "world" } });
      fireEvent.change(testStringArea, { target: { value: "hello world" } });
      fireEvent.change(replacementInput, { target: { value: "earth" } });
      await flushWorker();
    });

    // 置換結果ラベルが表示される
    expect(screen.getByText(/置換結果/)).toBeInTheDocument();
  });
});

// =========================================================
// 個別論点: ②-9 フォーカス可視化（outline:none 解消の確認）
// =========================================================
describe("②-9: フォーカス可視化", () => {
  it(
    "patternRow コンテナに :focus-within フォーカスリングルールが存在する" +
      "（コンテナがフォーカスリングを代理提供する設計）",
    () => {
      const cssPath = resolve(__dirname, "../RegexTesterPage.module.css");
      const css = readFileSync(cssPath, "utf-8");
      // patternRow:focus-within に outline: 2px solid var(--accent) が存在することを確認。
      // Component.tsx の patternInput は outline:none のままでフォーカスリング不可視だったが、
      // 新実装では patternRow コンテナの :focus-within でフォーカスリングを代理提供する。
      expect(css).toMatch(/\.patternRow:focus-within/);
      expect(css).toMatch(/outline:\s*2px\s+solid\s+var\(--accent\)/);
    },
  );
});

// =========================================================
// フラグ操作
// =========================================================
describe("フラグ操作", () => {
  it("g フラグチェックボックスが存在しデフォルトでオンになっている", () => {
    render(<RegexTesterPage />);
    const gCheckbox = screen.getByRole("checkbox", { name: /g/ });
    expect(gCheckbox).toBeInTheDocument();
    expect(gCheckbox).toBeChecked();
  });

  it("g フラグ OFF でマッチが 1 件のみになる", async () => {
    render(<RegexTesterPage />);

    const patternInput = screen.getByRole("textbox", {
      name: /正規表現パターン/,
    });
    const testStringArea = screen.getByRole("textbox", {
      name: /テスト文字列/,
    });

    await act(async () => {
      fireEvent.change(patternInput, { target: { value: "\\d+" } });
      fireEvent.change(testStringArea, {
        target: { value: "abc 123 def 456" },
      });
      await flushWorker();
    });

    // g フラグ OFF
    const gCheckbox = screen.getByRole("checkbox", { name: /g/ });
    await act(async () => {
      fireEvent.click(gCheckbox);
      await flushWorker();
    });

    const statusEl = screen.getByRole("status");
    expect(statusEl.textContent).toMatch(/1/);
  });
});

// =========================================================
// マッチなし表示
// =========================================================
describe("マッチなし表示", () => {
  it("パターンがマッチしないとき「マッチなし」が表示される", async () => {
    render(<RegexTesterPage />);

    const patternInput = screen.getByRole("textbox", {
      name: /正規表現パターン/,
    });
    const testStringArea = screen.getByRole("textbox", {
      name: /テスト文字列/,
    });

    await act(async () => {
      fireEvent.change(patternInput, { target: { value: "\\d{10}" } });
      fireEvent.change(testStringArea, { target: { value: "hello world" } });
      await flushWorker();
    });

    expect(screen.getByText(/マッチなし/)).toBeInTheDocument();
  });
});
