"use client";

/**
 * MarkdownPreviewTile — Markdown ライブプレビューの単一正典タイル
 *
 * cycle-228 T-24: MarkdownPreviewPage.tsx を Panel ルートのタイルへ作り直したもの。
 *
 * ## 設計原則
 *
 * - **タイル = ツール実装そのもののルート**: 最上位要素が <Panel>。外部ラッパーなし。
 * - **variant prop のみでバリエーション**: 現時点では "full" のみ（2ペイン）。
 *   別実装を作らない（分裂ゼロ）。
 * - **id インスタンス一意化**: useId ベースで生成し、複数インスタンスが同一ページに
 *   同居しても id 重複・label 誤結合が起きない（[A-6]）。
 * - **ToolPageLayout 非依存**: タイル単体で機能が完結する（[A-2]）。
 * - **logic.ts 共有エンジン**: renderMarkdown / sanitizeHtml が唯一のロジック源。
 *   sanitizeHtml を経由しない HTML 描画経路を絶対に作らない（XSS 防御）。
 *
 * ## SSR 安全性（最重要）
 *
 * useSyncExternalStore を使って SSR セーフなマウント検知（useMounted）を実装。
 * logic.ts の sanitizeHtml は DOMParser（ブラウザ専用 API）を使うため、
 * SSR 時（Node.js 環境）には呼ばれない構造を維持する。
 * - SSR: getServerSnapshot() が false を返す → プレビュー非表示
 * - CSR: getSnapshot() が true を返す → プレビューを描画
 * この対称性により hydration mismatch が発生しない。
 * 複数インスタンスが道具箱で同居しても hydration エラーが出ない。
 *
 * ## variant
 *
 * - `"full"` (デフォルト・唯一): 2ペイン（入力 textarea ＋ プレビュー ＋ HTML コピー）
 *   markdown-preview はこの1バリエーションで十分。
 *
 * ## 使い方
 *
 * ```tsx
 * // 道具箱や詳細ページから同一エクスポートを描画する（同一性の構造的保証）
 * <MarkdownPreviewTile variant="full" />
 * ```
 *
 * ## アクセシビリティ（C-3 準拠）
 *
 * - role="status" aria-live="polite" にはサマリテキストのみを配置し、
 *   スクリーンリーダーへの変化通知を実現する（C-3）。
 * - プレビュー本体（dangerouslySetInnerHTML）はライブリージョン外の
 *   role="region" に配置することで、キー入力毎に Markdown 全体が
 *   再読み上げされることを防ぐ（C-3）。
 */

import { useId, useMemo, useSyncExternalStore } from "react";
import { useState } from "react";
import Panel from "@/components/Panel";
import Button from "@/components/Button";
import Textarea from "@/components/Textarea";
import ErrorMessage from "@/components/ErrorMessage";
import {
  useCopyToClipboard,
  COPIED_LABEL,
} from "@/components/hooks/useCopyToClipboard";
import { renderMarkdown } from "./logic";
import styles from "./MarkdownPreviewTile.module.css";

/** サンプルMarkdown: ツールを初めて開いたときに機能を把握しやすいデフォルト値 */
const SAMPLE_MARKDOWN = `# Heading 1
## Heading 2

This is **bold** and *italic* text.

- List item 1
- List item 2

\`\`\`javascript
console.log("Hello");
\`\`\`

| Column A | Column B |
|----------|----------|
| Cell 1   | Cell 2   |
`;

/**
 * useMounted — SSR/hydration 安全な「マウント後」フラグ。
 *
 * useSyncExternalStore を使うことで:
 * - SSR: getServerSnapshot() が false を返す → プレビュー非表示（空の初期状態）
 * - CSR: getSnapshot() が true を返す → プレビューを描画
 * この対称性により React の hydration mismatch が発生しない。
 * logic.ts の sanitizeHtml は DOMParser（ブラウザ専用API）を使うため、
 * マウント前に呼び出すと SSR で例外が発生する。この hook でその呼び出しを防ぐ。
 */
function useMounted(): boolean {
  return useSyncExternalStore(
    () => () => {}, // subscribe: 変化なし（マウント時の一度きり）
    () => true, // getSnapshot（クライアント）: マウント後は常に true
    () => false, // getServerSnapshot（SSR）: false
  );
}

/** variant prop: 表示バリエーションの設定差。別実装ではない。 */
export type MarkdownPreviewTileVariant = "full";

export interface MarkdownPreviewTileProps {
  /**
   * 表示バリエーション（デフォルト: "full"）
   * - "full": 2ペイン（Markdown 入力 ＋ リアルタイムプレビュー ＋ HTML コピー）
   *   このツールは full のみで十分。バリエーションを無理にひねり出さない方針。
   */
  variant?: MarkdownPreviewTileVariant;
  /** 初期入力値（デフォルト: SAMPLE_MARKDOWN） */
  defaultInput?: string;
  /** Panel の as prop に透過される HTML タグ（デフォルト: "section"） */
  as?: "section" | "div" | "article" | "aside";
  /** 追加クラス */
  className?: string;
}

export default function MarkdownPreviewTile({
  variant = "full",
  defaultInput = SAMPLE_MARKDOWN,
  as = "section",
  className,
}: MarkdownPreviewTileProps = {}) {
  // variant は将来拡張のために受け取る。現在は "full" のみ。
  void variant;

  // ---------- id インスタンス一意化（[A-6]: 複数同居時の重複 id・label 誤結合防止） ----------
  const uid = useId();
  const inputId = `${uid}-input`;

  // ---------- State ----------
  const [input, setInput] = useState(defaultInput);

  // SSR/hydration 安全: useSyncExternalStore でマウント後フラグを取得（useEffect 不要）
  const isMounted = useMounted();

  // HTML コピーボタン（useCopyToClipboard フック使用）
  const { copy, copiedKey } = useCopyToClipboard();

  // ---------- リアルタイム変換（共有エンジン logic.ts を使用） ----------
  // isMounted が false（SSR 時・初回レンダリング）は renderMarkdown を呼ばない。
  // sanitizeHtml（DOMParser）はブラウザ専用のため SSR 時に呼ばれない構造を維持する。
  const result = useMemo(() => {
    if (!isMounted) return { success: true, html: "" };
    return renderMarkdown(input);
  }, [input, isMounted]);

  // C-3: プレビュー状態のサマリ（実テキストノード）
  // role="status" 領域に短いサマリのみを配置し、スクリーンリーダーへの変化通知を実現。
  // プレビュー本体はライブリージョン外（role="region"）に配置するため、
  // キー入力毎に Markdown 全体が再読み上げされることを防ぐ。
  const statusSummary =
    isMounted && !result.error && input.trim()
      ? "プレビューを更新しました"
      : "";

  // コピーできる条件: マウント済み・エラーなし・入力が空でない
  const canCopy = isMounted && !result.error && input.trim().length > 0;

  // ---------- ハンドラ ----------
  function handleInputChange(e: { target: { value: string } }) {
    setInput(e.target.value);
  }

  // ---------- Render ----------
  // タイルのルートが Panel（= DESIGN.md §1 パネル準拠・タイル = ツール実装そのもの）
  return (
    <Panel as={as} className={className}>
      <div className={styles.panels}>
        {/* 左パネル: Markdown 入力欄 */}
        <div className={styles.panel}>
          <label htmlFor={inputId} className={styles.panelLabel}>
            Markdown
          </label>
          <Textarea
            id={inputId}
            aria-label="Markdown入力"
            variant="mono"
            value={input}
            onChange={handleInputChange}
            placeholder="Markdownを入力..."
            spellCheck={false}
            rows={18}
          />
        </div>

        {/* 右パネル: プレビュー表示 */}
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <span className={styles.panelLabel}>プレビュー</span>
            {/* HTML コピーボタン。出力が空のときは disabled */}
            <Button
              size="small"
              disabled={!canCopy}
              onClick={() => copy(result.html)}
              aria-label={copiedKey ? COPIED_LABEL : "HTMLをコピー"}
            >
              {copiedKey ? COPIED_LABEL : "HTMLをコピー"}
            </Button>
          </div>

          {/* C-3: role="status" にはサマリのみ配置（視覚上は非表示）。
              プレビュー本体はこの外に配置することで、スクリーンリーダーが
              キー入力毎に Markdown 全体を再読み上げすることを防ぐ。 */}
          <div
            role="status"
            aria-live="polite"
            aria-atomic="false"
            className={styles.srOnly}
          >
            {statusSummary}
          </div>

          {/* エラー表示: A-4 準拠（ErrorMessage 経由・日本語メッセージ） */}
          {result.error ? (
            <ErrorMessage message={result.error} />
          ) : (
            /* プレビュー本体: ライブリージョン外の role="region" に配置（C-3） */
            <div
              role="region"
              aria-label="Markdownプレビュー"
              className={styles.previewWrapper}
            >
              {isMounted && input.trim() ? (
                <div
                  data-testid="markdown-preview"
                  className={styles.preview}
                  dangerouslySetInnerHTML={{ __html: result.html }}
                />
              ) : (
                <div className={styles.emptyHint}>
                  {isMounted
                    ? "左の入力欄にMarkdownを入力するとプレビューが表示されます"
                    : "読み込み中..."}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Panel>
  );
}
