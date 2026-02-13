"use client";

import { useState, useMemo, useCallback } from "react";
import { convertBase, formatBinary, formatHex, type NumberBase } from "./logic";
import styles from "./Component.module.css";

const BASES: { value: NumberBase; label: string; prefix: string }[] = [
  { value: 2, label: "2進数 (BIN)", prefix: "0b" },
  { value: 8, label: "8進数 (OCT)", prefix: "0o" },
  { value: 10, label: "10進数 (DEC)", prefix: "" },
  { value: 16, label: "16進数 (HEX)", prefix: "0x" },
];

interface ResultCard {
  label: string;
  value: string;
  formattedValue: string;
  key: string;
}

export default function NumberBaseConverterTool() {
  const [input, setInput] = useState("");
  const [fromBase, setFromBase] = useState<NumberBase>(10);
  const [copied, setCopied] = useState("");

  const result = useMemo(() => convertBase(input, fromBase), [input, fromBase]);

  const handleCopy = useCallback(async (value: string, key: string) => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(key);
      setTimeout(() => setCopied(""), 2000);
    } catch {
      // Clipboard API not available
    }
  }, []);

  const cards: ResultCard[] = [
    {
      label: "2進数 (BIN)",
      value: result.binary,
      formattedValue: formatBinary(result.binary),
      key: "binary",
    },
    {
      label: "8進数 (OCT)",
      value: result.octal,
      formattedValue: result.octal,
      key: "octal",
    },
    {
      label: "10進数 (DEC)",
      value: result.decimal,
      formattedValue: result.decimal,
      key: "decimal",
    },
    {
      label: "16進数 (HEX)",
      value: result.hexadecimal,
      formattedValue: formatHex(result.hexadecimal),
      key: "hexadecimal",
    },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.modeSwitch} role="radiogroup" aria-label="Base">
        {BASES.map((base) => (
          <button
            key={base.value}
            type="button"
            className={`${styles.modeButton} ${fromBase === base.value ? styles.active : ""}`}
            onClick={() => {
              setFromBase(base.value);
              setCopied("");
            }}
            role="radio"
            aria-checked={fromBase === base.value}
          >
            {base.label}
          </button>
        ))}
      </div>

      <div className={styles.field}>
        <label htmlFor="base-input" className={styles.label}>
          変換する数値
        </label>
        <input
          id="base-input"
          type="text"
          className={styles.input}
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setCopied("");
          }}
          placeholder={
            fromBase === 2
              ? "例: 11111111"
              : fromBase === 8
                ? "例: 377"
                : fromBase === 16
                  ? "例: ff"
                  : "例: 255"
          }
          spellCheck={false}
        />
      </div>

      {result.error && (
        <div className={styles.error} role="alert">
          {result.error}
        </div>
      )}

      <div className={styles.resultCards}>
        {cards.map((card) => (
          <div key={card.key} className={styles.resultCard}>
            <div className={styles.resultLabel}>{card.label}</div>
            <div className={styles.resultValue}>
              {card.formattedValue || "-"}
            </div>
            {card.value && (
              <button
                type="button"
                onClick={() => handleCopy(card.value, card.key)}
                className={styles.copyButton}
              >
                {copied === card.key ? "コピー済み" : "コピー"}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
