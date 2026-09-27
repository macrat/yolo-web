"use client";

/**
 * Base64Tile — Base64 のエンコードとデコードのタイル（DESIGN.md §8）。
 *
 * 道具箱と詳細ページは、同じこの部品を描く。full / encode / decode は同じ部品の設定の違いで、別の実装を持たない。
 * 変換は logic.ts の encodeBase64 / decodeBase64 / toUrlSafe だけが行う。
 *
 * ## variant
 *
 * - `"full"`（既定）: 変換の向きのラジオボタンを出し、来訪者がエンコードとデコードを切り替える。
 * - `"encode"`: 向きをエンコードに決め、ラジオボタンを出さない。
 * - `"decode"`: 向きをデコードに決め、ラジオボタンを出さない。
 *
 * URL-safe のチェックボックスは、エンコードの向きのときだけ出す。デコードはどちらの形も読むので、デコードの
 * 向きで出すと、押しても結果が変わらないコントロールになる。
 *
 * ## 組み方
 *
 * 入力と操作は囲まず、結果だけを結果のボックスに入れる。結果は1続きの文字列なので、本文の大きさで本文の幅に
 * 組み、通常の禁則で折る。1行に収まらない英数字の続きだけを語の中で折る。コピーのボタンはボックスの頭の行に
 * 置く。
 *
 * ## 読み上げ
 *
 * 結果が出たことを、見えないライブリージョンの短い文で知らせる。デコードできない入力は、入力欄のエラーの
 * 理由の文（role="alert"）が知らせる。
 *
 * 同じページに複数を置いても、id は useId で1つずつ別になる。
 */

import { useId, useMemo, useState } from "react";
import RadioGroup from "@/components/RadioGroup";
import Field from "@/components/Field";
import Textarea from "@/components/Textarea";
import Checkbox from "@/components/Checkbox";
import CopyButton from "@/components/CopyButton";
import ResultBox from "@/components/ResultBox";
import { encodeBase64, decodeBase64, toUrlSafe } from "./logic";
import styles from "./Base64Tile.module.css";

type Direction = "encode" | "decode";

export type Base64TileVariant = "full" | "encode" | "decode";

const DIRECTION_OPTIONS: { label: string; value: Direction }[] = [
  { label: "エンコード", value: "encode" },
  { label: "デコード", value: "decode" },
];

/** 向きごとの、入力欄のラベル・結果の名前・コピーで写すもの。 */
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

const DECODE_ERROR =
  "Base64 として読めない文字列です。入力内容を確認してください。";

export interface Base64TileProps {
  /** 表示の違い（既定: "full"） */
  variant?: Base64TileVariant;
  /** 初めの入力（既定: ""） */
  defaultInput?: string;
  className?: string;
}

function convert(
  input: string,
  direction: Direction,
  urlSafe: boolean,
): { output: string; failed: boolean } {
  if (!input) return { output: "", failed: false };
  if (direction === "encode") {
    const encoded = encodeBase64(input).output;
    return { output: urlSafe ? toUrlSafe(encoded) : encoded, failed: false };
  }
  const decoded = decodeBase64(input);
  return decoded.success
    ? { output: decoded.output, failed: false }
    : { output: "", failed: true };
}

export default function Base64Tile({
  variant = "full",
  defaultInput = "",
  className,
}: Base64TileProps = {}) {
  const urlSafeDescId = `${useId()}-url-safe-desc`;

  const fixedDirection: Direction | null = variant === "full" ? null : variant;
  const [chosenDirection, setChosenDirection] = useState<Direction>("encode");
  const direction = fixedDirection ?? chosenDirection;
  const [urlSafe, setUrlSafe] = useState(false);
  const [input, setInput] = useState(defaultInput);

  const { output, failed } = useMemo(
    () => convert(input, direction, urlSafe),
    [input, direction, urlSafe],
  );
  const text = DIRECTION_TEXT[direction];

  // 開いたときから出ている結果（初めの入力の結果）は登場の動きを持たない。一度消えたあとに来訪者の入力で
  // 現れた結果だけが動く（§11）。
  const [resultIsInitial, setResultIsInitial] = useState(() => output !== "");
  if (resultIsInitial && output === "") setResultIsInitial(false);

  return (
    <div className={[styles.tile, className].filter(Boolean).join(" ")}>
      {fixedDirection === null && (
        <RadioGroup
          options={DIRECTION_OPTIONS}
          value={chosenDirection}
          onChange={(value) => setChosenDirection(value as Direction)}
          legend="変換の向き"
        />
      )}

      {direction === "encode" && (
        <div className={styles.option}>
          <Checkbox
            label="URL-safe 形式で出力"
            checked={urlSafe}
            onChange={(e) => setUrlSafe(e.target.checked)}
            aria-describedby={urlSafeDescId}
          />
          <span id={urlSafeDescId} className={styles.optionDesc}>
            （+ → -、/ → _。JWT や URL のクエリ向け）
          </span>
        </div>
      )}

      <Field label={text.inputLabel} error={failed ? DECODE_ERROR : undefined}>
        {(control) => (
          <Textarea
            {...control}
            variant="mono"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              direction === "decode"
                ? "標準形・URL-safe 形・パディングなしのどれも読めます"
                : undefined
            }
            rows={6}
            spellCheck={false}
          />
        )}
      </Field>

      <p role="status" aria-live="polite" className="visually-hidden">
        {output ? text.done : ""}
      </p>

      {output && (
        <ResultBox
          caption={text.caption}
          appear={!resultIsInitial}
          copyButton={
            <CopyButton text={output} target={text.copyTarget} align="end" />
          }
        >
          <p className={styles.output}>{output}</p>
        </ResultBox>
      )}
    </div>
  );
}
