"use client";

import { useState, useRef, useCallback } from "react";
import styles from "./styles/YojiKimeru.module.css";

interface GuessInputProps {
  onSubmit: (input: string) => string | null;
  disabled: boolean;
}

/**
 * Text input field for 4-character kanji input with submit button.
 * Handles IME composition events to prevent premature submission.
 * Returns an error message from onSubmit if validation fails.
 */
export default function GuessInput({ onSubmit, disabled }: GuessInputProps) {
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [shaking, setShaking] = useState(false);
  const composingRef = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const triggerShake = useCallback(() => {
    setShaking(true);
    setTimeout(() => setShaking(false), 400);
  }, []);

  const handleSubmit = useCallback(() => {
    if (composingRef.current) return;
    const trimmed = value.trim();
    if (!trimmed) {
      setError("四字熟語を入力してください");
      triggerShake();
      return;
    }

    const errorMsg = onSubmit(trimmed);
    if (errorMsg) {
      setError(errorMsg);
      triggerShake();
    } else {
      setError(null);
      setValue("");
    }
    inputRef.current?.focus();
  }, [value, onSubmit, triggerShake]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && !composingRef.current) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit],
  );

  return (
    <div className={styles.inputArea}>
      <div className={`${styles.inputRow} ${shaking ? styles.shaking : ""}`}>
        <input
          ref={inputRef}
          className={styles.inputField}
          type="text"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setError(null);
          }}
          onKeyDown={handleKeyDown}
          onCompositionStart={() => {
            composingRef.current = true;
          }}
          onCompositionEnd={() => {
            composingRef.current = false;
          }}
          disabled={disabled}
          placeholder="四字熟語を入力"
          aria-label="四字熟語を入力"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
        />
        <button
          className={styles.submitButton}
          onClick={handleSubmit}
          disabled={disabled}
          type="button"
        >
          送信
        </button>
      </div>
      <div className={styles.errorMessage} role="alert" aria-live="polite">
        {error ?? ""}
      </div>
    </div>
  );
}
