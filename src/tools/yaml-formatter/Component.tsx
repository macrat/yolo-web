"use client";

import { useState, useCallback } from "react";
import {
  formatYaml,
  validateYaml,
  yamlToJson,
  jsonToYaml,
} from "./logic";
import styles from "./Component.module.css";

type Mode = "format" | "yaml-to-json" | "json-to-yaml";

export default function YamlFormatterTool() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [mode, setMode] = useState<Mode>("format");
  const [indent, setIndent] = useState<2 | 4>(2);
  const [copied, setCopied] = useState(false);

  const handleExecute = useCallback(() => {
    setError("");
    setCopied(false);
    if (!input.trim()) {
      setOutput("");
      return;
    }
    try {
      switch (mode) {
        case "format":
          setOutput(formatYaml(input, indent));
          break;
        case "yaml-to-json":
          setOutput(yamlToJson(input, indent));
          break;
        case "json-to-yaml":
          setOutput(jsonToYaml(input, indent));
          break;
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setOutput("");
    }
  }, [input, mode, indent]);

  const handleValidate = useCallback(() => {
    setCopied(false);
    if (!input.trim()) {
      setError("");
      setOutput("");
      return;
    }
    const result = validateYaml(input);
    if (result.valid) {
      setError("");
      setOutput("Valid YAML");
    } else {
      setError(
        result.line
          ? `行 ${result.line}: ${result.error}`
          : result.error || "Invalid YAML",
      );
      setOutput("");
    }
  }, [input]);

  const handleCopy = useCallback(async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API not available
    }
  }, [output]);

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
      <div className={styles.controls}>
        <div className={styles.modeControl}>
          <label htmlFor="yaml-mode-select" className={styles.controlLabel}>
            モード:
          </label>
          <select
            id="yaml-mode-select"
            value={mode}
            onChange={(e) => setMode(e.target.value as Mode)}
            className={styles.select}
          >
            <option value="format">YAML整形</option>
            <option value="yaml-to-json">YAML → JSON</option>
            <option value="json-to-yaml">JSON → YAML</option>
          </select>
        </div>
        <div className={styles.indentControl}>
          <label htmlFor="yaml-indent-select" className={styles.controlLabel}>
            インデント:
          </label>
          <select
            id="yaml-indent-select"
            value={indent}
            onChange={(e) => setIndent(Number(e.target.value) as 2 | 4)}
            className={styles.select}
          >
            <option value={2}>2スペース</option>
            <option value={4}>4スペース</option>
          </select>
        </div>
        <div className={styles.buttons}>
          <button
            onClick={handleExecute}
            className={styles.button}
            type="button"
          >
            変換
          </button>
          <button
            onClick={handleValidate}
            className={styles.button}
            type="button"
          >
            検証
          </button>
        </div>
      </div>
      <div className={styles.panels}>
        <div className={styles.panel}>
          <label htmlFor="yaml-input" className={styles.panelLabel}>
            入力
          </label>
          <textarea
            id="yaml-input"
            className={styles.textarea}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={getPlaceholder()}
            spellCheck={false}
          />
        </div>
        <div className={styles.panel}>
          <div className={styles.outputHeader}>
            <label htmlFor="yaml-output" className={styles.panelLabel}>
              出力
            </label>
            {output && (
              <button
                onClick={handleCopy}
                className={styles.copyButton}
                type="button"
              >
                {copied ? "コピー済み" : "コピー"}
              </button>
            )}
          </div>
          <textarea
            id="yaml-output"
            className={styles.textarea}
            value={output}
            readOnly
            placeholder="結果がここに表示されます"
          />
        </div>
      </div>
      {error && (
        <div className={styles.error} role="alert">
          {error}
        </div>
      )}
    </div>
  );
}
