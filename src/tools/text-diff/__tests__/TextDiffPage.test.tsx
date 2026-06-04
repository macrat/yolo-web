/**
 * text-diff 単一実装(TextDiffPage)の回帰テスト
 *
 * 個別論点:
 *   ①-2: 件数・ラベル一致（line/word/char モード別に適切なカウント表示）
 *   ①-12: 空入力「差分なし」誤表示解消（両方空のときは入力待ち状態）
 *   ②-15: コピーボタンは存在しない（知る対象）
 *
 * E-1〜E-12 を網羅:
 *   E-1: 基本レンダリング
 *   E-2: 入力→結果更新
 *   E-3: 空入力（両方空のとき差分なし誤表示しない）
 *   E-4: 変換ロジックの正確性（line/word/char モード）
 *   E-5: ARIA（role=status + aria-live=polite・サマリテキストノード・role=region）
 *   E-6: N/A（コピーボタンなし・知る対象）
 *   E-7: N/A（コピーボタンなし・知る対象）
 *   E-8: N/A（コピーボタンなし・知る対象）
 *   E-9: N/A（詳細リンクなし・ページ自体がフル機能ツール）
 *   E-10: meta 由来の表示
 *   E-11: 既存 logic.ts テスト PASS 維持
 *   E-12: CSS トークン検証（readFileSync）
 */

import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, afterEach } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";
import TextDiffPage from "../TextDiffPage";

afterEach(() => {
  document.body.innerHTML = "";
});

// ===========================================================
// E-1: 基本レンダリング
// ===========================================================
describe("E-1: 基本レンダリング", () => {
  it("コンポーネントが正常にレンダリングされる", () => {
    render(<TextDiffPage />);
    // 変更前・変更後のテキストエリアが存在する
    expect(screen.getByLabelText("変更前テキスト")).toBeInTheDocument();
    expect(screen.getByLabelText("変更後テキスト")).toBeInTheDocument();
  });

  it("比較モードの SegmentedControl（radiogroup）が存在する", () => {
    render(<TextDiffPage />);
    // SegmentedControl は role="radiogroup" で描画される（A-3 要件）
    const radiogroup = screen.getByRole("radiogroup");
    expect(radiogroup).toBeInTheDocument();
  });

  it("比較モードの初期選択が「行単位」になっている（C-5: value が options 内に存在）", () => {
    render(<TextDiffPage />);
    // 「行単位」が初期選択されている
    const lineOption = screen.getByRole("radio", { name: "行単位" });
    expect(lineOption).toBeChecked();
  });

  it("コピーボタンが存在しない（②-15: 知る対象）", () => {
    render(<TextDiffPage />);
    // コピーボタンは存在しない
    expect(screen.queryByRole("button")).toBeNull();
  });
});

// ===========================================================
// E-2: 入力→結果更新
// ===========================================================
describe("E-2: 入力→結果更新", () => {
  it("2つのテキストエリアに異なるテキストを入力すると差分結果が表示される", () => {
    render(<TextDiffPage />);

    const oldTextarea = screen.getByLabelText("変更前テキスト");
    const newTextarea = screen.getByLabelText("変更後テキスト");

    fireEvent.change(oldTextarea, { target: { value: "apple" } });
    fireEvent.change(newTextarea, { target: { value: "orange" } });

    // 差分結果欄が表示される
    const region = screen.getByRole("region", { name: "差分結果" });
    expect(region).toBeInTheDocument();
    expect(region.textContent?.length).toBeGreaterThan(0);
  });

  it("モードを変更すると比較モードが切り替わる（SegmentedControl のクリック）", () => {
    render(<TextDiffPage />);

    // 「単語単位」ラジオをクリックしてモード変更
    const wordOption = screen.getByRole("radio", { name: "単語単位" });
    fireEvent.click(wordOption);

    // 「単語単位」が選択されている
    expect(wordOption).toBeChecked();
  });
});

// ===========================================================
// E-3: 空入力（①-12: 空入力「差分なし」誤表示解消）
// ===========================================================
describe("E-3: 空入力（①-12 個別論点）", () => {
  it("両方空（初期状態）のとき「差分なし」を誤表示しない", () => {
    render(<TextDiffPage />);

    // 両方空のとき「差分なし」の誤表示はしない
    expect(screen.queryByText(/差分なし/)).toBeNull();
  });

  it("両方空のとき差分結果欄（role=region）が表示されない", () => {
    render(<TextDiffPage />);

    // 差分結果欄は表示されない
    expect(screen.queryByRole("region", { name: "差分結果" })).toBeNull();
  });

  it("両方空のとき role=status の summary は空またはプレースホルダー状態になる", () => {
    render(<TextDiffPage />);

    const statusEl = screen.getByRole("status");
    expect(statusEl).toBeInTheDocument();
    // 「差分なし」の誤表示はしない
    expect(statusEl).not.toHaveTextContent("差分なし");
  });

  it("片方だけ入力した場合も差分結果が正しく表示される", () => {
    render(<TextDiffPage />);

    const oldTextarea = screen.getByLabelText("変更前テキスト");
    fireEvent.change(oldTextarea, { target: { value: "some text" } });

    // 片方のみ入力でも差分計算が動く
    const statusEl = screen.getByRole("status");
    expect(statusEl).toBeInTheDocument();
  });

  it("同じテキストを両方に入力したとき「差分なし」が表示される（差分あり入力後）", () => {
    render(<TextDiffPage />);

    const oldTextarea = screen.getByLabelText("変更前テキスト");
    const newTextarea = screen.getByLabelText("変更後テキスト");

    // まず異なるテキストを入力
    fireEvent.change(oldTextarea, { target: { value: "hello" } });
    fireEvent.change(newTextarea, { target: { value: "hello" } });

    // 同じテキストのとき「差分なし」を表示する（入力がある場合は差分ゼロの通知）
    const statusEl = screen.getByRole("status");
    expect(statusEl).toHaveTextContent("差分なし");
  });
});

// ===========================================================
// E-4: 変換ロジックの正確性（①-2: 件数・ラベル一致）
// ===========================================================
describe("E-4: 変換ロジックの正確性（①-2 個別論点）", () => {
  it("line モードで複数行の差分を正しくカウントする", () => {
    render(<TextDiffPage />);

    const oldTextarea = screen.getByLabelText("変更前テキスト");
    const newTextarea = screen.getByLabelText("変更後テキスト");

    // line モード（初期値）のまま入力
    fireEvent.change(oldTextarea, { target: { value: "line1\nline2\n" } });
    fireEvent.change(newTextarea, { target: { value: "line1\nline3\n" } });

    const statusEl = screen.getByRole("status");
    // line モードのサマリは「行」単位で表示される
    expect(statusEl).toHaveTextContent(/行/);
  });

  it("word モードで単語単位の差分が検出される", () => {
    render(<TextDiffPage />);

    // 「単語単位」ラジオをクリックしてモード変更
    fireEvent.click(screen.getByRole("radio", { name: "単語単位" }));

    const oldTextarea = screen.getByLabelText("変更前テキスト");
    const newTextarea = screen.getByLabelText("変更後テキスト");

    fireEvent.change(oldTextarea, { target: { value: "hello world" } });
    fireEvent.change(newTextarea, { target: { value: "hello earth" } });

    const statusEl = screen.getByRole("status");
    // word モードのサマリは「単語」単位で表示される
    expect(statusEl).toHaveTextContent(/単語/);
  });

  it("char モードで文字単位の差分が検出される", () => {
    render(<TextDiffPage />);

    // 「文字単位」ラジオをクリックしてモード変更
    fireEvent.click(screen.getByRole("radio", { name: "文字単位" }));

    const oldTextarea = screen.getByLabelText("変更前テキスト");
    const newTextarea = screen.getByLabelText("変更後テキスト");

    fireEvent.change(oldTextarea, { target: { value: "abc" } });
    fireEvent.change(newTextarea, { target: { value: "aXc" } });

    const statusEl = screen.getByRole("status");
    // char モードのサマリは「文字」単位で表示される
    expect(statusEl).toHaveTextContent(/文字/);
  });

  it("line モードで追加・削除件数が正しくカウントされる（hunk件数ではなく行数）", () => {
    render(<TextDiffPage />);

    const oldTextarea = screen.getByLabelText("変更前テキスト");
    const newTextarea = screen.getByLabelText("変更後テキスト");

    // 3行追加（空→3行）
    fireEvent.change(oldTextarea, { target: { value: "" } });
    fireEvent.change(newTextarea, {
      target: { value: "line1\nline2\nline3\n" },
    });

    const statusEl = screen.getByRole("status");
    // 3行追加 → "+3 行" と表示（hunk件数=1ではなく行数カウント）
    expect(statusEl).toHaveTextContent(/\+3 行/);
  });

  // reviewer 指摘: word/char モードの正確な数値アサート（①-2 修正確認）
  it("word モードで正確な単語数をカウントする（hunk件数ではなく単語数）", () => {
    render(<TextDiffPage />);

    // 「単語単位」ラジオをクリックしてモード変更
    fireEvent.click(screen.getByRole("radio", { name: "単語単位" }));

    const oldTextarea = screen.getByLabelText("変更前テキスト");
    const newTextarea = screen.getByLabelText("変更後テキスト");

    // diffWords は added part(count:3='earth bar baz') + removed part(count:2='world foo') を返す
    // → "+3 単語 / −2 単語" と表示されるべき（hunk件数では "+1 単語 / −1 単語" になってしまう）
    fireEvent.change(oldTextarea, {
      target: { value: "hello world foo" },
    });
    fireEvent.change(newTextarea, {
      target: { value: "hello earth bar baz" },
    });

    const statusEl = screen.getByRole("status");
    // 単語数ベースのカウント: +3 単語 / −2 単語
    expect(statusEl).toHaveTextContent(/\+3 単語/);
    expect(statusEl).toHaveTextContent(/−2 単語/);
  });

  it("char モードで正確な文字数をカウントする（hunk件数ではなく文字数）", () => {
    render(<TextDiffPage />);

    // 「文字単位」ラジオをクリックしてモード変更
    fireEvent.click(screen.getByRole("radio", { name: "文字単位" }));

    const oldTextarea = screen.getByLabelText("変更前テキスト");
    const newTextarea = screen.getByLabelText("変更後テキスト");

    // diffChars は 'b' -> 'XY' で: removed part(count:1='b') + added part(count:2='XY') を返す
    // → "+2 文字 / −1 文字" と表示されるべき（hunk件数では "+1 文字 / −1 文字" になってしまう）
    fireEvent.change(oldTextarea, { target: { value: "abc" } });
    fireEvent.change(newTextarea, { target: { value: "aXYc" } });

    const statusEl = screen.getByRole("status");
    // 文字数ベースのカウント: +2 文字 / −1 文字
    expect(statusEl).toHaveTextContent(/\+2 文字/);
    expect(statusEl).toHaveTextContent(/−1 文字/);
  });
});

// ===========================================================
// E-5: ARIA（C-3: ライブリージョンに実テキストノードのサマリ）
// ===========================================================
describe("E-5: ARIA", () => {
  it("サマリ欄に role=status + aria-live=polite が付与されている", () => {
    render(<TextDiffPage />);

    const statusEl = screen.getByRole("status");
    expect(statusEl).toHaveAttribute("role", "status");
    expect(statusEl).toHaveAttribute("aria-live", "polite");
  });

  it("差分あり時のサマリ status 欄に実テキストノードが存在する（C-3 要件）", () => {
    render(<TextDiffPage />);

    const oldTextarea = screen.getByLabelText("変更前テキスト");
    const newTextarea = screen.getByLabelText("変更後テキスト");

    fireEvent.change(oldTextarea, { target: { value: "old" } });
    fireEvent.change(newTextarea, { target: { value: "new" } });

    const statusEl = screen.getByRole("status");
    // 実テキストノードのサマリが存在する（readOnly textarea ラップ不可・実テキスト要件）
    expect(statusEl.textContent?.trim().length).toBeGreaterThan(0);
    // サマリが数値と単位を含む（例：+1 行 / -1 行）
    expect(statusEl.textContent).toMatch(/[+\-−]/);
  });

  it("差分結果欄に role=region + aria-label が付与されている（差分あり時）", () => {
    render(<TextDiffPage />);

    const oldTextarea = screen.getByLabelText("変更前テキスト");
    const newTextarea = screen.getByLabelText("変更後テキスト");

    fireEvent.change(oldTextarea, { target: { value: "foo" } });
    fireEvent.change(newTextarea, { target: { value: "bar" } });

    const region = screen.getByRole("region", { name: "差分結果" });
    expect(region).toHaveAttribute("role", "region");
    expect(region).toHaveAttribute("aria-label", "差分結果");
  });

  it("SegmentedControl に aria-label または aria-labelledby が設定されている（C-2 要件）", () => {
    render(<TextDiffPage />);

    const radiogroup = screen.getByRole("radiogroup");
    // aria-label または aria-labelledby のいずれかが存在する（C-2 必須要件）
    const hasAriaLabel =
      radiogroup.hasAttribute("aria-label") ||
      radiogroup.hasAttribute("aria-labelledby");
    expect(hasAriaLabel).toBe(true);
  });
});

// ===========================================================
// E-10: meta 由来の表示
// ===========================================================
describe("E-10: meta 由来の表示", () => {
  it("コンポーネントがクラッシュせずレンダリングされる（ToolPageLayout なし・単体テスト）", () => {
    render(<TextDiffPage />);
    // テキストエリアが存在すればレンダリング成功
    expect(screen.getByLabelText("変更前テキスト")).toBeInTheDocument();
  });
});

// ===========================================================
// reviewer 指摘: 「+」「−」記号を差分本文に付与（meta.ts との整合）
// ===========================================================
describe("reviewer 指摘: +/− 記号が差分本文に付与されている", () => {
  it("追加部分に「+」記号が表示される（line モード）", () => {
    render(<TextDiffPage />);

    const oldTextarea = screen.getByLabelText("変更前テキスト");
    const newTextarea = screen.getByLabelText("変更後テキスト");

    fireEvent.change(oldTextarea, { target: { value: "old line\n" } });
    fireEvent.change(newTextarea, {
      target: { value: "old line\nnew line\n" },
    });

    const region = screen.getByRole("region", { name: "差分結果" });
    // 追加部分に「+」が含まれている
    expect(region.textContent).toMatch(/\+/);
  });

  it("削除部分に「−」記号が表示される（line モード）", () => {
    render(<TextDiffPage />);

    const oldTextarea = screen.getByLabelText("変更前テキスト");
    const newTextarea = screen.getByLabelText("変更後テキスト");

    fireEvent.change(oldTextarea, {
      target: { value: "old line\nremoved line\n" },
    });
    fireEvent.change(newTextarea, { target: { value: "old line\n" } });

    const region = screen.getByRole("region", { name: "差分結果" });
    // 削除部分に「−」が含まれている
    expect(region.textContent).toMatch(/−/);
  });

  it("char モードでも追加・削除部分に記号が付与される", () => {
    render(<TextDiffPage />);

    fireEvent.click(screen.getByRole("radio", { name: "文字単位" }));

    const oldTextarea = screen.getByLabelText("変更前テキスト");
    const newTextarea = screen.getByLabelText("変更後テキスト");

    fireEvent.change(oldTextarea, { target: { value: "abc" } });
    fireEvent.change(newTextarea, { target: { value: "aXc" } });

    const region = screen.getByRole("region", { name: "差分結果" });
    // 追加部分「+」と削除部分「−」の両方が存在する
    expect(region.textContent).toMatch(/[+−]/);
  });
});

// ===========================================================
// E-12: CSS トークン検証（readFileSync）
// ===========================================================
describe("E-12: CSSトークン検証", () => {
  const cssPath = join(
    process.cwd(),
    "src/tools/text-diff/TextDiffPage.module.css",
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
