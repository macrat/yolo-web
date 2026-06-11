import { describe, test, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { readFileSync } from "fs";
import { join } from "path";
import JsonFormatterTile from "../JsonFormatterTile";

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

describe("JsonFormatterTile", () => {
  beforeEach(() => {
    mockHook.copiedKey = null;
    mockHook.copy = vi.fn();
  });

  // ---------- 基本レンダリング ----------

  // E-1: デフォルト (variant="full") でレンダリングできる
  test("renders without crashing (variant=full)", () => {
    render(<JsonFormatterTile variant="full" />);
    expect(screen.getByLabelText("入力")).toBeInTheDocument();
    expect(screen.getByLabelText("出力")).toBeInTheDocument();
  });

  // E-1b: variant="format-only" でレンダリングできる
  test("renders without crashing (variant=format-only)", () => {
    render(<JsonFormatterTile variant="format-only" />);
    expect(screen.getByLabelText("入力")).toBeInTheDocument();
    expect(screen.getByLabelText("出力")).toBeInTheDocument();
  });

  // ---------- variant="full" の機能 ----------

  // E-2: 整形ボタンで出力が更新される (variant=full)
  test("formats JSON when 整形 button is clicked (variant=full)", () => {
    render(<JsonFormatterTile variant="full" />);
    const input = screen.getByLabelText("入力");
    fireEvent.change(input, { target: { value: '{"a":1,"b":2}' } });
    fireEvent.click(screen.getByRole("button", { name: "整形" }));
    const output = screen.getByLabelText("出力") as HTMLTextAreaElement;
    expect(output.value).toContain('"a": 1');
  });

  // E-2: 圧縮ボタンで出力が更新される (variant=full)
  test("minifies JSON when 圧縮 button is clicked (variant=full)", () => {
    render(<JsonFormatterTile variant="full" />);
    const input = screen.getByLabelText("入力");
    fireEvent.change(input, {
      target: { value: '{\n  "a": 1,\n  "b": 2\n}' },
    });
    fireEvent.click(screen.getByRole("button", { name: "圧縮" }));
    const output = screen.getByLabelText("出力") as HTMLTextAreaElement;
    expect(output.value).toBe('{"a":1,"b":2}');
  });

  // E-2: 検証ボタンで valid な JSON のとき成功メッセージが日本語で出る (variant=full)
  test("shows validation success in Japanese (variant=full)", () => {
    render(<JsonFormatterTile variant="full" />);
    const input = screen.getByLabelText("入力");
    fireEvent.change(input, { target: { value: '{"key": "value"}' } });
    fireEvent.click(screen.getByRole("button", { name: "検証" }));
    const output = screen.getByLabelText("出力") as HTMLTextAreaElement;
    expect(output.value).toBe("正しいJSONです");
    expect(output.value).not.toContain("Valid JSON");
  });

  // E-4: 変換ロジックの正確性（2スペース整形・デフォルト）
  test("formats with 2 spaces by default", () => {
    render(<JsonFormatterTile variant="full" />);
    const input = screen.getByLabelText("入力");
    fireEvent.change(input, { target: { value: '{"x":1}' } });
    fireEvent.click(screen.getByRole("button", { name: "整形" }));
    const output = screen.getByLabelText("出力") as HTMLTextAreaElement;
    expect(output.value).toBe('{\n  "x": 1\n}');
  });

  // E-4: インデント変更が整形に反映される
  test("formats with 4 spaces when indent changed to 4", () => {
    render(<JsonFormatterTile variant="full" />);
    const indentSelect = screen.getByLabelText("インデント");
    fireEvent.change(indentSelect, { target: { value: "4" } });
    const input = screen.getByLabelText("入力");
    fireEvent.change(input, { target: { value: '{"x":1}' } });
    fireEvent.click(screen.getByRole("button", { name: "整形" }));
    const output = screen.getByLabelText("出力") as HTMLTextAreaElement;
    expect(output.value).toBe('{\n    "x": 1\n}');
  });

  // E-4: 無効なJSONでエラー表示（日本語メッセージ必須）
  test("shows error message for invalid JSON", () => {
    render(<JsonFormatterTile variant="full" />);
    const input = screen.getByLabelText("入力");
    fireEvent.change(input, { target: { value: "{invalid}" } });
    fireEvent.click(screen.getByRole("button", { name: "整形" }));
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  // E-4: エラー文言は英語の生パーサーエラーを露出しない（日本語で表示）
  test("shows Japanese error message, not raw English parser error", () => {
    render(<JsonFormatterTile variant="full" />);
    const input = screen.getByLabelText("入力");
    fireEvent.change(input, { target: { value: "{invalid}" } });
    fireEvent.click(screen.getByRole("button", { name: "整形" }));
    const alert = screen.getByRole("alert");
    expect(alert.textContent).not.toMatch(
      /Expected|Unexpected|position|at line|column/i,
    );
    expect(alert.textContent).toMatch(/[ぁ-ん|ァ-ン|一-龯]/);
  });

  // E-4: 検証ボタンでも無効JSON時に日本語エラーが出る
  test("shows Japanese error message when 検証 is clicked with invalid JSON", () => {
    render(<JsonFormatterTile variant="full" />);
    const input = screen.getByLabelText("入力");
    fireEvent.change(input, { target: { value: "{bad json}" } });
    fireEvent.click(screen.getByRole("button", { name: "検証" }));
    const alert = screen.getByRole("alert");
    expect(alert.textContent).not.toMatch(
      /Expected|Unexpected|position|at line|column/i,
    );
    expect(alert.textContent).toMatch(/[ぁ-ん|ァ-ン|一-龯]/);
  });

  // ---------- ARIA ----------

  // E-5: role="status" aria-live="polite" 領域が存在する
  test("has role=status region with aria-live=polite", () => {
    render(<JsonFormatterTile />);
    const statusRegion = screen.getByRole("status");
    expect(statusRegion).toBeInTheDocument();
    expect(statusRegion).toHaveAttribute("aria-live", "polite");
  });

  // E-5a: 整形後に role="status" 領域に実テキストサマリが表示される（C-3）
  test("shows summary text in role=status after formatting", () => {
    render(<JsonFormatterTile />);
    const input = screen.getByLabelText("入力");
    fireEvent.change(input, { target: { value: '{"a":1}' } });
    fireEvent.click(screen.getByRole("button", { name: "整形" }));
    const statusRegion = screen.getByRole("status");
    expect(statusRegion).toHaveTextContent("整形しました");
  });

  // E-5b: 圧縮後に role="status" 領域に実テキストサマリが表示される（C-3）
  test("shows summary text in role=status after minifying", () => {
    render(<JsonFormatterTile />);
    const input = screen.getByLabelText("入力");
    fireEvent.change(input, { target: { value: '{\n  "a": 1\n}' } });
    fireEvent.click(screen.getByRole("button", { name: "圧縮" }));
    const statusRegion = screen.getByRole("status");
    expect(statusRegion).toHaveTextContent("圧縮しました");
  });

  // E-5c: 検証後に role="status" 領域に実テキストサマリが表示される（C-3）
  test("shows summary text in role=status after validation", () => {
    render(<JsonFormatterTile />);
    const input = screen.getByLabelText("入力");
    fireEvent.change(input, { target: { value: '{"key": "value"}' } });
    fireEvent.click(screen.getByRole("button", { name: "検証" }));
    const statusRegion = screen.getByRole("status");
    expect(statusRegion).toHaveTextContent("正しいJSONです");
  });

  // ---------- コピー ----------

  // E-7: 出力が空のときコピーボタンが disabled
  test("copy button is disabled when output is empty", () => {
    render(<JsonFormatterTile />);
    const copyButton = screen.getByRole("button", { name: "コピー" });
    expect(copyButton).toBeDisabled();
  });

  // E-7: 出力があるときコピーボタンが enabled
  test("copy button is enabled when output has content", () => {
    render(<JsonFormatterTile />);
    const input = screen.getByLabelText("入力");
    fireEvent.change(input, { target: { value: '{"a":1}' } });
    fireEvent.click(screen.getByRole("button", { name: "整形" }));
    const copyButton = screen.getByRole("button", { name: "コピー" });
    expect(copyButton).not.toBeDisabled();
  });

  // E-6: コピー前は "コピー" が表示される
  test("copy button label is コピー when not copied", () => {
    mockHook.copiedKey = null;
    render(<JsonFormatterTile />);
    const input = screen.getByLabelText("入力");
    fireEvent.change(input, { target: { value: '{"a":1}' } });
    fireEvent.click(screen.getByRole("button", { name: "整形" }));
    expect(screen.getByRole("button", { name: "コピー" })).toBeInTheDocument();
  });

  // E-6: コピー後は COPIED_LABEL ("コピーしました") が表示される
  test("copy button label changes to COPIED_LABEL when copiedKey is set", () => {
    mockHook.copiedKey = true;
    render(<JsonFormatterTile />);
    const input = screen.getByLabelText("入力");
    fireEvent.change(input, { target: { value: '{"a":1}' } });
    fireEvent.click(screen.getByRole("button", { name: "整形" }));
    expect(
      screen.getByRole("button", { name: "コピーしました" }),
    ).toBeInTheDocument();
  });

  // ---------- variant="format-only" の機能 ----------

  // F-1: format-only では整形ボタンのみが表示される（圧縮・検証ボタンなし）
  test("shows only 整形 button in format-only variant", () => {
    render(<JsonFormatterTile variant="format-only" />);
    expect(screen.getByRole("button", { name: "整形" })).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "圧縮" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "検証" }),
    ).not.toBeInTheDocument();
  });

  // F-2: format-only でも整形ボタンが正常に動く
  test("formats JSON correctly in format-only variant", () => {
    render(<JsonFormatterTile variant="format-only" />);
    const input = screen.getByLabelText("入力");
    fireEvent.change(input, { target: { value: '{"x":1}' } });
    fireEvent.click(screen.getByRole("button", { name: "整形" }));
    const output = screen.getByLabelText("出力") as HTMLTextAreaElement;
    expect(output.value).toBe('{\n  "x": 1\n}');
  });

  // F-3: format-only でもインデント Select が表示される
  test("shows indent Select in format-only variant", () => {
    render(<JsonFormatterTile variant="format-only" />);
    expect(screen.getByLabelText("インデント")).toBeInTheDocument();
  });

  // F-4: format-only でも無効JSONでエラーが表示される
  test("shows Japanese error in format-only variant for invalid JSON", () => {
    render(<JsonFormatterTile variant="format-only" />);
    const input = screen.getByLabelText("入力");
    fireEvent.change(input, { target: { value: "{invalid}" } });
    fireEvent.click(screen.getByRole("button", { name: "整形" }));
    const alert = screen.getByRole("alert");
    expect(alert.textContent).toMatch(/[ぁ-ん|ァ-ン|一-龯]/);
  });

  // ---------- 複数インスタンス同居（道具箱シミュレーション） ----------

  // I-1: 複数インスタンスで DOM id 重複ゼロ（useId ベース）
  test("multiple instances have unique DOM ids (no id collision)", () => {
    const { unmount } = render(
      <div>
        <JsonFormatterTile variant="full" />
        <JsonFormatterTile variant="format-only" />
      </div>,
    );
    // すべての id 属性を収集
    const ids = Array.from(document.querySelectorAll("[id]")).map(
      (el) => el.id,
    );
    // id 重複ゼロを確認
    const uniqueIds = new Set(ids);
    expect(ids.length).toBe(uniqueIds.size);
    unmount();
  });

  // I-2: 複数インスタンスで label と input の紐付けが正常（htmlFor 誤結合なし）
  test("multiple instances associate labels correctly", () => {
    render(
      <div>
        <JsonFormatterTile variant="full" />
        <JsonFormatterTile variant="format-only" />
      </div>,
    );
    // getByLabelText が複数ある場合は getAllByLabelText を使用
    const inputs = screen.getAllByLabelText("入力");
    expect(inputs.length).toBe(2);
    const outputs = screen.getAllByLabelText("出力");
    expect(outputs.length).toBe(2);
  });

  // ---------- エラーリセット ----------

  // E-9: 新しい操作をするとエラーがリセットされる
  test("clears error when a new valid operation is performed", () => {
    render(<JsonFormatterTile />);
    const input = screen.getByLabelText("入力");
    // まず無効JSON でエラーを出す
    fireEvent.change(input, { target: { value: "{invalid}" } });
    fireEvent.click(screen.getByRole("button", { name: "整形" }));
    expect(screen.getByRole("alert")).toBeInTheDocument();
    // 有効JSON で整形するとエラーが消える
    fireEvent.change(input, { target: { value: '{"a":1}' } });
    fireEvent.click(screen.getByRole("button", { name: "整形" }));
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  // ---------- CSS トークン検証 ----------

  // E-12: CSS ファイルで旧 --color-* トークン・--accent 直塗り・font-weight:700 不使用
  test("CSS does not use deprecated tokens or font-weight 700", () => {
    const cssPath = join(
      process.cwd(),
      "src/tools/json-formatter/JsonFormatterTile.module.css",
    );
    const css = readFileSync(cssPath, "utf-8");

    // 旧トークン --color-* が存在しないこと
    expect(css).not.toMatch(/var\(--color-/);

    // --accent 直塗りがないこと
    const accentDirectUse = css.match(
      /(?:background|color)\s*:\s*var\(--accent\)/g,
    );
    expect(accentDirectUse).toBeNull();

    // font-weight: 700 が CSS 宣言として存在しないこと
    const cssWithoutComments = css.replace(/\/\*[\s\S]*?\*\//g, "");
    expect(cssWithoutComments).not.toMatch(/font-weight\s*:\s*700/);
  });

  // E-13: CSS .controlLabel に white-space: nowrap があるか（ラベル折返し防止）
  test("CSS .controlLabel has white-space: nowrap", () => {
    const cssPath = join(
      process.cwd(),
      "src/tools/json-formatter/JsonFormatterTile.module.css",
    );
    const css = readFileSync(cssPath, "utf-8");
    const controlLabelBlock = css.match(/\.controlLabel\s*\{([\s\S]*?)\}/);
    expect(controlLabelBlock).not.toBeNull();
    expect(controlLabelBlock![1]).toMatch(/white-space\s*:\s*nowrap/);
  });

  // ---------- Panel ルート（A-1） ----------

  // A-1: タイルのルート要素に data-panel 属性があること（Panel コンポーネント）
  // Panel は section/div/article タグをレンダリングするので、タイルのルートを確認
  test("root element is a Panel (section by default)", () => {
    const { container } = render(<JsonFormatterTile />);
    // Panel は as="section" がデフォルト。第1子要素を確認
    const root = container.firstElementChild;
    expect(root?.tagName.toLowerCase()).toBe("section");
  });
});
