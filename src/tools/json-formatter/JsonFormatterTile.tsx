"use client";

import { useEffect, useRef, useState, type FocusEvent } from "react";
import { flushSync } from "react-dom";
import Button from "@/components/Button";
import CopyButton from "@/components/CopyButton";
import Field from "@/components/Field";
import ResultBox from "@/components/ResultBox";
import Select from "@/components/Select";
import Textarea from "@/components/Textarea";
import { revealFocusedFrame, revealResult } from "@/lib/reveal";
import { formatJson, minifyJson, validateJson, type IndentType } from "./logic";
import styles from "./JsonFormatterTile.module.css";

/** 操作が生んだ結果。整形と圧縮はコード、検証は文で出す。 */
type JsonResult =
  { kind: "format" | "minify"; code: string } | { kind: "valid" };

const RESULT_CAPTIONS: Record<JsonResult["kind"], string> = {
  format: "整形したJSON",
  minify: "圧縮したJSON",
  valid: "検証の結果",
};

/** 結果が出たときに読み上げで言う文。 */
const RESULT_ANNOUNCEMENTS: Record<JsonResult["kind"], string> = {
  format: "整形しました",
  minify: "圧縮しました",
  valid: "正しいJSONです",
};

const EMPTY_INPUT_ERROR = "JSONを入力してください。";
const INVALID_JSON_ERROR = "JSONの形式が正しくありません。";

/**
 * 数と、それに続く単位の字をつなぎ、あいだで折らない（「3行目」を「3行／目」に、「3文字目付近」を「3文字目付／近」に
 * しない。§4）。字のあいだに幅の無い WORD JOINER を挟む。エラーの文は Field が字で受けるので、折り方を字の側で決める。
 */
function keepTogether(text: string): string {
  return [...text].join("\u2060");
}

/**
 * JSON.parse の英語のエラーを、どこが誤りかを添えた日本語の文にする。英語の生のエラーは来訪者に見せない。
 * 位置を言わないエンジン（Safari の JavaScriptCore）では、位置を添えずに言う。
 */
function toJapaneseJsonError(rawError: string): string {
  const lineColMatch = rawError.match(/line\s+(\d+)\s+column\s+(\d+)/i);
  if (lineColMatch) {
    const line = keepTogether(`${lineColMatch[1]}行目`);
    const column = keepTogether(`${lineColMatch[2]}文字目付近`);
    return `${INVALID_JSON_ERROR}（${line}、${column}）`;
  }
  const positionMatch = rawError.match(/position\s+(\d+)/i);
  if (positionMatch) {
    // エンジンの位置は0から数えるので、来訪者が数える1からの数にする。
    const column = keepTogether(`${Number(positionMatch[1]) + 1}文字目付近`);
    return `${INVALID_JSON_ERROR}（先頭から${column}）`;
  }
  return INVALID_JSON_ERROR;
}

/**
 * JSON の整形・圧縮・検証（DESIGN.md §8）。入力は囲まず、結果だけを結果のボックスに入れる。整形と圧縮の
 * 結果は、結果のボックスがそのままコードのボックスになり、写すコピーのボタンをボックスの頭の行に持つ。
 * 数百行の結果でも、来訪者は結果の頭でそのまま写せる。
 *
 * 整形した JSON は字下げが中身なので、折り返さずボックスの中で横に送る（§5）。圧縮した JSON は改行を持たない
 * 1続きの文字列なので、ボックスの幅で、どの字のあいだでも折り返し、送らずに終わりまで読める。
 *
 * 結果が画面に入りきらないときは、操作の並びを画面の上に置き、その下に結果を見せる（§8）。キーボードでコードの区画に
 * 着いたときは、ボックスの頭とフォーカスのリングの上の辺から見せる。
 */
export default function JsonFormatterTile() {
  const [input, setInput] = useState("");
  const [indent, setIndent] = useState<IndentType>("2");
  const [error, setError] = useState("");
  const [result, setResult] = useState<JsonResult | null>(null);
  // 操作ごとに増やし、結果のボックスを新しく出し直して登場の動きと読み上げを毎回起こす。
  const [run, setRun] = useState(0);

  const operationsRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLElement>(null);

  function showResult(next: JsonResult): void {
    setError("");
    setResult(next);
    setRun((previous) => previous + 1);
  }

  function showError(message: string): void {
    // 同じ誤りのまま押し直したときも、エラーの文を入れ直して読み上げに言い直させる。文を消した形を先に
    // 描き切ってから入れるので、画面は一度も文の無い形を見せない。
    flushSync(() => setError(""));
    setError(message);
    setResult(null);
  }

  function runOperation(operate: (text: string) => JsonResult): void {
    if (!input.trim()) {
      showError(EMPTY_INPUT_ERROR);
      return;
    }
    try {
      showResult(operate(input));
    } catch (e) {
      showError(toJapaneseJsonError(e instanceof Error ? e.message : ""));
    }
  }

  const handleFormat = () =>
    runOperation((text) => ({
      kind: "format",
      code: formatJson(text, indent),
    }));

  const handleMinify = () =>
    runOperation((text) => ({ kind: "minify", code: minifyJson(text) }));

  const handleValidate = () =>
    runOperation((text) => {
      const validation = validateJson(text);
      if (!validation.valid) throw new Error(validation.error ?? "");
      return { kind: "valid" };
    });

  // キーボードでコードの区画に着いたら、ボックスの頭とリングの上の辺から見せる。マウスで押して着いたとき
  // （字を選ぶときなど）は、押した所を動かさない。
  function handleResultFocus(event: FocusEvent<HTMLElement>): void {
    const target = event.target;
    if (target === event.currentTarget || !target.matches(":focus-visible")) {
      return;
    }
    revealFocusedFrame(event.currentTarget);
  }

  useEffect(() => {
    if (run === 0 || !operationsRef.current || !resultRef.current) return;
    revealResult(operationsRef.current, resultRef.current);
  }, [run]);

  return (
    <div className={styles.tile}>
      <Field label="JSON" error={error || undefined}>
        {(control) => (
          <Textarea
            {...control}
            variant="mono"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder='{"key": "value"}'
            spellCheck={false}
            rows={12}
          />
        )}
      </Field>

      <div ref={operationsRef} className={styles.controls}>
        <Field label="インデント">
          {(control) => (
            <Select
              {...control}
              value={indent}
              onChange={(e) => setIndent(e.target.value as IndentType)}
            >
              <option value="2">2スペース</option>
              <option value="4">4スペース</option>
              <option value="tab">タブ</option>
            </Select>
          )}
        </Field>
        <div className={styles.buttons}>
          <Button variant="primary" onClick={handleFormat}>
            整形
          </Button>
          <Button onClick={handleMinify}>圧縮</Button>
          <Button onClick={handleValidate}>検証</Button>
        </div>
      </div>

      <p role="status" className="visually-hidden">
        {result && <span key={run}>{RESULT_ANNOUNCEMENTS[result.kind]}</span>}
      </p>

      {result &&
        (result.kind === "valid" ? (
          <ResultBox
            key={run}
            ref={resultRef}
            caption={RESULT_CAPTIONS.valid}
            appear
          >
            <p>正しいJSONです。</p>
          </ResultBox>
        ) : (
          <ResultBox
            key={run}
            ref={resultRef}
            caption={RESULT_CAPTIONS[result.kind]}
            kind="code"
            appear
            onFocus={handleResultFocus}
            copyButton={
              <CopyButton
                text={result.code}
                target={RESULT_CAPTIONS[result.kind]}
                align="end"
              />
            }
          >
            {result.kind === "format" ? (
              <pre>
                <code>{result.code}</code>
              </pre>
            ) : (
              <code className={styles.continuous}>{result.code}</code>
            )}
          </ResultBox>
        ))}
    </div>
  );
}
