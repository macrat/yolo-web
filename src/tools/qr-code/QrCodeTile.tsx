"use client";

/**
 * QrCodeTile — QRコード生成ツールの単一正典タイル
 *
 * cycle-228 T-25 で QrCodePage.tsx を Panel ルートのタイルへ作り直したもの。
 *
 * ## 設計原則
 *
 * - **タイル = ツール実装そのもののルート**: 最上位要素が <Panel>。外部ラッパーなし。
 * - **1ツール 1 タイル**: QR コード生成は full のみ（固定 variant を無理に作らない）。
 * - **id インスタンス一意化**: useId ベースで生成し、複数インスタンスが同一ページに
 *   同居しても id 重複・label 誤結合が起きない。
 * - **ToolPageLayout 非依存**: タイル単体で機能が完結する。
 * - **logic.ts 共有エンジン**: generateQrCode が唯一のロジック源。
 * - **debounce（D-4）**: 300ms debounce の setTimeout ID を useRef で保持し
 *   cleanup で解除する。連続入力で古い生成結果が上書きしない。
 *
 * ## variant
 *
 * - `"full"` (デフォルト・唯一): テキスト入力 + 誤り訂正レベル Select +
 *   SVG プレビュー + PNG ダウンロード。固定 variant は無理にひねり出さない。
 *
 * ## アクセシビリティ（C-3 準拠）
 *
 * - role="status" aria-live="polite" の div に実テキストノードのサマリを置く
 * - QR SVG には role="img" aria-label を設定する
 */

import { useId, useState, useCallback, useEffect, useRef } from "react";
import Panel from "@/components/Panel";
import Button from "@/components/Button";
import Textarea from "@/components/Textarea";
import Select from "@/components/Select";
import ErrorMessage from "@/components/ErrorMessage";
import { generateQrCode, type ErrorCorrectionLevel } from "./logic";
import styles from "./QrCodeTile.module.css";

/** debounce 遅延時間（ms）。入力停止後この時間が経過してから QR を生成する */
const DEBOUNCE_MS = 300;

/** variant prop: 表示バリエーションの設定差。現状 full のみ。 */
export type QrCodeTileVariant = "full";

export interface QrCodeTileProps {
  /**
   * 表示バリエーション（デフォルト: "full"）
   * QR コード生成は full のみで十分。固定 variant は無理に作らない。
   */
  variant?: QrCodeTileVariant;
  /** Panel の as prop に透過される HTML タグ（デフォルト: "section"） */
  as?: "section" | "div" | "article" | "aside";
  /** 追加クラス */
  className?: string;
}

export default function QrCodeTile({
  // variant は現在 "full" のみ。将来の拡張性のため prop を受け取るが内部処理は分岐なし。
  variant = "full", // eslint-disable-line @typescript-eslint/no-unused-vars
  as = "section",
  className,
}: QrCodeTileProps = {}) {
  // ---------- id インスタンス一意化（複数同居時の重複 id・label 誤結合防止） ----------
  const uid = useId();
  const inputId = `${uid}-input`;
  const ecLevelId = `${uid}-ec-level`;

  // ---------- State ----------
  const [input, setInput] = useState("");
  const [errorCorrection, setErrorCorrection] =
    useState<ErrorCorrectionLevel>("M");
  const [svgTag, setSvgTag] = useState("");
  const [dataUrl, setDataUrl] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  // C-3: ライブリージョン用サマリテキスト（実テキストノード）
  const [statusSummary, setStatusSummary] = useState("");

  // AP-I11: debounce タイマー ID を useRef で保持し、cleanup で clearTimeout する（D-4）
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ---------- debounce による QR 生成 ----------
  useEffect(() => {
    // 前回のタイマーをキャンセル（debounce + cleanup）
    if (debounceRef.current !== null) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      setErrorMessage(null);
      if (!input.trim()) {
        setSvgTag("");
        setDataUrl("");
        setStatusSummary("");
        return;
      }
      const result = generateQrCode(input, errorCorrection);
      if (result.success) {
        setSvgTag(result.svgTag);
        setDataUrl(result.dataUrl);
        // C-3: 生成成功の実テキストサマリ
        setStatusSummary("QRコードを生成しました");
      } else {
        // A-4: logic.ts が返す英語エラーを日本語に変換して ErrorMessage に渡す
        const jaError = toJapaneseError(result.error);
        setErrorMessage(jaError);
        setSvgTag("");
        setDataUrl("");
        setStatusSummary("");
      }
    }, DEBOUNCE_MS);

    return () => {
      if (debounceRef.current !== null) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [input, errorCorrection]);

  // ---------- ハンドラ ----------
  const handleDownload = useCallback(() => {
    if (!dataUrl) return;
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = "qrcode.png";
    link.click();
  }, [dataUrl]);

  // ---------- Render ----------
  // タイルのルートが Panel（= DESIGN.md §1 パネル準拠・タイル = ツール実装そのもの）
  return (
    <Panel as={as} className={className}>
      {/* テキスト入力欄 */}
      <div className={styles.field}>
        <label htmlFor={inputId} className={styles.label}>
          テキストまたはURL
        </label>
        <Textarea
          id={inputId}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="URLまたはテキストを入力すると自動でQRが生成されます"
          rows={3}
          spellCheck={false}
        />
      </div>

      {/* エラー訂正レベル選択 */}
      <div className={styles.controls}>
        <div className={styles.ecControl}>
          <label htmlFor={ecLevelId} className={styles.controlLabel}>
            エラー訂正:
          </label>
          <Select
            id={ecLevelId}
            value={errorCorrection}
            onChange={(e) =>
              setErrorCorrection(e.target.value as ErrorCorrectionLevel)
            }
          >
            <option value="L">低 (L: 7%)</option>
            <option value="M">中 (M: 15%)</option>
            <option value="Q">高 (Q: 25%)</option>
            <option value="H">最高 (H: 30%)</option>
          </Select>
        </div>
      </div>

      {/* エラー表示（A-4: 日本語メッセージを ErrorMessage 経由で表示） */}
      {errorMessage && <ErrorMessage message={errorMessage} />}

      {/* C-3: ライブリージョン - 実テキストノードのサマリ（readOnly textarea ラップ不可）
       * QR 画像自体が視覚フィードバックになっているため、サマリは visually-hidden で
       * スクリーンリーダーへの通知のみに使う。 */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="visually-hidden"
      >
        {statusSummary}
      </div>

      {/* QR コードプレビューと操作 */}
      <div className={styles.result}>
        {svgTag ? (
          /* QR SVG プレビュー（白背景で読み取り精度を確保） */
          <div
            className={styles.qrImage}
            dangerouslySetInnerHTML={{ __html: svgTag }}
            role="img"
            aria-label={`「${input.slice(0, 40)}」のQRコード`}
          />
        ) : (
          !errorMessage && (
            <p className={styles.placeholder}>
              {input.trim()
                ? "QRコードを生成中..."
                : "入力するとQRコードが表示されます"}
            </p>
          )
        )}

        {/* PNG ダウンロードボタン（T-4b: download 主体のためコピーボタンなし）
         * DESIGN.md L82「ボタンやフォームなどのUIコンポーネントは src/components/ にあるものを使う」 */}
        <Button variant="primary" onClick={handleDownload} disabled={!dataUrl}>
          PNG形式でダウンロード
        </Button>
      </div>
    </Panel>
  );
}

/**
 * logic.ts が返す英語エラーメッセージを日本語に変換する。
 * A-4: ErrorMessage に渡す message は必ず日本語であること。
 */
function toJapaneseError(error: string | undefined): string {
  if (!error) return "QRコードの生成中にエラーが発生しました。";
  if (error.includes("too long") || error.includes("Too long")) {
    return "テキストが長すぎます。短くしてから再度お試しください。";
  }
  if (error.includes("empty") || error.includes("Empty")) {
    return "テキストを入力してください。";
  }
  if (error.includes("context") || error.includes("Context")) {
    return "QRコードの生成中にエラーが発生しました。ブラウザの設定を確認してください。";
  }
  // その他の英語エラー: 日本語フォールバック
  return "QRコードの生成中にエラーが発生しました。入力内容を確認してください。";
}
