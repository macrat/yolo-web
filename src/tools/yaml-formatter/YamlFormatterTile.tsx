"use client";

/**
 * YamlFormatterTile — YAML整形・検証・JSON相互変換の単一正典タイル
 *
 * cycle-228 T-14: YamlFormatterPage.tsx を Panel ルートのタイルへ作り直したもの。
 *
 * ## 設計原則
 *
 * - **タイル = ツール実装そのもののルート**: 最上位要素が <Panel>（A-1）
 * - **1ツール n タイル = variant**: full / format / yaml-to-json / json-to-yaml は
 *   同一コンポーネントの設定差で表現。別実装を作らない（A-5）。
 * - **id インスタンス一意化**: useId ベースで生成し、複数インスタンスが同一ページに
 *   同居しても id 重複・label 誤結合が起きない（A-6）。
 * - **ToolPageLayout 非依存**: タイル単体で機能が完結する（A-2）。
 * - **logic.ts 共有エンジン**: formatYaml/validateYaml/yamlToJson/jsonToYaml が唯一のロジック源。
 *
 * ## variant
 *
 * - `"full"` (デフォルト): モード Select（format/yaml-to-json/json-to-yaml）＋インデント Select を表示。
 * - `"format"`: モードを整形に固定し、モード Select を非表示にする。
 * - `"yaml-to-json"`: モードを YAML→JSON に固定し、モード Select を非表示にする。
 * - `"json-to-yaml"`: モードを JSON→YAML に固定し、モード Select を非表示にする。
 *
 * ## アクセシビリティ（C-3 準拠）
 *
 * - 出力 textarea は readOnly で表示専用
 * - role="status" aria-live="polite" の div にサマリテキストを置く
 *   （readOnly textarea は値変化をスクリーンリーダーが読み上げないため）
 */

import { useId, useState, useCallback } from "react";
import Panel from "@/components/Panel";
import Button from "@/components/Button";
import Select from "@/components/Select";
import Textarea from "@/components/Textarea";
import ErrorMessage from "@/components/ErrorMessage";
import {
  useCopyToClipboard,
  COPIED_LABEL,
} from "@/components/hooks/useCopyToClipboard";
import { formatYaml, validateYaml, yamlToJson, jsonToYaml } from "./logic";
import styles from "./YamlFormatterTile.module.css";

type Mode = "format" | "yaml-to-json" | "json-to-yaml";

/** variant prop: 表示バリエーションの設定差。別実装ではない。 */
export type YamlFormatterTileVariant =
  | "full"
  | "format"
  | "yaml-to-json"
  | "json-to-yaml";

export interface YamlFormatterTileProps {
  /**
   * 表示バリエーション（デフォルト: "full"）
   * - "full": モード Select を表示し、ユーザーがモードを切り替えられる。
   * - "format": モードを YAML整形に固定し、モード Select を非表示にする。
   * - "yaml-to-json": モードを YAML→JSON に固定し、モード Select を非表示にする。
   * - "json-to-yaml": モードを JSON→YAML に固定し、モード Select を非表示にする。
   */
  variant?: YamlFormatterTileVariant;
  /** Panel の as prop に透過される HTML タグ（デフォルト: "section"） */
  as?: "section" | "div" | "article" | "aside";
  /** 追加クラス */
  className?: string;
}

/**
 * js-yaml / JSON.parse が返す英語エラーメッセージを日本語に変換する。
 *
 * js-yaml は常に英語のエラーメッセージを返す（例:
 * "missed comma between flow collection entries (1:15)"）。
 * 日本語サイトとして、生の英語パーサーエラーを来訪者に露出しないよう、
 * エラー位置情報（行番号）を活かした日本語メッセージに整形する。
 *
 * @param rawError - js-yaml / JSON.parse が投げたエラーの message（英語）
 * @param line - エラー行番号（validateYaml から取得、任意）
 * @returns 日本語の人間可読エラーメッセージ
 */
function toJapaneseYamlError(rawError: string, line?: number): string {
  // js-yaml のエラーは "(line:col)" 形式を含む（例: "(1:15)"）
  const markMatch = rawError.match(/\((\d+):(\d+)\)/);
  if (markMatch) {
    const errorLine = markMatch[1];
    const col = markMatch[2];
    return `YAMLの形式が正しくありません。（${errorLine}行目、${col}文字目付近）`;
  }

  // validateYaml が line を返した場合（js-yaml YAMLException.mark.line は 0 始まり→+1済み）
  if (line !== undefined) {
    return `YAMLの形式が正しくありません。（${line}行目付近）`;
  }

  // 位置情報が取れない場合のフォールバック
  return "YAMLの形式が正しくありません。";
}

/**
 * JSON.parse が返す英語エラーメッセージを日本語に変換する。
 *
 * @param rawError - JSON.parse が投げたエラーの message（英語）
 * @returns 日本語の人間可読エラーメッセージ
 */
function toJapaneseJsonError(rawError: string): string {
  // "line N column M" パターンを抽出（Chrome/Firefox/Node 共通形式）
  const lineColMatch = rawError.match(/line\s+(\d+)\s+column\s+(\d+)/i);
  if (lineColMatch) {
    const line = lineColMatch[1];
    const col = lineColMatch[2];
    return `JSONの形式が正しくありません。（${line}行目、${col}文字目付近）`;
  }

  // "position N" だけのパターン（一部の環境）
  const posMatch = rawError.match(/position\s+(\d+)/i);
  if (posMatch) {
    const pos = posMatch[1];
    return `JSONの形式が正しくありません。（位置 ${pos} 付近）`;
  }

  return "JSONの形式が正しくありません。";
}

export default function YamlFormatterTile({
  variant = "full",
  as = "section",
  className,
}: YamlFormatterTileProps = {}) {
  // ---------- id インスタンス一意化（複数同居時の重複 id・label 誤結合防止）(A-6) ----------
  const uid = useId();
  const inputId = `${uid}-input`;
  const outputId = `${uid}-output`;
  const modeId = `${uid}-mode`;
  const indentId = `${uid}-indent`;

  // ---------- variant から固定モードを決定 ----------
  // "full" の場合は null（ユーザーが選択可能）、それ以外は固定
  const fixedMode: Mode | null = variant === "full" ? null : (variant as Mode);

  // ---------- State ----------
  const [dynamicMode, setDynamicMode] = useState<Mode>("format");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [indent, setIndent] = useState<2 | 4>(2);
  // C-3: スクリーンリーダーへ通知するための短いサマリテキスト
  const [statusSummary, setStatusSummary] = useState("");

  const { copy, copiedKey } = useCopyToClipboard();

  // 実際に使うモード: fixed があればそれを使い、なければ state を使う
  const mode = fixedMode ?? dynamicMode;

  // ---------- ハンドラ ----------
  const handleExecute = useCallback(() => {
    setError("");
    setStatusSummary("");
    if (!input.trim()) {
      setOutput("");
      return;
    }
    try {
      switch (mode) {
        case "format": {
          const formatted = formatYaml(input, indent);
          setOutput(formatted);
          setStatusSummary("整形しました");
          break;
        }
        case "yaml-to-json": {
          const json = yamlToJson(input, indent);
          setOutput(json);
          setStatusSummary("JSONに変換しました");
          break;
        }
        case "json-to-yaml": {
          const yamlResult = jsonToYaml(input, indent);
          setOutput(yamlResult);
          setStatusSummary("YAMLに変換しました");
          break;
        }
      }
    } catch (e) {
      // js-yaml / JSON.parse の英語エラーを日本語に変換して表示（生エラーを露出しない）
      const rawMsg = e instanceof Error ? e.message : String(e);
      if (mode === "json-to-yaml") {
        setError(toJapaneseJsonError(rawMsg));
      } else {
        setError(toJapaneseYamlError(rawMsg));
      }
      setOutput("");
    }
  }, [input, mode, indent]);

  const handleValidate = useCallback(() => {
    setError("");
    setStatusSummary("");
    if (!input.trim()) {
      setOutput("");
      return;
    }
    const result = validateYaml(input);
    if (result.valid) {
      // 検証成功は日本語メッセージで表示（"Valid YAML" 等の英語は使わない）
      setOutput("有効なYAMLです");
      setStatusSummary("有効なYAMLです");
    } else {
      // validateYaml の result.error は英語の生パーサーエラーなので日本語に変換
      const rawMsg = result.error ?? "";
      // validateYaml は size-over や empty の場合は日本語エラーを返す
      if (
        rawMsg.includes("入力が大きすぎます") ||
        rawMsg.includes("入力が空です")
      ) {
        setError(rawMsg);
      } else {
        setError(toJapaneseYamlError(rawMsg, result.line));
      }
      setOutput("");
    }
  }, [input]);

  const handleCopy = useCallback(async () => {
    if (!output) return;
    await copy(output);
  }, [output, copy]);

  const getPlaceholder = (): string => {
    switch (mode) {
      case "format":
      case "yaml-to-json":
        return "key: value\nlist:\n  - item1\n  - item2";
      case "json-to-yaml":
        return '{"key": "value", "list": ["item1", "item2"]}';
    }
  };

  // ---------- Render ----------
  // タイルのルートが Panel（= DESIGN.md §1 パネル準拠・タイル = ツール実装そのもの）(A-1)
  return (
    <Panel as={as} className={className}>
      {/* コントロール行: モード選択（fullのみ）+ インデント選択 + 操作ボタン */}
      <div className={styles.controls}>
        {/* variant=full のみモード Select を表示。その他は固定のため非表示。(A-5) */}
        {fixedMode === null && (
          <div className={styles.controlGroup}>
            <label htmlFor={modeId} className={styles.controlLabel}>
              モード
            </label>
            <Select
              id={modeId}
              aria-label="モード"
              value={dynamicMode}
              onChange={(e) => {
                setDynamicMode(e.target.value as Mode);
                setOutput("");
                setError("");
                setStatusSummary("");
              }}
            >
              <option value="format">YAML整形</option>
              <option value="yaml-to-json">YAML → JSON</option>
              <option value="json-to-yaml">JSON → YAML</option>
            </Select>
          </div>
        )}
        <div className={styles.controlGroup}>
          <label htmlFor={indentId} className={styles.controlLabel}>
            インデント
          </label>
          <Select
            id={indentId}
            aria-label="インデント"
            value={indent}
            onChange={(e) => setIndent(Number(e.target.value) as 2 | 4)}
          >
            <option value={2}>2スペース</option>
            <option value={4}>4スペース</option>
          </Select>
        </div>
        <div className={styles.buttons}>
          <Button onClick={handleExecute} type="button" variant="primary">
            変換
          </Button>
          <Button onClick={handleValidate} type="button">
            検証
          </Button>
        </div>
      </div>

      {/* 入出力パネル */}
      <div className={styles.panels}>
        {/* 入力欄 */}
        <div className={styles.panel}>
          <label htmlFor={inputId} className={styles.panelLabel}>
            入力
          </label>
          <Textarea
            id={inputId}
            aria-label="入力"
            variant="mono"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={getPlaceholder()}
            spellCheck={false}
            rows={12}
          />
        </div>

        {/* 出力欄 */}
        <div className={styles.panel}>
          <div className={styles.outputHeader}>
            <label htmlFor={outputId} className={styles.panelLabel}>
              出力
            </label>
            {/* コピーボタン。出力が空のとき disabled。 */}
            <Button
              onClick={handleCopy}
              type="button"
              size="small"
              disabled={!output}
              aria-label={copiedKey ? COPIED_LABEL : "コピー"}
            >
              {copiedKey ? COPIED_LABEL : "コピー"}
            </Button>
          </div>
          {/* C-3: role="status" aria-live="polite" で動的通知。
              実テキストノード（サマリ）を置くことでスクリーンリーダーに変化を通知する。
              readOnly textarea をラップするだけでは値変化が読み上げられないため分離する。 */}
          <div
            role="status"
            aria-live="polite"
            aria-label="操作結果サマリ"
            className={styles.srOnly}
          >
            {statusSummary}
          </div>
          <Textarea
            id={outputId}
            aria-label="出力"
            variant="mono"
            value={output}
            readOnly
            placeholder="結果がここに表示されます"
            rows={12}
          />
        </div>
      </div>

      {/* エラー表示: ErrorMessage を使用。空のときは非表示 */}
      {error && <ErrorMessage message={error} />}
    </Panel>
  );
}
