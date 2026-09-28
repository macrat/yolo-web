/** つまみの幅（px）。globals.css のつまみの幅と同じ値。 */
export const THUMB_WIDTH = 16;

/**
 * 値が、つまみの動く幅のどこにあたるか（0〜1）。つまみの中心は、溝の両端からつまみの幅の半分だけ内側までしか
 * 動かないので（DESIGN.md §6）、溝の上の位置はこの割合から決める。
 */
function travelFraction(value: number, min: number, max: number): number {
  if (max <= min) return 0;
  return Math.min(Math.max((value - min) / (max - min), 0), 1);
}

/**
 * 値にあたる溝の上の位置を、溝の左端からの CSS の長さで言う。溝の色の止まりをここに置くと、止まりの色は、
 * つまみの中心をそこに置いたときの値の色になる。両端のつまみの半分の幅は、端の止まりの色で塗られる。
 */
export function trackPosition(value: number, min: number, max: number): string {
  const fraction = travelFraction(value, min, max);
  return `calc(${THUMB_WIDTH / 2}px + (100% - ${THUMB_WIDTH}px) * ${fraction})`;
}

export interface TrackStop {
  /** 止まりが指す値 */
  value: number;
  /** その値のときに作られる色 */
  color: string;
}

/** 色を作るスライダーの溝の塗り。止まりを、それぞれが指す値の位置に置く。 */
export function trackGradient(
  stops: readonly TrackStop[],
  min: number,
  max: number,
): string {
  const parts = stops.map(
    (stop) => `${stop.color} ${trackPosition(stop.value, min, max)}`,
  );
  return `linear-gradient(to right, ${parts.join(", ")})`;
}
