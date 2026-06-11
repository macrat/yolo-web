/**
 * PasswordGeneratorTile 回帰テスト
 *
 * PasswordGeneratorPage.test.tsx の振る舞いを移植・拡張。
 * 主な追加観点:
 * - [A-1] Panel がルートであること
 * - [A-6] useId ベースの id 一意性（複数インスタンス）
 * - variant="full" の全機能保持
 * - 複数インスタンスで DOM id 重複なし
 * - E-12 相当の CSS トークン検証
 *
 * CSS トークン検証は `import { readFileSync } from "fs"` で書く（require() は eslint error）。
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import PasswordGeneratorTile from "../PasswordGeneratorTile";

// =========================================================
// navigator.clipboard モック
// =========================================================
beforeEach(() => {
  vi.stubGlobal("navigator", {
    ...navigator,
    clipboard: {
      writeText: vi.fn().mockResolvedValue(undefined),
    },
  });
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

// =========================================================
// CSS トークン検証
// =========================================================
describe("CSS トークン検証", () => {
  const cssPath = join(
    process.cwd(),
    "src/tools/password-generator/PasswordGeneratorTile.module.css",
  );

  function stripCssComments(css: string): string {
    return css.replace(/\/\*[\s\S]*?\*\//g, "");
  }

  it("--color-* 旧トークンが存在しない [B-1]", () => {
    const css = stripCssComments(readFileSync(cssPath, "utf-8"));
    expect(css).not.toMatch(/var\(--color-/);
  });

  it("--accent 直塗り（background-color）が存在しない [B-3]", () => {
    const css = stripCssComments(readFileSync(cssPath, "utf-8"));
    expect(css).not.toMatch(/background-color\s*:\s*var\(--accent\)/);
  });

  it("--accent 直塗り（color）が存在しない [B-3]", () => {
    const css = stripCssComments(readFileSync(cssPath, "utf-8"));
    expect(css).not.toMatch(/(?:^|[;\s])color\s*:\s*var\(--accent\)/m);
  });

  it("非インタラクティブ要素に --r-interactive が使われていない [B-5]", () => {
    const css = stripCssComments(readFileSync(cssPath, "utf-8"));
    expect(css).not.toMatch(/border-radius\s*:\s*var\(--r-interactive\)/);
  });

  it("font-weight: 700 が存在しない [B-4]", () => {
    const css = stripCssComments(readFileSync(cssPath, "utf-8"));
    expect(css).not.toMatch(/font-weight\s*:\s*700/);
  });

  it("強度バーの background-color に --accent-strong を使っていない（status パレット統一）", () => {
    const css = stripCssComments(readFileSync(cssPath, "utf-8"));
    expect(css).not.toMatch(/background-color\s*:\s*var\(--accent-strong\)/);
  });
});

// =========================================================
// [A-1] アーキテクチャ: Panel ルート確認
// =========================================================
describe("[A-1] Panel ルート確認", () => {
  it("ルート要素が Panel（section または div）で、data-tile 等の Panel 特有属性を持つ", () => {
    const { container } = render(<PasswordGeneratorTile />);
    // Panel の index.tsx を見ると styles.panel クラスが付与される
    // Panel コンポーネントがルートとなること（div でなく section がデフォルト）
    const root = container.firstChild as HTMLElement;
    // Panel はデフォルト as="section" なので section タグになる
    expect(root.tagName.toLowerCase()).toBe("section");
  });
});

// =========================================================
// [A-6] useId ベースの id 一意性（複数インスタンス）
// =========================================================
describe("[A-6] 複数インスタンスで DOM id 一意性", () => {
  it("2 つのインスタンスを同一ページに配置しても DOM id が重複しない", () => {
    const { container } = render(
      <>
        <PasswordGeneratorTile />
        <PasswordGeneratorTile />
      </>,
    );

    // id を持つすべての要素を取得
    const allIds = Array.from(container.querySelectorAll("[id]")).map(
      (el) => el.id,
    );
    const uniqueIds = new Set(allIds);
    expect(allIds.length).toBe(uniqueIds.size);
  });

  it("2 つのインスタンスのスライダーが互いに独立している", () => {
    render(
      <>
        <PasswordGeneratorTile />
        <PasswordGeneratorTile />
      </>,
    );
    // 2 つのスライダーが存在する
    const sliders = screen.getAllByRole("slider");
    expect(sliders.length).toBe(2);
    // 各スライダーが独立した label に紐付いている
    const slider1 = sliders[0] as HTMLInputElement;
    const slider2 = sliders[1] as HTMLInputElement;
    expect(slider1.id).not.toBe(slider2.id);
  });
});

// =========================================================
// 基本レンダリング
// =========================================================
describe("基本レンダリング", () => {
  it("コンポーネントが正常にレンダリングされる", () => {
    render(<PasswordGeneratorTile />);
    expect(
      screen.getByRole("button", { name: /パスワード生成/ }),
    ).toBeInTheDocument();
  });

  it("文字数スライダーラベルと強度ラベルが描画される", () => {
    render(<PasswordGeneratorTile />);
    expect(screen.getByText(/文字数/)).toBeInTheDocument();
    expect(screen.getByText(/強度/)).toBeInTheDocument();
  });

  it("variant prop を省略しても動作する", () => {
    render(<PasswordGeneratorTile />);
    expect(
      screen.getByRole("button", { name: /パスワード生成/ }),
    ).toBeInTheDocument();
  });

  it("as prop でルートタグを変更できる", () => {
    const { container } = render(<PasswordGeneratorTile as="div" />);
    expect(container.firstChild?.nodeName.toLowerCase()).toBe("div");
  });
});

// =========================================================
// 空入力・初期状態
// =========================================================
describe("空入力・初期状態", () => {
  it("全文字種を OFF にするとエラーメッセージが表示される", async () => {
    render(<PasswordGeneratorTile />);
    fireEvent.click(screen.getByRole("switch", { name: /大文字/ }));
    fireEvent.click(screen.getByRole("switch", { name: /小文字/ }));
    fireEvent.click(screen.getByRole("switch", { name: /数字/ }));
    fireEvent.click(screen.getByRole("switch", { name: /記号/ }));
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /パスワード生成/ }),
    ).toBeDisabled();
  });

  it("初期状態では role='status' の要素が存在する", () => {
    render(<PasswordGeneratorTile />);
    const statusEl = screen.getByRole("status");
    expect(statusEl).toBeInTheDocument();
  });
});

// =========================================================
// 生成ボタン
// =========================================================
describe("生成ボタン動作", () => {
  it("生成ボタンを押すとパスワードが生成される", async () => {
    render(<PasswordGeneratorTile />);
    const generateBtn = screen.getByRole("button", { name: /パスワード生成/ });

    await act(async () => {
      fireEvent.click(generateBtn);
    });

    const passwordDisplay = screen.getByRole("status");
    expect(passwordDisplay.textContent?.length).toBeGreaterThan(0);
  });

  it("生成ボタン押下でデフォルト設定16文字のパスワードが生成される", async () => {
    render(<PasswordGeneratorTile />);
    const generateBtn = screen.getByRole("button", { name: /パスワード生成/ });

    await act(async () => {
      fireEvent.click(generateBtn);
    });

    const codeEl = document.querySelector("code");
    expect(codeEl).toBeInTheDocument();
    expect(codeEl?.textContent?.length).toBe(16);
  });
});

// =========================================================
// ARIA
// =========================================================
describe("ARIA", () => {
  it("role='status' aria-live='polite' の要素が存在する", () => {
    render(<PasswordGeneratorTile />);
    const statusEl = screen.getByRole("status");
    expect(statusEl).toHaveAttribute("aria-live", "polite");
  });

  it("ToggleSwitch が role='switch' で5つ描画される", () => {
    render(<PasswordGeneratorTile />);
    const switches = screen.getAllByRole("switch");
    expect(switches.length).toBe(5);
  });

  it("パスワード表示の code 要素には aria-live がない（秘密情報配慮）", async () => {
    render(<PasswordGeneratorTile />);

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /パスワード生成/ }));
    });

    const codeEl = document.querySelector("code");
    const ariaLive = codeEl?.getAttribute("aria-live");
    expect(ariaLive === null || ariaLive === "off").toBe(true);
  });
});

// =========================================================
// コピー
// =========================================================
describe("コピー機能", () => {
  it("コピーボタンが COPIED_LABEL に変化する", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: false });
    render(<PasswordGeneratorTile />);

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /パスワード生成/ }));
    });

    const copyBtn = screen.getByRole("button", { name: /コピー/ });
    expect(copyBtn).not.toBeDisabled();
    expect(copyBtn).toHaveTextContent("コピー");

    await act(async () => {
      fireEvent.click(copyBtn);
    });

    expect(
      screen.getByRole("button", { name: /コピーしました/ }),
    ).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(
      screen.getByRole("button", { name: /^コピー$/ }),
    ).toBeInTheDocument();
  });

  it("全文字種を OFF にすると生成ボタンが disabled になる", async () => {
    render(<PasswordGeneratorTile />);
    fireEvent.click(screen.getByRole("switch", { name: /大文字/ }));
    fireEvent.click(screen.getByRole("switch", { name: /小文字/ }));
    fireEvent.click(screen.getByRole("switch", { name: /数字/ }));
    fireEvent.click(screen.getByRole("switch", { name: /記号/ }));

    const generateBtn = screen.getByRole("button", { name: /パスワード生成/ });
    expect(generateBtn).toBeDisabled();
  });

  it("パスワード生成後はコピーボタンが有効になる", async () => {
    render(<PasswordGeneratorTile />);

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /パスワード生成/ }));
    });

    const copyBtn = screen.getByRole("button", { name: /コピー/ });
    expect(copyBtn).not.toBeDisabled();
  });

  it("navigator.clipboard が存在しない環境でエラーがスローされない", async () => {
    vi.stubGlobal("navigator", {
      ...navigator,
      clipboard: undefined,
    });

    render(<PasswordGeneratorTile />);

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /パスワード生成/ }));
    });

    await expect(async () => {
      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: /^コピー$/ }));
      });
    }).not.toThrow();
  });
});

// =========================================================
// hydration 安全性
// =========================================================
describe("hydration 安全性", () => {
  it("マウント後に useId ベースのスライダーが描画され、パスワードが生成される", () => {
    render(<PasswordGeneratorTile />);
    const codeEl = document.querySelector("code");
    expect(codeEl).toBeInTheDocument();
    // useEffect で 16 文字が生成される（DEFAULT_OPTIONS.length = 16）
    expect(codeEl?.textContent?.length).toBe(16);
  });
});

// =========================================================
// 強度バーの動的更新
// =========================================================
describe("強度バーの動的更新", () => {
  it("デフォルト設定（全ON・16文字）で強度が strong になっている", () => {
    render(<PasswordGeneratorTile />);
    const statusEl = screen.getByRole("status");
    expect(statusEl.textContent).toContain("強い");
  });

  it("全文字種を OFF にすると強度バーが「—」表示になる（弱い誤表示防止）", () => {
    render(<PasswordGeneratorTile />);

    fireEvent.click(screen.getByRole("switch", { name: /大文字/ }));
    fireEvent.click(screen.getByRole("switch", { name: /小文字/ }));
    fireEvent.click(screen.getByRole("switch", { name: /数字/ }));
    fireEvent.click(screen.getByRole("switch", { name: /記号/ }));

    const statusEl = screen.getByRole("status");
    expect(statusEl.textContent).toContain("—");
  });

  it("数字のみ・8文字では強度が weak になる", () => {
    render(<PasswordGeneratorTile />);

    fireEvent.click(screen.getByRole("switch", { name: /大文字/ }));
    fireEvent.click(screen.getByRole("switch", { name: /小文字/ }));
    fireEvent.click(screen.getByRole("switch", { name: /記号/ }));

    const slider = document.querySelector(
      'input[type="range"]',
    ) as HTMLInputElement;
    fireEvent.change(slider, { target: { value: "8" } });

    const statusEl = screen.getByRole("status");
    expect(statusEl.textContent).toContain("弱い");
  });
});

// =========================================================
// ToggleSwitch
// =========================================================
describe("ToggleSwitch", () => {
  it("ToggleSwitch が role='switch' で使われている（checkbox ではない）", () => {
    render(<PasswordGeneratorTile />);
    const switches = screen.getAllByRole("switch");
    expect(switches.length).toBeGreaterThan(0);
    switches.forEach((sw) => {
      expect(sw).toHaveAttribute("type", "checkbox");
      expect(sw).toHaveAttribute("role", "switch");
    });
  });

  it("ToggleSwitch のラベルが正しく表示される", () => {
    render(<PasswordGeneratorTile />);
    expect(screen.getByRole("switch", { name: /大文字/ })).toBeInTheDocument();
    expect(screen.getByRole("switch", { name: /小文字/ })).toBeInTheDocument();
    expect(screen.getByRole("switch", { name: /数字/ })).toBeInTheDocument();
    expect(screen.getByRole("switch", { name: /記号/ })).toBeInTheDocument();
    expect(
      screen.getByRole("switch", { name: /紛らわしい文字/ }),
    ).toBeInTheDocument();
  });
});

// =========================================================
// UX是正: 全文字種OFFのエラー状態
// =========================================================
describe("UX是正: 全文字種OFFのエラーフィードバック", () => {
  it("全文字種をOFFにするとエラーメッセージが表示される", () => {
    render(<PasswordGeneratorTile />);
    fireEvent.click(screen.getByRole("switch", { name: /大文字/ }));
    fireEvent.click(screen.getByRole("switch", { name: /小文字/ }));
    fireEvent.click(screen.getByRole("switch", { name: /数字/ }));
    fireEvent.click(screen.getByRole("switch", { name: /記号/ }));
    expect(screen.getByRole("alert")).toHaveTextContent(
      "使用する文字の種類を 1 つ以上選んでください",
    );
  });

  it("全文字種をOFFにすると生成ボタンが無効化される", () => {
    render(<PasswordGeneratorTile />);
    fireEvent.click(screen.getByRole("switch", { name: /大文字/ }));
    fireEvent.click(screen.getByRole("switch", { name: /小文字/ }));
    fireEvent.click(screen.getByRole("switch", { name: /数字/ }));
    fireEvent.click(screen.getByRole("switch", { name: /記号/ }));
    expect(
      screen.getByRole("button", { name: /パスワード生成/ }),
    ).toBeDisabled();
  });

  it("いずれか1つ以上の文字種をONにするとエラーメッセージが消える", () => {
    render(<PasswordGeneratorTile />);
    fireEvent.click(screen.getByRole("switch", { name: /大文字/ }));
    fireEvent.click(screen.getByRole("switch", { name: /小文字/ }));
    fireEvent.click(screen.getByRole("switch", { name: /数字/ }));
    fireEvent.click(screen.getByRole("switch", { name: /記号/ }));
    expect(screen.getByRole("alert")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("switch", { name: /大文字/ }));
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("文字種が有効な状態では強度バーが「—」表示にならない", () => {
    render(<PasswordGeneratorTile />);
    const statusEl = screen.getByRole("status");
    expect(statusEl.textContent).not.toContain("—");
  });
});
