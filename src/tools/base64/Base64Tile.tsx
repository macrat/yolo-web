"use client";

/**
 * Base64Tile — Base64エンコード/デコードの単一正典タイル
 *
 * cycle-227 T-2 で Base64Tool.tsx を Panel ルートのタイルへ作り直したもの。
 *
 * ## 設計原則
 *
 * - **タイル = ツール実装そのもののルート**: 最上位要素が <Panel>。外部ラッパーなし。
 * - **1ツール n タイル = variant**: full / encode / decode は同一コンポーネントの
 *   設定差で表現。別実装を作らない（分裂ゼロ）。
 * - **id インスタンス一意化**: useId ベースで生成し、複数インスタンスが同一ページに
 *   同居しても id 重複・label 誤結合・aria-describedby 誤結合が起きない。
 * - **ToolPageLayout 非依存**: タイル単体で機能が完結する。
 * - **logic.ts 共有エンジン**: encodeBase64 / decodeBase64 / toUrlSafe が唯一のロジック源。
 *
 * ## variant
 *
 * - `"full"` (デフォルト): 方向トグル（SegmentedControl）を表示し
 *   encode / decode をユーザーが切り替えられる。URL-safe トグルは encode 時のみ表示。
 * - `"encode"`: 方向を encode に固定し、SegmentedControl を非表示にする。URL-safe トグル表示。
 * - `"decode"`: 方向を decode に固定し、SegmentedControl と URL-safe トグルを非表示にする。
 *
 * ## URL-safe トグルの表示ルール
 *
 * decode 時に URL-safe トグルを表示すると「操作しても出力が変わらない」死んだコントロールに
 * なるため、encode 方向の時のみ表示する（full では動的に、encode/decode では静的に制御）。
 *
 * ## 使い方
 *
 * ```tsx
 * // 道具箱や詳細ページから同一エクスポートを描画する（同一性の構造的保証）
 * <Base64Tile variant="full" />
 * <Base64Tile variant="encode" />
 * <Base64Tile variant="decode" />
 * ```
 *
 * ## アクセシビリティ（C-3 準拠）
 *
 * - 出力 textarea は readOnly で表示専用
 * - role="status" aria-live="polite" の div にサマリテキストを置く
 *   （readOnly textarea は値変化をスクリーンリーダーが読み上げないため）
 * - URL-safe 説明文は useId ベースの id で aria-describedby に関連付ける
 *   （複数インスタンス同居時の誤結合防止）
 */

import { useId, useMemo, useState } from "react";
import Panel from "@/components/Panel";
import Button from "@/components/Button";
import SegmentedControl from "@/components/SegmentedControl";
import Textarea from "@/components/Textarea";
import ErrorMessage from "@/components/ErrorMessage";
import ToggleSwitch from "@/components/ToggleSwitch";
import {
  useCopyToClipboard,
  COPIED_LABEL,
} from "@/components/hooks/useCopyToClipboard";
import { encodeBase64, decodeBase64, toUrlSafe } from "./logic";
import styles from "./Base64Tile.module.css";

type Direction = "encode" | "decode";

/** variant prop: 表示バリエーションの設定差。別実装ではない。 */
export type Base64TileVariant = "full" | "encode" | "decode";

const DIRECTION_OPTIONS: { label: string; value: Direction }[] = [
  { label: "エンコード", value: "encode" },
  { label: "デコード", value: "decode" },
];

export interface Base64TileProps {
  /**
   * 表示バリエーション（デフォルト: "full"）
   * - "full": 方向トグル表示（encode / decode をユーザーが切り替え）
   * - "encode": 方向を encode に固定、方向トグル非表示、URL-safe トグル表示
   * - "decode": 方向を decode に固定、方向トグル・URL-safe トグル両方非表示
   */
  variant?: Base64TileVariant;
  /** 初期入力値（デフォルト: ""） */
  defaultInput?: string;
  /** Panel の as prop に透過される HTML タグ（デフォルト: "section"） */
  as?: "section" | "div" | "article" | "aside";
  /** 追加クラス */
  className?: string;
}

export default function Base64Tile({
  variant = "full",
  defaultInput = "",
  as = "section",
  className,
}: Base64TileProps = {}) {
  // ---------- id インスタンス一意化（複数同居時の重複 id・label 誤結合・aria-describedby 誤結合防止） ----------
  const uid = useId();
  const inputId = `${uid}-input`;
  const outputId = `${uid}-output`;
  const urlSafeDescId = `${uid}-url-safe-desc`;

  // ---------- variant から初期方向を決定 ----------
  // "full" は初期値 encode で、ユーザーが切り替え可能。
  // "encode" / "decode" は固定（ユーザーが変更できない）。
  const fixedDirection: Direction | null =
    variant === "encode" ? "encode" : variant === "decode" ? "decode" : null;

  // ---------- State ----------
  // full の場合のみ方向を state で管理。encode/decode は固定。
  const [dynamicDirection, setDynamicDirection] = useState<Direction>("encode");
  const [urlSafe, setUrlSafe] = useState(false);
  const [input, setInput] = useState(defaultInput);

  const { copy, copiedKey } = useCopyToClipboard();

  // 実際に使う方向: fixed があればそれを使い、なければ state を使う
  const direction = fixedDirection ?? dynamicDirection;

  // URL-safe トグルを表示するのは encode 方向の時のみ
  // decode 方向で表示すると「操作しても出力が変わらない」死んだコントロールになるため
  const showUrlSafeToggle = direction === "encode";

  // ---------- リアルタイム変換（共有エンジン logic.ts を使用） ----------
  const conversionResult = useMemo(() => {
    if (!input) return null;
    if (direction === "encode") {
      const r = encodeBase64(input);
      if (!r.success) return r;
      return {
        success: true as const,
        output: urlSafe ? toUrlSafe(r.output) : r.output,
        error: undefined,
      };
    }
    // デコード: logic.ts が URL-safe 文字とパディング欠損を自動正規化
    return decodeBase64(input);
  }, [input, direction, urlSafe]);

  const output = conversionResult?.success ? conversionResult.output : "";
  // エラー文言の日本語化（A-4: ErrorMessage には必ず日本語を渡す）
  const errorMessage =
    conversionResult?.success === false
      ? "不正な Base64 文字列です。入力内容を確認してください。"
      : "";

  // ライブリージョン用サマリテキスト（C-3: 実テキストノードのサマリ）
  const statusSummary = useMemo(() => {
    if (!input || conversionResult === null) return "";
    if (conversionResult.success === false) return "変換エラー";
    return direction === "encode" ? "エンコード完了" : "デコード完了";
  }, [input, conversionResult, direction]);

  // 入力・出力のラベルテキスト（方向によって変わる）
  const inputLabel = direction === "encode" ? "テキスト入力" : "Base64入力";
  const outputLabel = direction === "encode" ? "Base64出力" : "テキスト出力";
  const inputPlaceholder =
    direction === "encode"
      ? "エンコードするテキストを入力..."
      : "デコードするBase64文字列を入力（標準形・URL-safe形・パディングなし、いずれも対応）...";

  // ---------- ハンドラ ----------
  function handleDirectionChange(val: string) {
    // fixedDirection がある場合はここに到達しない（SegmentedControl が非表示）
    setDynamicDirection(val as Direction);
  }

  function handleInputChange(e: { target: { value: string } }) {
    setInput(e.target.value);
  }

  async function handleCopy() {
    if (!output) return;
    await copy(output);
  }

  // ---------- Render ----------
  // タイルのルートが Panel（= DESIGN.md §1 パネル準拠・タイル = ツール実装そのもの）
  return (
    <Panel as={as} className={className}>
      {/* コントロール行: 方向選択（full のみ表示） */}
      {fixedDirection === null && (
        <div className={styles.controls}>
          {/* variant=full のみ方向トグルを表示。encode/decode は固定のため非表示。 */}
          <SegmentedControl
            options={DIRECTION_OPTIONS}
            value={dynamicDirection}
            onChange={handleDirectionChange}
            aria-label="変換モード"
          />
        </div>
      )}

      {/* URL-safe オプション（encode 方向の時のみ表示）
          decode 方向で表示すると「操作しても出力が変わらない」死んだコントロールになるため非表示 */}
      {showUrlSafeToggle && (
        <div className={styles.optionRow}>
          <ToggleSwitch
            label="URL-safe 形式で出力"
            checked={urlSafe}
            onChange={(e) => setUrlSafe(e.target.checked)}
            aria-describedby={urlSafeDescId}
          />
          {/* useId ベースの id で aria-describedby に関連付け（複数インスタンス同居時の誤結合防止） */}
          <span id={urlSafeDescId} className={styles.optionDesc}>
            （+ → -, / → _。JWT や URL クエリ向け）
          </span>
        </div>
      )}

      {/* 入力欄 */}
      <div className={styles.field}>
        <label htmlFor={inputId} className={styles.fieldLabel}>
          {inputLabel}
        </label>
        <Textarea
          id={inputId}
          variant="mono"
          value={input}
          onChange={handleInputChange}
          placeholder={inputPlaceholder}
          rows={6}
          spellCheck={false}
        />
      </div>

      {/* エラー表示（A-4 準拠: 日本語化済みメッセージを渡す） */}
      {errorMessage && <ErrorMessage message={errorMessage} />}

      {/* 出力欄 */}
      <div className={styles.field}>
        <div className={styles.outputHeader}>
          <label htmlFor={outputId} className={styles.fieldLabel}>
            {outputLabel}
          </label>
          {/* コピーボタン */}
          <Button
            variant="default"
            size="small"
            onClick={handleCopy}
            disabled={!output}
            aria-label="出力をコピー"
          >
            {copiedKey ? COPIED_LABEL : "コピー"}
          </Button>
        </div>

        {/* C-3 準拠: readOnly textarea は role="status" 対象外。
            別途サマリ div を置いてスクリーンリーダーへ通知する */}
        <div
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className={styles.statusSummary}
        >
          {statusSummary}
        </div>

        <Textarea
          id={outputId}
          variant="mono"
          value={output}
          readOnly
          placeholder="結果がここに表示されます"
          rows={6}
        />
      </div>
    </Panel>
  );
}
