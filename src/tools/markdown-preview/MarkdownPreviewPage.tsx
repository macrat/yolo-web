"use client";

import { useState, useMemo, useSyncExternalStore } from "react";
import { renderMarkdown } from "./logic";
import Textarea from "@/components/Textarea";
import ErrorMessage from "@/components/ErrorMessage";
import styles from "./MarkdownPreviewPage.module.css";

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

/**
 * MarkdownPreviewPage — Markdownライブプレビューの単一実装。
 *
 * 機能:
 * - Markdown入力欄（Textarea: variant="mono"）
 * - リアルタイムプレビュー（useMemo で即時描画）
 * - GFM（GitHub Flavored Markdown）対応: 見出し・リスト・テーブル・コードブロック等
 * - サニタイズ済みHTML出力（XSS防止: script等の危険タグをホワイトリスト方式で除去）
 * - エラー表示（ErrorMessage: 入力超過時に日本語メッセージ）
 *
 * 設計方針:
 * - 確定提示方式: サンプルMarkdownを初期値として入力欄にセット済み
 * - T-4b: markdown-preview はコピーボタンなし確定（プレビュー閲覧用途）
 * - SSR/hydration安全: logic.ts の sanitizeHtml は DOMParser（ブラウザ専用API）を使うため
 *   SSR環境（Node.js）では動作しない。useSyncExternalStore を使った useMounted() で
 *   マウント後にのみレンダリングを実行し、SSR/CSR の初期状態を対称に保つ。
 * - ARIA C-3: role="status" aria-live="polite" にはサマリテキストのみを配置し、
 *   プレビュー本体（dangerouslySetInnerHTML）はライブリージョン外の role="region" に配置する。
 *   キー入力毎にMarkdown全体をスクリーンリーダーが再読み上げしないようにするため。
 * - エラー文言は全て日本語（A-4: 英語の例外を日本語メッセージに変換済み）
 * - AP-I11: タイマーなし（useMemo 即時描画）のためタイマー管理不要
 */
export default function MarkdownPreviewPage() {
  const [input, setInput] = useState(SAMPLE_MARKDOWN);
  // SSR/hydration安全: useSyncExternalStore でマウント後フラグを取得（useEffect不要）
  const isMounted = useMounted();

  // リアルタイム変換: マウント後かつ入力が変わるたびに即座にレンダリング
  const result = useMemo(() => {
    if (!isMounted) return { success: true, html: "" };
    return renderMarkdown(input);
  }, [input, isMounted]);

  // C-3: プレビュー状態のサマリ（実テキストノード）
  // role="status" 領域に短いサマリのみを配置し、スクリーンリーダーへの変化通知を実現する。
  // プレビュー本体はライブリージョンの外（role="region"）に配置するため、
  // キー入力毎にMarkdown全体が再読み上げされることを防ぐ。
  const statusSummary =
    isMounted && !result.error && input.trim()
      ? "プレビューを更新しました"
      : "";

  return (
    <div className={styles.container}>
      <div className={styles.panels}>
        {/* 左パネル: Markdown入力欄 */}
        <div className={styles.panel}>
          <label htmlFor="md-input" className={styles.panelLabel}>
            Markdown
          </label>
          <Textarea
            id="md-input"
            aria-label="Markdown入力"
            variant="mono"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Markdownを入力..."
            spellCheck={false}
            rows={18}
          />
        </div>

        {/* 右パネル: プレビュー表示 */}
        <div className={styles.panel}>
          <span className={styles.panelLabel}>プレビュー</span>

          {/* C-3: role="status" にはサマリのみ配置（視覚上は非表示）。
              プレビュー本体はこの外に配置することで、スクリーンリーダーが
              キー入力毎にMarkdown全体を再読み上げすることを防ぐ。 */}
          <div
            role="status"
            aria-live="polite"
            aria-atomic="false"
            className={styles.srOnly}
          >
            {statusSummary}
          </div>

          {/* エラー表示: A-4 準拠（ErrorMessage経由・日本語メッセージ） */}
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
    </div>
  );
}
