"use client";

import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { computeDiff, hasDifferences } from "./logic";

/**
 * テキスト差分ツール タイル用 UI（kind=widget）。
 *
 * 詳細ページ Component.tsx（3モード + 2 textarea + サマリ status 欄 + 差分結果欄）と
 * は別に、タイルサイズ（cols=3 rows=3 = 400×400px）に最適化した UI。
 * ロジックは詳細ページと同じ logic.ts の computeDiff() / hasDifferences() を再利用。
 *
 * 複合入力型タイル 2 件目（Phase 8.1 第 15 弾 / cycle-214 T-3）:
 * - cycle-210 text-replace の SSoT 4 項目を引用検証する場
 * - B-452（複合入力型タイル AP-P21 基準値 N≥3 見直し）の N=2 達成
 *
 * 採択仕様（cycle-214 T-3 計画書 r7）:
 * - §論点 1: cols=3 rows=3（400×400px）
 * - 計算トリガー: 即時計算（useMemo 派生 / debounce なし / 全12ケース <100ms 確認済）
 * - §論点 13 M1'' 採択:
 *   - 長文 <pre> 差分結果欄: role="region" + aria-label="Diff result"（aria-live なし）
 *   - サマリ status 欄（短文「+N / −M 行」）: role="status" aria-live="polite"
 * - §論点 4 D4 採択: .added = 色 + underline + "+" / .removed = 色 + line-through + "−"
 * - コピーボタン: 差分結果（Unified テキスト形式）をコピー / 「コピー」→「コピー済み」文言変化
 * - 詳細リンク: 「テキスト差分の使い方を見る →」
 * - §論点 3 C1 採択: タイル UI は line モード固定（select なし）/ 詳細ページでのみ切替
 *
 * AP-P21 役割分担（cycle-210 L37 SSoT / cycle-214 §論点 6）:
 * - 操作側（flexShrink: 0）= 2 textarea + コピーボタン + 詳細リンク + サマリ status 欄
 * - 膨張側（flex: 1 + overflowY: auto）= 長文 <pre> 差分結果欄
 *
 * AP-I11 setTimeout cleanup（cycle-211 / cycle-212 / cycle-213 SSoT）:
 * - コピーボタン文言復帰の 2 秒タイマーを useRef で保持
 * - useEffect cleanup（返却関数）で clearTimeout を呼び出す
 *
 * CSS Module 不使用（codegen 制約）/ インラインスタイル方式（既存 14 タイル同型）。
 */

/** コピー完了表示を元に戻すまでの時間 (ms): cycle-211 / cycle-212 / cycle-213 SSoT 同型 */
const COPY_FEEDBACK_DURATION_MS = 2000;

export default function TextDiffTile() {
  const [oldText, setOldText] = useState("");
  const [newText, setNewText] = useState("");
  const [copied, setCopied] = useState(false);

  /** コピー完了表示を元に戻す setTimeout ID
   *  useRef で保持し、useEffect cleanup で clearTimeout（AP-I11 SSoT） */
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // AP-I11 cleanup: unmount 時に走行中の setTimeout をすべてキャンセルする
  useEffect(() => {
    return () => {
      if (copyTimerRef.current !== null) {
        clearTimeout(copyTimerRef.current);
      }
    };
  }, []);

  // §論点 2-D 案 A 採択: 即時計算化（useMemo で依存値変化に応じて派生計算 / debounce なし）
  // §論点 3 C1 採択: タイル UI は line モード固定（select なし） / 詳細ページでのみ切替
  // 全 12 ケース（line/word/char × 1k/10k/50k/100k 字）< 100ms 確認済（T-1 ベンチ実測値）
  const diffParts = useMemo(
    () => computeDiff(oldText, newText, "line"),
    [oldText, newText],
  );
  const hasDiff = hasDifferences(diffParts);

  // 追加・削除の行数カウント（§論点 13 NIT-2 (b) 推奨: hunk 件数ではなく行数合算）
  // part.value を改行で分割し、空行を除いた行数を合算する（line モード固定）
  const addedCount = useMemo(
    () =>
      diffParts
        .filter((p) => p.added)
        .reduce(
          (sum, p) => sum + p.value.split("\n").filter(Boolean).length,
          0,
        ),
    [diffParts],
  );
  const removedCount = useMemo(
    () =>
      diffParts
        .filter((p) => p.removed)
        .reduce(
          (sum, p) => sum + p.value.split("\n").filter(Boolean).length,
          0,
        ),
    [diffParts],
  );

  // サマリ status 欄: line モード固定のため「行」単位固定
  const summaryText = hasDiff
    ? `+${addedCount} 行 / −${removedCount} 行`
    : "差分なし";

  /** コピー対象テキスト（差分結果を Unified テキスト形式で生成）*/
  const copyText = useMemo(() => {
    if (!hasDiff) return "";
    return diffParts
      .map((p) => {
        if (p.added) return `+${p.value}`;
        if (p.removed) return `-${p.value}`;
        return p.value;
      })
      .join("");
  }, [diffParts, hasDiff]);

  /** コピーハンドラ（AP-I11 SSoT / cycle-211/212/213 同型）*/
  const handleCopy = useCallback(async () => {
    if (!copyText) return;
    try {
      await navigator.clipboard.writeText(copyText);
      // コピー成功 → 「コピー済み」表示
      setCopied(true);
      // 既存タイマーをキャンセルしてから新規設定（連打対策）
      if (copyTimerRef.current !== null) {
        clearTimeout(copyTimerRef.current);
      }
      // ID を ref に保持して unmount 時の clearTimeout でリーク防止（AP-I11）
      copyTimerRef.current = setTimeout(() => {
        setCopied(false);
        copyTimerRef.current = null;
      }, COPY_FEEDBACK_DURATION_MS);
    } catch {
      // Clipboard API not available — silent fail
    }
  }, [copyText]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "6px",
        padding: "10px",
        backgroundColor: "var(--bg)",
        color: "var(--fg)",
        width: "100%",
        height: "100%",
        boxSizing: "border-box",
        overflow: "hidden",
        fontFamily: "inherit",
      }}
    >
      {/* ヘッダー行: タイトル（操作側 = flexShrink: 0）
           §論点 3 C1 採択: モード select なし / line モード固定 */}
      <p
        style={{
          flexShrink: 0,
          margin: 0,
          fontSize: "0.75rem",
          fontWeight: 600,
          opacity: 0.7,
        }}
      >
        テキスト差分
      </p>

      {/* 2 textarea 横並び（操作側 = flexShrink: 0）
           AP-P21: 2 入力 textarea は構造的に操作側（ユーザーが直接操作する要素） */}
      <div
        style={{
          flexShrink: 0,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "4px",
        }}
      >
        {/* diff-old textarea */}
        <textarea
          aria-label="変更前テキスト"
          value={oldText}
          onChange={(e) => setOldText(e.target.value)}
          placeholder="変更前を貼り付け"
          rows={4}
          style={{
            width: "100%",
            resize: "none",
            border: "1px solid var(--border, var(--fg-soft))",
            borderRadius: "4px",
            padding: "4px 6px",
            fontSize: "0.75rem",
            backgroundColor: "var(--bg)",
            color: "var(--fg)",
            boxSizing: "border-box",
            fontFamily:
              "ui-monospace, SFMono-Regular, 'SF Mono', Consolas, monospace",
            lineHeight: 1.4,
            minHeight: 0,
          }}
          spellCheck={false}
        />
        {/* diff-new textarea */}
        <textarea
          aria-label="変更後テキスト"
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          placeholder="変更後を貼り付け"
          rows={4}
          style={{
            width: "100%",
            resize: "none",
            border: "1px solid var(--border, var(--fg-soft))",
            borderRadius: "4px",
            padding: "4px 6px",
            fontSize: "0.75rem",
            backgroundColor: "var(--bg)",
            color: "var(--fg)",
            boxSizing: "border-box",
            fontFamily:
              "ui-monospace, SFMono-Regular, 'SF Mono', Consolas, monospace",
            lineHeight: 1.4,
            minHeight: 0,
          }}
          spellCheck={false}
        />
      </div>

      {/* サマリ status 欄（操作側 = flexShrink: 0）
           §論点 13 M1'' 採択: 短文のみ aria-live="polite" を付与
           WAI-ARIA: role="status" は暗黙的に aria-live="polite" + aria-atomic="true" を持つが、
           明示的に aria-live="polite" を付与してテスト可能性を確保 */}
      <div
        role="status"
        aria-live="polite"
        aria-label="差分サマリ"
        style={{
          flexShrink: 0,
          fontSize: "0.7rem",
          color: "var(--fg-soft)",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {summaryText}
      </div>

      {/* 差分結果欄（膨張側 = flex: 1 + overflowY: auto）
           §論点 13 M1'' 採択: 長文 <pre> には role="region" + aria-label のみ / aria-live なし
           AP-P21: 膨張側として残余高さを占有 */}
      {!hasDiff ? (
        <p
          style={{
            flex: 1,
            margin: 0,
            fontSize: "0.75rem",
            color: "var(--success, #16a34a)",
            overflowY: "auto",
          }}
        >
          テキストに差分はありません。
        </p>
      ) : (
        <pre
          role="region"
          aria-label="Diff result"
          style={{
            flex: 1,
            margin: 0,
            fontSize: "0.7rem",
            fontFamily:
              "ui-monospace, SFMono-Regular, 'SF Mono', Consolas, monospace",
            lineHeight: 1.5,
            whiteSpace: "pre-wrap",
            wordBreak: "break-all",
            overflowY: "auto",
            minHeight: 0,
          }}
        >
          {diffParts.map((part, i) => {
            if (part.added) {
              return (
                <span
                  key={i}
                  data-part="added"
                  style={{
                    backgroundColor: "var(--success-soft)",
                    color: "var(--success-strong)",
                    textDecoration: "underline",
                  }}
                >
                  {/* D4 採択: '+' 記号 + underline で追加を視覚表現（色覚多様性対応）
                       §論点 4: aria-hidden は意図的に付与しない（SR 読み上げ前提）
                       data-part="added" はテスト検出用の意味的マーカー */}
                  +{part.value}
                </span>
              );
            }
            if (part.removed) {
              return (
                <span
                  key={i}
                  data-part="removed"
                  style={{
                    backgroundColor: "var(--danger-soft)",
                    color: "var(--danger-strong)",
                    textDecoration: "line-through",
                  }}
                >
                  {/* D4 採択: '−' 記号 + line-through で削除を視覚表現（色覚多様性対応）
                       §論点 4: aria-hidden は意図的に付与しない（SR 読み上げ前提）
                       data-part="removed" はテスト検出用の意味的マーカー */}
                  −{part.value}
                </span>
              );
            }
            return (
              <span key={i} style={{ color: "var(--fg)" }}>
                {part.value}
              </span>
            );
          })}
        </pre>
      )}

      {/* フッター: コピーボタン + 詳細リンク（操作側 = flexShrink: 0）*/}
      <div
        style={{
          flexShrink: 0,
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "6px",
        }}
      >
        {/* コピーボタン（差分結果を Unified テキスト形式でコピー）
             文言変化: 「コピー」→「コピー済み」（cycle-211/212/213 SSoT 同型）
             AP-P21 (θ): AP-P21 適用外（コピーボタンは「コピー実行後」のみ文言変化するため）*/}
        <button
          type="button"
          onClick={handleCopy}
          disabled={!hasDiff}
          style={{
            padding: "6px 8px",
            fontSize: "0.75rem",
            borderRadius: "4px",
            border: "1px solid var(--border, var(--fg-soft))",
            backgroundColor: copied ? "var(--accent)" : "transparent",
            color: copied ? "var(--fg-invert, var(--bg))" : "var(--fg)",
            cursor: hasDiff ? "pointer" : "default",
            fontFamily: "inherit",
            fontWeight: copied ? 600 : 400,
            opacity: hasDiff ? 1 : 0.4,
            transition: "background-color 0.15s, color 0.15s",
          }}
        >
          {copied ? "コピー済み" : "コピー"}
        </button>

        {/* 詳細リンク（cycle-213 同型の「使い方を見る →」形式） */}
        <Link
          href="/tools/text-diff"
          style={{
            fontSize: "0.7rem",
            color: "var(--accent)",
            textDecoration: "underline",
            textUnderlineOffset: "2px",
            whiteSpace: "nowrap",
          }}
        >
          テキスト差分の使い方を見る →
        </Link>
      </div>
    </div>
  );
}
