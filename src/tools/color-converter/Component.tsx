"use client";

import { useState, useCallback } from "react";
import {
  parseHex,
  parseRgb,
  parseHsl,
  formatRgb,
  formatHsl,
  type ColorResult,
} from "./logic";
import styles from "./Component.module.css";

type InputMode = "hex" | "rgb" | "hsl";

export default function ColorConverterTool() {
  const [inputMode, setInputMode] = useState<InputMode>("hex");
  const [input, setInput] = useState("#3498db");
  const [result, setResult] = useState<ColorResult | null>(null);
  const [copied, setCopied] = useState("");

  const handleConvert = useCallback(() => {
    setCopied("");
    if (!input.trim()) {
      setResult(null);
      return;
    }
    let r: ColorResult;
    switch (inputMode) {
      case "hex":
        r = parseHex(input);
        break;
      case "rgb":
        r = parseRgb(input);
        break;
      case "hsl":
        r = parseHsl(input);
        break;
    }
    setResult(r);
  }, [input, inputMode]);

  const handleColorPicker = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const hex = e.target.value;
      setInput(hex);
      const r = parseHex(hex);
      setResult(r);
      setCopied("");
    },
    [],
  );

  const handleCopy = useCallback(async (value: string, label: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(label);
      setTimeout(() => setCopied(""), 2000);
    } catch {
      // Clipboard API not available
    }
  }, []);

  const handleModeChange = (newMode: InputMode) => {
    setInputMode(newMode);
    setResult(null);
    setCopied("");
  };

  return (
    <div className={styles.container}>
      <div className={styles.modeSwitch} role="radiogroup" aria-label="Mode">
        <button
          type="button"
          className={`${styles.modeButton} ${inputMode === "hex" ? styles.active : ""}`}
          onClick={() => handleModeChange("hex")}
          role="radio"
          aria-checked={inputMode === "hex"}
        >
          HEX
        </button>
        <button
          type="button"
          className={`${styles.modeButton} ${inputMode === "rgb" ? styles.active : ""}`}
          onClick={() => handleModeChange("rgb")}
          role="radio"
          aria-checked={inputMode === "rgb"}
        >
          RGB
        </button>
        <button
          type="button"
          className={`${styles.modeButton} ${inputMode === "hsl" ? styles.active : ""}`}
          onClick={() => handleModeChange("hsl")}
          role="radio"
          aria-checked={inputMode === "hsl"}
        >
          HSL
        </button>
      </div>

      <div className={styles.inputRow}>
        <div className={styles.field}>
          <label htmlFor="color-input" className={styles.label}>
            {inputMode === "hex" && "HEX値 (#RGB or #RRGGBB)"}
            {inputMode === "rgb" && "RGB値 (R, G, B)"}
            {inputMode === "hsl" && "HSL値 (H, S, L)"}
          </label>
          <input
            id="color-input"
            type="text"
            className={styles.textInput}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              inputMode === "hex"
                ? "#3498db"
                : inputMode === "rgb"
                  ? "52, 152, 219"
                  : "210, 68, 53"
            }
            spellCheck={false}
          />
        </div>
        <div className={styles.pickerField}>
          <label htmlFor="color-picker" className={styles.label}>
            カラーピッカー
          </label>
          <input
            id="color-picker"
            type="color"
            className={styles.colorPicker}
            value={result?.hex ?? "#3498db"}
            onChange={handleColorPicker}
          />
        </div>
      </div>

      <button
        type="button"
        onClick={handleConvert}
        className={styles.convertButton}
      >
        変換
      </button>

      {result && !result.success && (
        <div className={styles.error} role="alert">
          {result.error}
        </div>
      )}

      {result && result.success && (
        <>
          <div
            className={styles.colorPreview}
            style={{ backgroundColor: result.hex }}
            aria-label={`Color preview: ${result.hex}`}
          />
          <div className={styles.resultCards}>
            <div className={styles.resultCard}>
              <div className={styles.resultLabel}>HEX</div>
              <div className={styles.resultValue}>{result.hex}</div>
              <button
                type="button"
                onClick={() => handleCopy(result.hex!, "hex")}
                className={styles.copyButton}
              >
                {copied === "hex" ? "コピー済み" : "コピー"}
              </button>
            </div>
            <div className={styles.resultCard}>
              <div className={styles.resultLabel}>RGB</div>
              <div className={styles.resultValue}>
                {formatRgb(result.rgb!)}
              </div>
              <button
                type="button"
                onClick={() => handleCopy(formatRgb(result.rgb!), "rgb")}
                className={styles.copyButton}
              >
                {copied === "rgb" ? "コピー済み" : "コピー"}
              </button>
            </div>
            <div className={styles.resultCard}>
              <div className={styles.resultLabel}>HSL</div>
              <div className={styles.resultValue}>
                {formatHsl(result.hsl!)}
              </div>
              <button
                type="button"
                onClick={() => handleCopy(formatHsl(result.hsl!), "hsl")}
                className={styles.copyButton}
              >
                {copied === "hsl" ? "コピー済み" : "コピー"}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
