"use client";

import {
  useId,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent,
  type Ref,
} from "react";
import { trackGradient, type TrackStop } from "./trackPosition";
import styles from "./Slider.module.css";

export {
  trackPosition,
  trackPositionPx,
  type TrackStop,
} from "./trackPosition";

export interface SliderItem {
  /** 見えるラベル。スライダーの名前にもなる */
  label: string;
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

/**
 * 半角の字（数字・記号・欧字）の幅の見積もり（em）。本文の書体（IBM Plex Sans）の数字は 0.6em で桁が揃う。
 * 組みの切り替えの幅を em だけで決めると、Web フォントの読み込みの前と後で切り替わる幅が変わらない。
 */
const NARROW_CHAR_EM = 0.6;

/** 字の幅を em で見積もる。和字は 1em、半角の字は NARROW_CHAR_EM とする。 */
function textEm(text: string): number {
  let width = 0;
  for (const ch of text)
    width += /[\u0000-\u024f]/.test(ch) ? NARROW_CHAR_EM : 1;
  return Math.round(width * 100) / 100;
}

function format(item: SliderItem, value: number): string {
  return item.formatValue ? item.formatValue(value) : String(value);
}

/** とりうる値のうち、いちばん長い言い方。値の場所がいつもこの幅を取る。 */
function longestValue(item: SliderItem): string {
  const step = item.step ?? 1;
  const candidates = [item.min, item.max, item.max - step, item.min + step];
  return candidates
    .map((value) => format(item, value))
    .reduce((a, b) => (b.length > a.length ? b : a));
}

/**
 * スライダー（DESIGN.md §6）。ネイティブの input type="range" に、値を1刻みずつ動かす − と ＋、いまの値の字を
 * 添える。指・マウス・キーボードでつまみがどう動くかはブラウザに任せ、input の上の出来事はここで受けない。
 *
 * 並びは、1行の組み（ラベル・溝・− 値 ＋）で溝が 5rem に届かないとき、並び全体を2行の組み（1行目にラベルと
 * − 値 ＋、2行目に溝）にする。切り替えはコンテナクエリで CSS だけで行うので、サーバーの HTML のまま最初の描画から
 * 正しい組みで描き、幅や文字の大きさが変わるとブラウザが組み直す（Slider.module.css）。
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

  const labelWidth = Math.max(...items.map((item) => textEm(item.label)));
  const valueWidth = Math.max(
    ...items.map((item) => textEm(longestValue(item))),
  );
  // 1行の組みで溝のほかが取る幅: ラベル・ラベルのあとの 16px・− と ＋ の 88px・値・溝の右の 8px。
  const fixedWidth = `calc(${labelWidth}em + ${valueWidth}em + 112px)`;

  const step = (index: number, direction: -1 | 1) => {
    const item = items[index];
    const size = item.step ?? 1;
    const next = Math.min(
      Math.max(item.value + direction * size, item.min),
      item.max,
    );
    if (next === item.value) return;
    item.onChange(next);
    const input = inputRefs.current[index];
    if (input && document.activeElement === input) {
      setNotice("");
      return;
    }
    setNotice(`${item.label} ${format(item, next)}`);
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
          return (
            <div key={item.label} className={styles.row}>
              <label htmlFor={inputId} className={styles.label}>
                {item.label}
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
                <span className={styles.valueSpace}>{longestValue(item)}</span>
                <span className={styles.valueText}>
                  {format(item, item.value)}
                </span>
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
