import { describe, test, expect, vi, beforeEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import { readFileSync } from "fs";
import { resolve } from "path";
import HashGeneratorTile from "../HashGeneratorTile";
import { COPIED_LABEL } from "@/components/hooks/useCopyToClipboard";
import { meta } from "../meta";

// ============================================================
// HashGeneratorTile テスト
// cycle-228 T-17: HashGeneratorPage.test.tsx の振る舞いを
// HashGeneratorTile に移植・拡張
// ============================================================

describe("HashGeneratorTile", () => {
  beforeEach(() => {
    // Reset clipboard mock
    Object.defineProperty(navigator, "clipboard", {
      value: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
      configurable: true,
    });
  });

  // -------------------------------------------------------
  // A-1: ルート要素が Panel（section タグ）であること
  // -------------------------------------------------------
  test("A-1: root element is a Panel (section tag by default)", () => {
    const { container } = render(<HashGeneratorTile />);
    const root = container.firstChild as HTMLElement;
    expect(root.tagName.toLowerCase()).toBe("section");
  });

  test("A-1: as prop changes root tag to div", () => {
    const { container } = render(<HashGeneratorTile as="div" />);
    const root = container.firstChild as HTMLElement;
    expect(root.tagName.toLowerCase()).toBe("div");
  });

  // -------------------------------------------------------
  // E-1: 基本レンダリング
  // -------------------------------------------------------
  test("renders without crashing", () => {
    render(<HashGeneratorTile />);
    expect(
      screen.getByPlaceholderText("ハッシュ化するテキストを入力..."),
    ).toBeInTheDocument();
  });

  test("renders input textarea", () => {
    render(<HashGeneratorTile />);
    const textarea = screen.getByRole("textbox");
    expect(textarea).toBeInTheDocument();
  });

  test("renders generate button", () => {
    render(<HashGeneratorTile />);
    expect(
      screen.getByRole("button", { name: "ハッシュ生成" }),
    ).toBeInTheDocument();
  });

  // -------------------------------------------------------
  // E-1: format セレクタ
  // -------------------------------------------------------
  test("renders format selector with hex and base64 options", () => {
    render(<HashGeneratorTile />);
    // デフォルトは hex
    expect(screen.getByDisplayValue("16進数 (Hex)")).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Base64" })).toBeInTheDocument();
  });

  // -------------------------------------------------------
  // E-3: 空入力時は結果が非表示
  // -------------------------------------------------------
  test("shows no results on initial empty state", () => {
    render(<HashGeneratorTile />);
    // No hash algorithm labels shown initially
    expect(screen.queryByText("SHA-256")).not.toBeInTheDocument();
    expect(screen.queryByText("SHA-1")).not.toBeInTheDocument();
  });

  // -------------------------------------------------------
  // E-2: 入力してハッシュ生成ボタンを押すと全アルゴリズムの結果が表示される
  // -------------------------------------------------------
  test("generates hashes for all 4 algorithms when button clicked", async () => {
    render(<HashGeneratorTile />);
    const textarea = screen.getByRole("textbox");
    fireEvent.change(textarea, { target: { value: "hello" } });
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "ハッシュ生成" }));
    });
    await waitFor(() => {
      expect(screen.getByText("SHA-1")).toBeInTheDocument();
      expect(screen.getByText("SHA-256")).toBeInTheDocument();
      expect(screen.getByText("SHA-384")).toBeInTheDocument();
      expect(screen.getByText("SHA-512")).toBeInTheDocument();
    });
  });

  // -------------------------------------------------------
  // E-4: SHA-256 の既知値確認 (G-5)
  // -------------------------------------------------------
  test('generates correct SHA-256 hash for "hello"', async () => {
    render(<HashGeneratorTile />);
    const textarea = screen.getByRole("textbox");
    fireEvent.change(textarea, { target: { value: "hello" } });
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "ハッシュ生成" }));
    });
    await waitFor(() => {
      expect(
        screen.getByText(
          "2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824",
        ),
      ).toBeInTheDocument();
    });
  });

  // -------------------------------------------------------
  // C-3: ライブリージョン（role="status" aria-live="polite"）
  // -------------------------------------------------------
  test("C-3: has role=status aria-live=polite for results summary", () => {
    render(<HashGeneratorTile />);
    const statusEl = screen.getByRole("status");
    expect(statusEl).toBeInTheDocument();
    expect(statusEl).toHaveAttribute("aria-live", "polite");
  });

  test("C-3: live region shows summary text after hash generation", async () => {
    render(<HashGeneratorTile />);
    const textarea = screen.getByRole("textbox");
    fireEvent.change(textarea, { target: { value: "hello" } });
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "ハッシュ生成" }));
    });
    await waitFor(() => {
      const statusEl = screen.getByRole("status");
      expect(statusEl.textContent).not.toBe("");
      expect(statusEl.textContent).toMatch(/ハッシュ値|生成/);
    });
  });

  // -------------------------------------------------------
  // E-6: コピーボタン
  // -------------------------------------------------------
  test("copy button aria-label changes after copy", async () => {
    render(<HashGeneratorTile />);
    const textarea = screen.getByRole("textbox");
    fireEvent.change(textarea, { target: { value: "hello" } });
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "ハッシュ生成" }));
    });
    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /SHA-256のハッシュ値をコピー/ }),
      ).toBeInTheDocument();
    });
    const sha256CopyButton = screen.getByRole("button", {
      name: /SHA-256のハッシュ値をコピー/,
    });
    await act(async () => {
      fireEvent.click(sha256CopyButton);
    });
    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: new RegExp(COPIED_LABEL) }),
      ).toBeInTheDocument();
    });
  });

  // -------------------------------------------------------
  // E-7: 初期状態でコピーボタンなし
  // -------------------------------------------------------
  test("no copy buttons for hash results in initial state", () => {
    render(<HashGeneratorTile />);
    // Only the "ハッシュ生成" button should be present
    const allButtons = screen.getAllByRole("button");
    expect(allButtons).toHaveLength(1);
  });

  test("no copy buttons when generate pressed with empty input", async () => {
    render(<HashGeneratorTile />);
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "ハッシュ生成" }));
    });
    const allButtons = screen.getAllByRole("button");
    expect(allButtons).toHaveLength(1);
  });

  // -------------------------------------------------------
  // E-8: クリップボード未対応でも例外にならない
  // -------------------------------------------------------
  test("does not throw when clipboard is unavailable", async () => {
    Object.defineProperty(navigator, "clipboard", {
      value: undefined,
      configurable: true,
    });
    render(<HashGeneratorTile />);
    const textarea = screen.getByRole("textbox");
    fireEvent.change(textarea, { target: { value: "hello" } });
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "ハッシュ生成" }));
    });
    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /SHA-256のハッシュ値をコピー/ }),
      ).toBeInTheDocument();
    });
    const sha256CopyButton = screen.getByRole("button", {
      name: /SHA-256のハッシュ値をコピー/,
    });
    expect(() => fireEvent.click(sha256CopyButton)).not.toThrow();
  });

  // -------------------------------------------------------
  // エラー表示（ErrorMessage）
  // -------------------------------------------------------
  test("shows ErrorMessage when hash generation fails", async () => {
    vi.spyOn(crypto.subtle, "digest").mockRejectedValueOnce(
      new Error("not supported"),
    );
    render(<HashGeneratorTile />);
    const textarea = screen.getByRole("textbox");
    fireEvent.change(textarea, { target: { value: "hello" } });
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "ハッシュ生成" }));
    });
    await waitFor(() => {
      const alertEl = screen.getByRole("alert");
      expect(alertEl).toBeInTheDocument();
      expect(alertEl.textContent).toMatch(/エラー|ハッシュ/);
    });
    vi.restoreAllMocks();
  });

  // -------------------------------------------------------
  // race condition 対策: 後発入力の結果のみが表示され、先発の結果で上書きされない
  //
  // シナリオ（Promise 解決順序を直接制御）:
  //   1. "first" でハッシュ生成を開始。digest は手動制御の Promise で停止させる。
  //   2. "second" でハッシュ生成を開始。digest は即時 resolve する。
  //   3. "second" の Promise.all が完了し setState が走る → generationRef が進む。
  //   4. "first" の digest を手動で resolve させる → generationRef のズレで setState スキップ。
  //   → 最終表示は "second" の SHA-256 既知値のみ。"first" の値は DOM に現れない。
  //
  // generationRef ガードを削除すると "first" の結果で DOM が上書きされ、
  // "second" の既知値 assert が失敗する（ガードの有効性を機械的に固定する）。
  // -------------------------------------------------------
  test("race condition guard: stale first result is discarded, second result wins", async () => {
    // "first"  の SHA-256（hex）既知値
    const FIRST_SHA256 =
      "a7937b64b8caa58f03721bb6bacf5c78cb235febe0e70b1b84cd99541461a08e";
    // "second" の SHA-256（hex）既知値
    const SECOND_SHA256 =
      "16367aacb67a4a017c8da8ab95682ccb390863780f7114dda0a0e0c55644c7c4";

    const originalDigest = crypto.subtle.digest.bind(crypto.subtle);

    // "first" の4アルゴリズム分をブロックする resolve 関数を保持する配列
    const firstResolvers: Array<() => void> = [];

    let callCount = 0;
    vi.spyOn(crypto.subtle, "digest").mockImplementation(
      async (algorithm: AlgorithmIdentifier, data: BufferSource) => {
        callCount++;
        if (callCount <= 4) {
          // "first" の 4 digest: 手動 resolve まで待機（→ "second" より後に完了させる）
          await new Promise<void>((resolve) => {
            firstResolvers.push(resolve);
          });
        }
        // "second" の 4 digest（callCount 5〜8）: 即時 resolve
        return originalDigest(algorithm, data);
      },
    );

    render(<HashGeneratorTile />);
    const textarea = screen.getByRole("textbox");

    // ── 先発: "first" を入力して生成ボタンを押す ──
    // fireEvent.click は同期的に handleGenerate を呼び出し、
    // digest の await でサスペンドする（firstResolvers が埋まるまでブロック）。
    // act() で包まない = Promise.all が完了しない状態で次へ進める。
    fireEvent.change(textarea, { target: { value: "first" } });
    fireEvent.click(screen.getByRole("button", { name: "ハッシュ生成" }));

    // "first" の4つの digest が開始されるまで待つ（firstResolvers に4つ溜まる）
    await waitFor(() => expect(firstResolvers).toHaveLength(4));

    // ── 後発: "second" を入力して生成ボタンを押す（digest 即時 resolve）──
    fireEvent.change(textarea, { target: { value: "second" } });
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "ハッシュ生成" }));
    });

    // "second" の結果が表示されるまで待つ（generationRef が進んだ状態）
    await waitFor(() => {
      expect(screen.getByText(SECOND_SHA256)).toBeInTheDocument();
    });

    // ── "first" の digest を手動 resolve させる ──
    // generationRef がすでに進んでいるため、race ガードが setState をスキップする。
    await act(async () => {
      firstResolvers.forEach((resolve) => resolve());
    });

    // "first" の SHA-256 は DOM に現れていないこと（race ガードが古い結果を廃棄した証明）
    expect(screen.queryByText(FIRST_SHA256)).not.toBeInTheDocument();
    // "second" の結果は依然として表示されていること
    expect(screen.getByText(SECOND_SHA256)).toBeInTheDocument();

    vi.restoreAllMocks();
  });

  // -------------------------------------------------------
  // A-6: 複数インスタンスで DOM id が一意
  // -------------------------------------------------------
  test("A-6: multiple instances have unique DOM ids (no duplicates)", () => {
    const { container } = render(
      <>
        <HashGeneratorTile />
        <HashGeneratorTile />
      </>,
    );
    const allIds = Array.from(container.querySelectorAll("[id]")).map((el) =>
      el.getAttribute("id"),
    );
    const uniqueIds = new Set(allIds);
    expect(uniqueIds.size).toBe(allIds.length);
  });

  // -------------------------------------------------------
  // variant="sha256" テスト（SHA-256のみ表示の固定バリアント）
  // -------------------------------------------------------
  test('variant="sha256": only SHA-256 result shown, no other algorithms', async () => {
    render(<HashGeneratorTile variant="sha256" />);
    const textarea = screen.getByRole("textbox");
    fireEvent.change(textarea, { target: { value: "hello" } });
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "ハッシュ生成" }));
    });
    await waitFor(() => {
      expect(screen.getByText("SHA-256")).toBeInTheDocument();
    });
    // SHA-1, SHA-384, SHA-512 は表示されない
    expect(screen.queryByText("SHA-1")).not.toBeInTheDocument();
    expect(screen.queryByText("SHA-384")).not.toBeInTheDocument();
    expect(screen.queryByText("SHA-512")).not.toBeInTheDocument();
  });

  // -------------------------------------------------------
  // CSS トークン検証（D-1〜D-3 / B-1〜B-4）
  // -------------------------------------------------------
  test("CSS does not use deprecated --color-* tokens", () => {
    const cssPath = resolve(__dirname, "../HashGeneratorTile.module.css");
    const css = readFileSync(cssPath, "utf-8");
    expect(css).not.toMatch(/var\(--color-/);
  });

  test("CSS does not use --accent as fill/background directly", () => {
    const cssPath = resolve(__dirname, "../HashGeneratorTile.module.css");
    const css = readFileSync(cssPath, "utf-8");
    expect(css).not.toMatch(/background(-color)?\s*:\s*var\(--accent\)/);
  });

  test("CSS does not use font-weight: 700", () => {
    const cssPath = resolve(__dirname, "../HashGeneratorTile.module.css");
    const css = readFileSync(cssPath, "utf-8");
    expect(css).not.toMatch(/font-weight\s*:\s*700/);
  });

  test("CSS does not add box-shadow (B-6 / A-7)", () => {
    const cssPath = resolve(__dirname, "../HashGeneratorTile.module.css");
    const css = readFileSync(cssPath, "utf-8");
    expect(css).not.toMatch(/box-shadow/);
  });
});

// ============================================================
// G-2 / G-4: meta.ts の文字列整合テスト
// 旧 HashGeneratorPage.test.tsx の describe("meta.ts content validation") を移植
// ============================================================
describe("meta.ts content validation", () => {
  // G-2: howItWorks 冒頭に「ハッシュとは何か・何に使うか」の平易な導入文が存在する
  test("howItWorks contains intro explaining what a hash is and its uses", () => {
    // 「ハッシュ値」「改ざん検知」「一方向」の3キーワードすべてを含む導入文があること
    expect(meta.howItWorks).toMatch(/ハッシュ値/);
    expect(meta.howItWorks).toMatch(/改ざん検知/);
    expect(meta.howItWorks).toMatch(/一方向/);
  });

  // G-4: shortDescription が4種類すべてのアルゴリズムを含む（SHA-384の省略是正）
  test("shortDescription includes SHA-384", () => {
    expect(meta.shortDescription).toMatch(/SHA-384/);
  });

  // G-4: shortDescription が SHA-1 / SHA-256 / SHA-512 も含む
  test("shortDescription includes all four algorithms", () => {
    expect(meta.shortDescription).toMatch(/SHA-1/);
    expect(meta.shortDescription).toMatch(/SHA-256/);
    expect(meta.shortDescription).toMatch(/SHA-384/);
    expect(meta.shortDescription).toMatch(/SHA-512/);
  });
});
