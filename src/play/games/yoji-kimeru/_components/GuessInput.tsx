"use client";

import { useState, useRef, useCallback, useEffect, useId } from "react";
import Button from "@/components/Button";
import ErrorMessage from "@/components/ErrorMessage";
import {
  EVALUATE_UNAVAILABLE_MESSAGE,
  type GuessSubmitResult,
} from "@/play/games/shared/_lib/guessSubmit";
import styles from "./styles/YojiKimeru.module.css";

/** Duration of the shake animation in ms. Must match CSS .shaking animation duration. */
const SHAKE_DURATION_MS = 400;

interface GuessInputProps {
  onSubmit: (input: string) => Promise<GuessSubmitResult>;
  disabled: boolean;
  submitting?: boolean;
  /** 送信中でないのに入力できないとき、なぜ入力できないかを言う文（§6 無効）。 */
  disabledReason?: string;
}

/**
 * Text input field for 4-character kanji input with submit button.
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
  const shakeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clear the shake timer on unmount to prevent state updates after cleanup.
  useEffect(() => {
    return () => {
      if (shakeTimerRef.current) clearTimeout(shakeTimerRef.current);
    };
  }, []);

  const triggerShake = useCallback(() => {
    setShaking(true);
    if (shakeTimerRef.current) clearTimeout(shakeTimerRef.current);
    shakeTimerRef.current = setTimeout(
      () => setShaking(false),
      SHAKE_DURATION_MS,
    );
  }, []);

  const handleSubmit = useCallback(async () => {
    if (composingRef.current) return;
    if (submitting) return;
    const trimmed = value.trim();
    if (!trimmed) {
      setError("四字熟語を入力してください");
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
          disabled={disabled || submitting}
          placeholder={submitting ? "送信中..." : "四字熟語を入力"}
          aria-label="四字熟語を入力"
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
        />
        <Button
          variant="primary"
          onClick={() => void handleSubmit()}
          disabled={disabled || submitting}
          aria-describedby={showReason ? reasonId : undefined}
        >
          {submitting ? "送信中..." : "送信"}
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
