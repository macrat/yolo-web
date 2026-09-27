"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Button from "@/components/Button";
import CopyButton from "@/components/CopyButton";
import Field from "@/components/Field";
import ResultBox from "@/components/ResultBox";
import Select from "@/components/Select";
import Textarea from "@/components/Textarea";
import { formatJson, minifyJson, validateJson, type IndentType } from "./logic";
import styles from "./JsonFormatterTile.module.css";

/**
 * 道具の組み方。
 * - "full": 整形・圧縮・検証の3つの操作を持つ。
 * - "format-only": 整形だけを持つ。
 */
export type JsonFormatterTileVariant = "full" | "format-only";

/** 操作が生んだ結果。整形と圧縮はコード、検証は文で出す。 */
type JsonResult =
  { kind: "format" | "minify"; code: string } | { kind: "valid" };

const RESULT_CAPTIONS: Record<JsonResult["kind"], string> = {
  format: "整形した JSON",
  minify: "圧縮した JSON",
  valid: "検証の結果",
};

/** 結果が出たときに読み上げで言う文。 */
const RESULT_ANNOUNCEMENTS: Record<JsonResult["kind"], string> = {
  format: "整形しました",
  minify: "圧縮しました",
  valid: "正しいJSONです",
};

const EMPTY_INPUT_ERROR = "JSONを入力してください。";

/**
 * JSON.parse の英語のエラーを、何行目の何文字目かを添えた日本語の文にする。英語の生のエラーは来訪者に
 * 見せない。
 */
function toJapaneseJsonError(rawError: string): string {
  const lineColMatch = rawError.match(/line\s+(\d+)\s+column\s+(\d+)/i);
  if (lineColMatch) {
    return `JSONの形式が正しくありません。（${lineColMatch[1]}行目、${lineColMatch[2]}文字目付近）`;
  }
  const posMatch = rawError.match(/position\s+(\d+)/i);
  if (posMatch) {
    return `JSONの形式が正しくありません。（位置 ${posMatch[1]} 付近）`;
  }
  return "JSONの形式が正しくありません。";
}

export interface JsonFormatterTileProps {
  /** 道具の組み方（既定: "full"） */
  variant?: JsonFormatterTileVariant;
}

/**
 * JSON の整形・圧縮・検証（DESIGN.md §8）。入力は囲まず、結果だけを結果のボックスに入れる。整形と圧縮の
 * 結果は、結果のボックスがそのままコードのボックスになり、写すコピーのボタンをボックスの頭の行に持つ。
 * 数百行の結果でも、来訪者は結果の頭でそのまま写せる。
 *
 * 結果が出たとき、コピーのボタン（検証の結果ではボックス）が画面の外にあれば、それが画面に入るまで即時に
 * 送る（§8・§11）。
 */
export default function JsonFormatterTile({
  variant = "full",
}: JsonFormatterTileProps = {}) {
  const [input, setInput] = useState("");
  const [indent, setIndent] = useState<IndentType>("2");
  const [error, setError] = useState("");
  const [result, setResult] = useState<JsonResult | null>(null);
  // 操作ごとに増やし、結果のボックスを新しく出し直して登場の動きと読み上げを毎回起こす。
  const [run, setRun] = useState(0);

  const resultRef = useRef<HTMLElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);

  const showResult = useCallback((next: JsonResult) => {
    setError("");
    setResult(next);
    setRun((previous) => previous + 1);
  }, []);

  const showError = useCallback((message: string) => {
    setError(message);
    setResult(null);
  }, []);

  const runOperation = useCallback(
    (operate: (text: string) => JsonResult) => {
      if (!input.trim()) {
        showError(EMPTY_INPUT_ERROR);
        return;
      }
      try {
        showResult(operate(input));
      } catch (e) {
        showError(toJapaneseJsonError(e instanceof Error ? e.message : ""));
      }
    },
    [input, showError, showResult],
  );

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

  useEffect(() => {
    if (run === 0) return;
    const target = copyRef.current ?? resultRef.current;
    if (!target) return;
    const viewport = window.visualViewport;
    const visibleBottom = viewport
      ? viewport.offsetTop + viewport.height
      : window.innerHeight;
    const overflow = target.getBoundingClientRect().bottom - visibleBottom;
    if (overflow > 0) {
      window.scrollBy({ top: Math.ceil(overflow), behavior: "instant" });
    }
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

      <div className={styles.controls}>
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
          {variant === "full" && (
            <>
              <Button onClick={handleMinify}>圧縮</Button>
              <Button onClick={handleValidate}>検証</Button>
            </>
          )}
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
            copyButton={
              <div ref={copyRef}>
                <CopyButton
                  text={result.code}
                  target={RESULT_CAPTIONS[result.kind]}
                  align="end"
                />
              </div>
            }
          >
            <pre>
              <code>{result.code}</code>
            </pre>
          </ResultBox>
        ))}
    </div>
  );
}
