"use client";

import {
  useState,
  useRef,
  useCallback,
  type ReactNode,
  type RefObject,
} from "react";
import Button from "@/components/Button";
import ErrorMessage from "@/components/ErrorMessage";
import Field from "@/components/Field";
import Input from "@/components/Input";
import PhrasedText from "@/components/PhrasedText";
import {
  EVALUATE_UNAVAILABLE_MESSAGE,
  type GuessSubmitResult,
} from "@/play/games/shared/_lib/guessSubmit";
import styles from "./styles/YojiKimeru.module.css";

interface GuessInputProps {
  /** 欄の上に置くラベル。いまの難易度と残りの回数も言う（「中級の四字熟語を入力（あと6回）」）。 */
  label: ReactNode;
  onSubmit: (input: string) => Promise<GuessSubmitResult>;
  submitting: boolean;
  /** 欄の要素。推測のあと、画面の外に出た欄を画面に入れるために、呼び出し側が測る。 */
  fieldRef?: RefObject<HTMLInputElement | null>;
}

/**
 * 四字熟語を書く欄と送信のボタン。変換の途中の Enter では送らない。
 * 入力の誤りは欄に結んで欄の直下で言い、答え合わせができなかったことは、入力は正しいので欄の外で言う。
 */
export default function GuessInput({
  label,
  onSubmit,
  submitting,
  fieldRef,
}: GuessInputProps) {
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [unavailable, setUnavailable] = useState(false);
  const composingRef = useRef(false);
  const ownRef = useRef<HTMLInputElement>(null);
  const inputRef = fieldRef ?? ownRef;

  const handleSubmit = useCallback(async () => {
    if (composingRef.current) return;
    if (submitting) return;
    const trimmed = value.trim();
    if (!trimmed) {
      setError("四字熟語を入力してください");
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
    // 欄が画面の外にあれば、送り方は呼び出し側が決める（DESIGN.md §8）。
    inputRef.current?.focus({ preventScroll: true });
  }, [value, onSubmit, submitting, inputRef]);

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
    <div className={styles.guess}>
      <Field label={label} error={error ?? undefined}>
        {(control) => (
          <div className={styles.inputRow}>
            <Input
              {...control}
              ref={inputRef}
              // 送っているあいだも欄は無効にせず、書き換えだけを止める。無効にするとフォーカスが欄から外れ、
              // 次の推測を入れる所を来訪者が探し直すことになる。
              readOnly={submitting}
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
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
            />
            <Button
              variant="primary"
              onClick={() => void handleSubmit()}
              disabled={submitting}
            >
              {/* 面の字は2つとも同じ場所に重ねて描き、広いほうの幅をいつも取っておく。送っているあいだに
                  ボタンが広がって欄が縮むことがない。見えていない面は読み上げでも読まない。 */}
              <span className={styles.submitFaces}>
                <PhrasedText
                  as="span"
                  phrases={["送信"]}
                  hidden={submitting || undefined}
                />
                <PhrasedText
                  as="span"
                  phrases={["送信中……"]}
                  hidden={!submitting || undefined}
                />
              </span>
            </Button>
          </div>
        )}
      </Field>
      {unavailable && <ErrorMessage message={EVALUATE_UNAVAILABLE_MESSAGE} />}
    </div>
  );
}
