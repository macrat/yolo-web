"use client";

import { useState, useCallback } from "react";
import SegmentedControl from "@/components/SegmentedControl";
import FileDropZone from "@/components/FileDropZone";
import Textarea from "@/components/Textarea";
import Button from "@/components/Button";
import ErrorMessage from "@/components/ErrorMessage";
import {
  useCopyToClipboard,
  COPIED_LABEL,
} from "@/components/hooks/useCopyToClipboard";
import {
  fileToBase64,
  parseBase64Image,
  formatFileSize,
  type ImageBase64Result,
  type ParsedImage,
} from "./logic";
import styles from "./ImageBase64Page.module.css";

/** エンコード / デコードの変換モード */
type TabMode = "encode" | "decode";

/** モード切替の選択肢 */
const MODE_OPTIONS: { label: string; value: TabMode }[] = [
  { label: "画像 → Base64", value: "encode" },
  { label: "Base64 → 画像", value: "decode" },
];

/** ファイルサイズ上限（10MB） */
const MAX_FILE_SIZE = 10 * 1024 * 1024;

/**
 * ImageBase64Page — 画像Base64変換ツールのフル機能実装。
 *
 * 機能:
 * - エンコードモード: FileDropZone で画像を選択し、Base64文字列と Data URI を出力。
 *   画像プレビュー・MIMEタイプ・元サイズ・Base64サイズを表示。
 *   Base64・Data URI のコピーボタン（useCopyToClipboard）。
 * - デコードモード: Base64文字列または Data URI から画像をプレビュー表示・ダウンロード。
 *   MIMEタイプ表示。SVG は XSS 対策で拒否。
 *
 * 共通部品:
 * - SegmentedControl: エンコード/デコードのモード切替（A-3）
 * - FileDropZone: 画像ファイルのドラッグ&ドロップ（A-5）
 * - Textarea: 入出力テキストエリア（A-1）
 * - Button: プレビューボタン（共通 Button）
 * - ErrorMessage: エラー表示（A-4）
 * - useCopyToClipboard: コピーボタン（A-6）
 *
 * WCAG AA:
 * - SegmentedControl に aria-label="変換モード"（C-2）
 * - エンコード結果エリアに独立した role="status" aria-live="polite" div（C-3）
 *   readOnly textarea に role=status を直付与するパターンは禁止（値変化が SR に読まれない）
 */
export default function ImageBase64Page() {
  const [mode, setMode] = useState<TabMode>("encode");

  // エンコードモードの状態
  const [base64Result, setBase64Result] = useState<ImageBase64Result | null>(
    null,
  );
  const [encodeError, setEncodeError] = useState("");
  // C-3: スクリーンリーダーへ通知するための短いサマリテキスト
  // role="status" aria-live="polite" 領域に実テキストとして配置する（json-formatter パターン）
  const [encodeSummary, setEncodeSummary] = useState("");

  // デコードモードの状態
  const [decodeInput, setDecodeInput] = useState("");
  const [parsedImage, setParsedImage] = useState<ParsedImage | null>(null);
  const [decodeError, setDecodeError] = useState("");

  // コピーフック（Base64と Data URI を別キーで管理）
  const { copy, copiedKey } = useCopyToClipboard();

  // ===== エンコードモード ハンドラ =====

  /** FileDropZone からファイルを受け取りエンコード処理する */
  const handleFileSelect = useCallback(async (file: File) => {
    setEncodeError("");
    setBase64Result(null);
    setEncodeSummary("");
    if (!file.type.startsWith("image/")) {
      setEncodeError("画像ファイルを選択してください");
      return;
    }
    try {
      const result = await fileToBase64(file);
      setBase64Result(result);
      // C-3: 変換成功サマリを role="status" 領域に実テキストとして配置
      setEncodeSummary(
        `Base64に変換しました。元サイズ ${formatFileSize(result.originalSize)}、Base64サイズ ${formatFileSize(result.base64Size)}、MIMEタイプ ${result.mimeType}`,
      );
    } catch (e) {
      setEncodeError(e instanceof Error ? e.message : "エラーが発生しました");
    }
  }, []);

  /** FileDropZone からのサイズ超過エラーを受け取る */
  const handleFileError = useCallback((message: string) => {
    setEncodeError(message);
    setBase64Result(null);
    setEncodeSummary("");
  }, []);

  // ===== デコードモード ハンドラ =====

  /** Base64 / Data URI から画像をデコードしてプレビュー表示する */
  const handleDecode = useCallback(() => {
    setDecodeError("");
    setParsedImage(null);
    if (!decodeInput.trim()) {
      setDecodeError("Base64文字列を入力してください");
      return;
    }
    const parsed = parseBase64Image(decodeInput);
    if (parsed && parsed.dataUri.startsWith("data:image/")) {
      setParsedImage(parsed);
    } else {
      setDecodeError("有効なBase64画像データではありません");
    }
  }, [decodeInput]);

  // ===== ダウンロードハンドラ =====

  /**
   * qr-code と同じパターン: <a> を動的生成してクリックすることでダウンロードする。
   * これにより Button コンポーネントを再利用でき、スタイルの手動複製を避けられる。
   */
  const handleDownload = useCallback((dataUri: string, mimeType: string) => {
    const ext = mimeType.split("/")[1]?.replace("+xml", "") || "png";
    const link = document.createElement("a");
    link.href = dataUri;
    link.download = `image.${ext}`;
    link.click();
  }, []);

  // ===== モード切替ハンドラ =====

  const handleModeChange = useCallback((value: string) => {
    setMode(value as TabMode);
    // モード切替時にエラーとサマリをリセット
    setEncodeError("");
    setDecodeError("");
    setEncodeSummary("");
  }, []);

  return (
    <div className={styles.container}>
      {/* A-3: SegmentedControl でモード切替 / C-2: aria-label="変換モード" 必須 */}
      <SegmentedControl
        options={MODE_OPTIONS}
        value={mode}
        onChange={handleModeChange}
        aria-label="変換モード"
      />

      {/* エンコードモード */}
      {mode === "encode" && (
        <div className={styles.encodePanel}>
          {/* A-5: FileDropZone でファイルのドラッグ&ドロップ
           *  maxSizeBytes: 10MB 上限 / onError で日本語エラーメッセージを受け取る
           *  N-A1: border を --border-strong に統一（FileDropZone コンポーネント内で対応済み） */}
          <FileDropZone
            onFileSelect={handleFileSelect}
            onError={handleFileError}
            maxSizeBytes={MAX_FILE_SIZE}
            accept="image/*"
            description="PNG, JPEG, GIF, WebP 対応（最大10MB）"
          />

          {/* A-4: エラー表示 */}
          {encodeError && <ErrorMessage message={encodeError} />}

          {/* 結果表示エリア（ファイル選択後） */}
          {base64Result && (
            <div className={styles.resultArea}>
              {/* C-3: role="status" aria-live="polite" で動的通知。
                  実テキストノード（サマリ）を置くことでスクリーンリーダーに変化を通知する。
                  readOnly textarea をラップするだけでは値変化が読み上げられないため分離する。
                  視覚的には srOnly で隠し、SR のみに読ませる（json-formatter パターン）。 */}
              <div
                role="status"
                aria-live="polite"
                aria-label="変換結果サマリ"
                className={styles.srOnly}
              >
                {encodeSummary}
              </div>

              {/* 画像プレビュー（①-10）*/}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={base64Result.dataUri}
                alt="プレビュー"
                className={styles.preview}
              />

              {/* サイズ情報（①-10）*/}
              <div className={styles.fileInfo}>
                <span>MIMEタイプ: {base64Result.mimeType}</span>
                <span>
                  元サイズ: {formatFileSize(base64Result.originalSize)}
                </span>
                <span>
                  Base64サイズ: {formatFileSize(base64Result.base64Size)}
                </span>
              </div>

              {/* Base64 出力グループ */}
              <div className={styles.outputGroup}>
                <div className={styles.outputHeader}>
                  <label htmlFor="base64-output" className={styles.outputLabel}>
                    Base64
                  </label>
                  {/* A-6: useCopyToClipboard / COPIED_LABEL 使用 */}
                  <Button
                    size="small"
                    onClick={() => copy(base64Result.base64, "base64")}
                  >
                    {copiedKey === "base64" ? COPIED_LABEL : "コピー"}
                  </Button>
                </div>
                {/* A-1: Textarea "mono" バリアント。role=status は textarea に直付与しない（C-3 禁止パターン）。
                    SR 通知は上の独立した role=status div が担う。 */}
                <Textarea
                  id="base64-output"
                  variant="mono"
                  value={base64Result.base64}
                  readOnly
                  rows={4}
                />
              </div>

              {/* Data URI 出力グループ */}
              <div className={styles.outputGroup}>
                <div className={styles.outputHeader}>
                  <label
                    htmlFor="datauri-output"
                    className={styles.outputLabel}
                  >
                    Data URI
                  </label>
                  {/* A-6: useCopyToClipboard / COPIED_LABEL 使用 */}
                  <Button
                    size="small"
                    onClick={() => copy(base64Result.dataUri, "datauri")}
                  >
                    {copiedKey === "datauri" ? COPIED_LABEL : "コピー"}
                  </Button>
                </div>
                {/* A-1: Textarea "mono" バリアント。role=status は textarea に直付与しない（C-3 禁止パターン）。
                    SR 通知は上の独立した role=status div が担う。 */}
                <Textarea
                  id="datauri-output"
                  variant="mono"
                  value={base64Result.dataUri}
                  readOnly
                  rows={4}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* デコードモード（②-4 致命 / B-457 内包: Base64→画像デコード機能のフル復元） */}
      {mode === "decode" && (
        <div className={styles.decodePanel}>
          <div className={styles.outputGroup}>
            <label htmlFor="decode-input" className={styles.outputLabel}>
              Base64文字列またはData URI
            </label>
            {/* A-1: Textarea "mono" バリアント */}
            <Textarea
              id="decode-input"
              variant="mono"
              value={decodeInput}
              onChange={(e) => setDecodeInput(e.target.value)}
              placeholder="data:image/png;base64,iVBOR... または Base64文字列を貼り付け"
              rows={6}
              spellCheck={false}
            />
          </div>

          <div className={styles.previewButtonRow}>
            <Button variant="primary" onClick={handleDecode}>
              プレビュー
            </Button>
          </div>

          {/* A-4: エラー表示 */}
          {decodeError && <ErrorMessage message={decodeError} />}

          {/* デコード結果（②-4: B-457 内包 — デコード機能のフル復元） */}
          {parsedImage && (
            <div className={styles.resultArea} role="status" aria-live="polite">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={parsedImage.dataUri} // ユーザー入力 dataUri、handleDecode() でバリデーション済み（data:image/ 始まりのみ許可）
                alt="デコード結果プレビュー"
                className={styles.preview}
              />
              <div className={styles.fileInfo}>
                <span>MIMEタイプ: {parsedImage.mimeType}</span>
              </div>
              {/* ダウンロードボタン（qr-code と同じ onClick + <a> 動的生成パターン） */}
              <div>
                <Button
                  variant="primary"
                  onClick={() =>
                    handleDownload(parsedImage.dataUri, parsedImage.mimeType)
                  }
                >
                  ダウンロード
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
