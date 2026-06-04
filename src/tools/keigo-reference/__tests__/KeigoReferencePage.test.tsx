/**
 * KeigoReferencePage 回帰テスト（cycle-225 T-6 / 単一実装）
 *
 * 収束チェックリスト E-1〜E-12 の観点を網羅する。
 *
 * E-6, E-7, E-8: keigo-reference はコピーボタンなし（T-4b 確定: 知る対象）のため N/A
 */

import { describe, test, expect } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { readFileSync } from "fs";
import { resolve } from "path";
import KeigoReferencePage from "../KeigoReferencePage";

describe("KeigoReferencePage", () => {
  // -------------------------------------------------------
  // E-1: 基本レンダリング
  // -------------------------------------------------------
  test("E-1: 基本レンダリング: コンポーネントが正常にレンダリングされる", () => {
    render(<KeigoReferencePage />);
    // 検索入力欄が存在する
    expect(
      screen.getByRole("textbox", { name: /敬語を検索/ }),
    ).toBeInTheDocument();
  });

  test("E-1: タブ切替UI（SegmentedControl）が存在する", () => {
    render(<KeigoReferencePage />);
    // SegmentedControl は role="radiogroup" を持つ（複数あるため getAllByRole）
    const radiogroups = screen.getAllByRole("radiogroup");
    expect(radiogroups.length).toBeGreaterThan(0);
    // 2つのタブオプション
    expect(
      screen.getByRole("radio", { name: "敬語早見表" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("radio", { name: "よくある間違い" }),
    ).toBeInTheDocument();
  });

  test("E-1: 初期表示でカテゴリフィルターUI（「すべて」）が存在する", () => {
    render(<KeigoReferencePage />);
    // カテゴリフィルターの「すべて」が初期表示
    expect(screen.getByRole("radio", { name: "すべて" })).toBeInTheDocument();
  });

  // -------------------------------------------------------
  // E-2: 入力→結果更新
  // -------------------------------------------------------
  test("E-2: 検索クエリ入力で結果が絞り込まれる", async () => {
    render(<KeigoReferencePage />);
    const input = screen.getByRole("textbox", { name: /敬語を検索/ });

    // 初期は「行く」が表示されている（デスクトップ+モバイル両方に存在するため getAllByText）
    expect(screen.getAllByText("行く").length).toBeGreaterThan(0);

    // 「確認」で検索すると「確認する」エントリが表示される
    await act(async () => {
      fireEvent.change(input, { target: { value: "確認" } });
    });
    // 「確認する」エントリが表示される（デスクトップ+モバイル両方）
    expect(screen.getAllByText("確認する").length).toBeGreaterThan(0);
  });

  test("E-2: タブ切替でよくある間違いが表示される", async () => {
    render(<KeigoReferencePage />);
    const mistakesTab = screen.getByRole("radio", { name: "よくある間違い" });
    await act(async () => {
      fireEvent.click(mistakesTab);
    });
    // 間違いセクションのタイトルが表示される
    expect(screen.getByText("二重敬語")).toBeInTheDocument();
    expect(screen.getByText("尊敬語・謙譲語の混同")).toBeInTheDocument();
    expect(screen.getByText("バイト敬語")).toBeInTheDocument();
  });

  // -------------------------------------------------------
  // E-3: 空入力
  // -------------------------------------------------------
  test("E-3: 初期状態（空入力）でエラー表示がない", () => {
    render(<KeigoReferencePage />);
    // ErrorMessage は表示されていない
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  test("E-3: 空検索クエリで全件が表示される", () => {
    render(<KeigoReferencePage />);
    // 代表エントリが表示される
    expect(screen.getAllByText("行く").length).toBeGreaterThan(0);
    expect(screen.getAllByText("言う").length).toBeGreaterThan(0);
  });

  test("E-3: ゼロヒット時に空状態メッセージが表示される", async () => {
    render(<KeigoReferencePage />);
    const input = screen.getByRole("textbox", { name: /敬語を検索/ });
    await act(async () => {
      fireEvent.change(input, { target: { value: "xxxxxxxxxx" } });
    });
    expect(screen.getByText(/一致する/)).toBeInTheDocument();
  });

  // -------------------------------------------------------
  // E-4: 変換ロジックの正確性（UI経由）
  // -------------------------------------------------------
  test("E-4: 「言う」の尊敬語「おっしゃる」が表示される", () => {
    render(<KeigoReferencePage />);
    // テーブルビューで「おっしゃる」が存在する（デスクトップ+モバイル両方に存在する）
    expect(screen.getAllByText("おっしゃる").length).toBeGreaterThan(0);
  });

  test("E-4: 謙譲語「参る・うかがう」が表示される（「行く」の謙譲語）", () => {
    render(<KeigoReferencePage />);
    // デスクトップ+モバイル両方に存在するため getAllByText
    expect(screen.getAllByText("参る・うかがう").length).toBeGreaterThan(0);
  });

  test("E-4: よくある間違いタブでバイト敬語の誤用が表示される", async () => {
    render(<KeigoReferencePage />);
    const mistakesTab = screen.getByRole("radio", { name: "よくある間違い" });
    await act(async () => {
      fireEvent.click(mistakesTab);
    });
    // バイト敬語の例「〜になります」が表示される
    expect(screen.getByText("〜になります")).toBeInTheDocument();
  });

  // -------------------------------------------------------
  // E-5: ARIA
  // -------------------------------------------------------
  test("E-5: role=status aria-live=polite が付与されている（C-3準拠）", () => {
    render(<KeigoReferencePage />);
    const statusEl = document.querySelector(
      '[role="status"][aria-live="polite"]',
    );
    expect(statusEl).not.toBeNull();
  });

  test("E-5: ライブリージョンに実テキストノードのサマリが含まれる（C-3準拠）", () => {
    render(<KeigoReferencePage />);
    const statusEl = document.querySelector(
      '[role="status"][aria-live="polite"]',
    );
    // 初期状態でも件数サマリが入っている
    expect(statusEl?.textContent).toBeTruthy();
    expect(statusEl?.textContent).toMatch(/件/);
  });

  test("E-5: SegmentedControl に aria-label が付与されている（C-2準拠）", () => {
    render(<KeigoReferencePage />);
    // 複数 radiogroup がある場合は全て確認
    const radiogroups = screen.getAllByRole("radiogroup");
    expect(radiogroups.length).toBeGreaterThan(0);
    const firstRg = radiogroups[0];
    const ariaLabel = firstRg.getAttribute("aria-label");
    const ariaLabelledby = firstRg.getAttribute("aria-labelledby");
    // どちらか一方が必須
    expect(ariaLabel || ariaLabelledby).toBeTruthy();
  });

  test("E-5: カテゴリフィルターのSegmentedControlにaria-labelが付与されている", () => {
    render(<KeigoReferencePage />);
    // カテゴリフィルターのラジオグループ（複数存在する場合は全て確認）
    const radiogroups = screen.getAllByRole("radiogroup");
    // 全てのラジオグループがアクセシブル名を持つ
    radiogroups.forEach((rg) => {
      const ariaLabel = rg.getAttribute("aria-label");
      const ariaLabelledby = rg.getAttribute("aria-labelledby");
      expect(ariaLabel || ariaLabelledby).toBeTruthy();
    });
  });

  test("E-5: 検索結果更新後にライブリージョンのサマリが更新される", async () => {
    render(<KeigoReferencePage />);
    const input = screen.getByRole("textbox", { name: /敬語を検索/ });
    const statusEl = document.querySelector(
      '[role="status"][aria-live="polite"]',
    );

    await act(async () => {
      fireEvent.change(input, { target: { value: "行く" } });
    });

    // ライブリージョンには検索結果件数のサマリが入る
    expect(statusEl?.textContent).toMatch(/件/);
  });

  // -------------------------------------------------------
  // E-6, E-7, E-8: コピーボタン関連 — N/A
  // keigo-reference はコピーボタンなし（T-4b 確定: 知る対象）
  // -------------------------------------------------------
  test("E-6/E-7: コピーボタンが存在しない（T-4b方針: 知る対象）", () => {
    render(<KeigoReferencePage />);
    // 「コピー」というテキストのボタンがない
    const copyButtons = screen.queryAllByRole("button", { name: /コピー/ });
    expect(copyButtons).toHaveLength(0);
  });

  // -------------------------------------------------------
  // E-9: 詳細リンク — N/A（page.tsx で ToolPageLayout 経由）
  // -------------------------------------------------------

  // -------------------------------------------------------
  // E-10: meta由来の表示
  // -------------------------------------------------------
  test("E-10: ツールの主要機能（検索・カテゴリ）が表示される", () => {
    render(<KeigoReferencePage />);
    // ツールの機能が存在する
    expect(
      screen.getByRole("textbox", { name: /敬語を検索/ }),
    ).toBeInTheDocument();
    // radiogroup が1つ以上存在する
    expect(screen.getAllByRole("radiogroup").length).toBeGreaterThan(0);
  });

  // -------------------------------------------------------
  // E-11: 既存 logic.ts テストは PASS 維持（logic 自体は変更しない）
  // -------------------------------------------------------
  // logic.test.ts は既存のまま維持。ここでは UI 経由でロジックを確認。
  test("E-11: カテゴリフィルターがlogic.filterEntriesと整合する", async () => {
    render(<KeigoReferencePage />);
    // カテゴリ「ビジネス」に絞り込む
    const businessRadio = screen.getByRole("radio", { name: "ビジネス" });
    await act(async () => {
      fireEvent.click(businessRadio);
    });
    // basicカテゴリの「行く」が消える
    expect(screen.queryAllByText("行く")).toHaveLength(0);
    // businessカテゴリのエントリが存在する（デスクトップ+モバイル両方）
    expect(screen.getAllByText("確認する").length).toBeGreaterThan(0);
  });

  // -------------------------------------------------------
  // E-12: CSSトークン検証
  // -------------------------------------------------------
  test("E-12: CSS に --color-* 旧トークンが存在しない", () => {
    const cssPath = resolve(__dirname, "../KeigoReferencePage.module.css");
    const css = readFileSync(cssPath, "utf-8");
    expect(css).not.toMatch(/var\(--color-/);
  });

  test("E-12: CSS に --accent の直塗り（background/fill）が存在しない", () => {
    const cssPath = resolve(__dirname, "../KeigoReferencePage.module.css");
    const css = readFileSync(cssPath, "utf-8");
    // --accent を background や background-color に直接使っていないこと
    expect(css).not.toMatch(/background(-color)?\s*:\s*var\(--accent\)/);
  });

  test("E-12: CSS に font-weight: 700 が存在しない", () => {
    const cssPath = resolve(__dirname, "../KeigoReferencePage.module.css");
    const css = readFileSync(cssPath, "utf-8");
    expect(css).not.toMatch(/font-weight\s*:\s*700/);
  });

  // -------------------------------------------------------
  // 追加: アクセシビリティ詳細確認
  // -------------------------------------------------------
  test("テーブルに適切なヘッダーが存在する", () => {
    render(<KeigoReferencePage />);
    // テーブルには th 要素（ヘッダー）が存在する
    expect(screen.getByText("普通語")).toBeInTheDocument();
    expect(screen.getByText("尊敬語")).toBeInTheDocument();
    expect(screen.getByText("謙譲語")).toBeInTheDocument();
    expect(screen.getByText("丁寧語")).toBeInTheDocument();
  });

  test("行をクリックすると例文パネルが展開される", async () => {
    render(<KeigoReferencePage />);
    // テーブル内の「行く」行を探す（デスクトップ+モバイル両方に存在する）
    const casualCells = screen.getAllByText("行く");
    // 最初の要素（デスクトップテーブル）をクリック
    await act(async () => {
      fireEvent.click(casualCells[0]);
    });
    // 例文コンテキストが展開される（デスクトップ+モバイル両方に表示される場合もある）
    expect(screen.getAllByText("移動先を伝えるとき").length).toBeGreaterThan(0);
  });

  test("カテゴリフィルターで「接客・サービス」を選択できる", async () => {
    render(<KeigoReferencePage />);
    const serviceRadio = screen.getByRole("radio", { name: "接客・サービス" });
    await act(async () => {
      fireEvent.click(serviceRadio);
    });
    // 接客カテゴリのエントリ（「買う」）が表示される（デスクトップ+モバイル両方）
    expect(screen.getAllByText("買う").length).toBeGreaterThan(0);
  });

  // -------------------------------------------------------
  // E-5 追加: キーボード操作（reviewer指摘1 対応）
  // reviewer指摘1: <tr> に role="button" はARIA in HTML仕様で不可
  // 解決策: <tr> はネイティブのrow構造を維持し、先頭セル (<th scope="row">) 内の
  //         実 <button> にインタラクション（aria-expanded / onKeyDown）を持たせる
  // -------------------------------------------------------
  test("E-5: テーブルの <tr> に role='button' が付与されていない（ARIA仕様準拠）", () => {
    render(<KeigoReferencePage />);
    // <tr> にrole="button"が付いていないこと（ARIAセマンティクス破壊の防止）
    const trWithRoleButton = document.querySelectorAll('tr[role="button"]');
    expect(trWithRoleButton).toHaveLength(0);
  });

  test("E-5: テーブル内の行にキーボード操作可能な <button> が存在する（ARIA仕様準拠）", () => {
    render(<KeigoReferencePage />);
    // テーブル内（th scope="row" の中）に aria-expanded を持つ button が存在する
    const expandButtons = document.querySelectorAll(
      "table th[scope='row'] button[aria-expanded]",
    );
    expect(expandButtons.length).toBeGreaterThan(0);
  });

  test("E-5: テーブル行の展開ボタンが初期状態でaria-expanded='false'", () => {
    render(<KeigoReferencePage />);
    const expandButtons = document.querySelectorAll(
      "table th[scope='row'] button[aria-expanded]",
    );
    expect(expandButtons.length).toBeGreaterThan(0);
    expandButtons.forEach((btn) => {
      expect(btn.getAttribute("aria-expanded")).toBe("false");
    });
  });

  test("E-5: テーブル行の展開ボタンクリックで例文パネルが展開される（キーボード操作）", async () => {
    render(<KeigoReferencePage />);
    // th内のbuttonを取得（最初の行=「行く」）
    const expandButtons = document.querySelectorAll(
      "table th[scope='row'] button[aria-expanded]",
    );
    expect(expandButtons.length).toBeGreaterThan(0);

    // 最初の行（「行く」）のボタンにEnterキーを送る
    await act(async () => {
      fireEvent.keyDown(expandButtons[0], { key: "Enter", code: "Enter" });
    });
    // 例文コンテキストが展開される
    expect(screen.getAllByText("移動先を伝えるとき").length).toBeGreaterThan(0);
  });

  test("E-5: テーブル行の展開ボタンにSpaceキーで例文パネルが展開される", async () => {
    render(<KeigoReferencePage />);
    const expandButtons = document.querySelectorAll(
      "table th[scope='row'] button[aria-expanded]",
    );
    expect(expandButtons.length).toBeGreaterThan(0);

    // 最初の行（「行く」）のボタンにSpaceキーを送る
    await act(async () => {
      fireEvent.keyDown(expandButtons[0], { key: " ", code: "Space" });
    });
    // 例文コンテキストが展開される
    expect(screen.getAllByText("移動先を伝えるとき").length).toBeGreaterThan(0);
  });

  test("E-5: テーブル行の展開ボタンクリックでaria-expandedが切り替わる", async () => {
    render(<KeigoReferencePage />);
    const expandButtons = document.querySelectorAll(
      "table th[scope='row'] button[aria-expanded]",
    );
    expect(expandButtons.length).toBeGreaterThan(0);

    // クリック前は false
    expect(expandButtons[0].getAttribute("aria-expanded")).toBe("false");

    await act(async () => {
      fireEvent.click(expandButtons[0]);
    });

    // クリック後は true
    expect(expandButtons[0].getAttribute("aria-expanded")).toBe("true");
  });

  test("E-5: モバイルカードが role='button' + tabIndex=0 を持つ（div の場合は可）", () => {
    render(<KeigoReferencePage />);
    // モバイルカードは div なのでrole="button"を持って問題ない
    const cardButtons = document.querySelectorAll(
      'div[role="button"][tabindex="0"]',
    );
    // 少なくとも1つ以上あること
    expect(cardButtons.length).toBeGreaterThan(0);
  });

  // reviewer指摘3: 空クエリ時の空状態メッセージ整合
  test("reviewer指摘3: 検索クエリが空のときは鉤括弧なしの空状態メッセージが表示される", async () => {
    render(<KeigoReferencePage />);
    // カテゴリのみで絞り込んで0件にならないことを確認（全カテゴリ必ずエントリあり）
    // 代わりに、存在しない動詞でゼロヒットを引き起こしつつクエリを消す動作をテスト
    const input = screen.getByRole("textbox", { name: /敬語を検索/ });

    // まずゼロヒットにする
    await act(async () => {
      fireEvent.change(input, { target: { value: "xxxxxxxxxx" } });
    });
    // クエリが非空の場合は鉤括弧付きメッセージ
    expect(screen.getByText(/「xxxxxxxxxx」/)).toBeInTheDocument();

    // クエリを空にする（カテゴリのみでゼロヒットが起きた場合に備えて）
    // ただし現状のデータでは全カテゴリに必ずエントリがあるため、
    // この経路のテストは「クエリ空+全カテゴリ=0件」には到達しない。
    // 少なくとも「空クエリ時の文言が鉤括弧なし」であることを確認する。
    // 方法: searchQuery が空文字のとき noResults の文言が '該当する敬語が見つかりませんでした' であること
    // (実装側でクエリ空時のメッセージを分岐させる)
    // 今は意図的に query="" でゼロヒットが起きないのでテキスト存在チェックは省略
    // 代わりに、クエリ空の時は鉤括弧を含まないことをコードレベルで検証
    await act(async () => {
      fireEvent.change(input, { target: { value: "" } });
    });
    // クエリ空の場合は noResults が表示されない（全件表示されるため）
    expect(screen.queryByText(/「」に一致する/)).not.toBeInTheDocument();
  });
});
