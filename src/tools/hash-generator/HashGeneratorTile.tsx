"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { generateHash } from "./logic";
import type { HashAlgorithm } from "./logic";

/**
 * ハッシュ生成 タイル用簡素 UI（kind=widget）。
 *
 * 詳細ページ Component.tsx（textarea + アルゴリズム select + 手動ボタン + 4 件分結果カード
 * + hex/base64 切替）とは別に、タイルサイズ（cols=3 rows=2 = 400×264px）に最適化した
 * 簡素版 UI。ロジックは詳細ページと同じ logic.ts の generateHash() を再利用。
 *
 * 特徴（Base64Tile / HtmlEntityTile との差分）:
 * - アルゴリズムセグメントコントロール（SHA-1 / SHA-256 / SHA-384 / SHA-512 の 4 択）
 * - デフォルトは SHA-256（現代 Web で最も需要が高い）
 * - 出力は hex 固定（base64 切替は詳細ページの責務）
 * - 変換トリガはリアルタイム反映（onChange + セグメント切替で即時計算）
 * - crypto.subtle.digest() による非同期計算（< 1ms / < 1KB 入力）
 * - loading state なし（< 1 秒の処理に loading を出さない UX 業界標準に準拠）
 *
 * 非同期処理の race condition 対策:
 * - useEffect の cleanup フラグ（let ignore = false; return () => { ignore = true; }）で
 *   古い Promise 解決を破棄する。AbortController は SubtleCrypto.digest() が
 *   AbortSignal 引数を受け取らない仕様のため不採用。
 *
 * エラーハンドリング:
 * - crypto.subtle が undefined（HTTP 環境 / レガシーブラウザ）または digest が
 *   reject した場合、英語 JS エラーを表示せず日本語フォールバック文言を --fg-soft で表示。
 * - Base64Tile / HtmlEntityTile の統一表示パターン（--fg-soft + 日本語文言 + 控えめ表示）
 *   に倣う。
 *
 * 【AP-P21 対応】膨張ゼロ型でも役割分担パターンを継続採用:
 * - textarea を rows=2 + flexShrink: 0 で「入力欄を潰さない」設計
 * - 結果欄を flex: 1 + overflowY: auto で「結果膨張を結果欄内でスクロール」設計
 * hash-generator は SHA-512 = 128 hex 文字の固定長出力で、入力長によらず一定のため
 * 「膨張ゼロ型」だが、cycle-200〜204 で 5 連続適用済の CSS 構造を踏襲して一貫性を維持する
 * （cycle-204 キャリーオーバー: 「役割分担パターン採用 + T-4 計測は運用標準として継続」）。
 *
 * CSS はデザイントークン（--fg / --bg / --bg-soft / --accent / --fg-soft / --border）を
 * 使用した inline style で実装。
 * tsx による codegen (generate-tiles-registry.ts) が CSS Module を解釈できないため、
 * tile-declarations.ts から import する本コンポーネントは CSS Module を使用しない。
 *
 * 【8px について】
 * 本ファイル内の "8px" はすべてタイル内部の flex gap / padding 余白であり、
 * tile-grid.ts の TILE_GAP_PX（タイル間の外側マージン 8px）とは別概念。
 *
 * Phase 8.1 cycle-205 T-3
 */

/** タイルに表示するアルゴリズムの選択肢（4 択） */
const ALGORITHMS: HashAlgorithm[] = ["SHA-1", "SHA-256", "SHA-384", "SHA-512"];

/** crypto.subtle API が利用可能かどうかを確認する */
function isCryptoAvailable(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.crypto !== "undefined" &&
    typeof window.crypto.subtle !== "undefined"
  );
}

/** フォールバック文言: 非対応環境で --fg-soft 色で表示する */
const FALLBACK_MESSAGE = "お使いの環境では計算できません";

export default function HashGeneratorTile() {
  const [input, setInput] = useState("");
  const [algorithm, setAlgorithm] = useState<HashAlgorithm>("SHA-256");
  // null = 未入力（空欄表示）/ string = ハッシュ値またはエラー文言
  const [result, setResult] = useState<string | null>(null);
  // エラー状態かどうか（フォールバック文言を --fg-soft 色で表示するために使用）
  const [isError, setIsError] = useState(false);

  // input または algorithm が変わるたびに非同期ハッシュ計算を実行する
  // race condition 対策: cleanup フラグで古い Promise 解決を破棄する
  // （AbortController は SubtleCrypto.digest() が AbortSignal 非対応のため不採用）
  useEffect(() => {
    let ignore = false;

    // すべての分岐（空入力 / crypto 非対応 / 正常計算 / エラー）を
    // Promise チェーンに統一することで、effect 内の同期 setState を回避する
    const computeHash = (): Promise<{
      hash: string | null;
      error: boolean;
    }> => {
      if (input === "") {
        // 空入力: 結果欄を空にする
        return Promise.resolve({ hash: null, error: false });
      }
      if (!isCryptoAvailable()) {
        // crypto.subtle 非対応環境: 日本語フォールバック文言を返す
        return Promise.resolve({ hash: FALLBACK_MESSAGE, error: true });
      }
      // 正常系: generateHash で非同期ハッシュ計算
      return generateHash(input, algorithm, "hex")
        .then((hash) => ({ hash, error: false }))
        .catch(() => ({
          // digest が reject した場合（NotSupportedError / OperationError 等）
          // 英語 JS エラーを visitor に直接見せず、日本語フォールバック文言を表示
          hash: FALLBACK_MESSAGE,
          error: true,
        }));
    };

    computeHash().then(({ hash, error }) => {
      if (!ignore) {
        setResult(hash);
        setIsError(error);
      }
    });

    return () => {
      ignore = true;
    };
  }, [input, algorithm]);

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
        ハッシュ生成
      </p>

      {/* アルゴリズムセグメントコントロール: SHA-1 / SHA-256 / SHA-384 / SHA-512 の 4 択 */}
      <div
        style={{
          display: "flex",
          gap: "4px",
        }}
        role="group"
        aria-label="ハッシュアルゴリズム"
      >
        {ALGORITHMS.map((algo) => (
          <button
            key={algo}
            type="button"
            aria-pressed={algorithm === algo}
            onClick={() => setAlgorithm(algo)}
            style={{
              padding: "2px 8px",
              fontSize: "0.7rem",
              borderRadius: "4px",
              border: "1px solid var(--border, var(--fg-soft))",
              backgroundColor:
                algorithm === algo ? "var(--accent)" : "transparent",
              color: algorithm === algo ? "var(--bg)" : "var(--fg)",
              cursor: "pointer",
              fontFamily: "inherit",
              fontWeight: algorithm === algo ? 600 : 400,
              whiteSpace: "nowrap",
            }}
          >
            {algo}
          </button>
        ))}
      </div>

      {/* テキスト入力欄
           rows={2} 固定 + flexShrink: 0 で「入力欄を潰さない」設計。【AP-P21 対応】
           hash-generator は膨張ゼロ型（出力固定長）だが、cycle-200〜204 で 5 連続適用済の
           CSS 構造を踏襲して一貫性を維持する（cycle-204 キャリーオーバー遵守）。
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
        placeholder="テキストを入力するとハッシュ値を計算します"
        rows={2}
        aria-label="ハッシュ生成入力欄"
      />

      {/* ハッシュ結果表示エリア（読み取り専用）
           flex: 1 で残りスペースを占有し、overflowY: auto で枠内スクロール。【AP-P21 対応】
           SHA-512 = 128 hex 文字の固定長出力でも枠内に確実に収めるため
           overflow-wrap: break-word + word-break: break-all を適用。
           エラー時（crypto.subtle 非対応 / digest reject）は --fg-soft で控えめに表示。
           aria-live="polite" で非同期計算完了を支援技術に通知する。 */}
      <div
        role="status"
        aria-live="polite"
        style={{
          flex: 1,
          fontSize: "0.8rem",
          fontFamily:
            "ui-monospace, SFMono-Regular, 'SF Mono', Consolas, 'Liberation Mono', Menlo, monospace",
          wordBreak: "break-all",
          overflowWrap: "break-word",
          overflowY: "auto",
          color: isError ? "var(--fg-soft)" : "var(--fg)",
          opacity: 0.85,
        }}
      >
        {result === null ? "" : result}
      </div>

      {/* 詳細ページへのリンク（hex/base64 切替・4 種並列表示は詳細ページの責務） */}
      <Link
        href="/tools/hash-generator"
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
