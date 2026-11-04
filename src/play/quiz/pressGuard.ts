import type { QuizGuardedTransition } from "@/lib/analytics";
import { closestPressable, type ScreenPoint } from "@/lib/reveal";

/**
 * 回答の画面の押しの受け手（docs/cycles/cycle-316/t5a-design.md 4-9）。`window` の捕捉の段階で `pointerdown`・
 * `pointerup`・`mousedown`・`click` を受け、React の `onClick`・素の `a[href]` の移動・`summary` の開閉・Next の
 * `Link` の移動のどれより先に走る。受け持つのは次の3つである。
 *
 * - **押した点を覚える**: 切り替わったあとの着地は、同じ点に落ちる2打目を見て選ぶ。
 * - **二度押しの2打目を受けない**: 押した点の下が入れ替わる操作のあと、新しく出た画面を読む前の、1打目の点の
 *   近くへの押しは、1打目と一続きの二度押しの2打目である。その押しの `mousedown` と `click` を止める。
 * - **2打目で語を選ばない**: 受けた連続の押しのうち、1打目が画面を切り替えたものの2打目からは、語の選択を止める。
 */

/** 守りの起点から、受けない押しの押し下げまでの長さの上限（ms。この長さ未満を受けない）。 */
export const GUARD_WINDOW_MS = 700;

/**
 * 守りの起点の点から、受けない押しの押し下げの点までの直線の距離の上限（px。この距離以下を受けない）。Android が
 * 2度の押しを二度押しとみなす距離（`ViewConfiguration` の `DOUBLE_TAP_SLOP`）。
 */
export const GUARD_REACH_PX = 100;

/**
 * タッチとペンで、直前の押しの離しから次の押し下げまでを連続の押しと数える長さの上限（ms。この長さ未満を連続と
 * 数える）。Android の `ViewConfiguration` の `DOUBLE_TAP_TIMEOUT` と同じ。
 */
export const TOUCH_CONSECUTIVE_MS = 300;

/** 受けなかった押しのあと、同じ押せるものの押し直しを数える長さの上限（ms）。 */
export const RETRY_WINDOW_MS = 3000;

/** ポインタの1つの押し。時刻と座標は押し下げ（`pointerdown`）で取る。 */
export interface PointerPress {
  /** 押し下げの `event.timeStamp`。 */
  readonly downTime: number;
  /** 押し下げの画面の座標。 */
  readonly x: number;
  readonly y: number;
  readonly pointerType: string;
  readonly pointerId: number;
  /** 押し下げの的。 */
  readonly target: EventTarget | null;
  /** 離し（`pointerup`）の `event.timeStamp`。離すまでは null。 */
  upTime: number | null;
  /** この押しを受けないと決めた守り。受けるなら null。 */
  blockedBy: Guard | null;
  /** マウスの押しが連続の押しの守りの範囲にあったときの、その守り（連続かは `mousedown` の `detail` で決める）。 */
  mouseCandidateOf: Guard | null;
  /** 対の `mousedown` を受けたか。 */
  mouseDownSeen: boolean;
  /** 対の `click` を受けたか。 */
  clicked: boolean;
}

/** 受けた click。押しの点は着地の選び方に、押しは守りの起点に使う。 */
export interface AcceptedClick {
  /** 対の押し。キーボードと読み上げの起動（`detail === 0`）と、対の押し下げを持たない click では null。 */
  readonly press: PointerPress | null;
  /** click の座標。キーボードと読み上げの起動では null。 */
  readonly point: ScreenPoint | null;
  /** click を受けたときの切り替わりの番号。 */
  readonly transitionAtClick: number;
}

/** 1つの切り替わりのあとの守り。 */
interface Guard {
  readonly transition: QuizGuardedTransition;
  /** 切り替えた押し。 */
  readonly origin: PointerPress;
  /** タッチとペンの連続の押しで、次の押しを数える元の押し（起点の押しか、受けなかった押し）。 */
  chainPress: PointerPress;
  /** この守りで受けなかった押しを数えたか。 */
  reported: boolean;
}

/** 押し直しを待っている、受けなかった押し。 */
interface PendingRetry {
  readonly transition: QuizGuardedTransition;
  readonly pressable: Element;
  readonly downTime: number;
}

export interface PressGuardOptions {
  /** 守りが押しを初めて止めたとき（1つの守りで1回）。 */
  onGuarded(transition: QuizGuardedTransition): void;
  /** 受けなかった押しのあと、同じ押せるものの押し直しを受けたとき。 */
  onRetry(transition: QuizGuardedTransition, elapsedMs: number): void;
}

export interface PressGuard {
  /** `window` に受け手を置く。返す関数で外す。 */
  attach(): () => void;
  /** いま出ている画面の切り替わりの番号。 */
  shownTransition(): number;
  /**
   * 画面が切り替わったら、新しい画面の切り替わりの番号を知らせる。受け手は React の click の処理より先に走るので、
   * click の時点の番号で、その click が画面を切り替えたかと、連続の押しの1打目が画面を切り替えたかを見分ける。
   */
  showTransition(transition: number): void;
  /** いちばん新しく受けた click。まだ無ければ null。 */
  lastAcceptedClick(): AcceptedClick | null;
  /**
   * 切り替わりのあとの守りを掛ける。origin は切り替えた押し。`"answer"`（診断の答え→次の問）は連続の押しの守り、
   * ほかは窓の守りになる。前の守りは外れる。
   */
  open(transition: QuizGuardedTransition, origin: PointerPress): void;
  /** 守りを外す（守りを掛けない切り替わりと、キーボードで切り替えたとき）。 */
  close(): void;
}

function isTouchLike(press: PointerPress): boolean {
  return press.pointerType === "touch" || press.pointerType === "pen";
}

/** press が、origin を起点にした守りの範囲（700ms 未満・100px 以下）にあるか。 */
function isWithinReach(origin: PointerPress, press: PointerPress): boolean {
  return (
    press.downTime - origin.downTime < GUARD_WINDOW_MS &&
    Math.hypot(press.x - origin.x, press.y - origin.y) <= GUARD_REACH_PX
  );
}

/** タッチとペンの press が、previous の離しから数えて連続の押しか。 */
function followsWithinTouchInterval(
  previous: PointerPress,
  press: PointerPress,
): boolean {
  return (
    previous.upTime !== null &&
    press.downTime - previous.upTime < TOUCH_CONSECUTIVE_MS
  );
}

export function createPressGuard(
  initialTransition: number,
  options: PressGuardOptions,
): PressGuard {
  let transitionShown = initialTransition;
  /** いちばん新しい押し。対の mousedown と click をこれに結ぶ。 */
  let press: PointerPress | null = null;
  let guard: Guard | null = null;
  let lastClick: AcceptedClick | null = null;
  let pendingRetry: PendingRetry | null = null;
  /** 2打目で語を選ばない守りの、連続の押しの1打目（detail が 1 の mousedown）のときの切り替わりの番号。 */
  let sequenceStart: number | null = null;

  /** 受けない押しを止めたことを数え、押し直しを待つ。 */
  const noteStopped = (stopped: PointerPress, by: Guard): void => {
    if (!by.reported) {
      by.reported = true;
      options.onGuarded(by.transition);
    }
    const pressable = closestPressable(stopped.target);
    if (pressable) {
      pendingRetry = {
        transition: by.transition,
        pressable,
        downTime: stopped.downTime,
      };
    }
  };

  /** 受けた押しが、受けなかった押しの押し直しなら数える。 */
  const noteAccepted = (accepted: PointerPress): void => {
    const retry = pendingRetry;
    if (!retry) return;
    const elapsed = accepted.downTime - retry.downTime;
    if (elapsed > RETRY_WINDOW_MS) {
      pendingRetry = null;
      return;
    }
    if (closestPressable(accepted.target) !== retry.pressable) return;
    pendingRetry = null;
    options.onRetry(retry.transition, Math.round(elapsed));
  };

  const handlePointerDown = (event: PointerEvent): void => {
    const next: PointerPress = {
      downTime: event.timeStamp,
      x: event.clientX,
      y: event.clientY,
      pointerType: event.pointerType,
      pointerId: event.pointerId,
      target: event.target,
      upTime: null,
      blockedBy: null,
      mouseCandidateOf: null,
      mouseDownSeen: false,
      clicked: false,
    };
    press = next;
    if (!guard || !isWithinReach(guard.origin, next)) return;
    if (guard.transition !== "answer") {
      next.blockedBy = guard;
      return;
    }
    // 連続の押しの守り。タッチとペンは、iOS の Safari がタップの detail を数えないとする資料があるので、守りが
    // 離しからの長さで数え、受けなかった押しから連鎖させる。マウスはブラウザの数え方（mousedown の detail）に任せる。
    if (isTouchLike(next)) {
      if (followsWithinTouchInterval(guard.chainPress, next)) {
        next.blockedBy = guard;
        guard.chainPress = next;
      }
      return;
    }
    next.mouseCandidateOf = guard;
  };

  const handlePointerUp = (event: PointerEvent): void => {
    if (press && press.pointerId === event.pointerId && press.upTime === null) {
      press.upTime = event.timeStamp;
    }
  };

  const handleMouseDown = (event: MouseEvent): void => {
    const paired = press && !press.mouseDownSeen ? press : null;
    if (paired) {
      paired.mouseDownSeen = true;
      if (paired.mouseCandidateOf === guard && guard && event.detail >= 2) {
        paired.blockedBy = guard;
      }
      if (paired.blockedBy) {
        // フォーカスが押したものへ移らず、置いたフォーカスと語の選択を保つ。
        event.preventDefault();
        noteStopped(paired, paired.blockedBy);
        return;
      }
    }
    // 2打目で語を選ばない。受けた連続の押しの1打目が画面を切り替えたら（番号が増えていたら）、2打目からの既定の
    // 動き（語の選択）を止める。入れ替わった先の字に黒い地の選択が残らない。字の上で始めたダブルクリックと引いて
    // 選ぶことは、1打目が何も切り替えないので止めない。2打目の click はそのまま届く。
    if (event.detail === 1) {
      sequenceStart = transitionShown;
      return;
    }
    if (
      event.detail >= 2 &&
      sequenceStart !== null &&
      transitionShown > sequenceStart
    ) {
      event.preventDefault();
    }
  };

  const handleClick = (event: MouseEvent): void => {
    if (event.detail === 0) {
      // キーボードと読み上げの起動は対の押し下げを持たず、守りの中でも通す。押した点も持たない。
      lastClick = {
        press: null,
        point: null,
        transitionAtClick: transitionShown,
      };
      return;
    }
    const paired = press && !press.clicked ? press : null;
    if (paired) paired.clicked = true;
    if (paired?.blockedBy) {
      event.preventDefault();
      event.stopPropagation();
      noteStopped(paired, paired.blockedBy);
      return;
    }
    if (paired) noteAccepted(paired);
    lastClick = {
      press: paired,
      point: { x: event.clientX, y: event.clientY },
      transitionAtClick: transitionShown,
    };
  };

  return {
    attach() {
      window.addEventListener("pointerdown", handlePointerDown, true);
      window.addEventListener("pointerup", handlePointerUp, true);
      window.addEventListener("mousedown", handleMouseDown, true);
      window.addEventListener("click", handleClick, true);
      return () => {
        window.removeEventListener("pointerdown", handlePointerDown, true);
        window.removeEventListener("pointerup", handlePointerUp, true);
        window.removeEventListener("mousedown", handleMouseDown, true);
        window.removeEventListener("click", handleClick, true);
      };
    },
    shownTransition() {
      return transitionShown;
    },
    showTransition(transition) {
      transitionShown = transition;
    },
    lastAcceptedClick() {
      return lastClick;
    },
    open(transition, origin) {
      // 診断の答えは、見せる間（ANSWER_SHOWN_MS）のあとのタイマーで切り替わる。見せる間に起点から続けて押した
      // タッチとペンの押しは、受けなかった押しと同じく連鎖の元にする（どれにも働かない、答えた問の上の押し）。
      const chainPress =
        transition === "answer" &&
        press &&
        press !== origin &&
        isTouchLike(press) &&
        isWithinReach(origin, press) &&
        followsWithinTouchInterval(origin, press)
          ? press
          : origin;
      guard = { transition, origin, chainPress, reported: false };
    },
    close() {
      guard = null;
    },
  };
}
