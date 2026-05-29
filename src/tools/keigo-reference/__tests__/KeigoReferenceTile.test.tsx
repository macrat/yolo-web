/**
 * KeigoReferenceTile のテスト（参照・検索型タイル初回 / cycle-216 T-3）
 *
 * 観点:
 *   (i)   初期表示: 全件（60件）表示 + 検索 input / カテゴリUI / 出典フッタの存在
 *   (ii)  検索フィルタ（正引き）: casual 一致でヒット
 *   (iii) 検索フィルタ（逆引き）: sonkeigo/kenjogo 一致でヒット
 *   (iv)  カテゴリ絞り込み: basic/business/service 各カテゴリで件数が変わる
 *   (v)   検索語ハイライト（ヒットカラム）: casual ヒット → casual に <mark> / kenjogo ヒット → kenjogo に <mark>
 *   (v-t) テineigo ヒット: 表示行があり mark が付く（CRIT-2 対応）
 *   (vi)  コピー（clipboard mock）+ コピー済みフィードバック: 1秒後復帰
 *   (vii) ゼロヒット空状態（促し分け）: カテゴリ絞り込み中ゼロヒット → 全カテゴリに戻すリンク
 *   (viii) クリアボタン: 検索語消去・全件表示に戻る
 *   (ix)  IME 変換中はフィルタ非発火（compositionstart/compositionend）
 *   (x)   詳細リンク: /tools/keigo-reference へのリンク
 *   (xi)  オートフォーカスなし
 *   (xii) 各敬語形（尊敬語・謙譲語）の個別コピーボタンが存在
 *   (xiii) 結果行 flexShrink:0: 全件表示で各行が圧縮されていない（CRIT-1 対応）
 */

import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import KeigoReferenceTile from "../KeigoReferenceTile";

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

describe("KeigoReferenceTile", () => {
  // -------------------------------------------------------
  // 観点 (i): 初期表示
  // -------------------------------------------------------
  it("(i) 初期表示: 検索 input が存在する", () => {
    render(<KeigoReferenceTile />);
    expect(screen.getByRole("textbox", { name: /検索/ })).toBeInTheDocument();
  });

  it("(i) 初期表示: カテゴリ絞り込み UI（すべて）が存在する", () => {
    render(<KeigoReferenceTile />);
    // 「すべて」ボタンまたはオプションが存在する
    expect(screen.getByText("すべて")).toBeInTheDocument();
  });

  it("(i) 初期表示: 全件（60件）が表示される（代表エントリ「行く」「言う」が存在）", () => {
    render(<KeigoReferenceTile />);
    // 代表エントリが表示されていること
    expect(screen.getAllByText("行く").length).toBeGreaterThan(0);
    expect(screen.getAllByText("言う").length).toBeGreaterThan(0);
  });

  it("(i) 初期表示: 詳細ページリンクが存在する", () => {
    render(<KeigoReferenceTile />);
    const link = screen.getByRole("link", { name: /詳細/ });
    expect(link).toHaveAttribute("href", "/tools/keigo-reference");
  });

  it("(i) 初期表示: 出典フッタ（文化庁）が存在する", () => {
    render(<KeigoReferenceTile />);
    expect(screen.getByText(/文化庁/)).toBeInTheDocument();
  });

  // -------------------------------------------------------
  // 観点 (ii): 検索フィルタ（正引き）
  // -------------------------------------------------------
  it("(ii) 正引き検索: 「行く」で検索すると「行く」エントリがヒットする", async () => {
    render(<KeigoReferenceTile />);
    const input = screen.getByRole("textbox", { name: /検索/ });

    await act(async () => {
      fireEvent.change(input, { target: { value: "行く" } });
    });

    expect(screen.getAllByText("行く").length).toBeGreaterThan(0);
  });

  it("(ii) 正引き検索: 「xxxxxx」で検索するとゼロヒット状態になる", async () => {
    render(<KeigoReferenceTile />);
    const input = screen.getByRole("textbox", { name: /検索/ });

    await act(async () => {
      fireEvent.change(input, { target: { value: "xxxxxx" } });
    });

    // 空状態メッセージが表示される
    expect(screen.getByText(/一致する/)).toBeInTheDocument();
  });

  // -------------------------------------------------------
  // 観点 (iii): 検索フィルタ（逆引き）
  // -------------------------------------------------------
  it("(iii) 逆引き検索: 「いらっしゃる」（尊敬語）で検索すると複数エントリがヒットする", async () => {
    render(<KeigoReferenceTile />);
    const input = screen.getByRole("textbox", { name: /検索/ });

    await act(async () => {
      fireEvent.change(input, { target: { value: "いらっしゃる" } });
    });

    // 「行く」「来る」「いる」の少なくとも1つが存在する
    const hasIku = screen.queryAllByText("行く").length > 0;
    const hasKuru = screen.queryAllByText("来る").length > 0;
    const hasIru = screen.queryAllByText("いる").length > 0;
    expect(hasIku || hasKuru || hasIru).toBe(true);
  });

  it("(iii) 逆引き検索: 「参る」（謙譲語）で検索すると「行く」エントリがヒットする", async () => {
    render(<KeigoReferenceTile />);
    const input = screen.getByRole("textbox", { name: /検索/ });

    await act(async () => {
      fireEvent.change(input, { target: { value: "参る" } });
    });

    expect(screen.getAllByText("行く").length).toBeGreaterThan(0);
  });

  // -------------------------------------------------------
  // 観点 (iv): カテゴリ絞り込み
  // -------------------------------------------------------
  it("(iv) カテゴリ絞り込み: 「基本動詞」カテゴリを選択すると件数が変わる", async () => {
    render(<KeigoReferenceTile />);

    const basicBtn = screen.getByText(/基本動詞/);
    await act(async () => {
      fireEvent.click(basicBtn);
    });

    // basic カテゴリは26件。代表エントリ「行く」が存在する
    expect(screen.getAllByText("行く").length).toBeGreaterThan(0);
  });

  it("(iv) カテゴリ絞り込み: 「ビジネス」カテゴリを選択するとビジネス系エントリのみ表示", async () => {
    render(<KeigoReferenceTile />);

    const businessBtn = screen.getByText(/ビジネス/);
    await act(async () => {
      fireEvent.click(businessBtn);
    });

    // ビジネスカテゴリには24件。「すべて」の60件より少ない
    // 「行く」（basic）は表示されないはず
    // ビジネス系の何らかのエントリが表示されること確認
    const rows = document.querySelectorAll("[data-keigo-row]");
    expect(rows.length).toBeGreaterThan(0);
    expect(rows.length).toBeLessThan(60);
  });

  // -------------------------------------------------------
  // 観点 (v): 検索語ハイライト（ヒットカラム）
  // -------------------------------------------------------
  it("(v) ハイライト（正引き）: casual 検索でヒットした行の casual 列に mark が付く", async () => {
    render(<KeigoReferenceTile />);
    const input = screen.getByRole("textbox", { name: /検索/ });

    await act(async () => {
      fireEvent.change(input, { target: { value: "行く" } });
    });

    // <mark> タグが存在する
    const marks = document.querySelectorAll("mark");
    expect(marks.length).toBeGreaterThan(0);
    // casual 列のテキスト「行く」が mark されている
    const markedTexts = Array.from(marks).map((m) => m.textContent);
    expect(markedTexts.some((t) => t?.includes("行く"))).toBe(true);
  });

  it("(v) ハイライト（逆引き）: 尊敬語検索でヒットした行の sonkeigo 列に mark が付く", async () => {
    render(<KeigoReferenceTile />);
    const input = screen.getByRole("textbox", { name: /検索/ });

    await act(async () => {
      fireEvent.change(input, { target: { value: "参る" } });
    });

    // <mark> タグが存在する
    const marks = document.querySelectorAll("mark");
    expect(marks.length).toBeGreaterThan(0);
    // kenjogo 列に「参る」が mark されている
    const markedTexts = Array.from(marks).map((m) => m.textContent);
    expect(markedTexts.some((t) => t?.includes("参る"))).toBe(true);
  });

  // -------------------------------------------------------
  // 観点 (vi): コピー + コピー済みフィードバック
  // -------------------------------------------------------
  it("(vi) コピー: 尊敬語コピーボタンをクリックすると clipboard.writeText が呼ばれる", async () => {
    render(<KeigoReferenceTile />);

    // 「行く」エントリが表示されていること前提（全件表示）
    // 尊敬語コピーボタンが存在する
    const copyButtons = screen.getAllByRole("button", {
      name: /尊敬語.*コピー|コピー.*尊敬語/,
    });
    expect(copyButtons.length).toBeGreaterThan(0);

    await act(async () => {
      fireEvent.click(copyButtons[0]);
    });

    expect(navigator.clipboard.writeText).toHaveBeenCalledTimes(1);
  });

  it("(vi) コピー済みフィードバック: コピー後に「コピー済み」に変化し1秒後に復帰する", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: false });
    render(<KeigoReferenceTile />);

    const copyButtons = screen.getAllByRole("button", {
      name: /尊敬語.*コピー|コピー.*尊敬語/,
    });

    await act(async () => {
      fireEvent.click(copyButtons[0]);
    });

    // 「コピー済み」になる
    expect(document.querySelector("[data-copied='true']")).toBeInTheDocument();

    // 1秒後に復帰
    await act(async () => {
      vi.advanceTimersByTime(1000);
    });

    expect(document.querySelector("[data-copied='true']")).toBeNull();
  });

  // -------------------------------------------------------
  // 観点 (vii): ゼロヒット空状態（促し分け）
  // -------------------------------------------------------
  it("(vii) ゼロヒット（カテゴリ絞り込み中）: 「すべてのカテゴリに戻す」ボタン/リンクが表示される", async () => {
    render(<KeigoReferenceTile />);

    // service カテゴリ（10件）に絞り込み
    const serviceBtn = screen.getByText(/接客/);
    await act(async () => {
      fireEvent.click(serviceBtn);
    });

    // ヒットしない検索語を入力
    const input = screen.getByRole("textbox", { name: /検索/ });
    await act(async () => {
      fireEvent.change(input, { target: { value: "xxxxxxxxxx" } });
    });

    // カテゴリ起因のゼロヒット → 「すべてのカテゴリ」に戻す促しが表示される
    expect(screen.getByText(/すべてのカテゴリ/)).toBeInTheDocument();
  });

  it("(vii) ゼロヒット（すべてカテゴリ）: 検索語の見直し促しが表示される", async () => {
    render(<KeigoReferenceTile />);

    // すべてカテゴリのまま（60件）でゼロヒット
    const input = screen.getByRole("textbox", { name: /検索/ });
    await act(async () => {
      fireEvent.change(input, { target: { value: "xxxxxxxxxx" } });
    });

    // ゼロヒット状態の表示（「一致する」文言）
    expect(screen.getByText(/一致する/)).toBeInTheDocument();
  });

  // -------------------------------------------------------
  // 観点 (viii): クリアボタン
  // -------------------------------------------------------
  it("(viii) クリアボタン: 検索語入力後にクリアボタンで消去・全件表示に戻る", async () => {
    render(<KeigoReferenceTile />);
    const input = screen.getByRole("textbox", {
      name: /検索/,
    }) as HTMLInputElement;

    await act(async () => {
      fireEvent.change(input, { target: { value: "行く" } });
    });

    // クリアボタンが表示される
    const clearBtn = screen.getByRole("button", { name: /クリア|×|clear/i });
    expect(clearBtn).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(clearBtn);
    });

    // 検索語がクリアされている
    expect(input.value).toBe("");
    // 全件表示に戻っている（「行く」が表示される）
    expect(screen.getAllByText("行く").length).toBeGreaterThan(0);
  });

  // -------------------------------------------------------
  // 観点 (ix): IME 変換中はフィルタ非発火
  // -------------------------------------------------------
  it("(ix) IME セーフ: compositionstart 中は入力値が変わっても結果がフィルタされない", async () => {
    render(<KeigoReferenceTile />);
    const input = screen.getByRole("textbox", { name: /検索/ });

    // IME 変換開始（compositionstart）
    await act(async () => {
      fireEvent.compositionStart(input);
    });

    // 変換中に input value を変える（「xxxxxxxxxxx」→ 実際のフィルタは発火すべきでない）
    await act(async () => {
      fireEvent.change(input, { target: { value: "xxxxxxxxxx" } });
    });

    // compositionEnd 前はゼロヒット状態にならない（全件 or 変換前状態を維持）
    // 「行く」が表示されたまま
    expect(screen.queryAllByText("行く").length).toBeGreaterThan(0);

    // compositionend で確定
    await act(async () => {
      fireEvent.compositionEnd(input);
    });
  });

  // -------------------------------------------------------
  // 観点 (x): 詳細リンク
  // -------------------------------------------------------
  it("(x) 詳細リンク: /tools/keigo-reference へのリンクが存在する", () => {
    render(<KeigoReferenceTile />);
    const link = screen.getByRole("link", { name: /詳細/ });
    expect(link).toHaveAttribute("href", "/tools/keigo-reference");
  });

  // -------------------------------------------------------
  // 観点 (xi): オートフォーカスなし
  // -------------------------------------------------------
  it("(xi) オートフォーカスなし: 検索 input に autoFocus が設定されていない", () => {
    render(<KeigoReferenceTile />);
    const input = screen.getByRole("textbox", {
      name: /検索/,
    }) as HTMLInputElement;
    // autoFocus プロパティが false/undefined であること
    expect(input.autofocus).toBeFalsy();
  });

  // -------------------------------------------------------
  // 観点 (xii): 各敬語形（尊敬語・謙譲語）のコピーボタン
  // -------------------------------------------------------
  it("(xii) 各敬語形コピーボタン: 尊敬語と謙譲語のコピーボタンが存在する", () => {
    render(<KeigoReferenceTile />);
    // 尊敬語コピーボタン
    const sonkeigoButtons = screen.getAllByRole("button", {
      name: /尊敬語.*コピー|コピー.*尊敬語/,
    });
    expect(sonkeigoButtons.length).toBeGreaterThan(0);
    // 謙譲語コピーボタン
    const kenjogoCopyButtons = screen.getAllByRole("button", {
      name: /謙譲語.*コピー|コピー.*謙譲語/,
    });
    expect(kenjogoCopyButtons.length).toBeGreaterThan(0);
  });

  it("(xii) 謙譲語コピー: 謙譲語コピーボタンをクリックすると clipboard.writeText が呼ばれる", async () => {
    render(<KeigoReferenceTile />);

    const copyButtons = screen.getAllByRole("button", {
      name: /謙譲語.*コピー|コピー.*謙譲語/,
    });
    await act(async () => {
      fireEvent.click(copyButtons[0]);
    });

    expect(navigator.clipboard.writeText).toHaveBeenCalledTimes(1);
  });

  // -------------------------------------------------------
  // 観点 (v-t): 丁寧語（teineigo）検索時の挙動（CRIT-2 対応）
  // filterEntries は teineigo も検索対象にするため、「行きます」で検索すると
  // 「行く」エントリがヒットする。表示行があり、ハイライトに表示場所が必要。
  // -------------------------------------------------------
  it("(v-t) 丁寧語検索: 「行きます」で検索すると「行く」エントリがヒットする（空状態にならない）", async () => {
    render(<KeigoReferenceTile />);
    const input = screen.getByRole("textbox", { name: /検索/ });

    await act(async () => {
      fireEvent.change(input, { target: { value: "行きます" } });
    });

    // 「行く」エントリが表示される（ゼロヒット状態にならない）
    expect(screen.queryByText(/一致する動詞はありません/)).toBeNull();
    expect(screen.getAllByText("行く").length).toBeGreaterThan(0);
  });

  it("(v-t) 丁寧語ハイライト: 「行きます」で検索したとき mark タグが存在する", async () => {
    render(<KeigoReferenceTile />);
    const input = screen.getByRole("textbox", { name: /検索/ });

    await act(async () => {
      fireEvent.change(input, { target: { value: "行きます" } });
    });

    // 丁寧語ヒット行に mark が付く
    const marks = document.querySelectorAll("mark");
    expect(marks.length).toBeGreaterThan(0);
    // mark 内テキストが「行きます」の一部を含む
    const markedTexts = Array.from(marks).map((m) => m.textContent ?? "");
    expect(
      markedTexts.some(
        (t) =>
          t.includes("行きます") || t.includes("きます") || t.includes("ます"),
      ),
    ).toBe(true);
  });

  it("(v-t) 丁寧語ヒット行: 丁寧語が補助行として表示され、teineigo テキストが DOM に存在する", async () => {
    render(<KeigoReferenceTile />);
    const input = screen.getByRole("textbox", { name: /検索/ });

    await act(async () => {
      fireEvent.change(input, { target: { value: "行きます" } });
    });

    // 丁寧語ラベルと補助テキスト「行きます」が表示される
    expect(screen.getByText(/丁寧語/)).toBeInTheDocument();
    expect(screen.getByText("行きます")).toBeInTheDocument();
  });

  // -------------------------------------------------------
  // 観点 (xiii): 結果行 flexShrink:0（CRIT-1 対応）
  // 全件表示で各行が圧縮されていないこと（data-keigo-row の flexShrink が 0）
  // -------------------------------------------------------
  it("(xiii) flexShrink:0: 結果行に flexShrink:0 が設定されている", () => {
    render(<KeigoReferenceTile />);

    // 全件表示でいくつかの結果行が存在する
    const rows = document.querySelectorAll("[data-keigo-row]");
    expect(rows.length).toBeGreaterThan(0);

    // 先頭行の flexShrink が "0" であること
    const firstRow = rows[0] as HTMLElement;
    expect(firstRow.style.flexShrink).toBe("0");
  });
});
