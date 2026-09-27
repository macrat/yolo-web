"use client";

import { useState, useRef, useCallback, type Ref } from "react";
import Button from "@/components/Button";
import ErrorMessage from "@/components/ErrorMessage";
import Field from "@/components/Field";
import Input from "@/components/Input";
import {
  EVALUATE_UNAVAILABLE_MESSAGE,
  type GuessSubmitResult,
} from "@/play/games/shared/_lib/guessSubmit";
import styles from "./styles/KanjiKanaru.module.css";

const EMPTY_INPUT_MESSAGE = "漢字を1文字入力してください";

interface GuessInputProps {
  /** 欄のラベル。いまの難易度と残りの回数を言う（「中級の漢字を1字入力（あと6回）」）。 */
  label: string;
  onSubmit: (kanji: string) => Promise<GuessSubmitResult>;
  /** 送信中か。送信のボタンを押せなくし、字で言う。欄は無効にせず、文字盤を閉じさせない。 */
  submitting?: boolean;
  /** 問題を読み込んでいるあいだ true。欄とボタンを無効にする。 */
  loading?: boolean;
  /** 読み込み中を言う文の id。無効の欄の説明として読ませる。 */
  loadingTextId?: string;
  /** 入力欄と送信のボタンの並び。推測のあと、画面に入るまで送る相手になる。 */
  rowRef?: Ref<HTMLDivElement>;
}

/**
 * 漢字を1字入れる欄と送信のボタン。IME の変換中の Enter では送らない。
 * 入力の誤りは欄に結び、答え合わせができなかったことは、入力は正しいので欄の外で言う。
 */
export default function GuessInput({
  label,
  onSubmit,
  submitting = false,
  loading = false,
  loadingTextId,
  rowRef,
}: GuessInputProps) {
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [unavailable, setUnavailable] = useState(false);
  const composingRef = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = useCallback(async () => {
    if (composingRef.current || submitting || loading) return;
    const trimmed = value.trim();
    if (!trimmed) {
      setError(EMPTY_INPUT_MESSAGE);
      return;
    }

    setUnavailable(false);
    const result = await onSubmit(trimmed);
    if (result.kind === "invalid") {
      setError(result.message);
    } else if (result.kind === "unavailable") {
      setError(null);
      setUnavailable(true);
    } else {
      setError(null);
      setValue("");
    }
    inputRef.current?.focus();
  }, [value, onSubmit, submitting, loading]);

  return (
    <div className={styles.inputArea}>
      <Field label={label} error={error ?? undefined} disabled={loading}>
        {(control) => (
          <div ref={rowRef} className={styles.inputRow}>
            <Input
              {...control}
              ref={inputRef}
              className={styles.inputField}
              aria-describedby={
                [control["aria-describedby"], loading ? loadingTextId : null]
                  .filter(Boolean)
                  .join(" ") || undefined
              }
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
                setError(null);
                setUnavailable(false);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !composingRef.current) {
                  e.preventDefault();
                  void handleSubmit();
                }
              }}
              onCompositionStart={() => {
                composingRef.current = true;
              }}
              onCompositionEnd={() => {
                composingRef.current = false;
              }}
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
            />
            <Button
              variant="primary"
              onClick={() => void handleSubmit()}
              disabled={submitting || loading}
              aria-describedby={loading ? loadingTextId : undefined}
            >
              {/* 面の字は2つとも同じ場所に重ねて描き、広いほうの幅をいつも取っておく。送っているあいだに
                  ボタンが広がって欄が縮むことがない。見えていない面は読み上げでも読まない。 */}
              <span className={styles.submitFaces}>
                <span hidden={submitting || undefined}>送信</span>
                <span hidden={!submitting || undefined}>送信中……</span>
              </span>
            </Button>
          </div>
        )}
      </Field>
      {unavailable && <ErrorMessage message={EVALUATE_UNAVAILABLE_MESSAGE} />}
    </div>
  );
}
