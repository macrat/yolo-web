"use client";

import type { Ref } from "react";
import Slider, { type SliderItem, type TrackStop } from "@/components/Slider";
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

/** 色相の止まりの間隔。HSL の色は色相 60 ごとの区間で RGB の上を線形に動くので、この間隔の止まりで正確に描ける。 */
const HUE_STOP_INTERVAL = 60;
const HUE_MAX = 360;

function hsl(h: number, s: number, l: number): string {
  return `hsl(${h}, ${s}%, ${l}%)`;
}

/**
 * 色相・彩度・明度のスライダー。どの溝も、そこへつまみを動かしたときに作られる色で塗り、ほかの2つの成分は
 * いまの値のままにする（DESIGN.md §6 の色を作るスライダー）。いま作っている色から、どちらへ動かせばお題に
 * 近づくかが溝の上に見える。彩度が 0 なら色相の溝は一様な灰になり、色相を動かしても色が変わらないことも見える。
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
  const hueStops: TrackStop[] = [];
  for (let hue = 0; hue <= HUE_MAX; hue += HUE_STOP_INTERVAL) {
    hueStops.push({ value: hue, color: hsl(hue, s, l) });
  }
  const items: SliderItem[] = [
    {
      label: "色相",
      value: h,
      min: 0,
      max: HUE_MAX,
      onChange: onHChange,
      decreaseLabel: "色相を1減らす",
      increaseLabel: "色相を1増やす",
      trackStops: hueStops,
      inputRef: firstSliderRef,
    },
    {
      label: "彩度",
      value: s,
      min: 0,
      max: 100,
      onChange: onSChange,
      decreaseLabel: "彩度を1減らす",
      increaseLabel: "彩度を1増やす",
      trackStops: [
        { value: 0, color: hsl(h, 0, l) },
        { value: 100, color: hsl(h, 100, l) },
      ],
    },
    {
      label: "明度",
      value: l,
      min: 0,
      max: 100,
      onChange: onLChange,
      decreaseLabel: "明度を1減らす",
      increaseLabel: "明度を1増やす",
      trackStops: [
        { value: 0, color: hsl(h, s, 0) },
        { value: 50, color: hsl(h, s, 50) },
        { value: 100, color: hsl(h, s, 100) },
      ],
    },
  ];

  return (
    <div className={styles.sliders}>
      <Slider items={items} />
    </div>
  );
}
