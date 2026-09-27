"use client";

import { useEffect, useRef, useState } from "react";
import Button from "@/components/Button";
import Field from "@/components/Field";
import ResultBox from "@/components/ResultBox";
import Select from "@/components/Select";
import Textarea from "@/components/Textarea";
import { generateQrCode, type QrCodeFailure } from "./logic";
import {
  DEFAULT_LEVEL,
  LEVELS,
  LOWEST_LEVEL,
  formatCount,
  levelName,
  maxChars,
  type ErrorCorrectionLevel,
} from "./levels";
import styles from "./QrCodeTile.module.css";

/** 打ち終えてからQRコードを作るまでの間（ms）。打つたびに作り直して画像がちらつかないよう、手が止まるのを待つ。 */
const DEBOUNCE_MS = 300;

/** 代替テキストに入れる文の長さの上限（字）。長い文は、ここで切って「…」を添える。 */
const ALT_TEXT_LIMIT = 40;

/** 作れなかった理由と、そのとき選んでいたレベル。 */
interface Failure {
  reason: QrCodeFailure;
  level: ErrorCorrectionLevel;
}

/** 作れなかったことと、どう直すかを言う文。長すぎるときは、そのレベルの名前と入る字の数を添える。 */
function failureMessage({ reason, level }: Failure): string {
  if (reason === "failed") {
    return "QRコードの画像を描けませんでした。ページを読み込み直してから、もう一度試してください。";
  }
  const { ascii, japanese } = maxChars(level);
  const limit = `エラー訂正レベル「${levelName(level)}」で入るのは、半角英数なら${formatCount(ascii)}字、日本語なら${formatCount(japanese)}字までです。`;
  const fix =
    level === LOWEST_LEVEL
      ? "文を短くしてください。"
      : "文を短くするか、エラー訂正レベルを下げてください。";
  return `文が長すぎてQRコードに入りません。${limit}${fix}`;
}

/** 作ったQRコード。text は、その画像が符号にした文。 */
interface QrImage {
  text: string;
  dataUrl: string;
  size: number;
}

export type QrCodeTileVariant = "full";

export interface QrCodeTileProps {
  /** 道具の見せ方。QRコードの道具は、入力と画像を並べた1つの形だけを持つ。 */
  variant?: QrCodeTileVariant;
  className?: string;
}

/**
 * QRコードを作る道具（DESIGN.md §8）。入力欄は囲まず、作った画像だけを結果のボックスに入れる。画像を保存する
 * 操作は、結果のボックスのすぐ下に置く。
 *
 * 打つたびに作り直すので、結果のボックスは初めて画像ができたときにだけ現れる動きを持ち、文を直しているあいだは
 * 画像だけが替わる。
 */
export default function QrCodeTile({ className }: QrCodeTileProps = {}) {
  const [input, setInput] = useState("");
  const [level, setLevel] = useState<ErrorCorrectionLevel>(DEFAULT_LEVEL);
  const [image, setImage] = useState<QrImage | null>(null);
  const [failure, setFailure] = useState<Failure | null>(null);
  const generatedLevel = useRef(level);

  useEffect(() => {
    // レベルを選び直したときは待たずに作り直す。選ぶのは1回の操作で、打つ途中のように続かないので、待つと
    // そのあいだ前のレベルの画像や誤りが残る。
    const levelChanged = generatedLevel.current !== level;
    const timer = setTimeout(
      () => {
        generatedLevel.current = level;
        if (!input.trim()) {
          setImage(null);
          setFailure(null);
          return;
        }
        const result = generateQrCode(input, level);
        if (result.success) {
          setImage({ text: input, dataUrl: result.dataUrl, size: result.size });
          setFailure(null);
        } else {
          setImage(null);
          setFailure({ reason: result.error, level });
        }
      },
      levelChanged ? 0 : DEBOUNCE_MS,
    );
    return () => clearTimeout(timer);
  }, [input, level]);

  const handleDownload = () => {
    if (!image) return;
    const link = document.createElement("a");
    link.href = image.dataUrl;
    link.download = "qrcode.png";
    link.click();
  };

  return (
    <div className={[styles.tile, className].filter(Boolean).join(" ")}>
      <Field
        label="QRコードにする文字やURL"
        error={
          failure && failure.level === level
            ? failureMessage(failure)
            : undefined
        }
      >
        {(control) => (
          <Textarea
            {...control}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="https://example.com"
            rows={3}
            spellCheck={false}
          />
        )}
      </Field>

      <Field label="エラー訂正レベル">
        {(control) => (
          <Select
            {...control}
            value={level}
            onChange={(e) => setLevel(e.target.value as ErrorCorrectionLevel)}
          >
            {LEVELS.map(({ value, name, recovery }) => (
              <option key={value} value={value}>
                {`${name}（${value}・${recovery}）`}
              </option>
            ))}
          </Select>
        )}
      </Field>

      <p role="status" className="visually-hidden">
        {image ? "QRコードを作りました" : ""}
      </p>

      {image && (
        <div className={styles.result}>
          <ResultBox caption="QRコード" appear>
            {/* eslint-disable-next-line @next/next/no-img-element -- ブラウザで描いた data URL をそのまま見せる */}
            <img
              className={styles.image}
              src={image.dataUrl}
              width={image.size}
              height={image.size}
              alt={`「${abbreviate(image.text)}」のQRコード`}
            />
          </ResultBox>
          <Button
            variant="primary"
            className={styles.download}
            onClick={handleDownload}
          >
            PNG画像をダウンロード
          </Button>
        </div>
      )}
    </div>
  );
}

function abbreviate(text: string): string {
  const chars = Array.from(text);
  if (chars.length <= ALT_TEXT_LIMIT) return text;
  return `${chars.slice(0, ALT_TEXT_LIMIT).join("")}…`;
}
