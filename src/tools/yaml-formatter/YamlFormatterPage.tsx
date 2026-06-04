"use client";

import { useState, useCallback } from "react";
import { formatYaml, validateYaml, yamlToJson, jsonToYaml } from "./logic";
import {
  useCopyToClipboard,
  COPIED_LABEL,
} from "@/components/hooks/useCopyToClipboard";
import Textarea from "@/components/Textarea";
import Select from "@/components/Select";
import ErrorMessage from "@/components/ErrorMessage";
import Button from "@/components/Button";
import styles from "./YamlFormatterPage.module.css";

type Mode = "format" | "yaml-to-json" | "json-to-yaml";

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

/**
 * YamlFormatterPage — YAML整形・検証・JSON相互変換の単一実装。
 *
 * 機能:
 * - YAML 整形（インデント: 2スペース / 4スペース）
 * - YAML 検証（validate）
 * - YAML → JSON 変換
 * - JSON → YAML 変換
 * - 出力コピー（useCopyToClipboard）
 * - エラー表示（ErrorMessage）
 *
 * 設計方針:
 * - 確定提示方式: 入力欄を最初から表示
 * - AP-I11: setTimeout は useCopyToClipboard フック内で useRef+useEffect cleanup 済み
 * - ARIA: 出力欄に role="status" aria-live="polite" + 実テキストサマリ（C-3）
 * - T-4b: yaml-formatter はコピーボタンあり確定（設定ファイルに貼る＝持ち帰り対象）
 * - A-4: 英語の生パーサーエラー（js-yaml/JSON.parse）を日本語に変換して表示
 */
export default function YamlFormatterPage() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [mode, setMode] = useState<Mode>("format");
  const [indent, setIndent] = useState<2 | 4>(2);
  // C-3: スクリーンリーダーへ通知するための短いサマリテキスト
  // role="status" aria-live="polite" 領域に実テキストとして配置する
  const [statusSummary, setStatusSummary] = useState("");

  // T-4b: コピーあり確定。useCopyToClipboard フックを使用（独自実装しない）
  const { copy, copiedKey } = useCopyToClipboard();

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
          // C-3: 整形成功サマリを role="status" 領域に実テキストとして配置
          setStatusSummary("整形しました");
          break;
        }
        case "yaml-to-json": {
          const json = yamlToJson(input, indent);
          setOutput(json);
          // C-3: 変換成功サマリを role="status" 領域に実テキストとして配置
          setStatusSummary("JSONに変換しました");
          break;
        }
        case "json-to-yaml": {
          const yamlResult = jsonToYaml(input, indent);
          setOutput(yamlResult);
          // C-3: 変換成功サマリを role="status" 領域に実テキストとして配置
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
      // C-3: 検証成功サマリを role="status" 領域に実テキストとして配置
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

  return (
    <div className={styles.container}>
      {/* コントロール行: モード選択 + インデント選択 + 操作ボタン */}
      <div className={styles.controls}>
        <div className={styles.controlGroup}>
          <label htmlFor="yaml-mode-select" className={styles.controlLabel}>
            モード
          </label>
          <Select
            id="yaml-mode-select"
            aria-label="モード"
            value={mode}
            onChange={(e) => {
              setMode(e.target.value as Mode);
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
        <div className={styles.controlGroup}>
          <label htmlFor="yaml-indent-select" className={styles.controlLabel}>
            インデント
          </label>
          <Select
            id="yaml-indent-select"
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
          <label htmlFor="yaml-input" className={styles.panelLabel}>
            入力
          </label>
          <Textarea
            id="yaml-input"
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
            <label htmlFor="yaml-output" className={styles.panelLabel}>
              出力
            </label>
            {/* T-4b: コピーボタンあり確定。出力が空のとき disabled */}
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
            id="yaml-output"
            aria-label="出力"
            variant="mono"
            value={output}
            readOnly
            placeholder="結果がここに表示されます"
            rows={12}
          />
        </div>
      </div>

      {/* エラー表示: A-4 ErrorMessage を使用。空のときは非表示 */}
      {error && <ErrorMessage message={error} />}
    </div>
  );
}
