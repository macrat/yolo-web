"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { decodeUrl, encodeUrl } from "./logic";

/**
 * url-encode タイル用簡素 UI（kind=widget）。
 *
 * 詳細ページ Component.tsx（textarea×2 + button×4 + 結果表示）とは別に
 * タイルサイズ（cols=3 rows=2 = 400×264px）に最適化した簡素版 UI。
 * ロジックは詳細ページと同じ logic.ts の encodeUrl() / decodeUrl() を再利用。
 *
 * 特徴（CharCountTile / ByteCounterTile との差分）:
 * - encode / decode の双方向トグル（セグメント UI）を持つ
 * - decode 不正入力時に --fg-soft 色で控えめなエラー表示（リアルタイム）
 * - mode は "component"（encodeURIComponent / decodeURIComponent）固定
 * - 変換結果が長文字列になるため word-break: break-all で枠内に収める
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
 * Phase 8.1 cycle-202 T-3
 */

type Direction = "encode" | "decode";

export default function UrlEncodeTile() {
  const [input, setInput] = useState("");
  const [direction, setDirection] = useState<Direction>("encode");

  // input + direction が変わるたびに変換結果を再計算（useMemo で過剰再計算回避）
  const result = useMemo(() => {
    if (input === "") return null;
    return direction === "encode"
      ? encodeUrl(input, "component")
      : decodeUrl(input, "component");
  }, [input, direction]);

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
        URLエンコード
      </p>

      {/* 方向トグル: encode / decode の 2 択セグメント UI */}
      <div
        style={{
          display: "flex",
          gap: "4px",
        }}
        role="group"
        aria-label="変換方向"
      >
        {(["encode", "decode"] as Direction[]).map((dir) => (
          <button
            key={dir}
            type="button"
            aria-pressed={direction === dir}
            onClick={() => setDirection(dir)}
            style={{
              padding: "2px 10px",
              fontSize: "0.75rem",
              borderRadius: "4px",
              border: "1px solid var(--border, var(--fg-soft))",
              backgroundColor:
                direction === dir ? "var(--accent)" : "transparent",
              color: direction === dir ? "var(--bg)" : "var(--fg)",
              cursor: "pointer",
              fontFamily: "inherit",
              fontWeight: direction === dir ? 600 : 400,
            }}
          >
            {dir}
          </button>
        ))}
      </div>

      {/* テキスト入力欄
           rows={2} 固定 + flexShrink: 0 で「入力欄を潰さない」設計。
           url-encode は encode 結果が長文字列になるため、結果欄を flex: 1 で伸ばす代わりに
           入力欄を固定高さで安定させる（CharCountTile / ByteCounterTile とは異なる判断）。
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
          direction === "encode"
            ? "テキストを入力すると URL エンコードします"
            : "%XX 形式を入力すると URL デコードします"
        }
        rows={2}
        aria-label="URLエンコード入力欄"
      />

      {/* 変換結果表示エリア（読み取り専用）
           flex: 1 で残りスペースを占有し、overflowY: auto で枠内スクロール。
           入力欄が flexShrink: 0 で固定されているため、長文字列 encode 結果が
           膨張しても入力欄が圧縮されることなく結果欄のみがスクロール可能になる。 */}
      <div
        role="status"
        aria-live="polite"
        style={{
          flex: 1,
          fontSize: "0.8125rem",
          wordBreak: "break-all",
          overflowY: "auto",
          // decode 不正入力エラーは --fg-soft で控えめに表示
          // 正常時は --fg 相当（opacity: 0.85 で区別）
          color: result?.success === false ? "var(--fg-soft)" : "var(--fg)",
          opacity: result === null ? 0 : 0.85,
        }}
      >
        {result === null
          ? ""
          : result.success
            ? result.output
            : "不正な URL エンコードです"}
      </div>

      {/* 詳細ページへのリンク */}
      <Link
        href="/tools/url-encode"
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
