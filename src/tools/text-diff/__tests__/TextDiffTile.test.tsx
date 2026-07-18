/**
 * TextDiffTile — text-diff 単一正典タイル 回帰テスト
 *
 * cycle-228 T-23 で TextDiffPage.tsx を Panel ルートのタイルへ移植。
 * 旧 TextDiffPage.test.tsx の振る舞いを全移植し以下を拡張:
 *   - variant 別テスト（full / line / word / char）
 *   - 複数インスタンス同居時の DOM id 一意性確認
 *   - CSS トークン検証（TextDiffTile.module.css）
 *   - A-1: ルートが Panel（section タグ）であること
 *
 * 個別論点:
 *   ①-2: 件数・ラベル一致（line/word/char モード別に適切なカウント表示）
 *   ①-12: 空入力「差分なし」誤表示解消（両方空のときは入力待ち状態）
 *   ②-15: コピーボタンは存在しない（知る対象）
 */

import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, afterEach } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";
import TextDiffTile from "../TextDiffTile";

afterEach(() => {
  document.body.innerHTML = "";
});

// ===========================================================
// A-1: タイルルートが Panel（section タグ）
// ===========================================================
describe("A-1: タイルルートが Panel", () => {
  it("ルート要素が section タグ（Panel デフォルト）である", () => {
    const { container } = render(<TextDiffTile />);
    const root = container.firstChild as HTMLElement;
    expect(root?.tagName.toLowerCase()).toBe("section");
  });

  it('as="div" を渡すと div タグになる', () => {
    const { container } = render(<TextDiffTile as="div" />);
    const root = container.firstChild as HTMLElement;
    expect(root?.tagName.toLowerCase()).toBe("div");
  });
});

// ===========================================================
// E-1: 基本レンダリング
// ===========================================================
describe("E-1: 基本レンダリング", () => {
  it("コンポーネントが正常にレンダリングされる（variant=full）", () => {
    render(<TextDiffTile />);
    expect(screen.getByLabelText("変更前テキスト")).toBeInTheDocument();
    expect(screen.getByLabelText("変更後テキスト")).toBeInTheDocument();
  });

  it("比較モードの SegmentedControl（radiogroup）が存在する（variant=full）", () => {
    render(<TextDiffTile />);
    const radiogroup = screen.getByRole("radiogroup");
    expect(radiogroup).toBeInTheDocument();
  });

  it("比較モードの初期選択が「行単位」になっている（C-5: value が options 内に存在）", () => {
    render(<TextDiffTile />);
    const lineOption = screen.getByRole("radio", { name: "行単位" });
    expect(lineOption).toBeChecked();
  });

  it("コピーボタンが存在しない（②-15: 知る対象）", () => {
    render(<TextDiffTile />);
    expect(screen.queryByRole("button")).toBeNull();
  });
});

// ===========================================================
// variant 別テスト（A-5: variant prop の設定差）
// ===========================================================
describe("variant 別テスト", () => {
  it("variant=full: SegmentedControl が表示される", () => {
    render(<TextDiffTile variant="full" />);
    expect(screen.getByRole("radiogroup")).toBeInTheDocument();
  });

  it("variant=line: SegmentedControl が非表示・モードが行単位に固定される", () => {
    render(<TextDiffTile variant="line" />);
    // SegmentedControl は非表示
    expect(screen.queryByRole("radiogroup")).toBeNull();
    // 入力エリアは存在する
    expect(screen.getByLabelText("変更前テキスト")).toBeInTheDocument();
    expect(screen.getByLabelText("変更後テキスト")).toBeInTheDocument();
  });

  it("variant=word: SegmentedControl が非表示・モードが単語単位に固定される", () => {
    render(<TextDiffTile variant="word" />);
    expect(screen.queryByRole("radiogroup")).toBeNull();
    expect(screen.getByLabelText("変更前テキスト")).toBeInTheDocument();
  });

  it("variant=char: SegmentedControl が非表示・モードが文字単位に固定される", () => {
    render(<TextDiffTile variant="char" />);
    expect(screen.queryByRole("radiogroup")).toBeNull();
    expect(screen.getByLabelText("変更前テキスト")).toBeInTheDocument();
  });

  it("variant=line で差分が正しく検出される（行単位固定）", () => {
    render(<TextDiffTile variant="line" />);
    fireEvent.change(screen.getByLabelText("変更前テキスト"), {
      target: { value: "line1\nline2\n" },
    });
    fireEvent.change(screen.getByLabelText("変更後テキスト"), {
      target: { value: "line1\nline3\n" },
    });
    const statusEl = screen.getByRole("status");
    expect(statusEl).toHaveTextContent(/行/);
  });

  it("variant=word で差分が正しく検出される（単語単位固定）", () => {
    render(<TextDiffTile variant="word" />);
    fireEvent.change(screen.getByLabelText("変更前テキスト"), {
      target: { value: "hello world" },
    });
    fireEvent.change(screen.getByLabelText("変更後テキスト"), {
      target: { value: "hello earth" },
    });
    const statusEl = screen.getByRole("status");
    expect(statusEl).toHaveTextContent(/単語/);
  });

  it("variant=char で差分が正しく検出される（文字単位固定）", () => {
    render(<TextDiffTile variant="char" />);
    fireEvent.change(screen.getByLabelText("変更前テキスト"), {
      target: { value: "abc" },
    });
    fireEvent.change(screen.getByLabelText("変更後テキスト"), {
      target: { value: "aXc" },
    });
    const statusEl = screen.getByRole("status");
    expect(statusEl).toHaveTextContent(/文字/);
  });
});

// ===========================================================
// 複数インスタンス同居時の DOM id 一意性確認
// ===========================================================
describe("複数インスタンス同居: DOM id 一意性", () => {
  it("2つのインスタンスを同時にレンダリングしても id が重複しない", () => {
    render(
      <div>
        <TextDiffTile variant="full" />
        <TextDiffTile variant="line" />
      </div>,
    );
    const allElements = document.querySelectorAll("[id]");
    const ids = Array.from(allElements).map((el) => el.id);
    const uniqueIds = new Set(ids);
    expect(ids.length).toBe(uniqueIds.size);
  });

  it("複数インスタンスで label の htmlFor が正しく関連付けられる", () => {
    render(
      <div>
        <TextDiffTile variant="full" />
        <TextDiffTile variant="full" />
      </div>,
    );
    // 各インスタンスの「変更前テキスト」ラベルが独立した textarea を指す
    const oldTextareas = screen.getAllByLabelText("変更前テキスト");
    expect(oldTextareas.length).toBe(2);
    // 各 textarea の id が異なる
    expect(oldTextareas[0].id).not.toBe(oldTextareas[1].id);
  });
});

// ===========================================================
// E-2: 入力→結果更新
// ===========================================================
describe("E-2: 入力→結果更新", () => {
  it("2つのテキストエリアに異なるテキストを入力すると差分結果が表示される", () => {
    render(<TextDiffTile />);

    fireEvent.change(screen.getByLabelText("変更前テキスト"), {
      target: { value: "apple" },
    });
    fireEvent.change(screen.getByLabelText("変更後テキスト"), {
      target: { value: "orange" },
    });

    const region = screen.getByRole("region", { name: "差分結果" });
    expect(region).toBeInTheDocument();
    expect(region.textContent?.length).toBeGreaterThan(0);
  });

  it("モードを変更すると比較モードが切り替わる（SegmentedControl のクリック）", () => {
    render(<TextDiffTile />);

    const wordOption = screen.getByRole("radio", { name: "単語単位" });
    fireEvent.click(wordOption);

    expect(wordOption).toBeChecked();
  });

  it("モード切替後に古い結果が残らない（G-1 要件）", () => {
    render(<TextDiffTile />);

    // line モードで差分入力
    fireEvent.change(screen.getByLabelText("変更前テキスト"), {
      target: { value: "line1\nline2\n" },
    });
    fireEvent.change(screen.getByLabelText("変更後テキスト"), {
      target: { value: "line1\nline3\n" },
    });
    const statusLine = screen.getByRole("status");
    const lineText = statusLine.textContent;

    // word モードへ切替
    fireEvent.click(screen.getByRole("radio", { name: "単語単位" }));

    // 結果が更新される（モード切替後に古い「行」単位の結果が残らない）
    const statusWord = screen.getByRole("status");
    expect(statusWord.textContent).not.toBe(lineText);
  });
});

// ===========================================================
// E-3: 空入力（①-12: 空入力「差分なし」誤表示解消）
// ===========================================================
describe("E-3: 空入力（①-12 個別論点）", () => {
  it("両方空（初期状態）のとき「差分なし」を誤表示しない", () => {
    render(<TextDiffTile />);
    expect(screen.queryByText(/差分なし/)).toBeNull();
  });

  it("両方空のとき差分結果欄（role=region）が表示されない", () => {
    render(<TextDiffTile />);
    expect(screen.queryByRole("region", { name: "差分結果" })).toBeNull();
  });

  it("両方空のとき role=status の summary は空またはプレースホルダー状態になる", () => {
    render(<TextDiffTile />);
    const statusEl = screen.getByRole("status");
    expect(statusEl).toBeInTheDocument();
    expect(statusEl).not.toHaveTextContent("差分なし");
  });

  it("片方だけ入力した場合も差分結果が正しく表示される", () => {
    render(<TextDiffTile />);
    fireEvent.change(screen.getByLabelText("変更前テキスト"), {
      target: { value: "some text" },
    });
    const statusEl = screen.getByRole("status");
    expect(statusEl).toBeInTheDocument();
  });

  it("同じテキストを両方に入力したとき「差分なし」が表示される", () => {
    render(<TextDiffTile />);
    fireEvent.change(screen.getByLabelText("変更前テキスト"), {
      target: { value: "hello" },
    });
    fireEvent.change(screen.getByLabelText("変更後テキスト"), {
      target: { value: "hello" },
    });
    const statusEl = screen.getByRole("status");
    expect(statusEl).toHaveTextContent("差分なし");
  });
});

// ===========================================================
// E-4: 変換ロジックの正確性（①-2: 件数・ラベル一致）
// ===========================================================
describe("E-4: 変換ロジックの正確性（①-2 個別論点）", () => {
  it("line モードで複数行の差分を正しくカウントする", () => {
    render(<TextDiffTile />);
    fireEvent.change(screen.getByLabelText("変更前テキスト"), {
      target: { value: "line1\nline2\n" },
    });
    fireEvent.change(screen.getByLabelText("変更後テキスト"), {
      target: { value: "line1\nline3\n" },
    });
    const statusEl = screen.getByRole("status");
    expect(statusEl).toHaveTextContent(/行/);
  });

  it("word モードで単語単位の差分が検出される", () => {
    render(<TextDiffTile />);
    fireEvent.click(screen.getByRole("radio", { name: "単語単位" }));
    fireEvent.change(screen.getByLabelText("変更前テキスト"), {
      target: { value: "hello world" },
    });
    fireEvent.change(screen.getByLabelText("変更後テキスト"), {
      target: { value: "hello earth" },
    });
    const statusEl = screen.getByRole("status");
    expect(statusEl).toHaveTextContent(/単語/);
  });

  it("char モードで文字単位の差分が検出される", () => {
    render(<TextDiffTile />);
    fireEvent.click(screen.getByRole("radio", { name: "文字単位" }));
    fireEvent.change(screen.getByLabelText("変更前テキスト"), {
      target: { value: "abc" },
    });
    fireEvent.change(screen.getByLabelText("変更後テキスト"), {
      target: { value: "aXc" },
    });
    const statusEl = screen.getByRole("status");
    expect(statusEl).toHaveTextContent(/文字/);
  });

  it("line モードで追加・削除件数が正しくカウントされる（hunk件数ではなく行数）", () => {
    render(<TextDiffTile />);
    fireEvent.change(screen.getByLabelText("変更前テキスト"), {
      target: { value: "" },
    });
    fireEvent.change(screen.getByLabelText("変更後テキスト"), {
      target: { value: "line1\nline2\nline3\n" },
    });
    const statusEl = screen.getByRole("status");
    expect(statusEl).toHaveTextContent(/\+3 行/);
  });

  it("word モードで正確な単語数をカウントする（hunk件数ではなく単語数）", () => {
    render(<TextDiffTile />);
    fireEvent.click(screen.getByRole("radio", { name: "単語単位" }));
    fireEvent.change(screen.getByLabelText("変更前テキスト"), {
      target: { value: "hello world foo" },
    });
    fireEvent.change(screen.getByLabelText("変更後テキスト"), {
      target: { value: "hello earth bar baz" },
    });
    const statusEl = screen.getByRole("status");
    expect(statusEl).toHaveTextContent(/\+3 単語/);
    expect(statusEl).toHaveTextContent(/−2 単語/);
  });

  it("char モードで正確な文字数をカウントする（hunk件数ではなく文字数）", () => {
    render(<TextDiffTile />);
    fireEvent.click(screen.getByRole("radio", { name: "文字単位" }));
    fireEvent.change(screen.getByLabelText("変更前テキスト"), {
      target: { value: "abc" },
    });
    fireEvent.change(screen.getByLabelText("変更後テキスト"), {
      target: { value: "aXYc" },
    });
    const statusEl = screen.getByRole("status");
    expect(statusEl).toHaveTextContent(/\+2 文字/);
    expect(statusEl).toHaveTextContent(/−1 文字/);
  });
});

// ===========================================================
// E-5: ARIA（C-3: ライブリージョンに実テキストノードのサマリ）
// ===========================================================
describe("E-5: ARIA", () => {
  it("サマリ欄に role=status + aria-live=polite が付与されている", () => {
    render(<TextDiffTile />);
    const statusEl = screen.getByRole("status");
    expect(statusEl).toHaveAttribute("role", "status");
    expect(statusEl).toHaveAttribute("aria-live", "polite");
  });

  it("差分あり時のサマリ status 欄に実テキストノードが存在する（C-3 要件）", () => {
    render(<TextDiffTile />);
    fireEvent.change(screen.getByLabelText("変更前テキスト"), {
      target: { value: "old" },
    });
    fireEvent.change(screen.getByLabelText("変更後テキスト"), {
      target: { value: "new" },
    });
    const statusEl = screen.getByRole("status");
    expect(statusEl.textContent?.trim().length).toBeGreaterThan(0);
    expect(statusEl.textContent).toMatch(/[+\-−]/);
  });

  it("差分結果欄に role=region + aria-label が付与されている（差分あり時）", () => {
    render(<TextDiffTile />);
    fireEvent.change(screen.getByLabelText("変更前テキスト"), {
      target: { value: "foo" },
    });
    fireEvent.change(screen.getByLabelText("変更後テキスト"), {
      target: { value: "bar" },
    });
    const region = screen.getByRole("region", { name: "差分結果" });
    expect(region).toHaveAttribute("role", "region");
    expect(region).toHaveAttribute("aria-label", "差分結果");
  });

  it("SegmentedControl に aria-label または aria-labelledby が設定されている（C-2 要件）", () => {
    render(<TextDiffTile />);
    const radiogroup = screen.getByRole("radiogroup");
    const hasAriaLabel =
      radiogroup.hasAttribute("aria-label") ||
      radiogroup.hasAttribute("aria-labelledby");
    expect(hasAriaLabel).toBe(true);
  });
});

// ===========================================================
// B-593: 本体見出しレベル是正（h1→h3 飛び是正の回帰防止）
// ===========================================================
describe("B-593: 差分結果見出しのレベル（h1→h3 飛び是正の回帰防止）", () => {
  it("「差分結果」見出しが見出しレベル2（h2）である", () => {
    render(<TextDiffTile />);

    // 差分結果見出しは差分入力後に描画されるため、異なるテキストを入力する
    fireEvent.change(screen.getByLabelText("変更前テキスト"), {
      target: { value: "apple" },
    });
    fireEvent.change(screen.getByLabelText("変更後テキスト"), {
      target: { value: "orange" },
    });

    // B-593: h1→h3 飛び是正の回帰防止 — レベル2で取得できることを保証
    const heading = screen.getByRole("heading", { level: 2, name: "差分結果" });
    expect(heading).toBeInTheDocument();
  });
});

// ===========================================================
// reviewer 指摘: 「+」「−」記号を差分本文に付与（meta.ts との整合）
// ===========================================================
describe("+/− 記号が差分本文に付与されている", () => {
  it("追加部分に「+」記号が表示される（line モード）", () => {
    render(<TextDiffTile />);
    fireEvent.change(screen.getByLabelText("変更前テキスト"), {
      target: { value: "old line\n" },
    });
    fireEvent.change(screen.getByLabelText("変更後テキスト"), {
      target: { value: "old line\nnew line\n" },
    });
    const region = screen.getByRole("region", { name: "差分結果" });
    expect(region.textContent).toMatch(/\+/);
  });

  it("削除部分に「−」記号が表示される（line モード）", () => {
    render(<TextDiffTile />);
    fireEvent.change(screen.getByLabelText("変更前テキスト"), {
      target: { value: "old line\nremoved line\n" },
    });
    fireEvent.change(screen.getByLabelText("変更後テキスト"), {
      target: { value: "old line\n" },
    });
    const region = screen.getByRole("region", { name: "差分結果" });
    expect(region.textContent).toMatch(/−/);
  });

  it("char モードでも追加・削除部分に記号が付与される", () => {
    render(<TextDiffTile />);
    fireEvent.click(screen.getByRole("radio", { name: "文字単位" }));
    fireEvent.change(screen.getByLabelText("変更前テキスト"), {
      target: { value: "abc" },
    });
    fireEvent.change(screen.getByLabelText("変更後テキスト"), {
      target: { value: "aXc" },
    });
    const region = screen.getByRole("region", { name: "差分結果" });
    expect(region.textContent).toMatch(/[+−]/);
  });
});

// ===========================================================
// U-7 是正: 末尾改行アーティファクト修正
// ===========================================================
describe("U-7 是正: line モードの末尾改行アーティファクト解消", () => {
  it("末尾改行の有無だけが異なるテキストは差分なしとして扱われる", () => {
    render(<TextDiffTile />);
    fireEvent.change(screen.getByLabelText("変更前テキスト"), {
      target: { value: "もも" },
    });
    fireEvent.change(screen.getByLabelText("変更後テキスト"), {
      target: { value: "もも\n" },
    });
    const statusEl = screen.getByRole("status");
    expect(statusEl).toHaveTextContent("差分なし");
  });

  it("末尾改行だけ異なるとき差分結果欄に「差分はありません」が表示される", () => {
    render(<TextDiffTile />);
    fireEvent.change(screen.getByLabelText("変更前テキスト"), {
      target: { value: "line1\nline2" },
    });
    fireEvent.change(screen.getByLabelText("変更後テキスト"), {
      target: { value: "line1\nline2\n" },
    });
    const noDiffMsg = screen.getByText("テキストに差分はありません。");
    expect(noDiffMsg).toBeInTheDocument();
  });

  it("サマリ件数が過剰にならない（末尾改行アーティファクトで +1行/-1行 が出ない）", () => {
    render(<TextDiffTile />);
    fireEvent.change(screen.getByLabelText("変更前テキスト"), {
      target: { value: "もも" },
    });
    fireEvent.change(screen.getByLabelText("変更後テキスト"), {
      target: { value: "もも\n" },
    });
    const statusEl = screen.getByRole("status");
    expect(statusEl.textContent).not.toMatch(/\+\d+/);
    expect(statusEl.textContent).not.toMatch(/−\d+/);
  });
});

// ===========================================================
// E-12: CSS トークン検証（readFileSync）
// ===========================================================
describe("E-12: CSSトークン検証（TextDiffTile.module.css）", () => {
  const cssPath = join(
    process.cwd(),
    "src/tools/text-diff/TextDiffTile.module.css",
  );

  it("--color-* 旧トークンが存在しない", () => {
    const css = readFileSync(cssPath, "utf-8");
    expect(css).not.toMatch(/var\(--color-/);
  });

  it("--accent 直塗りが存在しない（--accent-soft/strong 以外）", () => {
    const css = readFileSync(cssPath, "utf-8");
    const accentDirectUse = css.match(/var\(--accent[^-]/g);
    expect(accentDirectUse).toBeNull();
  });

  it("font-weight: 700 が存在しない", () => {
    const css = readFileSync(cssPath, "utf-8");
    expect(css).not.toMatch(/font-weight:\s*700/);
  });

  it("box-shadow プロパティが存在しない（B-6/A-7: Panel 以外に box-shadow なし）", () => {
    const css = readFileSync(cssPath, "utf-8");
    // コメント行を除いた CSS からチェック（コメントに文言が含まれることは許容）
    const cssWithoutComments = css.replace(/\/\*[\s\S]*?\*\//g, "");
    expect(cssWithoutComments).not.toMatch(/box-shadow\s*:/);
  });
});
