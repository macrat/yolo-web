"use client";

import styles from "./RadarChart.module.css";

interface RadarChartAxis {
  label: string;
  value: number;
  max: number;
}

interface RadarChartProps {
  /** Array of axis data to display (labels, values, maximums) */
  axes: RadarChartAxis[];
  /** Theme color for the data polygon (hex) */
  color: string;
  /** Chart size in pixels (used for viewBox, responsive via CSS) */
  size?: number;
}

/** Default chart size for viewBox calculation */
const DEFAULT_SIZE = 300;

/** Padding around the chart for labels */
const PADDING = 50;

/** Number of concentric grid levels (20%, 40%, 60%, 80%, 100%) */
const GRID_LEVELS = 5;

/** Radius of dots at each data point vertex */
const DOT_RADIUS = 4;

/**
 * Calculate the (x, y) position on the chart for a given axis index and
 * radius ratio. The layout starts at 12 o'clock (top) and proceeds clockwise.
 */
function getPoint(
  cx: number,
  cy: number,
  radius: number,
  index: number,
  total: number,
  ratio: number,
): [number, number] {
  const angle = (2 * Math.PI * index) / total - Math.PI / 2;
  return [
    cx + radius * ratio * Math.cos(angle),
    cy + radius * ratio * Math.sin(angle),
  ];
}

/**
 * Build an SVG polygon points string for the given number of vertices
 * at a specific radius ratio.
 */
function buildPolygonPoints(
  cx: number,
  cy: number,
  radius: number,
  total: number,
  ratios: number[],
): string {
  return ratios
    .map((ratio, i) => {
      const [x, y] = getPoint(cx, cy, radius, i, total, ratio);
      return `${x},${y}`;
    })
    .join(" ");
}

/**
 * SVG-based radar chart component. Renders a polygon chart with concentric
 * grid lines, data polygon with color fill, axis labels, and percentage
 * score annotations.
 *
 * No external libraries required -- pure SVG rendering.
 */
export default function RadarChart({
  axes,
  color,
  size = DEFAULT_SIZE,
}: RadarChartProps) {
  const total = axes.length;
  if (total < 3) return null;

  const cx = size / 2;
  const cy = size / 2;
  const radius = (size - PADDING * 2) / 2;

  // Normalize values to 0..1 ratios
  const ratios = axes.map((axis) =>
    axis.max > 0 ? Math.min(axis.value / axis.max, 1) : 0,
  );

  // Grid lines (concentric polygons at each level)
  const gridPolygons = Array.from({ length: GRID_LEVELS }, (_, level) => {
    const levelRatio = (level + 1) / GRID_LEVELS;
    const uniformRatios = Array.from({ length: total }, () => levelRatio);
    return buildPolygonPoints(cx, cy, radius, total, uniformRatios);
  });

  // Axis lines from center to each vertex
  const axisLines = Array.from({ length: total }, (_, i) => {
    const [x, y] = getPoint(cx, cy, radius, i, total, 1);
    return { x1: cx, y1: cy, x2: x, y2: y };
  });

  // Data polygon
  const dataPoints = buildPolygonPoints(cx, cy, radius, total, ratios);

  // Dots at each data vertex
  const dots = ratios.map((ratio, i) =>
    getPoint(cx, cy, radius, i, total, ratio),
  );

  // Label positions (slightly outside the outer polygon)
  const labelOffset = 1.2;
  const labels = axes.map((axis, i) => {
    const [x, y] = getPoint(cx, cy, radius, i, total, labelOffset);
    const pct = axis.max > 0 ? Math.round((axis.value / axis.max) * 100) : 0;
    return { x, y, label: axis.label, pct };
  });

  return (
    <svg
      className={styles.chart}
      viewBox={`0 0 ${size} ${size}`}
      role="img"
      aria-label="レーダーチャート"
    >
      {/* Background grid */}
      {gridPolygons.map((points, i) => (
        <polygon
          key={`grid-${i}`}
          points={points}
          fill="none"
          stroke="#d1d5db"
          strokeWidth={i === GRID_LEVELS - 1 ? 1.5 : 0.7}
          opacity={0.6}
        />
      ))}

      {/* Axis lines */}
      {axisLines.map((line, i) => (
        <line
          key={`axis-${i}`}
          x1={line.x1}
          y1={line.y1}
          x2={line.x2}
          y2={line.y2}
          stroke="#d1d5db"
          strokeWidth={0.7}
          opacity={0.6}
        />
      ))}

      {/* Data polygon with animation */}
      <g className={styles.dataGroup}>
        {/* Filled area */}
        <polygon
          points={dataPoints}
          fill={color}
          fillOpacity={0.25}
          stroke={color}
          strokeWidth={2}
        />
        {/* Vertex dots */}
        {dots.map(([x, y], i) => (
          <circle key={`dot-${i}`} cx={x} cy={y} r={DOT_RADIUS} fill={color} />
        ))}
      </g>

      {/* Axis labels and score percentages */}
      {labels.map((item, i) => {
        // Adjust text-anchor based on horizontal position
        const anchorX = item.x - cx;
        let textAnchor: "start" | "middle" | "end" = "middle";
        if (anchorX > 5) textAnchor = "start";
        if (anchorX < -5) textAnchor = "end";

        return (
          <g key={`label-${i}`}>
            <text
              x={item.x}
              y={item.y}
              textAnchor={textAnchor}
              dominantBaseline="middle"
              fontSize={13}
              fontWeight="bold"
              fill="#374151"
            >
              {item.label}
            </text>
            <text
              x={item.x}
              y={item.y + 15}
              textAnchor={textAnchor}
              dominantBaseline="middle"
              fontSize={11}
              fill="#6b7280"
            >
              {item.pct}%
            </text>
          </g>
        );
      })}
    </svg>
  );
}
