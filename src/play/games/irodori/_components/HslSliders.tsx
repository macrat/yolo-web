"use client";

import { useId, type CSSProperties, type Ref } from "react";
import styles from "./HslSliders.module.css";

interface Props {
  h: number;
  s: number;
  l: number;
  onHChange: (value: number) => void;
  onSChange: (value: number) => void;
  onLChange: (value: number) => void;
  /** 色相のスライダー。次の問へ進んだとき、フォーカスをここへ移す */
  firstSliderRef?: Ref<HTMLInputElement>;
}

interface SliderSpec {
  label: string;
  max: number;
  value: number;
  onChange: (value: number) => void;
  /** 溝に描く、その値を動かしたときの色の移り変わり */
  track: string;
}

const HUE_TRACK =
  "linear-gradient(to right, hsl(0,100%,50%), hsl(60,100%,50%), hsl(120,100%,50%), hsl(180,100%,50%), hsl(240,100%,50%), hsl(300,100%,50%), hsl(360,100%,50%))";

/**
 * 色相・彩度・明度のスライダー。溝には、そのスライダーを動かすと色がどう移るかを描く。いまの色から
 * 動かす先が見えるので、お題に近づける向きが分かる。
 */
export default function HslSliders({
  h,
  s,
  l,
  onHChange,
  onSChange,
  onLChange,
  firstSliderRef,
}: Props) {
  const id = useId();
  const sliders: SliderSpec[] = [
    {
      label: "色相",
      max: 360,
      value: h,
      onChange: onHChange,
      track: HUE_TRACK,
    },
    {
      label: "彩度",
      max: 100,
      value: s,
      onChange: onSChange,
      track: `linear-gradient(to right, hsl(${h},0%,${l}%), hsl(${h},100%,${l}%))`,
    },
    {
      label: "明度",
      max: 100,
      value: l,
      onChange: onLChange,
      track: `linear-gradient(to right, hsl(${h},${s}%,0%), hsl(${h},${s}%,50%), hsl(${h},${s}%,100%))`,
    },
  ];

  return (
    <div className={styles.sliders}>
      {sliders.map((slider, index) => {
        const inputId = `${id}-${index}`;
        return (
          <div key={slider.label} className={styles.row}>
            <label htmlFor={inputId} className={styles.label}>
              {slider.label}
            </label>
            <input
              ref={index === 0 ? firstSliderRef : undefined}
              id={inputId}
              type="range"
              min={0}
              max={slider.max}
              value={slider.value}
              onChange={(e) => slider.onChange(Number(e.target.value))}
              className={styles.slider}
              style={{ "--track": slider.track } as CSSProperties}
            />
            <span className={styles.value} aria-hidden="true">
              {slider.value}
            </span>
          </div>
        );
      })}
    </div>
  );
}
