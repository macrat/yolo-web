"use client";

/**
 * UrlEncodeTile — URL エンコード/デコードの単一正典タイル
 *
 * cycle-226 T-1 で UrlEncodePage.tsx を Panel ルートのタイルへ作り直したもの。
 *
 * ## 設計原則
 *
 * - **タイル = ツール実装そのもののルート**: 最上位要素が <Panel>。外部ラッパーなし。
 * - **1ツール n タイル = variant**: full / encode / decode は同一コンポーネントの
 *   設定差で表現。別実装を作らない（分裂ゼロ）。
 * - **id インスタンス一意化**: useId ベースで生成し、複数インスタンスが同一ページに
 *   同居しても id 重複・label 誤結合が起きない。
 * - **ToolPageLayout 非依存**: タイル単体で機能が完結する。
 * - **logic.ts 共有エンジン**: encodeUrl / decodeUrl が唯一のロジック源。
 *
 * ## variant
 *
 * - `"full"` (デフォルト): 方向トグル（SegmentedControl）を表示し
 *   encode / decode をユーザーが切り替えられる。
 * - `"encode"`: 方向を encode に固定し、SegmentedControl を非表示にする。
 * - `"decode"`: 方向を decode に固定し、SegmentedControl を非表示にする。
 *
 * ## 使い方
 *
 * ```tsx
 * // 道具箱や詳細ページから同一エクスポートを描画する（同一性の構造的保証）
 * <UrlEncodeTile variant="full" />
 * <UrlEncodeTile variant="encode" />
 * <UrlEncodeTile variant="decode" />
 * ```
 *
 * ## アクセシビリティ（C-3 準拠）
 *
 * - 出力 textarea は readOnly で表示専用
 * - role="status" aria-live="polite" の div にサマリテキストを置く
 *   （readOnly textarea は値変化をスクリーンリーダーが読み上げないため）
 */

import { useId, useMemo, useState } from "react";
import Panel from "@/components/Panel";
import Button from "@/components/Button";
import SegmentedControl from "@/components/SegmentedControl";
import Select from "@/components/Select";
import Textarea from "@/components/Textarea";
import ErrorMessage from "@/components/ErrorMessage";
import {
  useCopyToClipboard,
  COPIED_LABEL,
} from "@/components/hooks/useCopyToClipboard";
import { encodeUrl, decodeUrl, type EncodeMode } from "./logic";
import styles from "./UrlEncodeTile.module.css";

type Direction = "encode" | "decode";

/** variant prop: 表示バリエーションの設定差。別実装ではない。 */
export type UrlEncodeTileVariant = "full" | "encode" | "decode";

const DIRECTION_OPTIONS: { label: string; value: Direction }[] = [
  { label: "エンコード", value: "encode" },
  { label: "デコード", value: "decode" },
];

/** エラーを日本語に変換する（A-4 準拠: 英語生エラーを露出しない） */
function toJapaneseError(direction: Direction): string {
  if (direction === "decode") {
    return "不正な URL エンコード文字列です。パーセント記号に続く 2 桁の 16 進数を確認してください。";
  }
  return "エンコードに失敗しました。入力内容を確認してください。";
}

export interface UrlEncodeTileProps {
  /**
   * 表示バリエーション（デフォルト: "full"）
   * - "full": 方向トグル表示（encode / decode をユーザーが切り替え）
   * - "encode": 方向を encode に固定、方向トグル非表示
   * - "decode": 方向を decode に固定、方向トグル非表示
   */
  variant?: UrlEncodeTileVariant;
  /** 初期のエンコードモード（デフォルト: "component"） */
  defaultMode?: EncodeMode;
  /** 初期入力値（デフォルト: ""） */
  defaultInput?: string;
  /** Panel の as prop に透過される HTML タグ（デフォルト: "section"） */
  as?: "section" | "div" | "article" | "aside";
  /** 追加クラス */
  className?: string;
}

export default function UrlEncodeTile({
  variant = "full",
  defaultMode = "component",
  defaultInput = "",
  as = "section",
  className,
}: UrlEncodeTileProps = {}) {
  // ---------- id インスタンス一意化（複数同居時の重複 id・label 誤結合防止） ----------
  const uid = useId();
  const inputId = `${uid}-input`;
  const outputId = `${uid}-output`;
  const modeId = `${uid}-mode`;

  // ---------- variant から初期方向を決定 ----------
  // "full" は初期値 encode で、ユーザーが切り替え可能。
  // "encode" / "decode" は固定（ユーザーが変更できない）。
  const fixedDirection: Direction | null =
    variant === "encode" ? "encode" : variant === "decode" ? "decode" : null;

  // ---------- State ----------
  // full の場合のみ方向を state で管理。encode/decode は固定。
  const [dynamicDirection, setDynamicDirection] = useState<Direction>("encode");
  const [mode, setMode] = useState<EncodeMode>(defaultMode);
  const [input, setInput] = useState(defaultInput);

  const { copy, copiedKey } = useCopyToClipboard();

  // 実際に使う方向: fixed があればそれを使い、なければ state を使う
  const direction = fixedDirection ?? dynamicDirection;

  // ---------- リアルタイム変換（共有エンジン logic.ts を使用） ----------
  const conversionResult = useMemo(() => {
    if (!input) return null;
    return direction === "encode"
      ? encodeUrl(input, mode)
      : decodeUrl(input, mode);
  }, [input, direction, mode]);

  const output = conversionResult?.success ? conversionResult.output : "";
  const errorMessage =
    conversionResult && !conversionResult.success
      ? toJapaneseError(direction)
      : "";

  // ライブリージョン用サマリテキスト（C-3: 実テキストノードのサマリ）
  const statusSummary = (() => {
    if (!input) return "";
    if (errorMessage) return "";
    if (direction === "encode") return "エンコードしました";
    return "デコードしました";
  })();

  // ---------- ハンドラ ----------
  function handleDirectionChange(val: string) {
    // fixedDirection がある場合はここに到達しない（SegmentedControl が非表示）
    setDynamicDirection(val as Direction);
  }

  function handleModeChange(e: { target: { value: string } }) {
    setMode(e.target.value as EncodeMode);
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
      {/* コントロール行: 方向選択（full のみ表示）+ モード選択 */}
      <div className={styles.controls}>
        {/* variant=full のみ方向トグルを表示。encode/decode は固定のため非表示。 */}
        {fixedDirection === null && (
          <SegmentedControl
            options={DIRECTION_OPTIONS}
            value={dynamicDirection}
            onChange={handleDirectionChange}
            aria-label="変換方向"
          />
        )}

        <div className={styles.modeRow}>
          <label htmlFor={modeId} className={styles.modeLabel}>
            モード:
          </label>
          <Select id={modeId} value={mode} onChange={handleModeChange}>
            <option value="component">コンポーネント（パラメータ用）</option>
            <option value="full">URL全体</option>
          </Select>
        </div>
      </div>

      {/* 入力欄 */}
      <div className={styles.field}>
        <label htmlFor={inputId} className={styles.fieldLabel}>
          入力
        </label>
        <Textarea
          id={inputId}
          variant="mono"
          value={input}
          onChange={handleInputChange}
          placeholder={
            direction === "encode"
              ? "エンコードするテキストを入力..."
              : "デコードするURL文字列を入力..."
          }
          rows={5}
          spellCheck={false}
        />
      </div>

      {/* エラー表示（A-4 準拠: 日本語化済みメッセージを渡す） */}
      {errorMessage && <ErrorMessage message={errorMessage} />}

      {/* 出力欄 */}
      <div className={styles.field}>
        <div className={styles.outputHeader}>
          <label htmlFor={outputId} className={styles.fieldLabel}>
            出力
          </label>
          {/* コピーボタン */}
          <Button
            variant="default"
            size="small"
            onClick={handleCopy}
            disabled={!output}
            aria-label={copiedKey ? COPIED_LABEL : "コピー"}
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
          rows={5}
          aria-label="出力"
        />
      </div>
    </Panel>
  );
}
