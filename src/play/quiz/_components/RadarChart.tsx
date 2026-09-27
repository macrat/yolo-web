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
  /** 多角形から字までのあき */
  gap: number;
  /** 軸ごとの、名前の字の幅 */
  nameWidths: readonly number[];
  /** 軸ごとの、数値の字の幅 */
  valueWidths: readonly number[];
}

interface LabelPlacement {
  /** 添える字の中央 */
  x: number;
  /** 添える字の1行目の上端 */
  top: number;
}

export interface RadarLayout {
  width: number;
  height: number;
  cx: number;
  cy: number;
  radius: number;
  /** 軸の名前の下に数値を添えるか */
  showValues: boolean;
  labels: LabelPlacement[];
}

/** 格子の同心の多角形の数（20% ごと） */
const GRID_LEVELS = 5;

/** 軸の向きの成分がこれより小さければ、その向きには寄っていないとみなす */
const ALIGNED = 0.1;

/**
 * 数値を添えたまま描く、多角形の半径の下限（添える字の行の高さの何倍か）。半径がこれより小さいと、多角形が
 * まわりに添えた字の塊より小さくなり、どの軸が大きいかを形で読めない。そのときは図から数値を外して半径に幅を
 * 回す。数値はすぐ下のスコアの帯が同じ値を字で言っている。
 */
const MIN_RADIUS_WITH_VALUES = 4;

/** 半径を探す刻み（px） */
const RADIUS_STEP = 0.5;

/** i 番目の軸の向き。12時から時計回りに並べる。 */
function direction(index: number, total: number): [number, number] {
  const angle = (2 * Math.PI * index) / total - Math.PI / 2;
  return [Math.cos(angle), Math.sin(angle)];
}

/** 中心を原点とした、字の箱 */
interface Box {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

type Horizontal = "start" | "middle" | "end";
type Vertical = "above" | "center" | "below";

function sign(value: number): -1 | 0 | 1 {
  return value > ALIGNED ? 1 : value < -ALIGNED ? -1 : 0;
}

/**
 * 軸の角の外に字を置く所の候補。先に軸の向きの外側（右の角なら右、下の角なら下）を試し、そこに置けなければ
 * 角の上か下に寄せた所を試す。
 */
function placementsFor(ux: number, uy: number): [Horizontal, Vertical][] {
  const horizontal: Horizontal =
    sign(ux) > 0 ? "start" : sign(ux) < 0 ? "end" : "middle";
  const vertical: Vertical =
    Math.abs(uy) > Math.abs(ux) ? (uy < 0 ? "above" : "below") : "center";
  const all: [Horizontal, Vertical][] = [[horizontal, vertical]];
  for (const v of ["above", "below"] as const) {
    for (const h of ["middle", horizontal] as const) {
      if (!all.some(([ah, av]) => ah === h && av === v)) all.push([h, v]);
    }
  }
  return all;
}

function boxAt(
  x: number,
  y: number,
  width: number,
  height: number,
  [horizontal, vertical]: [Horizontal, Vertical],
): Box {
  const left =
    horizontal === "start"
      ? x
      : horizontal === "end"
        ? x - width
        : x - width / 2;
  const top =
    vertical === "above"
      ? y - height
      : vertical === "below"
        ? y
        : y - height / 2;
  return { left, top, right: left + width, bottom: top + height };
}

function inflate(box: Box, by: number): Box {
  return {
    left: box.left - by,
    top: box.top - by,
    right: box.right + by,
    bottom: box.bottom + by,
  };
}

function boxesOverlap(a: Box, b: Box): boolean {
  return (
    a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom
  );
}

/** 凸の多角形と箱が重なるか（分離軸で確かめる）。 */
function boxOverlapsPolygon(box: Box, polygon: [number, number][]): boolean {
  const corners: [number, number][] = [
    [box.left, box.top],
    [box.right, box.top],
    [box.right, box.bottom],
    [box.left, box.bottom],
  ];
  const axes: [number, number][] = [
    [1, 0],
    [0, 1],
    ...polygon.map(([x1, y1], i): [number, number] => {
      const [x2, y2] = polygon[(i + 1) % polygon.length];
      return [y1 - y2, x2 - x1];
    }),
  ];
  return axes.every(([ax, ay]) => {
    const project = (points: [number, number][]) =>
      points.map(([x, y]) => x * ax + y * ay);
    const a = project(corners);
    const b = project(polygon);
    return Math.max(...a) > Math.min(...b) && Math.max(...b) > Math.min(...a);
  });
}

/**
 * 半径 radius で、どの軸の字も、図の幅の中にあり、格子の外周の多角形（線と多角形はどれもその中にある）にも
 * ほかの字にも、あき gap の半分より近づかない所に置く。置けなければ null。
 */
function placeLabels(
  radius: number,
  frame: RadarFrame,
  total: number,
  widths: readonly number[],
  height: number,
): Box[] | null {
  const { gap } = frame;
  const half = frame.width / 2;
  const directions = Array.from({ length: total }, (_, i) =>
    direction(i, total),
  );
  const outline = directions.map(([ux, uy]): [number, number] => [
    radius * ux,
    radius * uy,
  ]);
  const placed: Box[] = [];
  for (const [i, [ux, uy]] of directions.entries()) {
    const x = (radius + gap) * ux;
    const y = (radius + gap) * uy;
    const box = placementsFor(ux, uy)
      .map((placement) => boxAt(x, y, widths[i], height, placement))
      .find((candidate) => {
        const margin = inflate(candidate, gap / 2);
        return (
          candidate.left >= -half &&
          candidate.right <= half &&
          !boxOverlapsPolygon(margin, outline) &&
          placed.every((other) => !boxesOverlap(margin, other))
        );
      });
    if (!box) return null;
    placed.push(box);
  }
  return placed;
}

/**
 * 字を添える行の数を決めて図を組む。字は補助情報の大きさのまま縮めず、字を線にも多角形にもほかの字にも重ねずに
 * 置けるいちばん大きい半径で多角形を描く。図の高さは、多角形と字の全体が入る高さにする。
 */
function layoutWithLines(
  frame: RadarFrame,
  total: number,
  showValues: boolean,
): RadarLayout {
  const { width, lineHeight } = frame;
  const lines = showValues ? 2 : 1;
  const widths = frame.nameWidths.map((name, i) =>
    showValues ? Math.max(name, frame.valueWidths[i]) : name,
  );
  let radius = Math.floor(width / 2 / RADIUS_STEP) * RADIUS_STEP;
  let boxes = placeLabels(radius, frame, total, widths, lines * lineHeight);
  while (!boxes && radius > 0) {
    radius = Math.max(0, radius - RADIUS_STEP);
    boxes = placeLabels(radius, frame, total, widths, lines * lineHeight);
  }
  const placed = boxes ?? [];

  const extentTop = Math.min(-radius, ...placed.map((box) => box.top));
  const extentBottom = Math.max(radius, ...placed.map((box) => box.bottom));
  return {
    width,
    height: extentBottom - extentTop,
    cx: width / 2,
    cy: -extentTop,
    radius,
    showValues,
    labels: placed.map((box) => ({
      x: width / 2 + (box.left + box.right) / 2,
      top: box.top - extentTop,
    })),
  };
}

/**
 * 図を組む。数値を添えた組みで多角形の半径が下限に届かなければ、数値を外した組みにする。
 */
export function layoutRadar(frame: RadarFrame, total: number): RadarLayout {
  const withValues = layoutWithLines(frame, total, true);
  if (withValues.radius >= MIN_RADIUS_WITH_VALUES * frame.lineHeight) {
    return withValues;
  }
  return layoutWithLines(frame, total, false);
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

function sameWidths(a: readonly number[], b: readonly number[]): boolean {
  return a.length === b.length && a.every((width, i) => width === b[i]);
}

function sameFrame(a: RadarFrame | null, b: RadarFrame): boolean {
  return (
    a !== null &&
    a.width === b.width &&
    a.lineHeight === b.lineHeight &&
    a.gap === b.gap &&
    sameWidths(a.nameWidths, b.nameWidths) &&
    sameWidths(a.valueWidths, b.valueWidths)
  );
}

interface RadarChartProps {
  axes: readonly RadarChartAxis[];
  /** 図の名前（読み上げ） */
  label: string;
}

/**
 * 軸ごとの割合を多角形で見せるレーダー（DESIGN.md §5 図）。無彩で描き、多角形は面を塗らずに --ink の線で描く。
 * 頂点は多角形の角で分かるので、点を置かない。格子と軸は細い線で引く。
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
    const widths = (kind: "name" | "value") =>
      Array.from(
        figure.querySelectorAll<HTMLElement>(`[data-radar-${kind}]`),
        (text) => text.getBoundingClientRect().width,
      );
    const measure = () => {
      const sample = figure.querySelector<HTMLElement>("[data-radar-name]");
      if (!sample) return;
      const fontSize = parseFloat(getComputedStyle(sample).fontSize) || 0;
      const next: RadarFrame = {
        width: figure.clientWidth,
        lineHeight: sample.getBoundingClientRect().height,
        gap: fontSize / 2,
        nameWidths: widths("name"),
        valueWidths: widths("value"),
      };
      setFrame((current) => (sameFrame(current, next) ? current : next));
    };
    measure();
    if (typeof ResizeObserver === "undefined") return;
    // 図の幅と、字の大きさで変わる測りの字を見て、変わったら組み直す。
    const observer = new ResizeObserver(measure);
    observer.observe(figure);
    figure
      .querySelectorAll("[data-radar-name], [data-radar-value]")
      .forEach((text) => observer.observe(text));
    return () => observer.disconnect();
  }, [axes]);

  const ratios = axes.map(
    (axis) => Math.min(Math.max(axis.percent, 0), 100) / 100,
  );
  const layout = frame ? layoutRadar(frame, axes.length) : null;
  const lineHeight = frame?.lineHeight ?? 0;

  return (
    <div ref={figureRef} className={styles.figure}>
      {axes.map((axis, i) => (
        <span key={i} aria-hidden="true">
          <span className={styles.measure} data-radar-name="">
            {axis.label}
          </span>
          <span className={styles.measure} data-radar-value="">
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
            data-radar-data=""
            points={polygonPoints(layout, ratios)}
          />
          {axes.map((axis, i) => {
            const placement = layout.labels[i];
            return (
              <text
                key={`label-${i}`}
                className={styles.label}
                textAnchor="middle"
              >
                <tspan
                  x={placement.x}
                  y={placement.top + lineHeight / 2}
                  dominantBaseline="central"
                >
                  {axis.label}
                </tspan>
                {layout.showValues && (
                  <tspan
                    x={placement.x}
                    y={placement.top + (lineHeight * 3) / 2}
                    dominantBaseline="central"
                  >
                    {axis.percent}%
                  </tspan>
                )}
              </text>
            );
          })}
        </svg>
      )}
    </div>
  );
}
