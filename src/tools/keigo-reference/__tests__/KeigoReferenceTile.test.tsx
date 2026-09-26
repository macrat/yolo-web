/**
 * KeigoReferenceTile のユニットテスト（cycle-228 T-18 TDD: 実装前に書く）
 *
 * 検証観点:
 * - V-1: variant=full でのレンダリング（全機能が表示される）
 * - V-2: ルート要素が Panel であること（A-1 要件）
 * - V-3: 名前の欄と件数の行（DESIGN.md §7「件数と備え」）
 * - V-4: タブ切替でよくある間違いが表示される
 * - V-5: カテゴリフィルターが動作する（E-11）
 * - V-6: アコーディオン展開（クリック/Enter/Space）
 * - V-7: id インスタンス一意性（複数同居時の重複 id 防止）
 * - V-8: ARIA 要件（C-2, C-3）
 * - V-9: CSS トークン検証（B-1, B-3）
 * - V-10: データ整合性
 * - V-11: 旧コンポーネント KeigoReferencePage が削除されている（A-3 二重実装ゼロ）
 */

import { afterEach, describe, it, expect } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";
import KeigoReferenceTile from "../KeigoReferenceTile";

// 絞り込みは URL のクエリに持つので、テストごとにクエリの無い URL へ戻す。
afterEach(() => {
  window.history.replaceState(null, "", "/tools/keigo-reference");
});

// 見えている件数の行。読み上げに伝える文は、これとは別の見えない role="status" が持つ。
function countLine(): HTMLElement {
  const line = document.querySelector<HTMLElement>('p[tabindex="-1"]');
  if (!line) throw new Error("件数の行がありません");
  return line;
}

function searchBox(): HTMLElement {
  return screen.getByRole("searchbox", { name: "普通語・敬語で探す" });
}

// --- V-1: variant=full レンダリング ---
describe("V-1: variant=full レンダリング", () => {
  it("名前の欄が、普通語・敬語で探せることをラベルで言う", () => {
    render(<KeigoReferenceTile variant="full" />);
    expect(searchBox()).toBeInTheDocument();
  });

  it("タブ切替UI（ラジオボタンの組）が存在する", () => {
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

  it("表の見出し行が、普通語・分類・尊敬語・謙譲語・丁寧語の列を持つ", () => {
    render(<KeigoReferenceTile variant="full" />);
    expect(
      screen.getAllByRole("columnheader").map((cell) => cell.textContent),
    ).toEqual(["普通語", "分類", "尊敬語", "謙譲語", "丁寧語"]);
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

// --- V-3: 名前の欄と件数の行 ---
describe("V-3: 名前の欄と件数の行", () => {
  it("件数の行が全件の数と分類順を言い、並び順の組を持たない", () => {
    render(<KeigoReferenceTile variant="full" />);
    expect(countLine()).toHaveTextContent(/^全\d+語・分類順$/);
    expect(
      screen.queryByRole("radiogroup", { name: "並び順" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "絞り込み（すべて）" }),
    ).toBeInTheDocument();
  });

  it("名前の欄で絞り込み、件数の行が該当件数を言う", () => {
    render(<KeigoReferenceTile variant="full" />);
    fireEvent.change(searchBox(), { target: { value: "確認" } });
    expect(screen.getAllByText("確認する").length).toBeGreaterThan(0);
    expect(countLine()).toHaveTextContent(/^\d+語（全\d+語）・分類順$/);
  });

  it("当たらないときは件数の行が言い、「絞り込みを外す」で名前の欄へ戻る", () => {
    render(<KeigoReferenceTile variant="full" />);
    fireEvent.change(searchBox(), { target: { value: "xxxxxxxxxx" } });
    expect(countLine()).toHaveTextContent(/^条件に合う語はありません/);
    fireEvent.click(screen.getByRole("button", { name: "絞り込みを外す" }));
    expect(countLine()).toHaveTextContent(/^全\d+語・分類順$/);
    expect(searchBox()).toHaveFocus();
  });

  it("URL のクエリの状態で出す", () => {
    window.history.replaceState(
      null,
      "",
      "/tools/keigo-reference?kind=service",
    );
    render(<KeigoReferenceTile variant="full" />);
    expect(screen.getByRole("radio", { name: "接客・サービス" })).toBeChecked();
    expect(screen.queryAllByText("行く")).toHaveLength(0);
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

// --- V-4b: 本体見出しの見出しレベル（B-593 回帰防止） ---
describe("V-4b: 本体見出しの見出しレベル（B-593）", () => {
  it("よくある間違いセクションの見出しが h2（h1→h3 飛び是正の回帰防止）", async () => {
    // B-593: ツール本体の見出しが h1 の直下で h3 になり h2 を飛ばしていた問題の是正。
    // mistakeSectionTitle の見出し（例: 「二重敬語」）が見出しレベル2 で描画されることを検証する。
    render(<KeigoReferenceTile variant="full" />);
    const mistakesTab = screen.getByRole("radio", { name: "よくある間違い" });
    await act(async () => {
      fireEvent.click(mistakesTab);
    });
    expect(
      screen.getByRole("heading", { level: 2, name: /二重敬語/ }),
    ).toBeInTheDocument();
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
  it("行の開閉のボタンを押すと例文パネルが展開される", async () => {
    render(<KeigoReferenceTile variant="full" />);
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "行く の例文" }));
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

  it("狭い画面の開閉する行は、読み上げの名前が普通語だけで、分類と敬語の形を説明に持つ", () => {
    render(<KeigoReferenceTile variant="full" />);
    const row = document.querySelector<HTMLElement>(
      "li > button[aria-expanded]",
    );
    expect(row).not.toBeNull();
    expect(row).toHaveAccessibleName("行く");
    expect(row).toHaveAccessibleDescription(
      "基本動詞 尊敬語: いらっしゃる・おいでになる 謙譲語: 参る・うかがう 丁寧語: 行きます",
    );
    fireEvent.click(row!);
    expect(row).toHaveAttribute("aria-expanded", "true");
    expect(screen.getAllByText("移動先を伝えるとき").length).toBeGreaterThan(0);
  });
});

// --- V-7: id インスタンス一意性 ---
describe("V-7: id インスタンス一意性", () => {
  it("同一ページに2つのインスタンスを描画しても input の id が重複しない", () => {
    const { container } = render(
      <>
        <KeigoReferenceTile variant="full" />
        <KeigoReferenceTile variant="full" />
      </>,
    );
    const inputs = container.querySelectorAll("input");
    const ids = Array.from(inputs)
      .map((el) => el.getAttribute("id"))
      .filter(Boolean);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });
});

// --- V-8: ARIA 要件 ---
describe("V-8: ARIA 要件", () => {
  it("ラジオボタンの組は、どれも見出しを名前として持つ", () => {
    render(<KeigoReferenceTile variant="full" />);
    expect(
      screen.getByRole("radiogroup", { name: "表示する内容" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("radiogroup", { name: "分類" }),
    ).toBeInTheDocument();
  });

  it("絞り込んだ件数を、条件が落ち着いてから読み上げに渡す", async () => {
    render(<KeigoReferenceTile variant="full" />);
    const status = screen.getByRole("status");
    expect(status).toHaveTextContent("");
    fireEvent.change(searchBox(), { target: { value: "行く" } });
    await act(() => new Promise((resolve) => setTimeout(resolve, 350)));
    expect(status).toHaveTextContent(/^\d+語（全\d+語）$/);
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
