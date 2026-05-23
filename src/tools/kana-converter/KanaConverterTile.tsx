"use client";

import { useState } from "react";
import Link from "next/link";
import { convertKana } from "./logic";
import type { KanaConvertMode } from "./logic";

/**
 * ひらがな・カタカナ変換 タイル用簡素 UI（kind=widget）。
 *
 * 詳細ページ Component.tsx（4 モード選択 radiogroup + 入力 textarea + 出力 textarea
 * + コピーボタン）とは別に、タイルサイズ（cols=3 rows=2 = 400×264px）に
 * 最適化した簡素版 UI。ロジックは詳細ページと同じ logic.ts の convertKana() を再利用。
 *
 * 特徴（FullwidthConverterTile との差分）:
 * - モード選択: 2x2 グリッド（論点 1 退避案 B 採択）
 *   案 A（4 ボタン横一列）を Playwright 実物確認した結果、w375 / w1200 両方でラベルが
 *   「ひらがな → ...」のように省略され、来訪者が 1 秒で意図を取れない状態になったため
 *   退避案 B（2x2 グリッド）にフォールバック。2x2 にすることで 1 ボタン幅が約 2 倍に
 *   拡大しフルラベルが表示可能になる。rows=2 のまま収まることを Playwright で確認済。
 *   各ラベルは Component.tsx の MODES 定数と同一文字列
 *   （「ひらがな → カタカナ」「カタカナ → ひらがな」「半角カナ → 全角カナ」「全角カナ → 半角カナ」）
 * - ARIA: `<button>` + `aria-pressed`、外側は `role="group"` でグループ化（論点 5b 案 b 採択）
 *   詳細ページの `role="radiogroup"` とは ARIA 層が異なるが、既存 5 タイルと同型で一貫性を優先
 *   詳細・タイルの ARIA 分裂は B-443 で 5 件一括解消予定
 * - debounce なし（即時反映 / 論点 2 案 A 採択）: 変換が純粋同期 + 計算コスト極小のため
 * - エラーハンドリング不要: convertKana() は失敗経路を持たない純粋同期関数
 * - useMemo 不使用: 純粋同期 + 計算コスト極小で不要（FullwidthConverterTile と同様）
 * - DL ボタンなし: テキスト出力型のため不要（qr-code タイルとは異なる）
 *
 * 【AP-P21 対応】混在型（主 3 モード膨張ゼロ + 副モード to-halfwidth-katakana 最大 2 倍膨張）で
 * 役割分担パターンを継続採用:
 * - textarea を rows=2 + flexShrink: 0 で「入力欄を潰さない」設計
 * - 結果欄を flex: 1 + overflowY: auto で「結果膨張を結果欄内でスクロール」設計
 * cycle-200〜207 で 8 連続適用済の CSS 構造を踏襲してタイル全体の一貫性を維持。
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
 * Phase 8.1 cycle-208 T-3
 */

/** タイルに表示するモードの選択肢（4 択）— Component.tsx の MODES 定数と同一ラベル */
const MODES: { value: KanaConvertMode; label: string }[] = [
  { value: "hiragana-to-katakana", label: "ひらがな → カタカナ" },
  { value: "katakana-to-hiragana", label: "カタカナ → ひらがな" },
  { value: "to-fullwidth-katakana", label: "半角カナ → 全角カナ" },
  { value: "to-halfwidth-katakana", label: "全角カナ → 半角カナ" },
];

export default function KanaConverterTile() {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<KanaConvertMode>("hiragana-to-katakana");

  // input + mode が変わるたびに変換結果を再計算（純粋同期関数 + 計算コスト極小 → useMemo 省略可）
  // convertKana() は失敗経路を持たないため try/catch 不要
  const result = input === "" ? null : convertKana(input, mode);

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
        ひらがな・カタカナ変換
      </p>

      {/* モードセグメントコントロール: 2x2 グリッド（論点 1 退避案 B）
           案 A（4 ボタン横一列）の Playwright 実物確認でラベルが省略されたため退避。
           2x2 グリッドにより 1 ボタン幅が約 2 倍に拡大し、フルラベル表示が可能になる。
           仮名変換 2 種（上段）+ 文字幅変換 2 種（下段）の自然な分類も視覚的に伝わる。
           rows=2 のまま収まることを Playwright で確認済（論点 3 案 A 維持）。
           ARIA: role="group" + 各 button の aria-pressed（論点 5b 案 b 採択）。
           詳細ページ Component.tsx の role="radiogroup" とは ARIA 層が異なるが、
           既存 5 タイルと同型の button + aria-pressed で一貫性を優先（B-443 で一括解消予定）。 */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
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
              padding: "2px 4px",
              fontSize: "0.75rem",
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
      </div>

      {/* テキスト入力欄
           rows={2} 固定 + flexShrink: 0 で「入力欄を潰さない」設計。【AP-P21 対応】
           タイルは「素早く確認する場」であり、長文入力したい visitor は詳細ページへ誘導する。 */}
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
        placeholder="テキストを入力すると変換します"
        rows={2}
        aria-label="ひらがな・カタカナ変換入力欄"
      />

      {/* 変換結果表示エリア（読み取り専用）
           flex: 1 で残りスペースを占有し、overflowY: auto で枠内スクロール。【AP-P21 対応】
           入力欄が flexShrink: 0 で固定されているため、to-halfwidth-katakana による
           膨張（全角濁音 1 文字 → 半角 2 文字、最大 2 倍）があっても入力欄が圧縮されず
           結果欄のみがスクロール可能。
           convertKana() は失敗経路なし → エラー表示不要。
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

      {/* 詳細ページへのリンク（コピーボタン等の追加機能は詳細ページの責務） */}
      <Link
        href="/tools/kana-converter"
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
