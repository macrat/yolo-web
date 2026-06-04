"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Button from "@/components/Button";
import Textarea from "@/components/Textarea";
import Select from "@/components/Select";
import ErrorMessage from "@/components/ErrorMessage";
import { generateQrCode, type ErrorCorrectionLevel } from "./logic";
import styles from "./QrCodePage.module.css";

/** debounce 遅延時間（ms）。入力停止後この時間が経過してから QR を生成する */
const DEBOUNCE_MS = 300;

/**
 * QrCodePage — QRコード生成ツール本体（単一実装）。
 *
 * テキスト・URL を入力し、リアルタイム（300ms debounce）で QR コードを生成する。
 * エラー訂正レベル（L/M/Q/H）を選択可能。
 * 出力は SVG プレビュー + PNG ダウンロード（download 主体。T-4b 方針によりコピーボタンなし）。
 *
 * C-3 準拠: live region（role="status" aria-live="polite"）には
 * readOnly textarea をラップするのではなく、実テキストノードのサマリを配置する。
 *
 * A-4 準拠: エラーメッセージは必ず日本語に変換して ErrorMessage に渡す。
 * logic.ts が返す英語例外メッセージをそのまま渡さない。
 *
 * AP-I11 準拠: debounce タイマーは useRef + useEffect cleanup で管理する。
 */
export default function QrCodePage() {
  const [input, setInput] = useState("");
  const [errorCorrection, setErrorCorrection] =
    useState<ErrorCorrectionLevel>("M");
  const [svgTag, setSvgTag] = useState("");
  const [dataUrl, setDataUrl] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  // C-3: ライブリージョン用サマリテキスト（実テキストノード）
  const [statusSummary, setStatusSummary] = useState("");

  // AP-I11: debounce タイマー ID を useRef で保持し、cleanup で clearTimeout する
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  const handleDownload = useCallback(() => {
    if (!dataUrl) return;
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = "qrcode.png";
    link.click();
  }, [dataUrl]);

  return (
    <div className={styles.container}>
      {/* テキスト入力欄 */}
      <div className={styles.field}>
        <label htmlFor="qr-input" className={styles.label}>
          テキストまたはURL
        </label>
        <Textarea
          id="qr-input"
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
          <label htmlFor="qr-ec" className={styles.controlLabel}>
            エラー訂正:
          </label>
          <Select
            id="qr-ec"
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
       * スクリーンリーダーへの通知のみに使う（reviewer 指摘: minor 改善提案）。 */}
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
         * reviewer 指摘(cycle-225 T-6): 生 <button> ではなく共通 Button コンポーネントを使う。
         * DESIGN.md L82「ボタンやフォームなどのUIコンポーネントは src/components/ にあるものを使う」 */}
        <Button variant="primary" onClick={handleDownload} disabled={!dataUrl}>
          PNG形式でダウンロード
        </Button>
      </div>
    </div>
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
