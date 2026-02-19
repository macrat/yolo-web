"use client";

import { useMemo } from "react";
import styles from "./HslSliders.module.css";

interface Props {
  h: number;
  s: number;
  l: number;
  onHChange: (value: number) => void;
  onSChange: (value: number) => void;
  onLChange: (value: number) => void;
  disabled?: boolean;
}

/**
 * HSL sliders with gradient backgrounds and a live preview patch.
 */
export default function HslSliders({
  h,
  s,
  l,
  onHChange,
  onSChange,
  onLChange,
  disabled = false,
}: Props) {
  // Hue slider: rainbow gradient (always the same)
  const hueGradient =
    "linear-gradient(to right, hsl(0,100%,50%), hsl(60,100%,50%), hsl(120,100%,50%), hsl(180,100%,50%), hsl(240,100%,50%), hsl(300,100%,50%), hsl(360,100%,50%))";

  // Saturation slider: gradient from gray to full saturation at current H and L
  const satGradient = useMemo(
    () => `linear-gradient(to right, hsl(${h},0%,${l}%), hsl(${h},100%,${l}%))`,
    [h, l],
  );

  // Lightness slider: gradient from black through mid to white at current H and S
  const lightGradient = useMemo(
    () =>
      `linear-gradient(to right, hsl(${h},${s}%,0%), hsl(${h},${s}%,50%), hsl(${h},${s}%,100%))`,
    [h, s],
  );

  const previewColor = `hsl(${h}, ${s}%, ${l}%)`;

  return (
    <div className={styles.slidersArea}>
      <div className={styles.sliders}>
        <div className={styles.sliderRow}>
          <span className={styles.sliderLabel}>H</span>
          <input
            type="range"
            min={0}
            max={360}
            value={h}
            onChange={(e) => onHChange(Number(e.target.value))}
            className={styles.slider}
            style={{ background: hueGradient }}
            aria-label={"\u8272\u76F8"}
            aria-valuenow={h}
            disabled={disabled}
          />
          <span className={styles.sliderValue}>{h}</span>
        </div>
        <div className={styles.sliderRow}>
          <span className={styles.sliderLabel}>S</span>
          <input
            type="range"
            min={0}
            max={100}
            value={s}
            onChange={(e) => onSChange(Number(e.target.value))}
            className={styles.slider}
            style={{ background: satGradient }}
            aria-label={"\u5F69\u5EA6"}
            aria-valuenow={s}
            disabled={disabled}
          />
          <span className={styles.sliderValue}>{s}</span>
        </div>
        <div className={styles.sliderRow}>
          <span className={styles.sliderLabel}>L</span>
          <input
            type="range"
            min={0}
            max={100}
            value={l}
            onChange={(e) => onLChange(Number(e.target.value))}
            className={styles.slider}
            style={{ background: lightGradient }}
            aria-label={"\u660E\u5EA6"}
            aria-valuenow={l}
            disabled={disabled}
          />
          <span className={styles.sliderValue}>{l}</span>
        </div>
      </div>
      <div className={styles.previewArea}>
        <span className={styles.previewLabel}>
          {"\u3042\u306A\u305F\u306E\u8272"}
        </span>
        <div
          className={styles.previewPatch}
          style={{ backgroundColor: previewColor }}
          role="img"
          aria-label={"\u3042\u306A\u305F\u306E\u56DE\u7B54\u8272"}
        />
      </div>
    </div>
  );
}
