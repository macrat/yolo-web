"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { decodeBase64, encodeBase64 } from "./logic";

/**
 * base64 タイル用簡素 UI（kind=widget）。
 *
 * 詳細ページ Component.tsx（textarea×2 + button×3 + コピーボタン + 結果表示）とは別に
 * タイルサイズ（cols=3 rows=2 = 400×264px）に最適化した簡素版 UI。
 * ロジックは詳細ページと同じ logic.ts の encodeBase64() / decodeBase64() を再利用。
 *
 * 特徴（CharCountTile / ByteCounterTile との差分）:
 * - encode / decode の双方向トグル（セグメント UI）を持つ
 * - decode 不正入力時に --fg-soft 色で控えめなエラー表示（リアルタイム）
 * - decode 失敗ケースは 2 系統:
 *   (a) base64 文法不正 = atob 失敗（例: 不正文字 !@# を含む）
 *   (b) base64 有効だが UTF-8 として復元不能 = TextDecoder fatal: true 失敗
 *       （例: /w== は有効な base64 だが 0xff 単独で UTF-8 不正）
 *   → いずれも固定日本語文言「不正な Base64 文字列です」を --fg-soft で表示
 * - 変換結果が長文字列になるため word-break: break-all で枠内に収める
 *
 * 【AP-P21 対応】結果膨張型の役割分担:
 * - textarea を rows=2 + flexShrink: 0 で「入力欄を潰さない」設計
 * - 結果欄を flex: 1 + overflowY: auto で「結果膨張を結果欄内でスクロール」設計
 * base64 は encode 結果が url-encode 以上に膨張する（日本語 30 文字 → 120 文字超）。
 * cycle-202 の url-encode で T-4 R1 で発覚した「textarea が 12px に圧迫」事故を
 * 計画段階で先取りして対応。
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
 * Phase 8.1 cycle-203 T-3
 */

type Direction = "encode" | "decode";

export default function Base64Tile() {
  const [input, setInput] = useState("");
  const [direction, setDirection] = useState<Direction>("encode");

  // input + direction が変わるたびに変換結果を再計算（useMemo で過剰再計算回避）
  const result = useMemo(() => {
    if (input === "") return null;
    return direction === "encode" ? encodeBase64(input) : decodeBase64(input);
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
        Base64
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
           rows={2} 固定 + flexShrink: 0 で「入力欄を潰さない」設計。【AP-P21 対応】
           base64 は encode 結果が url-encode 以上に膨張するため、
           結果欄を flex: 1 で伸ばす代わりに入力欄を固定高さで安定させる。
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
            ? "テキストを入力すると Base64 エンコードします"
            : "Base64 文字列を入力するとデコードします"
        }
        rows={2}
        aria-label="Base64入力欄"
      />

      {/* 変換結果表示エリア（読み取り専用）
           flex: 1 で残りスペースを占有し、overflowY: auto で枠内スクロール。【AP-P21 対応】
           入力欄が flexShrink: 0 で固定されているため、長文字列 encode 結果が
           膨張しても入力欄が圧縮されることなく結果欄のみがスクロール可能になる。
           decode 失敗時は固定日本語文言「不正な Base64 文字列です」を --fg-soft で表示。
           英語ブラウザ例外メッセージ（atob の "The string to be decoded is not correctly
           encoded." 等）は visitor に直接見せない。 */}
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
            : "不正な Base64 文字列です"}
      </div>

      {/* 詳細ページへのリンク */}
      <Link
        href="/tools/base64"
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
