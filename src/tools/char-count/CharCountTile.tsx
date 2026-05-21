"use client";

import { useState } from "react";
import Link from "next/link";
import { countChars } from "./logic";

/**
 * char-count タイル用簡素 UI（kind=widget）。
 *
 * 詳細ページ Component.tsx（textarea rows=10 + 6 統計値 grid）とは別に
 * タイルサイズ（cols=3 rows=2 = 400×264px）に最適化した簡素版 UI。
 * ロジックは詳細ページと同じ logic.ts の countChars() を import して再利用。
 *
 * CSS はデザイントークン（--fg / --bg / --accent）を使用した inline style で実装。
 * tsx による codegen (generate-tiles-registry.ts) が CSS Module を解釈できないため、
 * tile-declarations.ts から import する本コンポーネントは CSS Module を使用しない。
 *
 * Phase 8.1 cycle-200 T-3
 */
export default function CharCountTile() {
  const [text, setText] = useState("");
  const charCount = countChars(text);

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
      <p
        style={{
          margin: 0,
          fontSize: "0.75rem",
          fontWeight: 600,
          opacity: 0.7,
        }}
      >
        文字数カウント
      </p>
      <textarea
        style={{
          flex: 1,
          width: "100%",
          resize: "none",
          border: "1px solid var(--fg)",
          borderRadius: "4px",
          padding: "6px 8px",
          fontSize: "0.875rem",
          backgroundColor: "var(--bg)",
          color: "var(--fg)",
          boxSizing: "border-box",
          fontFamily: "inherit",
          opacity: 0.9,
        }}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="文字を入力すると数えます"
        rows={3}
        aria-label="文字数カウント入力欄"
      />
      <div
        style={{ display: "flex", alignItems: "center", gap: "8px" }}
        role="status"
        aria-live="polite"
      >
        <span style={{ fontSize: "0.75rem", opacity: 0.7 }}>文字数</span>
        <span
          style={{
            fontSize: "1.125rem",
            fontWeight: 700,
            color: "var(--accent)",
          }}
        >
          {charCount}
        </span>
      </div>
      <Link
        href="/tools/char-count"
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
