"use client";

import { useState } from "react";
import Link from "next/link";
import { convert } from "./logic";
import type { ConvertMode } from "./logic";

/**
 * 全角半角変換 タイル用簡素 UI（kind=widget）。
 *
 * 詳細ページ Component.tsx（双方向トグル + オプション 3 種チェックボックス + 入力 textarea
 * + 出力 textarea + コピーボタン）とは別に、タイルサイズ（cols=3 rows=2 = 400×264px）に
 * 最適化した簡素版 UI。ロジックは詳細ページと同じ logic.ts の convert() を再利用。
 *
 * 特徴（HtmlEntityTile との差分）:
 * - 方向トグル: 「半角に変換」(toHalfwidth) / 「全角に変換」(toFullwidth) の 2 択セグメント UI
 * - オプション 3 種チェックボックス（英数字 / カタカナ / 記号）はタイルで省略し全 ON 固定
 *   （採択案 B: 最大公約数ユースケースが全 ON で大半の利用者の用途と一致。
 *    詳細ページが細部制御の責務を担う = タイル / 詳細ページの責務分離）
 * - エラーハンドリング不要: convert() は失敗経路を持たない純粋同期関数のため
 *   try/catch / フォールバック文言は不要（hash-generator とは異なる）
 * - useMemo 不使用: 純粋同期関数 + 計算コスト極小のため HtmlEntityTile と異なり省略可能
 *   （計画書 §T-3 で「builder 裁量」として確認済み）
 *
 * 【AP-P21 対応】膨張ゼロ型でも役割分担パターンを継続採用:
 * - textarea を rows=2 + flexShrink: 0 で「入力欄を潰さない」設計
 * - 結果欄を flex: 1 + overflowY: auto で「結果膨張を結果欄内でスクロール」設計
 * fullwidth-converter は実質膨張ゼロ型（半角 1 文字 ↔ 全角 1 文字。濁音カタカナ toHalfwidth で
 * 1 文字 → 2 文字の微増があるが base64 4 倍 / url-encode 3 倍とは桁違いに小さい）。
 * それでも継続採用する理由:
 * (i) cycle-200〜205 で 6 連続適用済の CSS 構造を踏襲することでタイル全体の一貫性を維持
 * (ii) cycle-204 / cycle-205 申し送り「役割分担パターン採用 + T-4 計測は運用標準として継続」遵守
 * (iii) AP-WF09 防止のため「膨張ゼロ型でも継続採用」の理由を本コメントで明示
 * (iv) 膨張ゼロ型サンプル 2 件目（cycle-205 hash-generator = 1 件目）として T-4 計測継続
 *
 * CSS はデザイントークン（--fg / --bg / --accent / --fg-soft / --border）を
 * 使用した inline style で実装。
 * tsx による codegen (generate-tiles-registry.ts) が CSS Module を解釈できないため、
 * tile-declarations.ts から import する本コンポーネントは CSS Module を使用しない。
 *
 * 【8px について】
 * 本ファイル内の "8px" はすべてタイル内部の flex gap / padding 余白であり、
 * tile-grid.ts の TILE_GAP_PX（タイル間の外側マージン 8px）とは別概念。
 *
 * Phase 8.1 cycle-206 T-3
 */

/** タイルに表示するモードの選択肢（2 択） */
const MODES: { value: ConvertMode; label: string }[] = [
  { value: "toHalfwidth", label: "半角に変換" },
  { value: "toFullwidth", label: "全角に変換" },
];

/** 全 ON 固定オプション（タイルは常にこれを使用する） */
const ALL_ON_OPTIONS = { alphanumeric: true, katakana: true, symbol: true };

export default function FullwidthConverterTile() {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<ConvertMode>("toHalfwidth");

  // input + mode が変わるたびに変換結果を再計算（純粋同期関数 + 計算コスト極小 → useMemo 省略可）
  // convert() は失敗経路を持たないため try/catch 不要
  const result = input === "" ? null : convert(input, mode, ALL_ON_OPTIONS);

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
      {/* ヘッダー: タイトル */}
      <p
        style={{
          margin: 0,
          fontSize: "0.75rem",
          fontWeight: 600,
          opacity: 0.7,
        }}
      >
        全角半角変換
      </p>

      {/* モードセグメントコントロール: 半角に変換 / 全角に変換 の 2 択 */}
      <div
        style={{
          display: "flex",
          gap: "4px",
        }}
        role="group"
        aria-label="変換モード"
      >
        {MODES.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            aria-pressed={mode === value}
            onClick={() => setMode(value)}
            style={{
              padding: "2px 10px",
              fontSize: "0.75rem",
              borderRadius: "4px",
              border: "1px solid var(--border, var(--fg-soft))",
              backgroundColor: mode === value ? "var(--accent)" : "transparent",
              color: mode === value ? "var(--bg)" : "var(--fg)",
              cursor: "pointer",
              fontFamily: "inherit",
              fontWeight: mode === value ? 600 : 400,
              whiteSpace: "nowrap",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* テキスト入力欄
           rows={2} 固定 + flexShrink: 0 で「入力欄を潰さない」設計。【AP-P21 対応】
           fullwidth-converter は実質膨張ゼロ型（半角 ↔ 全角 1:1 対応）だが、
           cycle-200〜205 で 6 連続適用済の CSS 構造を踏襲して一貫性を維持する。
           タイルは「素早く確認する場」であり、長文入力したい visitor は詳細ページへ誘導する。 */}
      <textarea
        style={{
          flexShrink: 0,
          width: "100%",
          resize: "none",
          // --fg-soft: placeholder が浮き上がりすぎず、入力テキストとの視覚差を自然に確保
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
        placeholder={
          mode === "toHalfwidth"
            ? "全角テキストを入力すると半角に変換します"
            : "半角テキストを入力すると全角に変換します"
        }
        rows={2}
        aria-label="全角半角変換入力欄"
      />

      {/* 変換結果表示エリア（読み取り専用）
           flex: 1 で残りスペースを占有し、overflowY: auto で枠内スクロール。【AP-P21 対応】
           入力欄が flexShrink: 0 で固定されているため、濁音カタカナ toHalfwidth による
           微増（1 文字 → 2 文字）があっても入力欄が圧縮されることなく結果欄のみがスクロール可能。
           convert() は失敗経路なし → エラー表示不要。
           aria-live="polite" で変換結果の更新を支援技術に通知する。 */}
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
          opacity: result === null ? 0 : 0.85,
        }}
      >
        {result === null ? "" : result}
      </div>

      {/* 詳細ページへのリンク（オプション 3 種個別制御・コピーボタン等は詳細ページの責務） */}
      <Link
        href="/tools/fullwidth-converter"
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
  );
}
