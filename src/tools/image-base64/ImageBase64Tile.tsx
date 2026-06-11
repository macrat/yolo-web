"use client";

/**
 * ImageBase64Tile — 画像 Base64 変換の単一正典タイル
 *
 * cycle-228 T-26: ImageBase64Page.tsx を Panel ルートのタイルへ再実装。
 *
 * ## 設計原則
 *
 * - **タイル = ツール実装そのもののルート**: 最上位要素が <Panel>。外部ラッパーなし。
 * - **1ツール n タイル = variant**: full / encode / decode は同一コンポーネントの
 *   設定差で表現。別実装を作らない（分裂ゼロ）。
 * - **id インスタンス一意化**: useId ベースで生成し、複数インスタンスが同一ページに
 *   同居しても id 重複・label 誤結合が起きない。
 * - **ToolPageLayout 非依存**: タイル単体で機能が完結する。
 * - **logic.ts 共有エンジン**: fileToBase64 / parseBase64Image が唯一のロジック源。
 *
 * ## variant
 *
 * - `"full"` (デフォルト): 方向トグル（SegmentedControl）を表示し
 *   encode / decode をユーザーが切り替えられる。
 * - `"encode"`: 方向を encode に固定し、SegmentedControl を非表示にする。
 *   T-31 で道具箱に恒久展示されるファイル I/O 系の代表として「画像 → Base64」の
 *   変換器として一目で分かる構成にする。
 * - `"decode"`: 方向を decode に固定し、SegmentedControl を非表示にする。
 *
 * ## 非同期安全性（D-4 準拠）
 *
 * FileReader は Promise ベースではなくコールバックベースのため、アンマウント後に
 * onload が呼ばれると setState が実行されてメモリリークや警告の原因になる。
 * 世代カウンタ（generationRef）を使って古い FileReader 読み込み結果を無視する。
 * 連続ドロップ時も前の読み込み結果が後の結果を上書きしない。
 *
 * ## アクセシビリティ（C-3 準拠）
 *
 * - エンコード出力の readOnly textarea は role="status" 対象外。
 * - 別途 srOnly の role="status" aria-live="polite" div にサマリを置く。
 * - 画像プレビューには alt テキストを付与。
 */

import { useId, useState, useCallback, useRef } from "react";
import Panel from "@/components/Panel";
import Button from "@/components/Button";
import SegmentedControl from "@/components/SegmentedControl";
import Textarea from "@/components/Textarea";
import ErrorMessage from "@/components/ErrorMessage";
import FileDropZone from "@/components/FileDropZone";
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
import styles from "./ImageBase64Tile.module.css";

/** エンコード / デコードの変換モード */
type TabMode = "encode" | "decode";

/** モード切替の選択肢 */
const MODE_OPTIONS: { label: string; value: TabMode }[] = [
  { label: "画像 → Base64", value: "encode" },
  { label: "Base64 → 画像", value: "decode" },
];

/** ファイルサイズ上限（10MB） */
const MAX_FILE_SIZE = 10 * 1024 * 1024;

/** variant prop: 表示バリエーションの設定差。別実装ではない。 */
export type ImageBase64TileVariant = "full" | "encode" | "decode";

export interface ImageBase64TileProps {
  /**
   * 表示バリエーション（デフォルト: "full"）
   * - "full": 方向トグル表示（encode / decode をユーザーが切り替え）
   * - "encode": 方向を encode に固定、方向トグル非表示
   * - "decode": 方向を decode に固定、方向トグル非表示
   */
  variant?: ImageBase64TileVariant;
  /** Panel の as prop に透過される HTML タグ（デフォルト: "section"） */
  as?: "section" | "div" | "article" | "aside";
  /** 追加クラス */
  className?: string;
}

export default function ImageBase64Tile({
  variant = "full",
  as = "section",
  className,
}: ImageBase64TileProps = {}) {
  // ---------- id インスタンス一意化（複数同居時の重複 id・label 誤結合防止） ----------
  const uid = useId();
  const base64OutputId = `${uid}-base64-output`;
  const dataUriOutputId = `${uid}-datauri-output`;
  const decodeInputId = `${uid}-decode-input`;

  // ---------- variant から初期モードを決定 ----------
  // "full" は初期値 encode で、ユーザーが切り替え可能。
  // "encode" / "decode" は固定（ユーザーが変更できない）。
  const fixedMode: TabMode | null =
    variant === "encode" ? "encode" : variant === "decode" ? "decode" : null;

  // ---------- State ----------
  const [dynamicMode, setDynamicMode] = useState<TabMode>("encode");

  // 実際に使うモード: fixed があればそれを使い、なければ state を使う
  const mode = fixedMode ?? dynamicMode;

  // エンコードモードの状態
  const [base64Result, setBase64Result] = useState<ImageBase64Result | null>(
    null,
  );
  const [encodeError, setEncodeError] = useState("");
  // C-3: スクリーンリーダーへ通知するための短いサマリテキスト
  const [encodeSummary, setEncodeSummary] = useState("");

  // デコードモードの状態
  const [decodeInput, setDecodeInput] = useState("");
  const [parsedImage, setParsedImage] = useState<ParsedImage | null>(null);
  const [decodeError, setDecodeError] = useState("");

  // コピーフック（Base64 と Data URI を別キーで管理）
  const { copy, copiedKey } = useCopyToClipboard();

  // ---------- 世代カウンタ（D-4: アンマウント後 setState 防止・連続ドロップ対策） ----------
  // FileReader は非同期コールバックベースのため、アンマウント後や
  // 連続ドロップ時に古い結果が setState されないよう世代で管理する。
  const generationRef = useRef(0);

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
    // 世代カウントを進める（連続ドロップ・アンマウント対策）
    const currentGeneration = ++generationRef.current;
    try {
      const result = await fileToBase64(file);
      // 世代が一致する場合のみ setState（古い結果の上書き防止）
      if (currentGeneration === generationRef.current) {
        setBase64Result(result);
        // C-3: 変換成功サマリを role="status" 領域に実テキストとして配置
        setEncodeSummary(
          `Base64に変換しました。元サイズ ${formatFileSize(result.originalSize)}、Base64サイズ ${formatFileSize(result.base64Size)}、MIMEタイプ ${result.mimeType}`,
        );
      }
    } catch (e) {
      if (currentGeneration === generationRef.current) {
        setEncodeError(e instanceof Error ? e.message : "エラーが発生しました");
      }
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

  // ===== モード切替ハンドラ（variant="full" のみ有効） =====

  const handleModeChange = useCallback((value: string) => {
    setDynamicMode(value as TabMode);
    // G-1: モード切替時に古い結果をリセット
    setEncodeError("");
    setDecodeError("");
    setEncodeSummary("");
    setBase64Result(null);
    setParsedImage(null);
  }, []);

  // ---------- Render ----------
  // タイルのルートが Panel（= DESIGN.md §1 パネル準拠・タイル = ツール実装そのもの）
  return (
    <Panel as={as} className={className}>
      {/* variant=full のみ方向トグルを表示。encode/decode は固定のため非表示。 */}
      {fixedMode === null && (
        <div className={styles.controls}>
          <SegmentedControl
            options={MODE_OPTIONS}
            value={dynamicMode}
            onChange={handleModeChange}
            aria-label="変換モード"
          />
        </div>
      )}

      {/* エンコードモード */}
      {mode === "encode" && (
        <div className={styles.encodePanel}>
          {/* FileDropZone でファイルのドラッグ&ドロップ
           *  maxSizeBytes: 10MB 上限 / onError で日本語エラーメッセージを受け取る */}
          <FileDropZone
            onFileSelect={handleFileSelect}
            onError={handleFileError}
            maxSizeBytes={MAX_FILE_SIZE}
            accept="image/*"
            description="PNG, JPEG, GIF, WebP 対応（最大10MB）"
          />

          {/* エラー表示 */}
          {encodeError && <ErrorMessage message={encodeError} />}

          {/* 結果表示エリア（ファイル選択後） */}
          {base64Result && (
            <div className={styles.resultArea}>
              {/* C-3: role="status" aria-live="polite" で動的通知。
                  実テキストノード（サマリ）を置くことでスクリーンリーダーに変化を通知する。
                  readOnly textarea をラップするだけでは値変化が読み上げられないため分離する。
                  srOnly で視覚的に隠し SR のみに読ませる。 */}
              <div
                role="status"
                aria-live="polite"
                aria-atomic="true"
                className={styles.srOnly}
              >
                {encodeSummary}
              </div>

              {/* 画像プレビュー */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={base64Result.dataUri}
                alt="プレビュー"
                className={styles.preview}
              />

              {/* サイズ情報 */}
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
                  <label
                    htmlFor={base64OutputId}
                    className={styles.outputLabel}
                  >
                    Base64
                  </label>
                  <Button
                    size="small"
                    onClick={() => copy(base64Result.base64, "base64")}
                  >
                    {copiedKey === "base64" ? COPIED_LABEL : "コピー"}
                  </Button>
                </div>
                {/* A-1: Textarea "mono" バリアント。role=status は textarea に直付与しない（C-3 禁止パターン）。 */}
                <Textarea
                  id={base64OutputId}
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
                    htmlFor={dataUriOutputId}
                    className={styles.outputLabel}
                  >
                    Data URI
                  </label>
                  <Button
                    size="small"
                    onClick={() => copy(base64Result.dataUri, "datauri")}
                  >
                    {copiedKey === "datauri" ? COPIED_LABEL : "コピー"}
                  </Button>
                </div>
                <Textarea
                  id={dataUriOutputId}
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

      {/* デコードモード */}
      {mode === "decode" && (
        <div className={styles.decodePanel}>
          <div className={styles.outputGroup}>
            <label htmlFor={decodeInputId} className={styles.outputLabel}>
              Base64文字列またはData URI
            </label>
            <Textarea
              id={decodeInputId}
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

          {/* エラー表示 */}
          {decodeError && <ErrorMessage message={decodeError} />}

          {/* デコード結果 */}
          {parsedImage && (
            <div className={styles.resultArea} role="status" aria-live="polite">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={parsedImage.dataUri}
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
    </Panel>
  );
}
