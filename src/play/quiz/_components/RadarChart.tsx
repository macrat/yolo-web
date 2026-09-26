"use client";

import { useLayoutEffect, useRef, useState } from "react";
import styles from "./RadarChart.module.css";

export interface RadarChartAxis {
  /** 軸の名前 */
  label: string;
  /** 満点に対する割合（0〜100 の整数）。頂点の位置と、添える数値の両方がこの値を言う。 */
  percent: number;
}

/** 図を組むために測った値（どれも CSS の px） */
export interface RadarFrame {
  /** 図に使える幅 */
  width: number;
  /** 軸に添える字の1行の高さ */
  lineHeight: number;
  /** 多角形の頂点から字までのあき */
  gap: number;
  /** 軸ごとの、添える字（名前と数値）のうち広いほうの幅 */
  labelWidths: readonly number[];
}

interface LabelPlacement {
  x: number;
  /** 2行（名前・数値）の1行目の上端 */
  top: number;
  anchor: "start" | "middle" | "end";
}

export interface RadarLayout {
  width: number;
  height: number;
  cx: number;
  cy: number;
  radius: number;
  labels: LabelPlacement[];
}

/** 格子の同心の多角形の数（20% ごと） */
const GRID_LEVELS = 5;

/** 頂点の点の半径 */
const DOT_RADIUS = 4.5;

/** 軸の向きがこれより横に寄っていれば、字を頂点の左か右に置く */
const SIDE = 0.1;

/** 軸の向きがこれより縦に寄っていれば、字を頂点の上か下に置く */
const VERTICAL = 0.5;

/** i 番目の軸の向き。12時から時計回りに並べる。 */
function direction(index: number, total: number): [number, number] {
  const angle = (2 * Math.PI * index) / total - Math.PI / 2;
  return [Math.cos(angle), Math.sin(angle)];
}

/**
 * 図を組む。字は補助情報の大きさのまま縮めず、字が図の幅に収まるいちばん大きい半径で多角形を描く。図の高さは、
 * 多角形と字の全体が入る高さにする。
 */
export function layoutRadar(frame: RadarFrame, total: number): RadarLayout {
  const { width, lineHeight, gap, labelWidths } = frame;
  const half = width / 2;
  const directions = Array.from({ length: total }, (_, i) =>
    direction(i, total),
  );

  // 横に置く字が図の幅の外へ出ない半径のうち、いちばん大きいもの。
  const radius = Math.max(
    0,
    directions.reduce((limit, [ux], i) => {
      if (Math.abs(ux) < SIDE) return limit;
      return Math.min(limit, (half - labelWidths[i]) / Math.abs(ux) - gap);
    }, half - DOT_RADIUS),
  );

  // 中心を 0 として、字の2行の上端を決める。
  const placed = directions.map(([ux, uy]) => {
    const x = half + (radius + gap) * ux;
    const y = (radius + gap) * uy;
    const anchor: LabelPlacement["anchor"] =
      ux > SIDE ? "start" : ux < -SIDE ? "end" : "middle";
    const top =
      uy < -VERTICAL ? y - 2 * lineHeight : uy > VERTICAL ? y : y - lineHeight;
    return { x, top, anchor };
  });

  const extentTop = Math.min(-radius, ...placed.map((label) => label.top));
  const extentBottom = Math.max(
    radius,
    ...placed.map((label) => label.top + 2 * lineHeight),
  );

  return {
    width,
    height: extentBottom - extentTop,
    cx: half,
    cy: -extentTop,
    radius,
    labels: placed.map((label) => ({ ...label, top: label.top - extentTop })),
  };
}

function polygonPoints(layout: RadarLayout, ratios: readonly number[]): string {
  return ratios
    .map((ratio, i) => {
      const [ux, uy] = direction(i, ratios.length);
      const x = layout.cx + layout.radius * ratio * ux;
      const y = layout.cy + layout.radius * ratio * uy;
      return `${x},${y}`;
    })
    .join(" ");
}

function sameFrame(a: RadarFrame | null, b: RadarFrame): boolean {
  return (
    a !== null &&
    a.width === b.width &&
    a.lineHeight === b.lineHeight &&
    a.gap === b.gap &&
    a.labelWidths.every((width, i) => width === b.labelWidths[i])
  );
}

interface RadarChartProps {
  axes: readonly RadarChartAxis[];
  /** 図の名前（読み上げ） */
  label: string;
}

/**
 * 軸ごとの割合を多角形で見せるレーダー（DESIGN.md §5 図）。無彩で描き、多角形は面を塗らずに --ink の線と頂点の
 * 点で描く。格子と軸は細い線で引く。
 *
 * 軸の名前と数値は補助情報の大きさで紙の上に添え、図を縮めても字は小さくしない。字の幅と行の高さを描く前に
 * 測り、それが収まる大きさで多角形を描く。幅か字の大きさが変わったら測り直す。
 */
export default function RadarChart({ axes, label }: RadarChartProps) {
  const figureRef = useRef<HTMLDivElement>(null);
  const [frame, setFrame] = useState<RadarFrame | null>(null);

  useLayoutEffect(() => {
    const figure = figureRef.current;
    if (!figure) return;
    const measure = () => {
      const texts = Array.from(
        figure.querySelectorAll<HTMLElement>("[data-radar-measure]"),
      );
      if (texts.length === 0) return;
      const fontSize = parseFloat(getComputedStyle(texts[0]).fontSize) || 0;
      const labelWidths = axes.map((_, i) =>
        Math.max(
          ...texts
            .filter((text) => text.dataset.radarMeasure === String(i))
            .map((text) => text.getBoundingClientRect().width),
        ),
      );
      const next: RadarFrame = {
        width: figure.clientWidth,
        lineHeight: texts[0].getBoundingClientRect().height,
        gap: fontSize / 2,
        labelWidths,
      };
      setFrame((current) => (sameFrame(current, next) ? current : next));
    };
    measure();
    if (typeof ResizeObserver === "undefined") return;
    // 図の幅と、字の大きさで変わる測りの字を見て、変わったら組み直す。
    const observer = new ResizeObserver(measure);
    observer.observe(figure);
    figure
      .querySelectorAll("[data-radar-measure]")
      .forEach((text) => observer.observe(text));
    return () => observer.disconnect();
  }, [axes]);

  const ratios = axes.map(
    (axis) => Math.min(Math.max(axis.percent, 0), 100) / 100,
  );
  const layout = frame ? layoutRadar(frame, axes.length) : null;

  return (
    <div ref={figureRef} className={styles.figure}>
      {axes.map((axis, i) => (
        <span key={i} aria-hidden="true">
          <span className={styles.measure} data-radar-measure={i}>
            {axis.label}
          </span>
          <span className={styles.measure} data-radar-measure={i}>
            {axis.percent}%
          </span>
        </span>
      ))}
      {layout && (
        <svg
          className={styles.chart}
          width={layout.width}
          height={layout.height}
          viewBox={`0 0 ${layout.width} ${layout.height}`}
          role="img"
          aria-label={label}
        >
          {Array.from({ length: GRID_LEVELS }, (_, level) => (
            <polygon
              key={`grid-${level}`}
              className={styles.grid}
              points={polygonPoints(
                layout,
                axes.map(() => (level + 1) / GRID_LEVELS),
              )}
            />
          ))}
          {axes.map((_, i) => {
            const [ux, uy] = direction(i, axes.length);
            return (
              <line
                key={`axis-${i}`}
                className={styles.grid}
                x1={layout.cx}
                y1={layout.cy}
                x2={layout.cx + layout.radius * ux}
                y2={layout.cy + layout.radius * uy}
              />
            );
          })}
          <polygon
            className={styles.data}
            points={polygonPoints(layout, ratios)}
          />
          {ratios.map((ratio, i) => {
            const [ux, uy] = direction(i, axes.length);
            return (
              <circle
                key={`dot-${i}`}
                className={styles.dot}
                cx={layout.cx + layout.radius * ratio * ux}
                cy={layout.cy + layout.radius * ratio * uy}
                r={DOT_RADIUS}
              />
            );
          })}
          {axes.map((axis, i) => {
            const placement = layout.labels[i];
            const lineHeight = frame?.lineHeight ?? 0;
            return (
              <text
                key={`label-${i}`}
                className={styles.label}
                textAnchor={placement.anchor}
              >
                <tspan
                  x={placement.x}
                  y={placement.top + lineHeight / 2}
                  dominantBaseline="central"
                >
                  {axis.label}
                </tspan>
                <tspan
                  x={placement.x}
                  y={placement.top + (lineHeight * 3) / 2}
                  dominantBaseline="central"
                >
                  {axis.percent}%
                </tspan>
              </text>
            );
          })}
        </svg>
      )}
    </div>
  );
}
