"use client";

import {
  useId,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent,
  type Ref,
} from "react";
import {
  phrasedNameText,
  renderPhrasedName,
  type PhrasedName,
} from "@/components/PhrasedText";
import { trackGradient, type TrackStop } from "./trackPosition";
import { textEm } from "./textWidth";
import styles from "./Slider.module.css";

export { trackPosition, type TrackStop } from "./trackPosition";
export { textEm } from "./textWidth";

export interface SliderItem {
  /** 見えるラベル。スライダーの名前にもなる。見出しと同じく文節で折る（PhrasedName） */
  label: PhrasedName;
  value: number;
  min: number;
  max: number;
  /** 1刻みの大きさ（既定: 1） */
  step?: number;
  /** 新しい値を受け取る。引く・矢印のキー・− と ＋ のどれで変えたときも呼ばれる */
  onChange: (value: number) => void;
  /** 値の言い方。見える値と読み上げの両方に使う（既定: 数のまま） */
  formatValue?: (value: number) => string;
  /** − の名前。何をどちらへどれだけ動かすかを、刻みと単位を含めて言う（「品質を5%下げる」） */
  decreaseLabel: string;
  /** ＋ の名前（「品質を5%上げる」） */
  increaseLabel: string;
  /**
   * 色を作るスライダーの溝の色の止まり。止まりのそれぞれが指す値と、その値のときに作られる色を渡す。
   * 渡さないスライダーの溝は --paper-2 で塗る。
   */
  trackStops?: readonly TrackStop[];
  inputRef?: Ref<HTMLInputElement>;
}

interface SliderProps {
  /** 並べるスライダー。1本でも並びとして組み、並びのすべての行で列を揃える */
  items: readonly SliderItem[];
}

function format(item: SliderItem, value: number): string {
  return item.formatValue ? item.formatValue(value) : String(value);
}

/** とりうる値のうち、いちばん幅の広い言い方。値の場所がいつもこの幅を取る。 */
function longestValue(item: SliderItem): string {
  const step = item.step ?? 1;
  const candidates = [item.min, item.max, item.max - step, item.min + step];
  return candidates
    .map((value) => format(item, value))
    .reduce((a, b) => (textEm(b) > textEm(a) ? b : a));
}

/** 小数の刻みでも浮動小数の誤差を残さないよう、刻みと最小の値の小数の桁で丸める。 */
function decimals(value: number): number {
  const text = String(value);
  const point = text.indexOf(".");
  return point === -1 ? 0 : text.length - point - 1;
}

/**
 * value から direction の向きに1刻み動かした値。ネイティブの矢印のキーと同じく、最小の値から刻みの格子に揃え、
 * 最小と最大のあいだに収める。
 */
export function stepValue(
  value: number,
  direction: -1 | 1,
  min: number,
  max: number,
  step: number,
): number {
  const places = Math.max(decimals(step), decimals(min));
  const index = Math.round((value - min) / step) + direction;
  const next = Number((min + index * step).toFixed(places));
  return Math.min(Math.max(next, min), max);
}

/**
 * スライダー（DESIGN.md §6）。ネイティブの input type="range" に、値を1刻みずつ動かす − と ＋、いまの値の字を
 * 添える。指・マウス・キーボードでつまみがどう動くかはブラウザに任せ、input の上の出来事はここで受けない。
 *
 * 並びは、1行の組み（ラベル・溝・− 値 ＋）で溝が 5rem に届かないとき、並び全体を2行の組み（1行目にラベルと
 * − 値 ＋、2行目に溝）にする。切り替えはコンテナクエリで CSS だけで行うので、サーバーの HTML のまま最初の描画から
 * 正しい組みで描き、幅や文字の大きさが変わるとブラウザが組み直す（Slider.module.css）。ラベルと値の列は、字の幅の
 * 上限の見積もり（textWidth.ts）に固定するので、1行の組みの溝の長さは、どの字でも、Web フォントを読む前も後も、
 * コンテナクエリが問う幅と等しい。
 *
 * − と ＋ は、押してもフォーカスを動かさず（Tab の順にも入れない）、端では aria-disabled で無効にして、その形に
 * あったフォーカスも落とさない。押して変えた値は、使う側の onChange を直に呼んで渡す。新しい値は読み上げの知らせで
 * 1度言う。ただし、スライダーにフォーカスがあるまま押したときは、ネイティブのスライダーが変わった値を自分で
 * 読むので、知らせを出さない（同じ値を2度読ませない）。
 */
export default function Slider({ items }: SliderProps) {
  const id = useId();
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [notice, setNotice] = useState("");

  const labelWidth = Math.max(
    ...items.map((item) => textEm(phrasedNameText(item.label))),
  );
  const valueWidth = Math.max(
    ...items.map((item) => textEm(longestValue(item))),
  );
  // 1行の組みで溝のほかが取る幅: ラベル・ラベルのあとの 16px・− と ＋ の 88px・値・値の左右の 4px ずつ・
  // 溝の右の 8px。
  const fixedWidth = `calc(${labelWidth}em + ${valueWidth}em + 120px)`;

  const step = (index: number, direction: -1 | 1) => {
    const item = items[index];
    const next = stepValue(
      item.value,
      direction,
      item.min,
      item.max,
      item.step ?? 1,
    );
    if (next === item.value) return;
    item.onChange(next);
    const input = inputRefs.current[index];
    if (input && document.activeElement === input) {
      setNotice("");
      return;
    }
    setNotice(`${phrasedNameText(item.label)} ${format(item, next)}`);
  };

  // マウスで押してもフォーカスを移さない。移すと、そのあと矢印のキーでスライダーが動かなくなる。
  const keepFocus = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  return (
    <div
      className={styles.container}
      style={
        {
          "--slider-fixed": fixedWidth,
          "--slider-label": `${labelWidth}em`,
          "--slider-value": `${valueWidth}em`,
        } as CSSProperties
      }
    >
      <div className={styles.sliders}>
        {items.map((item, index) => {
          const inputId = `${id}-${index}`;
          const atMin = item.value <= item.min;
          const atMax = item.value >= item.max;
          const track = item.trackStops
            ? trackGradient(item.trackStops, item.min, item.max)
            : undefined;
          const setInput = (element: HTMLInputElement | null) => {
            inputRefs.current[index] = element;
            const ref = item.inputRef;
            if (typeof ref === "function") ref(element);
            else if (ref) ref.current = element;
          };
          const labelText = phrasedNameText(item.label);
          return (
            <div key={labelText} className={styles.row}>
              <label htmlFor={inputId} className={styles.label}>
                {renderPhrasedName(item.label)}
              </label>
              <input
                ref={setInput}
                id={inputId}
                type="range"
                min={item.min}
                max={item.max}
                step={item.step ?? 1}
                value={item.value}
                aria-valuetext={
                  item.formatValue ? format(item, item.value) : undefined
                }
                onChange={(event) => item.onChange(Number(event.target.value))}
                className={styles.input}
                style={
                  track
                    ? ({ "--slider-track": track } as CSSProperties)
                    : undefined
                }
              />
              <button
                type="button"
                tabIndex={-1}
                className={`${styles.step} ${styles.decrease}`}
                aria-label={item.decreaseLabel}
                aria-disabled={atMin || undefined}
                onMouseDown={keepFocus}
                onClick={() => !atMin && step(index, -1)}
              >
                <span className={styles.shape} aria-hidden="true" />
              </button>
              <span className={styles.value} aria-hidden="true">
                {format(item, item.value)}
              </span>
              <button
                type="button"
                tabIndex={-1}
                className={`${styles.step} ${styles.increase}`}
                aria-label={item.increaseLabel}
                aria-disabled={atMax || undefined}
                onMouseDown={keepFocus}
                onClick={() => !atMax && step(index, 1)}
              >
                <span className={styles.shape} aria-hidden="true" />
              </button>
            </div>
          );
        })}
      </div>
      <p className="visually-hidden" role="status">
        {notice}
      </p>
    </div>
  );
}
