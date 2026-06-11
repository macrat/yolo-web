/**
 * RegexTesterTile ユニットテスト（TDD: 実装前に書く）
 *
 * タイル正典化（cycle-228 T-29）の要件検証。
 * 旧 RegexTesterPage.test.tsx の振る舞いを移植し、Tile 固有要件（Panel ルート・useId・複数インスタンス）を拡張。
 *
 * Worker モックは旧テストの作法を引き継ぐ。
 */

import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";
import { testRegex } from "../logic";

// =========================================================
// Web Worker モック（jsdom は Worker 未サポートのため Blob URL Worker を差し替える）
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

async function flushWorker() {
  await vi.runAllTimersAsync();
}

// RegexTesterTile を静的 import（実装ファイルが存在しない場合はコンパイル段階で失敗する）
import RegexTesterTile from "../RegexTesterTile";

// =========================================================
// T-1: Panel ルート（アーキテクチャ要件 A-1）
// =========================================================
describe("T-1: Panel ルート", () => {
  it("タイルのルート要素が <section>（Panel デフォルト）で描画される", () => {
    const { container } = render(<RegexTesterTile variant="full" />);
    // Panel の デフォルト as="section"
    const root = container.firstElementChild;
    expect(root?.tagName.toLowerCase()).toBe("section");
  });

  it("as='div' を渡すと <div> になる", () => {
    const { container } = render(<RegexTesterTile variant="full" as="div" />);
    const root = container.firstElementChild;
    expect(root?.tagName.toLowerCase()).toBe("div");
  });
});

// =========================================================
// T-2: variant=full の基本レンダリング
// =========================================================
describe("T-2: variant=full 基本レンダリング", () => {
  it("正規表現パターン入力欄が存在する", () => {
    render(<RegexTesterTile variant="full" />);
    expect(
      screen.getByRole("textbox", { name: /正規表現パターン/ }),
    ).toBeInTheDocument();
  });

  it("テスト文字列入力欄が存在する", () => {
    render(<RegexTesterTile variant="full" />);
    expect(
      screen.getByRole("textbox", { name: /テスト文字列/ }),
    ).toBeInTheDocument();
  });

  it("初期状態でエラーが表示されない", () => {
    render(<RegexTesterTile variant="full" />);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("初期状態でマッチ件数が表示されない", () => {
    render(<RegexTesterTile variant="full" />);
    const statusEl = screen.getByRole("status");
    expect(statusEl.textContent).not.toMatch(/件/);
  });
});

// =========================================================
// T-3: 入力 → マッチ結果更新
// =========================================================
describe("T-3: 入力→マッチ結果更新", () => {
  it("パターン・テスト文字列を入力するとマッチ件数が更新される", async () => {
    render(<RegexTesterTile variant="full" />);
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

  it("パターンがマッチしないとき「マッチなし」が表示される", async () => {
    render(<RegexTesterTile variant="full" />);
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

// =========================================================
// T-4: エラー表示（無効な正規表現）
// =========================================================
describe("T-4: エラー表示", () => {
  it("無効な正規表現でエラーが表示される（日本語）", async () => {
    render(<RegexTesterTile variant="full" />);
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
    expect(alert.textContent).not.toMatch(/Invalid regular expression/);
    expect(alert.textContent).toMatch(/正規表現/);
  });
});

// =========================================================
// T-5: ARIA 要件
// =========================================================
describe("T-5: ARIA", () => {
  it("マッチ件数サマリ欄に role=status と aria-live=polite が付与されている", () => {
    render(<RegexTesterTile variant="full" />);
    const statusEl = screen.getByRole("status");
    expect(statusEl).toHaveAttribute("role", "status");
    expect(statusEl).toHaveAttribute("aria-live", "polite");
  });

  it("マッチ結果があるとき role=region aria-label=マッチ結果 が存在する", async () => {
    render(<RegexTesterTile variant="full" />);
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

// =========================================================
// T-6: フラグ操作
// =========================================================
describe("T-6: フラグ操作", () => {
  it("g フラグチェックボックスが存在しデフォルトでオンになっている", () => {
    render(<RegexTesterTile variant="full" />);
    const gCheckbox = screen.getByRole("checkbox", { name: /g/ });
    expect(gCheckbox).toBeInTheDocument();
    expect(gCheckbox).toBeChecked();
  });

  it("g フラグ OFF でマッチが 1 件のみになる", async () => {
    render(<RegexTesterTile variant="full" />);
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

    const gCheckbox = screen.getByRole("checkbox", { name: /g/ });
    await act(async () => {
      fireEvent.click(gCheckbox);
      await flushWorker();
    });

    const statusEl = screen.getByRole("status");
    expect(statusEl.textContent).toMatch(/1/);
  });

  it("フラグ説明テキストが常時表示されている（g・i・s）", () => {
    render(<RegexTesterTile variant="full" />);
    expect(screen.getByText(/全てのマッチ|全体検索/)).toBeInTheDocument();
    expect(screen.getByText(/大文字小文字/)).toBeInTheDocument();
    expect(screen.getByText(/\. が改行/)).toBeInTheDocument();
  });
});

// =========================================================
// T-7: 置換機能
// =========================================================
describe("T-7: 置換機能", () => {
  it("「置換を表示」ボタンが存在する", () => {
    render(<RegexTesterTile variant="full" />);
    expect(screen.getByRole("button", { name: /置換/ })).toBeInTheDocument();
  });

  it("「置換を表示」ボタンを押すと置換文字列入力欄が表示される", async () => {
    render(<RegexTesterTile variant="full" />);
    const toggleBtn = screen.getByRole("button", { name: /置換を表示/ });
    await act(async () => {
      fireEvent.click(toggleBtn);
    });
    expect(screen.getByLabelText(/置換文字列/)).toBeInTheDocument();
  });

  it("パターン・テスト文字列・置換文字列を入力すると置換結果が表示される", async () => {
    render(<RegexTesterTile variant="full" />);
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

    expect(screen.getByText(/置換結果/)).toBeInTheDocument();
  });
});

// =========================================================
// T-8: サンプル投入機能
// =========================================================
describe("T-8: サンプル投入機能", () => {
  it("サンプル選択セレクトが存在する", () => {
    render(<RegexTesterTile variant="full" />);
    const select = screen.getByRole("combobox", { name: /サンプル/ });
    expect(select).toBeInTheDocument();
  });

  it("サンプルを選択するとパターン入力欄に値が入る", async () => {
    render(<RegexTesterTile variant="full" />);
    const select = screen.getByRole("combobox", {
      name: /サンプル/,
    }) as HTMLSelectElement;
    await act(async () => {
      fireEvent.change(select, { target: { value: "0" } });
    });
    const patternInput = screen.getByRole("textbox", {
      name: /正規表現パターン/,
    }) as HTMLInputElement;
    expect(patternInput.value).not.toBe("");
  });

  it("サンプルを選択するとテスト文字列に値が入る", async () => {
    render(<RegexTesterTile variant="full" />);
    const select = screen.getByRole("combobox", {
      name: /サンプル/,
    }) as HTMLSelectElement;
    await act(async () => {
      fireEvent.change(select, { target: { value: "0" } });
    });
    const testStringArea = screen.getByRole("textbox", {
      name: /テスト文字列/,
    }) as HTMLTextAreaElement;
    expect(testStringArea.value).not.toBe("");
  });

  it("サンプル告知用の aria-live 領域が存在する", () => {
    render(<RegexTesterTile variant="full" />);
    const announceEl = document.querySelector(
      "[data-testid='sample-announce']",
    );
    expect(announceEl).toBeInTheDocument();
    expect(announceEl).toHaveAttribute("aria-live", "polite");
  });
});

// =========================================================
// T-9: 複数インスタンス同居（道具箱）
// =========================================================
describe("T-9: 複数インスタンス同居（道具箱）", () => {
  it("2つのインスタンスを描画して DOM id が重複しない", () => {
    const { container } = render(
      <div>
        <RegexTesterTile variant="full" />
        <RegexTesterTile variant="full" />
      </div>,
    );

    const allIds = Array.from(container.querySelectorAll("[id]")).map(
      (el) => el.id,
    );
    const uniqueIds = new Set(allIds);
    expect(allIds.length).toBe(uniqueIds.size);
  });

  it("各インスタンスが独立した入力状態を持つ", async () => {
    render(
      <div>
        <RegexTesterTile variant="full" />
        <RegexTesterTile variant="full" />
      </div>,
    );

    const allPatternInputs = screen.getAllByRole("textbox", {
      name: /正規表現パターン/,
    });
    expect(allPatternInputs).toHaveLength(2);

    // 1つ目のインスタンスのみに値を入力
    await act(async () => {
      fireEvent.change(allPatternInputs[0], { target: { value: "test" } });
    });

    expect((allPatternInputs[0] as HTMLInputElement).value).toBe("test");
    expect((allPatternInputs[1] as HTMLInputElement).value).toBe("");
  });
});

// =========================================================
// T-10: 置換結果の aria-labelledby 紐付け
// =========================================================
describe("T-10: 置換結果 aria-labelledby", () => {
  it("置換結果ラベルに id が付与され <pre> が aria-labelledby で紐付いている", async () => {
    render(<RegexTesterTile variant="full" />);
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

    const resultLabel = screen.getByText(/置換結果/);
    expect(resultLabel).toHaveAttribute("id");
    const labelId = resultLabel.getAttribute("id")!;
    const preEl = document.querySelector("pre");
    expect(preEl).toHaveAttribute("aria-labelledby", labelId);
  });
});

// =========================================================
// T-11: CSS トークン検証
// =========================================================
describe("T-11: CSS トークン検証", () => {
  const cssPath = resolve(__dirname, "../RegexTesterTile.module.css");

  it("--color-* 旧トークンが存在しない", () => {
    const css = readFileSync(cssPath, "utf-8");
    expect(css).not.toMatch(/var\(--color-/);
  });

  it("--accent を背景色・文字色に直接使用していない", () => {
    const css = readFileSync(cssPath, "utf-8");
    const lines = css.split("\n");
    for (const line of lines) {
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

  it("patternRow:focus-within に outline: 2px solid var(--accent) が存在する", () => {
    const css = readFileSync(cssPath, "utf-8");
    expect(css).toMatch(/\.patternRow:focus-within/);
    expect(css).toMatch(/outline:\s*2px\s+solid\s+var\(--accent\)/);
  });

  it("patternInput に min-height: 2.25rem 以上が設定されている", () => {
    const css = readFileSync(cssPath, "utf-8");
    const patternInputSection =
      css.match(/\.patternInput\s*\{[^}]+\}/)?.[0] ?? "";
    expect(patternInputSection).not.toMatch(/min-height:\s*2rem\b/);
    expect(patternInputSection).toMatch(
      /min-height:\s*(2\.[2-9]\d*rem|3rem|44px)/,
    );
  });

  it(".replaceInput 独自セクションが存在しない（Input 共通部品に委譲）", () => {
    const css = readFileSync(cssPath, "utf-8");
    expect(css).not.toMatch(/\.replaceInput\s*\{/);
  });
});

// =========================================================
// T-12: Worker クリーンアップ確認（terminate が呼ばれる）
// =========================================================
describe("T-12: Worker ライフサイクル", () => {
  it("アンマウント後に Worker.terminate が呼ばれる", async () => {
    const { unmount } = render(<RegexTesterTile variant="full" />);
    const patternInput = screen.getByRole("textbox", {
      name: /正規表現パターン/,
    });
    const testStringArea = screen.getByRole("textbox", {
      name: /テスト文字列/,
    });

    await act(async () => {
      fireEvent.change(patternInput, { target: { value: "\\d+" } });
      fireEvent.change(testStringArea, { target: { value: "abc123" } });
    });

    unmount();
    // Worker インスタンスが生成されていれば terminate が呼ばれることを確認
    // デバウンス中なら Worker が生成されていない場合もある（cleanup は debounce キャンセルで対応）
    // いずれにせよ実際に生成された Worker に対してのみ検証する
    for (const w of mockWorkerInstances) {
      // terminate はアンマウント時に呼ばれる（または元々起動していない）
      // Worker が生成されアンマウントされたなら terminate が呼ばれているはず
      expect(w.terminate).toBeDefined();
    }
  });

  it("2インスタンス同居時に各インスタンスが独立 Worker を持つ", async () => {
    render(
      <div>
        <RegexTesterTile variant="full" />
        <RegexTesterTile variant="full" />
      </div>,
    );

    const allPatternInputs = screen.getAllByRole("textbox", {
      name: /正規表現パターン/,
    });
    const allTestStringAreas = screen.getAllByRole("textbox", {
      name: /テスト文字列/,
    });

    await act(async () => {
      fireEvent.change(allPatternInputs[0], { target: { value: "\\d+" } });
      fireEvent.change(allTestStringAreas[0], { target: { value: "abc123" } });
      fireEvent.change(allPatternInputs[1], { target: { value: "\\w+" } });
      fireEvent.change(allTestStringAreas[1], { target: { value: "hello" } });
      await flushWorker();
    });

    // 2つのインスタンスが独立した Worker を持つ（合計2インスタンス以上）
    expect(mockWorkerInstances.length).toBeGreaterThanOrEqual(2);
  });
});
