"use client";

/**
 * Base64Tile — Base64 のエンコードとデコードの道具。道具のページ（src/app/tools/base64/page.tsx）が描く。
 *
 * 向きのラジオボタン・URL-safe のチェックボックス・入力欄は枠で囲まず（DESIGN.md §8 入力）、変換の結果だけを
 * 結果のボックスに入れる（§8 結果）。変換は logic.ts の関数が持ち、この部品は入力と表示だけを持つ。
 *
 * - エンコードの結果（Base64）は符号にした文字列で、全体が1語である。「-」や「/」の後ろで折らず、字のあいだの
 *   どこでも折って行を埋める。デコードの結果（文）は本文と同じく通常の禁則で折る。
 * - 向きを切り替えると、いまの結果を入力に移し、変換した結果を逆の向きでそのまま確かめられる。
 * - デコードで、打ちかけ（字の数が4字の区切りに合わない・中身が文字の途中で切れる）の入力のあいだは、前の
 *   結果を出したままにし、打つ手が止まってから理由の文を出す。1字ごとに結果が消えて下が上下し、登場の動きと
 *   知らせが繰り返されないためである。Base64 に使わない字は、打った所ですぐ理由を言う。
 * - 結果が現れて画面の下にはみ出すときは、結果が見えるまで送る（src/lib/reveal.ts）。結果が出たことは、
 *   画面に出さない status の行で知らせる。
 */

import { useEffect, useId, useMemo, useRef, useState } from "react";
import RadioGroup from "@/components/RadioGroup";
import Field from "@/components/Field";
import Textarea from "@/components/Textarea";
import Checkbox from "@/components/Checkbox";
import CopyButton from "@/components/CopyButton";
import ResultBox from "@/components/ResultBox";
import { revealResult } from "@/lib/reveal";
import {
  encodeBase64,
  decodeBase64,
  toUrlSafe,
  type DecodeError,
} from "./logic";
import styles from "./Base64Tile.module.css";

type Direction = "encode" | "decode";

const DIRECTION_OPTIONS: { label: string; value: Direction }[] = [
  { label: "エンコード", value: "encode" },
  { label: "デコード", value: "decode" },
];

/** 向きごとの、入力欄のラベル・結果の名前・コピーで写すもの・結果が出たときの知らせ。 */
const DIRECTION_TEXT: Record<
  Direction,
  { inputLabel: string; caption: string; copyTarget: string; done: string }
> = {
  encode: {
    inputLabel: "エンコードするテキスト",
    caption: "エンコードしたBase64",
    copyTarget: "Base64",
    done: "エンコードしました",
  },
  decode: {
    inputLabel: "デコードするBase64",
    caption: "デコードしたテキスト",
    copyTarget: "テキスト",
    done: "デコードしました",
  },
};

/** 打つ手が止まったとみなすまでの時間（ms）。打ちかけの入力の理由の文は、これだけ手が止まってから出す。 */
export const TYPING_PAUSE_MS = 600;

/** 打ちかけの入力で起きうる理由。これらは打ち進めると消えうるので、手が止まるまで言わない。 */
const PENDING_KINDS: ReadonlySet<DecodeError["kind"]> = new Set([
  "incomplete",
  "not-text",
]);

/** デコードできなかった理由と、どう直すかを言う文（§8）。 */
function decodeErrorMessage(error: DecodeError): string {
  switch (error.kind) {
    case "invalid-char":
      return `Base64に使わない字「${error.char}」が入っています。使えるのは英字・数字と「+」「/」「-」「_」「=」です。ほかの字を取り除いてください。`;
    case "misplaced-padding":
      return "「=」は末尾にだけ置けます。途中の「=」を取り除くか、2つの文字列に分けてデコードしてください。";
    case "incomplete":
      return "字の数が1つ足りないか、1つ多すぎます。最後まで写せているか、余分な字が無いかを確かめてください。";
    case "not-text":
      return "中身を文字（UTF-8）として読めませんでした。文字をBase64にしたものか、途中で切れていないかを確かめてください。";
  }
}

type Conversion =
  | { output: string; error?: undefined }
  | { output?: undefined; error: DecodeError };

function convert(
  input: string,
  direction: Direction,
  urlSafe: boolean,
): Conversion {
  if (direction === "encode") {
    const encoded = encodeBase64(input);
    return { output: urlSafe ? toUrlSafe(encoded) : encoded };
  }
  const decoded = decodeBase64(input);
  return decoded.success
    ? { output: decoded.output }
    : { error: decoded.error };
}

export default function Base64Tile() {
  // URL-safe の説明の id を、この部品の中で作ってチェックボックスと結ぶ。
  const urlSafeDescId = useId();
  const operationsRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLElement>(null);

  const [direction, setDirection] = useState<Direction>("encode");
  const [urlSafe, setUrlSafe] = useState(false);
  const [input, setInput] = useState("");
  const [pausedInput, setPausedInput] = useState<string | null>(null);
  // 打ちかけのあいだ出したままにする、最後に変換できた結果。
  const [lastOutput, setLastOutput] = useState("");

  const conversion = useMemo(
    () => convert(input, direction, urlSafe),
    [input, direction, urlSafe],
  );

  useEffect(() => {
    const timer = setTimeout(() => setPausedInput(input), TYPING_PAUSE_MS);
    return () => clearTimeout(timer);
  }, [input]);

  const typingPaused = pausedInput === input;
  const error =
    conversion.error &&
    (typingPaused || !PENDING_KINDS.has(conversion.error.kind))
      ? conversion.error
      : undefined;
  const output = conversion.error
    ? error
      ? ""
      : lastOutput
    : conversion.output;
  if (output !== lastOutput) setLastOutput(output);

  const resultShown = output !== "";
  useEffect(() => {
    if (resultShown && operationsRef.current && resultRef.current) {
      revealResult(operationsRef.current, resultRef.current);
    }
  }, [resultShown]);

  const text = DIRECTION_TEXT[direction];

  function handleDirectionChange(next: Direction): void {
    if (conversion.output) setInput(conversion.output);
    setDirection(next);
  }

  return (
    <div className={styles.tile}>
      <RadioGroup
        options={DIRECTION_OPTIONS}
        value={direction}
        onChange={(value) => handleDirectionChange(value as Direction)}
        legend="変換の向き"
      />

      {direction === "encode" && (
        <div className={styles.option}>
          <Checkbox
            label="URL-safe形式で出力"
            checked={urlSafe}
            onChange={(e) => setUrlSafe(e.target.checked)}
            aria-describedby={urlSafeDescId}
          />
          <span id={urlSafeDescId} className={styles.optionDesc}>
            （+を-に、/を_にする。JWTやURLのクエリ向け）
          </span>
        </div>
      )}

      <div ref={operationsRef}>
        <Field
          label={text.inputLabel}
          error={error ? decodeErrorMessage(error) : undefined}
        >
          {(control) => (
            <Textarea
              {...control}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                direction === "decode"
                  ? "標準形・URL-safe形・パディングなし・改行入りのどれも読めます"
                  : undefined
              }
              rows={6}
              spellCheck={false}
            />
          )}
        </Field>
      </div>

      <p role="status" aria-live="polite" className="visually-hidden">
        {resultShown ? text.done : ""}
      </p>

      {resultShown && (
        <ResultBox
          ref={resultRef}
          caption={text.caption}
          appear
          copyButton={
            <CopyButton text={output} target={text.copyTarget} align="end" />
          }
        >
          <p
            className={
              direction === "encode"
                ? `${styles.output} ${styles.encoded}`
                : styles.output
            }
          >
            {output}
          </p>
        </ResultBox>
      )}
    </div>
  );
}
