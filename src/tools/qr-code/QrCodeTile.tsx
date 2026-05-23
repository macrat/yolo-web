"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { generateQrCode } from "./logic";

/**
 * QR コード生成 タイル用 UI（kind=widget）。
 *
 * 詳細ページ Component.tsx（textarea + 誤り訂正セレクト + SVG プレビュー + DL ボタン）と
 * は別に、タイルサイズ（cols=3 rows=3 = 400×400px）に最適化した UI。
 * ロジックは詳細ページと同じ logic.ts の generateQrCode() を再利用。
 *
 * 設計判断（cycle-207 T-3 計画書）:
 * - kind=widget（詳細ページ Component は縦長で 128px セルに収まらない）
 * - タイルサイズ rows=3（cols=3 rows=3 = 400×400px）。論点 0 案 C 採択。
 * - 誤り訂正レベル M 固定（タイル UI に表示しない）。論点 1 案 B 採択。
 *   M = QR 業界の事実標準 + qrcode-generator のデフォルト + CMAN「推奨」ラベル。
 * - debounce 300ms リアルタイム化。論点 2 案 C 採択。
 *   useEffect + setTimeout + cleanup の clearTimeout パターン（cycle-205 確立）。
 * - タイル下端に独立 DL ボタン配置。論点 0-b 案 A 採択。「PNG形式でダウンロード」ラベル。
 *
 * 【AP-P21 画像出力型適応 SSoT】（論点 3）:
 * - 入力 textarea: rows=2 + flexShrink: 0（入力欄を潰さない）
 * - SVG プレビューコンテナ: flex: 1 + aspect-ratio: 1 で正方形維持、最小高さ 150px、
 *   最大高さ 272px（padding/textarea/DL 各分を差し引いた残余）
 * - DL ボタン: flexShrink: 0（タイル下端固定）
 * - コンテナ背景 #fff 固定（QR 読み取り精度要件）
 * - Quiet Zone（margin=4 セル）: logic.ts の createSvgTag(4, 4) で担保
 *
 * CSS Module 不使用（codegen 制約）。インラインスタイル方式で既存 7 タイルと同型。
 *
 * 【8px について】
 * 本ファイル内の "8px" はすべてタイル内部の flex gap / padding 余白であり、
 * tile-grid.ts の TILE_GAP_PX（タイル間の外側マージン 8px）とは別概念。
 *
 * Phase 8.1 cycle-207 T-3
 */

/** debounce 遅延時間（ms）。入力停止後この時間が経過してから QR を生成する */
const DEBOUNCE_MS = 300;

/** 誤り訂正レベル（タイルは M 固定、詳細ページで L/M/Q/H を選択可能） */
const ERROR_CORRECTION_LEVEL = "M" as const;

export default function QrCodeTile() {
  const [input, setInput] = useState("");
  const [svgTag, setSvgTag] = useState("");
  const [dataUrl, setDataUrl] = useState("");

  // cycle-205 で確立した useEffect cleanup パターンの debounce 派生。
  // input 変更から 300ms 後に QR を生成する。
  // cleanup で前回の setTimeout をキャンセルすることで連続入力時の再描画を抑制する。
  useEffect(() => {
    const timerId = setTimeout(() => {
      if (!input.trim()) {
        setSvgTag("");
        setDataUrl("");
        return;
      }
      const result = generateQrCode(input, ERROR_CORRECTION_LEVEL);
      if (result.success) {
        setSvgTag(result.svgTag);
        setDataUrl(result.dataUrl);
      } else {
        // エラー時はプレビューをクリア（エラー文言はタイル内に表示しない）
        setSvgTag("");
        setDataUrl("");
      }
    }, DEBOUNCE_MS);

    // cleanup: 次の effect 実行前（またはアンマウント時）に前回の timer をキャンセル
    return () => clearTimeout(timerId);
  }, [input]);

  const handleDownload = useCallback(() => {
    if (!dataUrl) return;
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = "qrcode.png";
    link.click();
  }, [dataUrl]);

  // aria-label 動的化: 入力ありなら「{input.slice(0, 30)} の QR コード」、空なら固定文言
  const previewAriaLabel = input.trim()
    ? `「${input.slice(0, 30)}」の QR コード`
    : "QR コードプレビューエリア";

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
        QR コード生成
      </p>

      {/* テキスト入力欄
           rows={2} 固定 + flexShrink: 0 で「入力欄を潰さない」設計。【AP-P21 対応】
           画像出力型固有の設計として、SVG プレビューコンテナが flex: 1 で拡張する。
           onChange + debounce 300ms で入力停止後に QR を自動生成する。 */}
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
        placeholder="URL またはテキストを入力すると QR が自動生成されます"
        rows={2}
        aria-label="QR コード入力欄"
      />

      {/* SVG プレビューコンテナ（AP-P21 画像出力型適応）
           flex: "0 0 auto" + height: "auto" + aspectRatio: 1 で正方形を維持する。
           flex: 1 では height がフレックス残余スペースで膨張し aspect-ratio が無効化されるため採用不可。
           maxWidth: 226px はタイル 400px から他要素（title 20 + textarea 46 + button 31 + link 20 +
           padding 24 + gap 32）を差し引いた上限（≈ 227px）から逆算し、全要素がタイル内に収まる設定。
           最小高さ 150px（QR 読み取り可能な物理 2cm 相当）を保持。
           背景 #fff 固定: QR は白背景が読み取り精度要件。
           aria-live="polite" で SVG 更新を支援技術に通知する。
           入力なし時: 「入力を待っています」の文言を表示。 */}
      <div
        role="status"
        aria-live="polite"
        aria-label={previewAriaLabel}
        style={{
          // aspect-ratio: 1 で正方形を維持する（AP-P21 画像出力型適応判定基準 iv）。
          // flex: 1 を使うと height がフレックス残余スペースで膨張し aspect-ratio が無効化される
          // ため、flex: "0 0 auto" + height: "auto" にして幅から高さを aspect-ratio で導出する。
          // maxWidth: 226px はタイル内の他要素（title/textarea/button/link + gap/padding）と
          // 合計で 400px タイル高さに収まる上限（400 - 24(padding) - 32(gap) - 20(title)
          // - 46(textarea) - 31(button) - 20(link) ≈ 227px）から逆算。
          flex: "0 0 auto",
          height: "auto",
          aspectRatio: "1",
          width: "100%",
          maxWidth: "226px",
          minHeight: "150px",
          backgroundColor: "#fff",
          borderRadius: "4px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          alignSelf: "center",
          boxSizing: "border-box",
        }}
      >
        {svgTag ? (
          // SVG を直接 innerHTML として描画（QR コード SVG は信頼できるロジックから生成）
          <div
            style={{ maxWidth: "100%", height: "auto", display: "block" }}
            dangerouslySetInnerHTML={{ __html: svgTag }}
          />
        ) : (
          <p
            style={{
              margin: 0,
              fontSize: "0.75rem",
              color: "var(--fg-soft)",
              textAlign: "center",
              padding: "8px",
            }}
          >
            入力を待っています
          </p>
        )}
      </div>

      {/* DL ボタン（AP-P21 flexShrink: 0 でタイル下端固定）
           入力なし（dataUrl が空）は disabled にして操作を防止する。
           handleDownload は <a> 要素を動的生成して download=qrcode.png で PNG を保存する。 */}
      <button
        type="button"
        onClick={handleDownload}
        disabled={!dataUrl}
        style={{
          flexShrink: 0,
          padding: "6px 12px",
          borderRadius: "4px",
          border: "1px solid var(--border, var(--fg-soft))",
          backgroundColor: dataUrl ? "var(--accent)" : "transparent",
          color: dataUrl ? "var(--bg)" : "var(--fg-soft)",
          cursor: dataUrl ? "pointer" : "not-allowed",
          fontSize: "0.8rem",
          fontFamily: "inherit",
          fontWeight: 500,
          opacity: dataUrl ? 1 : 0.5,
          transition: "background-color 0.15s, color 0.15s",
        }}
      >
        PNG形式でダウンロード
      </button>

      {/* 詳細ページへのリンク（誤り訂正レベル選択・サイズ変更等は詳細ページの責務） */}
      <Link
        href="/tools/qr-code"
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
