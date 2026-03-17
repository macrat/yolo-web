"use client";

import { useState, useRef, useCallback } from "react";
import styles from "./styles/KanjiKanaru.module.css";

interface GuessInputProps {
  onSubmit: (kanji: string) => Promise<string | null>;
  disabled: boolean;
  submitting?: boolean;
}

/**
 * Single kanji input field with submit button.
 * Handles IME composition events to prevent premature submission.
 * Returns an error message from onSubmit if validation fails.
 * Supports async onSubmit for server-side evaluation.
 */
export default function GuessInput({
  onSubmit,
  disabled,
  submitting = false,
}: GuessInputProps) {
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [shaking, setShaking] = useState(false);
  const composingRef = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const triggerShake = useCallback(() => {
    setShaking(true);
    setTimeout(() => setShaking(false), 400);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (composingRef.current) return;
    if (submitting) return;
    const trimmed = value.trim();
    if (!trimmed) {
      setError(
        "\u6F22\u5B57\u30921\u6587\u5B57\u5165\u529B\u3057\u3066\u304F\u3060\u3055\u3044",
      );
      triggerShake();
      return;
    }

    const errorMsg = await onSubmit(trimmed);
    if (errorMsg) {
      setError(errorMsg);
      triggerShake();
    } else {
      setError(null);
      setValue("");
    }
    inputRef.current?.focus();
  }, [value, onSubmit, triggerShake, submitting]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && !composingRef.current) {
        e.preventDefault();
        void handleSubmit();
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
          placeholder={
            submitting
              ? "\u9001\u4FE1\u4E2D..."
              : "\u6F22\u5B57\u3092\u5165\u529B"
          }
          aria-label="\u6F22\u5B57\u3092\u5165\u529B"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
        />
        <button
          className={styles.submitButton}
          onClick={() => void handleSubmit()}
          disabled={disabled}
          type="button"
        >
          {submitting ? "\u9001\u4FE1\u4E2D..." : "\u9001\u4FE1"}
        </button>
      </div>
      <div className={styles.errorMessage} role="alert" aria-live="polite">
        {error ?? ""}
      </div>
    </div>
  );
}
