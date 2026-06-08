"use client";

/**
 * HtmlEntityTile — HTML エンティティ変換の単一正典タイル
 *
 * cycle-227 T-1 で HtmlEntityPage.tsx を Panel ルートのタイルへ作り直したもの。
 *
 * ## 設計原則
 *
 * - **タイル = ツール実装そのもののルート**: 最上位要素が <Panel>。外部ラッパーなし。
 * - **1ツール n タイル = variant**: full / encode / decode は同一コンポーネントの
 *   設定差で表現。別実装を作らない（分裂ゼロ）。
 * - **id インスタンス一意化**: useId ベースで生成し、複数インスタンスが同一ページに
 *   同居しても id 重複・label 誤結合が起きない。
 * - **ToolPageLayout 非依存**: タイル単体で機能が完結する。
 * - **logic.ts 共有エンジン**: convertEntity が唯一のロジック源。
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
 * <HtmlEntityTile variant="full" />
 * <HtmlEntityTile variant="encode" />
 * <HtmlEntityTile variant="decode" />
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
import Textarea from "@/components/Textarea";
import ErrorMessage from "@/components/ErrorMessage";
import {
  useCopyToClipboard,
  COPIED_LABEL,
} from "@/components/hooks/useCopyToClipboard";
import { convertEntity, type EntityMode } from "./logic";
import styles from "./HtmlEntityTile.module.css";

/** variant prop: 表示バリエーションの設定差。別実装ではない。 */
export type HtmlEntityTileVariant = "full" | "encode" | "decode";

const DIRECTION_OPTIONS: { label: string; value: EntityMode }[] = [
  { label: "エンコード", value: "encode" },
  { label: "デコード", value: "decode" },
];

/**
 * 変換結果のサマリ文言（C-3: ライブリージョンに実テキストノードを置く要件）。
 * スクリーンリーダーはサマリテキストを読み上げ、出力の変化を通知する。
 */
function buildSummary(mode: EntityMode, output: string): string {
  if (!output) return "";
  const charCount = [...output].length;
  return mode === "encode"
    ? `エンコード完了・${charCount}文字`
    : `デコード完了・${charCount}文字`;
}

export interface HtmlEntityTileProps {
  /**
   * 表示バリエーション（デフォルト: "full"）
   * - "full": 方向トグル表示（encode / decode をユーザーが切り替え）
   * - "encode": 方向を encode に固定、方向トグル非表示
   * - "decode": 方向を decode に固定、方向トグル非表示
   */
  variant?: HtmlEntityTileVariant;
  /** 初期入力値（デフォルト: ""） */
  defaultInput?: string;
  /** Panel の as prop に透過される HTML タグ（デフォルト: "section"） */
  as?: "section" | "div" | "article" | "aside";
  /** 追加クラス */
  className?: string;
}

export default function HtmlEntityTile({
  variant = "full",
  defaultInput = "",
  as = "section",
  className,
}: HtmlEntityTileProps = {}) {
  // ---------- id インスタンス一意化（複数同居時の重複 id・label 誤結合防止） ----------
  const uid = useId();
  const inputId = `${uid}-input`;
  const outputId = `${uid}-output`;

  // ---------- variant から初期方向を決定 ----------
  // "full" は初期値 encode で、ユーザーが切り替え可能。
  // "encode" / "decode" は固定（ユーザーが変更できない）。
  const fixedMode: EntityMode | null =
    variant === "encode" ? "encode" : variant === "decode" ? "decode" : null;

  // ---------- State ----------
  // full の場合のみ方向を state で管理。encode/decode は固定。
  const [dynamicMode, setDynamicMode] = useState<EntityMode>("encode");
  const [input, setInput] = useState(defaultInput);

  const { copy, copiedKey } = useCopyToClipboard();

  // 実際に使う方向: fixed があればそれを使い、なければ state を使う
  const mode = fixedMode ?? dynamicMode;

  // ---------- リアルタイム変換（共有エンジン logic.ts を使用） ----------
  const result = useMemo(() => {
    if (!input) return null;
    return convertEntity(input, mode);
  }, [input, mode]);

  const output = result?.success ? result.output : "";
  const errorMessage =
    result && !result.success
      ? "変換中にエラーが発生しました。入力内容を確認してください。"
      : "";

  const summaryText = buildSummary(mode, output);

  // ---------- ハンドラ ----------
  function handleModeChange(val: string) {
    // fixedMode がある場合はここに到達しない（SegmentedControl が非表示）
    setDynamicMode(val as EntityMode);
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
      {fixedMode === null && (
        <div className={styles.controls}>
          <SegmentedControl
            options={DIRECTION_OPTIONS}
            value={dynamicMode}
            onChange={handleModeChange}
            aria-label="変換モード"
          />
        </div>
      )}

      {/* 入力欄 */}
      <div className={styles.field}>
        <label htmlFor={inputId} className={styles.label}>
          {mode === "encode" ? "テキスト入力" : "HTMLエンティティ入力"}
        </label>
        <Textarea
          id={inputId}
          variant="mono"
          value={input}
          onChange={handleInputChange}
          placeholder={
            mode === "encode"
              ? "エンコードするテキストを入力..."
              : "デコードするHTMLエンティティを入力..."
          }
          rows={6}
          spellCheck={false}
        />
      </div>

      {/* エラー表示（A-4 準拠: 日本語化済みメッセージを渡す） */}
      {errorMessage && <ErrorMessage message={errorMessage} />}

      {/* 出力欄 */}
      <div className={styles.field}>
        <div className={styles.outputRow}>
          <label htmlFor={outputId} className={styles.label}>
            {mode === "encode" ? "エンコード結果" : "デコード結果"}
          </label>
          {/* コピーボタン */}
          <Button
            size="small"
            variant="default"
            disabled={!output}
            onClick={() => void handleCopy()}
            aria-label={
              copiedKey ? COPIED_LABEL : "結果をクリップボードにコピー"
            }
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
          {summaryText}
        </div>

        <Textarea
          id={outputId}
          variant="mono"
          value={output}
          readOnly
          placeholder="結果がここに表示されます"
          rows={6}
          aria-label={mode === "encode" ? "エンコード結果" : "デコード結果"}
        />
      </div>
    </Panel>
  );
}
