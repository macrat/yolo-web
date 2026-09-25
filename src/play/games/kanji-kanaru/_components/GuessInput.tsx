"use client";

import { useState, useRef, useCallback, useId } from "react";
import Button from "@/components/Button";
import ErrorMessage from "@/components/ErrorMessage";
import {
  EVALUATE_UNAVAILABLE_MESSAGE,
  type GuessSubmitResult,
} from "@/play/games/shared/_lib/guessSubmit";
import styles from "./styles/KanjiKanaru.module.css";

interface GuessInputProps {
  onSubmit: (kanji: string) => Promise<GuessSubmitResult>;
  disabled: boolean;
  submitting?: boolean;
  /** 送信中でないのに入力できないとき、なぜ入力できないかを言う文（§6 無効）。 */
  disabledReason?: string;
}

/**
 * Single kanji input field with submit button.
 * Handles IME composition events to prevent premature submission.
 * An input error from onSubmit is tied to the field; a failed evaluation is
 * announced outside the field, since the input itself is valid.
 * Supports async onSubmit for server-side evaluation.
 */
export default function GuessInput({
  onSubmit,
  disabled,
  submitting = false,
  disabledReason,
}: GuessInputProps) {
  const reasonId = useId();
  const errorId = useId();
  // 送信中はボタンの字が「送信中...」と理由を言うので、理由の文を別に出さない。
  const showReason = Boolean(disabled && !submitting && disabledReason);
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [unavailable, setUnavailable] = useState(false);
  const [shaking, setShaking] = useState(false);
  const composingRef = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const describedBy =
    [showReason ? reasonId : null, error ? errorId : null]
      .filter(Boolean)
      .join(" ") || undefined;

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

    setUnavailable(false);
    const result = await onSubmit(trimmed);
    if (result.kind === "invalid") {
      setError(result.message);
      triggerShake();
    } else if (result.kind === "unavailable") {
      setError(null);
      setUnavailable(true);
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
          data-field
          type="text"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setError(null);
            setUnavailable(false);
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
          aria-label={"\u6F22\u5B57\u3092\u5165\u529B"}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
        />
        <Button
          variant="primary"
          onClick={() => void handleSubmit()}
          disabled={disabled}
          aria-describedby={showReason ? reasonId : undefined}
        >
          {submitting ? "\u9001\u4FE1\u4E2D..." : "\u9001\u4FE1"}
        </Button>
      </div>
      {showReason && (
        <p id={reasonId} className={styles.disabledReason}>
          {disabledReason}
        </p>
      )}
      {error && <ErrorMessage id={errorId} message={error} />}
      {unavailable && <ErrorMessage message={EVALUATE_UNAVAILABLE_MESSAGE} />}
    </div>
  );
}
