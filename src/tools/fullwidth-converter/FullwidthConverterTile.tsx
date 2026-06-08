"use client";

/**
 * FullwidthConverterTile — 全角半角変換の単一正典タイル
 *
 * cycle-227 T-3 で FullwidthConverterPage.tsx を Panel ルートのタイルへ作り直したもの。
 *
 * ## 設計原則
 *
 * - **タイル = ツール実装そのもののルート**: 最上位要素が <Panel>。
 * - **1ツール n タイル = variant**: full / toHalfwidth / toFullwidth は同一コンポーネントの
 *   設定差で表現。別実装を作らない（分裂ゼロ）。
 * - **id インスタンス一意化**: useId ベースで生成し、複数インスタンスが同一ページに
 *   同居しても id 重複・label 誤結合が起きない（checkbox id/htmlFor も含む）。
 * - **ToolPageLayout 非依存**: タイル単体で機能が完結する。
 * - **logic.ts 共有エンジン**: convert / toHalfwidth / toFullwidth が唯一のロジック源。
 *   戻り値は string 直接（エラー経路なし）。
 *
 * ## variant
 *
 * - `"full"` (デフォルト): 方向トグル（SegmentedControl）を表示し
 *   toHalfwidth / toFullwidth をユーザーが切り替えられる。
 * - `"toHalfwidth"`: 方向を toHalfwidth に固定し、SegmentedControl を非表示にする。
 * - `"toFullwidth"`: 方向を toFullwidth に固定し、SegmentedControl を非表示にする。
 *
 * ## アクセシビリティ（C-3 準拠）
 *
 * - 出力 textarea は readOnly で表示専用
 * - role="status" aria-live="polite" の div にサマリテキストを置く
 * - checkbox 3個は role=group + aria-label="変換対象" でグループ化
 * - 各 checkbox は useId ベースの id と htmlFor で label と正しく関連付け
 */

import { useId, useMemo, useState } from "react";
import Panel from "@/components/Panel";
import Button from "@/components/Button";
import SegmentedControl from "@/components/SegmentedControl";
import Textarea from "@/components/Textarea";
import {
  useCopyToClipboard,
  COPIED_LABEL,
} from "@/components/hooks/useCopyToClipboard";
import { convert, type ConvertMode, type ConvertOptions } from "./logic";
import styles from "./FullwidthConverterTile.module.css";

/** variant prop: 表示バリエーションの設定差。別実装ではない。 */
export type FullwidthConverterTileVariant =
  | "full"
  | "toHalfwidth"
  | "toFullwidth";

/** モード選択の定義 */
const MODE_OPTIONS: { label: string; value: ConvertMode }[] = [
  { label: "半角に変換", value: "toHalfwidth" },
  { label: "全角に変換", value: "toFullwidth" },
];

/** 変換オプション名の日本語ラベル */
const OPTION_LABELS: Record<keyof ConvertOptions, string> = {
  alphanumeric: "英数字",
  katakana: "カタカナ",
  symbol: "記号・スペース",
};

/** オプションのキーを固定順で列挙（React key 安定のため） */
const OPTION_KEYS = ["alphanumeric", "katakana", "symbol"] as const;

export interface FullwidthConverterTileProps {
  /**
   * 表示バリエーション（デフォルト: "full"）
   * - "full": 方向トグル表示（toHalfwidth / toFullwidth をユーザーが切り替え）
   * - "toHalfwidth": 方向を toHalfwidth に固定、方向トグル非表示
   * - "toFullwidth": 方向を toFullwidth に固定、方向トグル非表示
   */
  variant?: FullwidthConverterTileVariant;
  /** 初期入力値（デフォルト: ""） */
  defaultInput?: string;
  /** Panel の as prop に透過される HTML タグ（デフォルト: "section"） */
  as?: "section" | "div" | "article" | "aside";
  /** 追加クラス */
  className?: string;
}

export default function FullwidthConverterTile({
  variant = "full",
  defaultInput = "",
  as = "section",
  className,
}: FullwidthConverterTileProps = {}) {
  // ---------- id インスタンス一意化（複数同居時の重複 id・label 誤結合防止） ----------
  const uid = useId();
  const inputId = `${uid}-input`;
  const outputId = `${uid}-output`;
  // checkbox ごとに一意の id を生成
  const alphanumericId = `${uid}-opt-alphanumeric`;
  const katakanaId = `${uid}-opt-katakana`;
  const symbolId = `${uid}-opt-symbol`;

  // checkbox id を key でルックアップできるようにまとめておく
  const checkboxIds: Record<keyof ConvertOptions, string> = {
    alphanumeric: alphanumericId,
    katakana: katakanaId,
    symbol: symbolId,
  };

  // ---------- variant から方向を決定 ----------
  // "full" は初期値 toHalfwidth で、ユーザーが切り替え可能。
  // "toHalfwidth" / "toFullwidth" は固定（ユーザーが変更できない）。
  const fixedMode: ConvertMode | null =
    variant === "toHalfwidth"
      ? "toHalfwidth"
      : variant === "toFullwidth"
        ? "toFullwidth"
        : null;

  // ---------- State ----------
  const [dynamicMode, setDynamicMode] = useState<ConvertMode>("toHalfwidth");
  const [input, setInput] = useState(defaultInput);
  const [options, setOptions] = useState<ConvertOptions>({
    alphanumeric: true,
    katakana: true,
    symbol: true,
  });

  const { copy, copiedKey } = useCopyToClipboard();

  // 実際に使うモード: fixed があればそれを使い、なければ state を使う
  const mode = fixedMode ?? dynamicMode;

  // ---------- リアルタイム変換（共有エンジン logic.ts を使用・エラー経路なし） ----------
  const output = useMemo(() => {
    return convert(input, mode, options);
  }, [input, mode, options]);

  // ライブリージョン用サマリテキスト（C-3: 実テキストノードのサマリ）
  const statusSummary =
    output.length > 0 ? `変換しました（${output.length}文字）` : "";

  // ---------- ハンドラ ----------
  function handleModeChange(val: string): void {
    // fixedMode がある場合はここに到達しない（SegmentedControl が非表示）
    setDynamicMode(val as ConvertMode);
  }

  function handleOptionChange(key: keyof ConvertOptions): void {
    setOptions((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function handleInputChange(e: { target: { value: string } }): void {
    setInput(e.target.value);
  }

  async function handleCopy(): Promise<void> {
    if (!output) return;
    await copy(output);
  }

  // ---------- Render ----------
  // タイルのルートが Panel（= DESIGN.md §1 パネル準拠・タイル = ツール実装そのもの）
  return (
    <Panel as={as} className={className}>
      {/* 方向トグル: variant=full のみ表示。toHalfwidth/toFullwidth は固定のため非表示。 */}
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

      {/* 変換オプション: 英数字・カタカナ・記号を個別ON/OFF（全 variant で維持） */}
      {/* role=group + aria-label でアクセシブルにグループ化 */}
      <div className={styles.optionsRow} role="group" aria-label="変換対象">
        {OPTION_KEYS.map((key) => (
          <label
            key={key}
            className={styles.checkboxLabel}
            htmlFor={checkboxIds[key]}
          >
            <input
              id={checkboxIds[key]}
              type="checkbox"
              checked={options[key]}
              onChange={() => handleOptionChange(key)}
            />
            {OPTION_LABELS[key]}
          </label>
        ))}
      </div>

      {/* 入力欄 */}
      <div className={styles.field}>
        <label htmlFor={inputId} className={styles.fieldLabel}>
          入力テキスト
        </label>
        <Textarea
          id={inputId}
          value={input}
          onChange={handleInputChange}
          placeholder="変換するテキストを入力..."
          rows={6}
          spellCheck={false}
        />
      </div>

      {/* 出力欄 */}
      <div className={styles.field}>
        <div className={styles.outputHeader}>
          <label htmlFor={outputId} className={styles.fieldLabel}>
            変換結果
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
          value={output}
          readOnly
          placeholder={input ? "" : "結果がここに表示されます"}
          rows={6}
          aria-label="変換結果"
        />
      </div>
    </Panel>
  );
}
