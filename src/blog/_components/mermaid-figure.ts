/**
 * 記事の図（DESIGN.md §5 の図）の色と大きさの決め方。描画から切り離して、単体で試せる形にする。
 */

/** 図の中の字の下限。§4 の補助情報の大きさ（rem）。 */
export const FIGURE_TEXT_MIN_REM = 0.875;

/** 8ビットの sRGB の成分を hex の色に直す。 */
export function toHexColor(red: number, green: number, blue: number): string {
  return (
    "#" +
    [red, green, blue]
      .map((channel) => channel.toString(16).padStart(2, "0"))
      .join("")
  );
}

/** 図の描き方。 */
export interface FigurePlan {
  /** 図を描く倍率。 */
  scale: number;
  /** コンテンツ幅に収まるか。収まらない図は、ボックスの中で横に送る。 */
  fits: boolean;
}

/**
 * 図を描く倍率を決める。naturalWidth は図の元の幅、available はコンテンツ幅、smallestText は図の中のいちばん
 * 小さい字の元の大きさ、minText は字の下限（px）。
 * 収まる図は元の大きさで描く。収まらない図は、字が下限を下回らない所まで縮め、それでも収まらなければ下限の
 * 大きさのまま横に送る。元から下限より小さい字を持つ図は、下限まで大きくする。
 */
export function planFigure(
  naturalWidth: number,
  available: number,
  smallestText: number,
  minText: number,
): FigurePlan {
  const fitScale = available / naturalWidth;
  const floor = minText / smallestText;
  const scale = Math.max(Math.min(1, fitScale), floor);
  return { scale, fits: scale <= fitScale };
}

/** gantt の横の組み方（mermaid の gantt の設定の値）。 */
export interface GanttLayout {
  /** 図の幅。 */
  useWidth: number;
  /** 区分の名前を置く、左の余白。 */
  leftPadding: number;
  /** 右の余白。 */
  rightPadding: number;
}

/** gantt の目盛りの字の、横の中心と幅。 */
export interface TickLabel {
  center: number;
  width: number;
}

/**
 * gantt を描き直す組み方を決める。gantt は渡された幅に時間の軸を詰めて描くので、字を大きくすると目盛りの字が
 * 重なり、区分の名前が帯に掛かる。目盛りの字が gap を空けて並ぶところまで時間の軸を広げ、区分の名前の右端から
 * gap を空けた所まで左の余白を広げる。どちらも足りていれば null。
 */
export function widenGantt(
  layout: GanttLayout,
  ticks: TickLabel[],
  sectionRight: number,
  gap: number,
): GanttLayout | null {
  const sorted = ticks.slice().sort((a, b) => a.center - b.center);
  let stretch = 1;
  for (let i = 1; i < sorted.length; i++) {
    const spacing = sorted[i].center - sorted[i - 1].center;
    if (spacing <= 0) continue;
    const needed = (sorted[i - 1].width + sorted[i].width) / 2 + gap;
    stretch = Math.max(stretch, needed / spacing);
  }
  const leftPadding = Math.max(
    layout.leftPadding,
    Math.ceil(sectionRight + gap),
  );
  if (stretch === 1 && leftPadding === layout.leftPadding) return null;
  const axis = layout.useWidth - layout.leftPadding - layout.rightPadding;
  return {
    useWidth: Math.ceil(axis * stretch) + leftPadding + layout.rightPadding,
    leftPadding,
    rightPadding: layout.rightPadding,
  };
}
