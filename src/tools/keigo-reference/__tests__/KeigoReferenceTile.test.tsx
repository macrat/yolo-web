/**
 * KeigoReferenceTile のユニットテスト（cycle-228 T-18 TDD: 実装前に書く）
 *
 * 検証観点:
 * - V-1: variant=full でのレンダリング（全機能が表示される）
 * - V-2: ルート要素が Panel であること（A-1 要件）
 * - V-3: 検索クエリ入力で結果が絞り込まれる（E-2）
 * - V-4: タブ切替でよくある間違いが表示される
 * - V-5: カテゴリフィルターが動作する（E-11）
 * - V-6: アコーディオン展開（クリック/Enter/Space）
 * - V-7: id インスタンス一意性（複数同居時の重複 id 防止）
 * - V-8: ARIA 要件（C-2, C-3）
 * - V-9: CSS トークン検証（B-1, B-3, B-4）
 * - V-10: 空クエリ時の空状態メッセージ
 * - V-11: 旧コンポーネント KeigoReferencePage が削除されている（A-3 二重実装ゼロ）
 */

import { describe, it, expect } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";
import KeigoReferenceTile from "../KeigoReferenceTile";

// --- V-1: variant=full レンダリング ---
describe("V-1: variant=full レンダリング", () => {
  it("検索入力欄が存在する", () => {
    render(<KeigoReferenceTile variant="full" />);
    expect(
      screen.getByRole("textbox", { name: /敬語を検索/ }),
    ).toBeInTheDocument();
  });

  it("タブ切替UI（SegmentedControl）が存在する", () => {
    render(<KeigoReferenceTile variant="full" />);
    const radiogroups = screen.getAllByRole("radiogroup");
    expect(radiogroups.length).toBeGreaterThan(0);
    expect(
      screen.getByRole("radio", { name: "敬語早見表" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("radio", { name: "よくある間違い" }),
    ).toBeInTheDocument();
  });

  it("カテゴリフィルター「すべて」が初期表示される", () => {
    render(<KeigoReferenceTile variant="full" />);
    expect(screen.getByRole("radio", { name: "すべて" })).toBeInTheDocument();
  });

  it("テーブルヘッダーが存在する（普通語/尊敬語/謙譲語/丁寧語）", () => {
    render(<KeigoReferenceTile variant="full" />);
    expect(screen.getByText("普通語")).toBeInTheDocument();
    expect(screen.getByText("尊敬語")).toBeInTheDocument();
    expect(screen.getByText("謙譲語")).toBeInTheDocument();
    expect(screen.getByText("丁寧語")).toBeInTheDocument();
  });

  it("代表エントリが表示される", () => {
    render(<KeigoReferenceTile variant="full" />);
    expect(screen.getAllByText("行く").length).toBeGreaterThan(0);
    expect(screen.getAllByText("言う").length).toBeGreaterThan(0);
  });
});

// --- V-2: ルート要素が Panel であること（A-1 要件）---
describe("V-2: Panel ルート要素（A-1）", () => {
  it("ルート要素に data-panel 属性または Panel のクラスが存在する", () => {
    const { container } = render(<KeigoReferenceTile variant="full" />);
    // Panel コンポーネントは section/div 要素としてレンダリングされる
    // Panel.module.css のクラスが付いていること、または tagName が section/article/div であること
    const root = container.firstElementChild;
    expect(root).not.toBeNull();
    // Panel は section タグがデフォルト
    expect(root?.tagName.toLowerCase()).toBe("section");
  });

  it("variant=full でルート要素が Panel の section タグ", () => {
    const { container } = render(<KeigoReferenceTile />);
    const root = container.firstElementChild;
    expect(root?.tagName.toLowerCase()).toBe("section");
  });

  it("as='div' を渡すと div タグになる", () => {
    const { container } = render(
      <KeigoReferenceTile variant="full" as="div" />,
    );
    const root = container.firstElementChild;
    expect(root?.tagName.toLowerCase()).toBe("div");
  });
});

// --- V-3: 検索クエリ入力 ---
describe("V-3: 検索クエリ入力", () => {
  it("検索クエリ入力で結果が絞り込まれる", async () => {
    render(<KeigoReferenceTile variant="full" />);
    const input = screen.getByRole("textbox", { name: /敬語を検索/ });
    expect(screen.getAllByText("行く").length).toBeGreaterThan(0);
    await act(async () => {
      fireEvent.change(input, { target: { value: "確認" } });
    });
    expect(screen.getAllByText("確認する").length).toBeGreaterThan(0);
  });

  it("ゼロヒット時に空状態メッセージが表示される", async () => {
    render(<KeigoReferenceTile variant="full" />);
    const input = screen.getByRole("textbox", { name: /敬語を検索/ });
    await act(async () => {
      fireEvent.change(input, { target: { value: "xxxxxxxxxx" } });
    });
    expect(screen.getByText(/一致する/)).toBeInTheDocument();
  });

  it("空クエリで「「」に一致する」が表示されない（reviewer指摘3）", async () => {
    render(<KeigoReferenceTile variant="full" />);
    const input = screen.getByRole("textbox", { name: /敬語を検索/ });
    await act(async () => {
      fireEvent.change(input, { target: { value: "xxxxxxxxxx" } });
    });
    expect(screen.getByText(/「xxxxxxxxxx」/)).toBeInTheDocument();
    await act(async () => {
      fireEvent.change(input, { target: { value: "" } });
    });
    expect(screen.queryByText(/「」に一致する/)).not.toBeInTheDocument();
  });
});

// --- V-4: タブ切替 ---
describe("V-4: タブ切替", () => {
  it("「よくある間違い」タブに切り替えるとセクションが表示される", async () => {
    render(<KeigoReferenceTile variant="full" />);
    const mistakesTab = screen.getByRole("radio", { name: "よくある間違い" });
    await act(async () => {
      fireEvent.click(mistakesTab);
    });
    expect(screen.getByText("二重敬語")).toBeInTheDocument();
    expect(screen.getByText("尊敬語・謙譲語の混同")).toBeInTheDocument();
    expect(screen.getByText("バイト敬語")).toBeInTheDocument();
  });

  it("バイト敬語の誤用例「〜になります」が表示される", async () => {
    render(<KeigoReferenceTile variant="full" />);
    const mistakesTab = screen.getByRole("radio", { name: "よくある間違い" });
    await act(async () => {
      fireEvent.click(mistakesTab);
    });
    expect(screen.getByText("〜になります")).toBeInTheDocument();
  });
});

// --- V-5: カテゴリフィルター ---
describe("V-5: カテゴリフィルター", () => {
  it("「ビジネス」フィルターで基本動詞「行く」が消える", async () => {
    render(<KeigoReferenceTile variant="full" />);
    const businessRadio = screen.getByRole("radio", { name: "ビジネス" });
    await act(async () => {
      fireEvent.click(businessRadio);
    });
    expect(screen.queryAllByText("行く")).toHaveLength(0);
    expect(screen.getAllByText("確認する").length).toBeGreaterThan(0);
  });

  it("「接客・サービス」フィルターで「買う」が表示される", async () => {
    render(<KeigoReferenceTile variant="full" />);
    const serviceRadio = screen.getByRole("radio", { name: "接客・サービス" });
    await act(async () => {
      fireEvent.click(serviceRadio);
    });
    expect(screen.getAllByText("買う").length).toBeGreaterThan(0);
  });
});

// --- V-6: アコーディオン展開 ---
describe("V-6: アコーディオン展開", () => {
  it("行クリックで例文パネルが展開される", async () => {
    render(<KeigoReferenceTile variant="full" />);
    const casualCells = screen.getAllByText("行く");
    await act(async () => {
      fireEvent.click(casualCells[0]);
    });
    expect(screen.getAllByText("移動先を伝えるとき").length).toBeGreaterThan(0);
  });

  it("展開ボタンが初期状態で aria-expanded='false'", () => {
    render(<KeigoReferenceTile variant="full" />);
    const expandButtons = document.querySelectorAll(
      "table th[scope='row'] button[aria-expanded]",
    );
    expect(expandButtons.length).toBeGreaterThan(0);
    expandButtons.forEach((btn) => {
      expect(btn.getAttribute("aria-expanded")).toBe("false");
    });
  });

  it("Enterキーで例文パネルが展開される", async () => {
    render(<KeigoReferenceTile variant="full" />);
    const expandButtons = document.querySelectorAll(
      "table th[scope='row'] button[aria-expanded]",
    );
    expect(expandButtons.length).toBeGreaterThan(0);
    await act(async () => {
      fireEvent.keyDown(expandButtons[0], { key: "Enter", code: "Enter" });
    });
    expect(screen.getAllByText("移動先を伝えるとき").length).toBeGreaterThan(0);
  });

  it("Spaceキーで例文パネルが展開される", async () => {
    render(<KeigoReferenceTile variant="full" />);
    const expandButtons = document.querySelectorAll(
      "table th[scope='row'] button[aria-expanded]",
    );
    await act(async () => {
      fireEvent.keyDown(expandButtons[0], { key: " ", code: "Space" });
    });
    expect(screen.getAllByText("移動先を伝えるとき").length).toBeGreaterThan(0);
  });

  it("展開ボタンクリックで aria-expanded が切り替わる", async () => {
    render(<KeigoReferenceTile variant="full" />);
    const expandButtons = document.querySelectorAll(
      "table th[scope='row'] button[aria-expanded]",
    );
    expect(expandButtons[0].getAttribute("aria-expanded")).toBe("false");
    await act(async () => {
      fireEvent.click(expandButtons[0]);
    });
    expect(expandButtons[0].getAttribute("aria-expanded")).toBe("true");
  });

  it("<tr> に role='button' が付与されていない（ARIA仕様準拠）", () => {
    render(<KeigoReferenceTile variant="full" />);
    const trWithRoleButton = document.querySelectorAll('tr[role="button"]');
    expect(trWithRoleButton).toHaveLength(0);
  });

  it("モバイルカードが role='button' + tabIndex=0 を持つ", () => {
    render(<KeigoReferenceTile variant="full" />);
    const cardButtons = document.querySelectorAll(
      'div[role="button"][tabindex="0"]',
    );
    expect(cardButtons.length).toBeGreaterThan(0);
  });
});

// --- V-7: id インスタンス一意性 ---
describe("V-7: id インスタンス一意性", () => {
  it("同一ページに2つのインスタンスを描画しても input id が重複しない", () => {
    const { container } = render(
      <>
        <KeigoReferenceTile variant="full" />
        <KeigoReferenceTile variant="full" />
      </>,
    );
    const inputs = container.querySelectorAll("input[type='text']");
    const ids = Array.from(inputs)
      .map((el) => el.getAttribute("id"))
      .filter(Boolean);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });
});

// --- V-8: ARIA 要件 ---
describe("V-8: ARIA 要件", () => {
  it("role='status' aria-live='polite' が存在する（C-3）", () => {
    render(<KeigoReferenceTile variant="full" />);
    const statusEl = document.querySelector(
      '[role="status"][aria-live="polite"]',
    );
    expect(statusEl).not.toBeNull();
  });

  it("ライブリージョンに実テキストのサマリが含まれる（C-3）", () => {
    render(<KeigoReferenceTile variant="full" />);
    const statusEl = document.querySelector(
      '[role="status"][aria-live="polite"]',
    );
    expect(statusEl?.textContent).toBeTruthy();
    expect(statusEl?.textContent).toMatch(/件/);
  });

  it("全 SegmentedControl に aria-label が付与されている（C-2）", () => {
    render(<KeigoReferenceTile variant="full" />);
    const radiogroups = screen.getAllByRole("radiogroup");
    radiogroups.forEach((rg) => {
      const ariaLabel = rg.getAttribute("aria-label");
      const ariaLabelledby = rg.getAttribute("aria-labelledby");
      expect(ariaLabel || ariaLabelledby).toBeTruthy();
    });
  });

  it("検索結果更新後にライブリージョンのサマリが更新される", async () => {
    render(<KeigoReferenceTile variant="full" />);
    const input = screen.getByRole("textbox", { name: /敬語を検索/ });
    const statusEl = document.querySelector(
      '[role="status"][aria-live="polite"]',
    );
    await act(async () => {
      fireEvent.change(input, { target: { value: "行く" } });
    });
    expect(statusEl?.textContent).toMatch(/件/);
  });

  it("コピーボタンが存在しない（知る対象ツール）", () => {
    render(<KeigoReferenceTile variant="full" />);
    const copyButtons = screen.queryAllByRole("button", { name: /コピー/ });
    expect(copyButtons).toHaveLength(0);
  });
});

// --- V-9: CSS トークン検証 ---
describe("V-9: CSS トークン検証", () => {
  it("CSS に --color-* 旧トークンが存在しない（B-1）", () => {
    const cssPath = resolve(__dirname, "../KeigoReferenceTile.module.css");
    const css = readFileSync(cssPath, "utf-8");
    expect(css).not.toMatch(/var\(--color-/);
  });

  it("CSS に --accent の直塗り（background/fill）が存在しない（B-3）", () => {
    const cssPath = resolve(__dirname, "../KeigoReferenceTile.module.css");
    const css = readFileSync(cssPath, "utf-8");
    expect(css).not.toMatch(/background(-color)?\s*:\s*var\(--accent\)/);
  });

  it("CSS に font-weight: 700 が存在しない（B-4）", () => {
    const cssPath = resolve(__dirname, "../KeigoReferenceTile.module.css");
    const css = readFileSync(cssPath, "utf-8");
    expect(css).not.toMatch(/font-weight\s*:\s*700/);
  });
});

// --- V-10: データ整合性 ---
describe("V-10: データ整合性", () => {
  it("「言う」の尊敬語「おっしゃる」が表示される", () => {
    render(<KeigoReferenceTile variant="full" />);
    expect(screen.getAllByText("おっしゃる").length).toBeGreaterThan(0);
  });

  it("「行く」の謙譲語「参る・うかがう」が表示される", () => {
    render(<KeigoReferenceTile variant="full" />);
    expect(screen.getAllByText("参る・うかがう").length).toBeGreaterThan(0);
  });
});

// --- V-11: 二重実装ゼロ（A-3） ---
describe("V-11: 二重実装ゼロ（A-3）", () => {
  it("旧 KeigoReferencePage.tsx が削除されている", () => {
    const oldPath = resolve(__dirname, "../KeigoReferencePage.tsx");
    expect(existsSync(oldPath)).toBe(false);
  });

  it("旧 KeigoReferencePage.module.css が削除されている", () => {
    const oldCssPath = resolve(__dirname, "../KeigoReferencePage.module.css");
    expect(existsSync(oldCssPath)).toBe(false);
  });
});
