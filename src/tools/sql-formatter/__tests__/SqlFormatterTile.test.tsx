/**
 * SqlFormatterTile のユニットテスト（TDD: 実装前に書く）
 *
 * 検証観点:
 * - V-1: variant=full でのレンダリング（全機能が表示される）
 * - V-2: 整形ボタンで出力が更新される
 * - V-3: 圧縮ボタンで出力が更新される
 * - V-4: キーワード大文字トグルスイッチ
 * - V-5: インデント選択が整形に反映される
 * - V-6: ARIA（role="status" aria-live="polite"）
 * - V-7: コピーボタンの有効/無効
 * - V-8: id インスタンス一意性（複数インスタンス同居）
 * - V-9: CSS トークン検証（旧 --color-* / font-weight: 700 禁止）
 * - V-10: エラー表示（日本語化）
 */

import { describe, it, test, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { readFileSync } from "fs";
import { join } from "path";
import SqlFormatterTile from "../SqlFormatterTile";

// vi.hoisted でモック変数をホイストして動的に copiedKey を制御できるようにする
const mockHook = vi.hoisted(() => ({
  copy: vi.fn(),
  copiedKey: null as string | number | boolean | null,
}));

// useCopyToClipboard をモックする（clipboard API 不在環境）
vi.mock("@/components/hooks/useCopyToClipboard", () => ({
  useCopyToClipboard: () => mockHook,
  COPIED_LABEL: "コピーしました",
}));

describe("V-1: variant=full のレンダリング", () => {
  it("入力欄と出力欄が存在する", () => {
    render(<SqlFormatterTile variant="full" />);
    expect(screen.getByLabelText("SQL入力")).toBeInTheDocument();
    expect(screen.getByLabelText("SQL出力")).toBeInTheDocument();
  });

  it("整形・圧縮ボタンが表示される", () => {
    render(<SqlFormatterTile variant="full" />);
    expect(screen.getByRole("button", { name: "整形" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "圧縮" })).toBeInTheDocument();
  });

  it("インデント選択（Select）が表示される", () => {
    render(<SqlFormatterTile variant="full" />);
    expect(screen.getByLabelText("インデント")).toBeInTheDocument();
  });

  it("キーワード大文字トグルスイッチが表示される", () => {
    render(<SqlFormatterTile variant="full" />);
    expect(
      screen.getByRole("switch", { name: "キーワード大文字" }),
    ).toBeInTheDocument();
  });

  it("コピーボタンが表示される", () => {
    render(<SqlFormatterTile variant="full" />);
    expect(screen.getByRole("button", { name: "コピー" })).toBeInTheDocument();
  });
});

describe("V-2: 整形ボタンの動作", () => {
  it("整形ボタンで出力が更新される", () => {
    render(<SqlFormatterTile variant="full" />);
    const input = screen.getByLabelText("SQL入力");
    fireEvent.change(input, {
      target: { value: "select id, name from users where id = 1" },
    });
    fireEvent.click(screen.getByRole("button", { name: "整形" }));
    const output = screen.getByLabelText("SQL出力") as HTMLTextAreaElement;
    expect(output.value).toContain("SELECT");
    expect(output.value).toContain("FROM");
  });

  it("空入力で整形してもエラーにならない", () => {
    render(<SqlFormatterTile variant="full" />);
    fireEvent.click(screen.getByRole("button", { name: "整形" }));
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("整形後に role=status 領域に「整形しました」が表示される", () => {
    render(<SqlFormatterTile variant="full" />);
    const input = screen.getByLabelText("SQL入力");
    fireEvent.change(input, {
      target: { value: "select id from users" },
    });
    fireEvent.click(screen.getByRole("button", { name: "整形" }));
    const statusRegion = screen.getByRole("status");
    expect(statusRegion).toHaveTextContent("整形しました");
  });
});

describe("V-3: 圧縮ボタンの動作", () => {
  it("圧縮ボタンで改行のない出力が得られる", () => {
    render(<SqlFormatterTile variant="full" />);
    const input = screen.getByLabelText("SQL入力");
    fireEvent.change(input, {
      target: { value: "SELECT id,\n  name\nFROM users\nWHERE id = 1" },
    });
    fireEvent.click(screen.getByRole("button", { name: "圧縮" }));
    const output = screen.getByLabelText("SQL出力") as HTMLTextAreaElement;
    expect(output.value).not.toContain("\n");
  });

  it("圧縮後に role=status 領域に「圧縮しました」が表示される", () => {
    render(<SqlFormatterTile variant="full" />);
    const input = screen.getByLabelText("SQL入力");
    fireEvent.change(input, {
      target: { value: "SELECT id FROM users" },
    });
    fireEvent.click(screen.getByRole("button", { name: "圧縮" }));
    const statusRegion = screen.getByRole("status");
    expect(statusRegion).toHaveTextContent("圧縮しました");
  });
});

describe("V-4: キーワード大文字トグル", () => {
  it("デフォルト（ON）でキーワードが大文字になる", () => {
    render(<SqlFormatterTile variant="full" />);
    const input = screen.getByLabelText("SQL入力");
    fireEvent.change(input, {
      target: { value: "select id from users" },
    });
    fireEvent.click(screen.getByRole("button", { name: "整形" }));
    const output = screen.getByLabelText("SQL出力") as HTMLTextAreaElement;
    expect(output.value).toContain("SELECT");
    expect(output.value).toContain("FROM");
  });

  it("トグルをOFFにするとキーワードが小文字になる", () => {
    render(<SqlFormatterTile variant="full" />);
    const toggle = screen.getByRole("switch", { name: "キーワード大文字" });
    fireEvent.click(toggle);
    const input = screen.getByLabelText("SQL入力");
    fireEvent.change(input, {
      target: { value: "SELECT id FROM users" },
    });
    fireEvent.click(screen.getByRole("button", { name: "整形" }));
    const output = screen.getByLabelText("SQL出力") as HTMLTextAreaElement;
    expect(output.value).toContain("select");
    expect(output.value).toContain("from");
  });
});

describe("V-5: インデント設定", () => {
  it("4スペースインデントを選択すると AND が4スペースインデントされる", () => {
    render(<SqlFormatterTile variant="full" />);
    const indentSelect = screen.getByLabelText("インデント");
    fireEvent.change(indentSelect, { target: { value: "4" } });
    const input = screen.getByLabelText("SQL入力");
    fireEvent.change(input, {
      target: {
        value: "select * from users where status = 'active' and age > 18",
      },
    });
    fireEvent.click(screen.getByRole("button", { name: "整形" }));
    const output = screen.getByLabelText("SQL出力") as HTMLTextAreaElement;
    const lines = output.value.split("\n");
    const andLine = lines.find((l) => l.trim().startsWith("AND"));
    expect(andLine).toBeDefined();
    expect(andLine!.startsWith("    ")).toBe(true);
  });
});

describe("V-6: ARIA アクセシビリティ", () => {
  it("role=status aria-live=polite の領域が存在する", () => {
    render(<SqlFormatterTile variant="full" />);
    const statusRegion = screen.getByRole("status");
    expect(statusRegion).toBeInTheDocument();
    expect(statusRegion).toHaveAttribute("aria-live", "polite");
  });
});

describe("V-7: コピーボタン", () => {
  beforeEach(() => {
    mockHook.copiedKey = null;
    mockHook.copy = vi.fn();
  });

  it("出力が空のときコピーボタンが disabled", () => {
    render(<SqlFormatterTile variant="full" />);
    const copyButton = screen.getByRole("button", { name: "コピー" });
    expect(copyButton).toBeDisabled();
  });

  it("出力があるときコピーボタンが enabled", () => {
    render(<SqlFormatterTile variant="full" />);
    const input = screen.getByLabelText("SQL入力");
    fireEvent.change(input, {
      target: { value: "select id from users" },
    });
    fireEvent.click(screen.getByRole("button", { name: "整形" }));
    const copyButton = screen.getByRole("button", { name: "コピー" });
    expect(copyButton).not.toBeDisabled();
  });

  it("コピー済み状態では COPIED_LABEL が表示される", () => {
    mockHook.copiedKey = true;
    render(<SqlFormatterTile variant="full" />);
    const input = screen.getByLabelText("SQL入力");
    fireEvent.change(input, {
      target: { value: "select id from users" },
    });
    fireEvent.click(screen.getByRole("button", { name: "整形" }));
    expect(
      screen.getByRole("button", { name: "コピーしました" }),
    ).toBeInTheDocument();
  });
});

describe("V-8: id インスタンス一意性", () => {
  it("同一ページに2つ描画しても input id が重複しない", () => {
    const { container: c1 } = render(<SqlFormatterTile variant="full" />);
    const { container: c2 } = render(<SqlFormatterTile variant="full" />);
    const input1 = c1.querySelector("textarea[id]");
    const input2 = c2.querySelector("textarea[id]");
    expect(input1).not.toBeNull();
    expect(input2).not.toBeNull();
    expect(input1!.id).not.toBe(input2!.id);
  });

  it("2インスタンスの全 id 付き要素に重複がない", () => {
    const { container: c1 } = render(<SqlFormatterTile variant="full" />);
    const { container: c2 } = render(<SqlFormatterTile variant="full" />);
    const ids1 = [...c1.querySelectorAll("[id]")].map((el) => el.id);
    const ids2 = [...c2.querySelectorAll("[id]")].map((el) => el.id);
    const overlap = ids1.filter((id) => ids2.includes(id));
    expect(overlap).toHaveLength(0);
  });
});

describe("V-9: CSS トークン検証", () => {
  test("CSS に旧 --color-* トークン・--accent 直塗り・font-weight 700 が含まれない", () => {
    const cssPath = join(
      process.cwd(),
      "src/tools/sql-formatter/SqlFormatterTile.module.css",
    );
    const css = readFileSync(cssPath, "utf-8");
    // 旧トークン --color-* が存在しないこと
    expect(css).not.toMatch(/var\(--color-/);
    // background/color に --accent が直接使われていないこと
    const accentDirectUse = css.match(
      /(?:background|color|accent-color)\s*:\s*var\(--accent\)/g,
    );
    expect(accentDirectUse).toBeNull();
    // font-weight: 700 が CSS 宣言として存在しないこと（コメント除去後）
    const cssWithoutComments = css.replace(/\/\*[\s\S]*?\*\//g, "");
    expect(cssWithoutComments).not.toMatch(/font-weight\s*:\s*700/);
  });
});

describe("V-10: エラー表示", () => {
  it("初期状態ではエラーが表示されない", () => {
    render(<SqlFormatterTile variant="full" />);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});

describe("V-11: variant なし（デフォルト）", () => {
  it("variant 未指定で full と同等の動作をする", () => {
    render(<SqlFormatterTile />);
    expect(screen.getByLabelText("SQL入力")).toBeInTheDocument();
    expect(screen.getByLabelText("SQL出力")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "整形" })).toBeInTheDocument();
  });
});
