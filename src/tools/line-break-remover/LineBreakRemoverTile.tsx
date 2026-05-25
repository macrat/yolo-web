"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  removeLineBreaks,
  type RemoveMode,
  type SmartPdfJoinStyle,
} from "./logic";

/**
 * 改行削除ツール タイル用簡素 UI（kind=widget）。
 *
 * 詳細ページ Component.tsx（3 モード選択 radiogroup + 条件付きオプション + 入力 textarea
 * + 結果 textarea + コピーボタン）とは別に、タイルサイズ（cols=3 rows=2 = 400×264px）に
 * 最適化した簡素版 UI。ロジックは詳細ページと同じ logic.ts の removeLineBreaks() を再利用。
 *
 * 特徴（KanaConverterTile との差分）:
 * - モード選択: 横 2 + 縦 1 グリッド（論点 1 退避案 C 採択 / cycle-209 T-3 Step 1 実証）
 *   案 A（横一列 3 ボタン）を Playwright w375 実物確認した結果、「PDFスマートモード」が
 *   右クリップ（scrollWidth > clientWidth）したため退避。
 *   計画書 §Step 1 の順序に従い案 C（横 2+縦 1）を試行 → w375/w1200 両方で PASS 確認。
 *   （案 B（縦並び）も PASS だが、計画書「案 A FAIL → 案 C → 案 B」の順で案 C が先に採択）
 *   上段: 「改行を削除」「改行をスペースに置換」（各 1fr）/ 下段: 「PDFスマートモード」（full-width）
 *   ラベルは詳細ページ Component.tsx L60/L69/L78 と同一（NIT-1 対応）:
 *   「改行を削除」「改行をスペースに置換」「PDFスマートモード」
 * - 2 階層オプション: smart-pdf 選択時のみ joinStyle サブオプションを条件付き表示。
 *   Phase 8.1 で初の「条件付きオプション UI 表示」パターン SSoT 確立。
 *   アニメーション = CSS @keyframes joinStyleFadeIn（opacity 0→1 + translateY -4px→0 /
 *   200ms ease-out）。`key` prop で smart-pdf に入るたび再マウントして常に 0→1 方向。
 *   高さは条件付き JSX レンダリングで即時切替（grid-template-rows トランジションの
 *   Chrome jumpy 挙動 / Hydration ミスマッチを根本回避 / 論点 2.5 案(a) 採択）。
 *   prefers-reduced-motion: reduce 下では animation: none で即時表示（WCAG 2.1 SC 2.3.3）。
 * - mergeConsecutive: タイルでは OFF 固定・省略（詳細ページデフォルト OFF と整合 / 論点 3 案 ii）
 * - handleModeChange: モード切替時に setCopied(false) でコピー状態リセット（詳細ページ踏襲）
 * - debounce なし（即時反映 / 論点 5 案 1）: 軽量同期処理 + cycle-208 kana-converter 実証済
 *
 * 【AP-P21 対応】膨張ゼロ型（remove/replace-space/smart-pdf 全モードで結果が入力以下）:
 * - textarea を rows=2 + flexShrink: 0 で「入力欄を潰さない」設計
 * - 結果欄を role="status" aria-live="polite" で支援技術に更新を通知
 *
 * CSS はデザイントークン（--fg / --bg / --accent / --fg-soft / --border）を
 * 使用した inline style で実装。CSS Module 不使用（codegen 制約）。
 * ただし @keyframes joinStyleFadeIn のみ <style> タグで JSX 内インジェクション
 * （インラインスタイルでは @keyframes を記述できないため）。
 *
 * 【8px について】
 * 本ファイル内の "8px" はタイル内部の flex gap / padding 余白であり、
 * tile-grid.ts の TILE_GAP_PX（タイル間外側マージン 8px）とは別概念。
 *
 * Phase 8.1 cycle-209 T-3
 */

/** モード選択肢 — 詳細ページ Component.tsx L60/L69/L78 と同一ラベル（NIT-1 対応） */
const MODES: { value: RemoveMode; label: string }[] = [
  { value: "remove", label: "改行を削除" },
  { value: "replace-space", label: "改行をスペースに置換" },
  { value: "smart-pdf", label: "PDFスマートモード" },
];

/** joinStyle 選択肢（smart-pdf 専用サブオプション） */
const JOIN_STYLES: { value: SmartPdfJoinStyle; label: string }[] = [
  { value: "remove", label: "削除する" },
  { value: "space", label: "スペースに置換" },
];

/**
 * joinStyleFadeIn @keyframes CSS 文字列。
 * CSS Module 不使用制約のため <style> タグ経由でインジェクションする。
 * prefers-reduced-motion: reduce 時は animation: none を適用するため
 * このキーフレーム自体は常に定義しておく（適用制御は animation プロパティで行う）。
 */
const FADE_IN_KEYFRAMES = `
  @keyframes joinStyleFadeIn {
    from { opacity: 0; transform: translateY(-4px); }
    to   { opacity: 1; transform: translateY(0); }
  }
`;

export default function LineBreakRemoverTile() {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<RemoveMode>("remove");
  const [joinStyle, setJoinStyle] = useState<SmartPdfJoinStyle>("remove");
  const [copied, setCopied] = useState(false);

  // prefers-reduced-motion: reduce を検知してアニメーション無効化（アクセシビリティ）。
  // useState の遅延初期化で初回値を取得し、useEffect ではリスナー登録のみ行う。
  // 初回値の取得（mql.matches）を遅延初期化で行い、変化コールバックで setState する
  // = 「外部システム（OS 設定）の変化を React state に同期する」正規パターン（lint 準拠）。
  // typeof window === "undefined" チェックで SSR セーフにする（タイルは "use client" だが念のため）。
  const [reducedMotion, setReducedMotion] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleChange = (e: MediaQueryListEvent) =>
      setReducedMotion(e.matches);
    mql.addEventListener("change", handleChange);
    return () => mql.removeEventListener("change", handleChange);
  }, []);

  // 変換結果（純粋同期 + 計算コスト極小 → useMemo 省略可）
  // removeLineBreaks() は失敗経路あり（error フィールド）だがタイルではエラー表示省略
  const result = removeLineBreaks(input, {
    mode,
    mergeConsecutive: false, // タイルでは OFF 固定（詳細ページデフォルト OFF と整合）
    smartPdfJoinStyle: joinStyle,
  });

  /** モード切替 + copied リセット（詳細ページ Component.tsx L40-43 と同型）*/
  const handleModeChange = (newMode: RemoveMode) => {
    setMode(newMode);
    setCopied(false);
  };

  const handleCopy = async () => {
    if (!result.output) return;
    try {
      await navigator.clipboard.writeText(result.output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API not available
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        padding: "12px",
        backgroundColor: "var(--bg)",
        color: "var(--fg)",
        width: "100%",
        height: "100%",
        boxSizing: "border-box",
        overflow: "hidden",
        fontFamily: "inherit",
      }}
    >
      {/* joinStyleFadeIn @keyframes の定義（CSS Module 不使用制約によりインジェクション） */}
      <style>{FADE_IN_KEYFRAMES}</style>

      {/* ヘッダー: タイトル */}
      <p
        style={{
          margin: 0,
          fontSize: "0.75rem",
          fontWeight: 600,
          opacity: 0.7,
        }}
      >
        改行削除
      </p>

      {/* モードセグメントコントロール: 退避案 C（横 2 + 縦 1 グリッド）
           案 A（横一列 3 ボタン）を Playwright 実物確認した結果、w375 で
           「PDFスマートモード」ボタンがクリップされたため退避案 C にフォールバック。
           上段: 「改行を削除」「改行をスペースに置換」の 2 ボタン（最長ラベルを上段に配置）
           下段: 「PDFスマートモード」1 ボタン（full-width で中央表示）
           2 行構成になるが rows=2（264px）内に収まることを Playwright で確認。
           ARIA: role="group" + 各 button の aria-pressed（論点 4 案 b 採択）。
           詳細ページ Component.tsx の role="radiogroup" とは ARIA 層が異なるが、
           既存 6 タイルと同型の button + aria-pressed で一貫性を優先（B-443 で一括解消予定）。 */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "4px",
        }}
        role="group"
        aria-label="変換モード"
      >
        {/* 上段: remove / replace-space */}
        {MODES.slice(0, 2).map(({ value, label }) => (
          <button
            key={value}
            type="button"
            aria-pressed={mode === value}
            onClick={() => handleModeChange(value)}
            style={{
              padding: "2px 4px",
              fontSize: "0.7rem",
              borderRadius: "4px",
              border: "1px solid var(--border, var(--fg-soft))",
              backgroundColor: mode === value ? "var(--accent)" : "transparent",
              color: mode === value ? "var(--bg)" : "var(--fg)",
              cursor: "pointer",
              fontFamily: "inherit",
              fontWeight: mode === value ? 600 : 400,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              textAlign: "center",
            }}
          >
            {label}
          </button>
        ))}
        {/* 下段: smart-pdf（grid 2 列スパンで full-width）*/}
        <button
          type="button"
          aria-pressed={mode === "smart-pdf"}
          onClick={() => handleModeChange("smart-pdf")}
          style={{
            gridColumn: "1 / -1",
            padding: "2px 4px",
            fontSize: "0.7rem",
            borderRadius: "4px",
            border: "1px solid var(--border, var(--fg-soft))",
            backgroundColor:
              mode === "smart-pdf" ? "var(--accent)" : "transparent",
            color: mode === "smart-pdf" ? "var(--bg)" : "var(--fg)",
            cursor: "pointer",
            fontFamily: "inherit",
            fontWeight: mode === "smart-pdf" ? 600 : 400,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            textAlign: "center",
          }}
        >
          PDFスマートモード
        </button>
      </div>

      {/* joinStyle サブオプション（smart-pdf 選択時のみ表示 / 2 階層オプション Phase 8.1 初導入）
           表示制御: mode === "smart-pdf" の条件付き JSX レンダリングで高さを即時切替。
           アニメーション: CSS @keyframes joinStyleFadeIn（opacity 0→1 + translateY -4px→0）。
           mode を key prop にすることで smart-pdf に入るたび DOM が再マウントされ
           常に 0→1 方向のフェードインが実行される。
           prefers-reduced-motion: reduce 設定下では animation: none で即時表示
           （WCAG 2.1 SC 2.3.3 対応）。*/}
      {mode === "smart-pdf" && (
        <div
          key={mode}
          aria-label="行内改行の処理"
          style={{
            display: "flex",
            flexDirection: "row",
            gap: "4px",
            animation: reducedMotion
              ? "none"
              : "joinStyleFadeIn 200ms ease-out forwards",
          }}
        >
          {JOIN_STYLES.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              aria-pressed={joinStyle === value}
              onClick={() => setJoinStyle(value)}
              style={{
                flex: 1,
                padding: "2px 4px",
                fontSize: "0.7rem",
                borderRadius: "4px",
                border: "1px solid var(--border, var(--fg-soft))",
                backgroundColor:
                  joinStyle === value ? "var(--accent)" : "transparent",
                color: joinStyle === value ? "var(--bg)" : "var(--fg)",
                cursor: "pointer",
                fontFamily: "inherit",
                fontWeight: joinStyle === value ? 600 : 400,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                textAlign: "center",
                minWidth: 0,
              }}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {/* テキスト入力欄
           rows={2} 固定 + flexShrink: 0 で「入力欄を潰さない」設計。【AP-P21 対応】 */}
      <textarea
        style={{
          flexShrink: 0,
          width: "100%",
          resize: "none",
          border: "1px solid var(--fg-soft)",
          borderRadius: "4px",
          padding: "6px 8px",
          fontSize: "0.875rem",
          backgroundColor: "var(--bg)",
          color: "var(--fg)",
          boxSizing: "border-box",
          fontFamily: "inherit",
        }}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="テキストを入力すると改行を削除します"
        rows={2}
        aria-label="改行削除入力欄"
      />

      {/* 変換結果表示エリア（role="status" aria-live="polite" で支援技術に通知）
           flex: 1 で残りスペースを占有、overflowY: auto で枠内スクロール。【AP-P21 対応】
           膨張ゼロ型（全モードで結果 ≤ 入力）のため overflow リスク低。 */}
      <div
        role="status"
        aria-live="polite"
        style={{
          flex: 1,
          fontSize: "0.8125rem",
          wordBreak: "break-all",
          overflowWrap: "break-word",
          overflowY: "auto",
          color: "var(--fg)",
          opacity: result.output ? 0.85 : 0,
          minHeight: 0,
        }}
      >
        {result.output}
      </div>

      {/* フッター: コピーボタン + 詳細ページリンク */}
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "8px",
        }}
      >
        {result.output ? (
          <button
            type="button"
            onClick={handleCopy}
            style={{
              padding: "2px 8px",
              fontSize: "0.75rem",
              borderRadius: "4px",
              border: "1px solid var(--border, var(--fg-soft))",
              backgroundColor: copied ? "var(--accent)" : "transparent",
              color: copied ? "var(--bg)" : "var(--fg)",
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            {copied ? "コピー済み" : "コピー"}
          </button>
        ) : (
          <span />
        )}

        {/* 詳細ページへのリンク（追加機能・全オプションは詳細ページの責務） */}
        <Link
          href="/tools/line-break-remover"
          style={{
            fontSize: "0.75rem",
            color: "var(--accent)",
            textDecoration: "underline",
            textUnderlineOffset: "2px",
            alignSelf: "flex-end",
          }}
        >
          詳細ページで開く
        </Link>
      </div>
    </div>
  );
}
