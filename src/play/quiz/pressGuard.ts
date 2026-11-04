import type { QuizGuardedTransition } from "@/lib/analytics";
import { closestPressable, type ScreenPoint } from "@/lib/reveal";

/**
 * 回答の画面の押しの受け手（docs/cycles/cycle-316/t5a-design.md 4-9）。`window` の捕捉の段階で `pointerdown`・
 * `pointerup`・`pointercancel`・`mousedown`・`click` を受け、React の `onClick`・素の `a[href]` の移動・`summary` の
 * 開閉・Next の `Link` の移動のどれより先に走る。受け持つのは次の3つである。
 *
 * - **押した点を覚える**: 切り替わったあとの着地は、同じ点に落ちる2打目を見て選ぶ。
 * - **二度押しの2打目を受けない**: 押した点の下が入れ替わる操作のあと、新しく出た画面を読む前の、1打目の点の
 *   近くへの押しは、1打目と一続きの二度押しの2打目である。その押しの `mousedown` と `click` を止める。受けるかは
 *   押し下げの時刻と座標で決め、守りが開いたあとの押し下げは押し下げの時に、守りが開く前に押し下げてまだ `click`
 *   まで届いていない押し（1打目の click より先に押し下げた指の速い二度押しの2打目と、診断の答えを見せる間に触れ、
 *   切り替わったあとに離す指）は守りが開いた時に決める。
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

/**
 * 離してから互換の `mousedown` と `click` を待つ長さの上限（ms）。タッチの互換の事象は離しのすぐあとに出るので、
 * これを過ぎても `click` を受けない押し（2本の指で触れた押しなど、ブラウザが tap と取らなかった押し）は、もう
 * `click` を受けない。
 */
export const COMPAT_EVENTS_WAIT_MS = 1000;

/**
 * ポインタの1つの押し。時刻と座標は押し下げ（`pointerdown`）で取る。覚えるのは、主のポインタ（`isPrimary` が真）の
 * 主のボタン（`button === 0`。指とペンでは触れること）の押しだけである。右や中のボタンの押しと、2本目からの指の
 * 押しは、二度押しの2打目にならず、覚えると1本目の指の `mousedown` と `click` を別の押しに結んでしまう。
 */
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
  /** 対の `mousedown` の `detail`（マウスの連続の数）。`mousedown` を受けるまでは null。 */
  mouseDownDetail: number | null;
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
  /**
   * タッチとペンの連続の押しで、次の押しを数える元の押し（起点の押しか、受けなかった押しか、答えを見せる間に答えた
   * 問の押せない行の上で離した押し）。
   */
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
   * ほかは窓の守りになる。前の守りは外れる。origin のあとに押し下げてまだ `click` まで届いていない押しも、この守りで
   * 受けるかを決める。
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

/**
 * 互換の事象を待つ押しのうち、click と対の押しの位置（無ければ -1）。click がポインタの番号を持てば（Chromium の
 * click は `PointerEvent` で、その押しの `pointerId` を持つ）その番号のいちばん古い押し、持たなければいちばん古い
 * 押しである。番号で結べば、tap と取られずに click を受けなかった押しが並びに残っていても、次の押しの click を
 * それに結ばない。
 */
function clickPairIndex(
  waiting: readonly PointerPress[],
  event: MouseEvent,
): number {
  const pointerId =
    "pointerId" in event ? (event as PointerEvent).pointerId : -1;
  if (pointerId < 0) return waiting.length > 0 ? 0 : -1;
  return waiting.findIndex((candidate) => candidate.pointerId === pointerId);
}

/**
 * 互換の事象をもう受けない押しか（nextDownTime は次の押し下げの時刻）。マウスの click は離しと同じ task で出るので、
 * 次の押し下げまでに click を受けていないマウスの押し（押し下げた的が離すまでに DOM から外れた押し）はもう受けない。
 * タッチとペンは、離してから `COMPAT_EVENTS_WAIT_MS` を過ぎた押しである。
 */
function hasStoppedWaiting(
  waiting: PointerPress,
  nextDownTime: number,
): boolean {
  if (waiting.upTime === null) return false;
  return (
    waiting.pointerType === "mouse" ||
    nextDownTime - waiting.upTime >= COMPAT_EVENTS_WAIT_MS
  );
}

export function createPressGuard(
  initialTransition: number,
  options: PressGuardOptions,
): PressGuard {
  let transitionShown = initialTransition;
  /**
   * 互換の mousedown と click を待つ押し（まだ click を受けていない押し）の、押し下げの順の並び。ブラウザは互換の
   * 事象を押しの順に出すが、タッチでは離したあとにまとめて出すので、速い二度押しでは2打目の pointerdown が1打目の
   * mousedown と click より先に届く。そこで mousedown は mousedown をまだ受けていないいちばん古い押しに、click は
   * いちばん古い押し（clickPairIndex）に結ぶ。並びに残るのは、押し下げているか、離して互換の事象を待つ押しだけで
   * ある（click を受けた押しと、それより前の押し・引いて送りになった押し・hasStoppedWaiting の押しは外す）。
   */
  let waiting: PointerPress[] = [];
  /** いちばん新しく click を受けた押し。 */
  let lastClickedPress: PointerPress | null = null;
  let guard: Guard | null = null;
  let lastClick: AcceptedClick | null = null;
  let pendingRetry: PendingRetry | null = null;
  /** 2打目で語を選ばない守りの、連続の押しの1打目（detail が 1 の mousedown）のときの切り替わりの番号。 */
  let sequenceStart: number | null = null;

  /**
   * 受けない押しを止めたことを数え、押し直しを待つ。押し直しの元は、止めた事象（`mousedown` か `click`）の的の
   * 押せるものである。見せる間に押し下げて切り替わったあとに離す押しでは、押し下げの的は答えた問の行で、何も
   * 起きなかったのは止めた事象が落ちた新しい画面のものだからである。経過は押し下げの時刻から数える。
   */
  const noteStopped = (
    stopped: PointerPress,
    by: Guard,
    stoppedEventTarget: EventTarget | null,
  ): void => {
    if (!by.reported) {
      by.reported = true;
      options.onGuarded(by.transition);
    }
    const pressable = closestPressable(stoppedEventTarget);
    if (pressable) {
      pendingRetry = {
        transition: by.transition,
        pressable,
        downTime: stopped.downTime,
      };
    }
  };

  /**
   * pressed を守り g の範囲で見て、受けない押しなら g を `blockedBy` に入れる。タッチとペンの連続の押しは、連鎖の元を
   * pressed に進める。すでに `click` まで届いた押し（診断の答えを見せる間に、答えた問の押せない行の上で離した押し）は
   * 何も起こしていないので止めずに、連鎖の元にだけする。マウスの連続は `mousedown` の `detail` で決め、`mousedown` が
   * まだなら `mousedown` の時に決める。
   */
  const judge = (g: Guard, pressed: PointerPress): void => {
    if (!isWithinReach(g.origin, pressed)) return;
    const block = (): void => {
      if (!pressed.clicked) pressed.blockedBy = g;
    };
    if (g.transition !== "answer") {
      block();
      return;
    }
    // 連続の押しの守り。タッチとペンは、iOS の Safari がタップの detail を数えないとする資料があるので、守りが
    // 離しからの長さで数え、受けなかった押しから連鎖させる。マウスはブラウザの数え方（mousedown の detail）に任せる。
    if (isTouchLike(pressed)) {
      if (followsWithinTouchInterval(g.chainPress, pressed)) {
        block();
        g.chainPress = pressed;
      }
      return;
    }
    if (pressed.mouseDownDetail === null) pressed.mouseCandidateOf = g;
    else if (pressed.mouseDownDetail >= 2) block();
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
    if (!event.isPrimary || event.button !== 0) return;
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
      mouseDownDetail: null,
      clicked: false,
    };
    waiting = waiting.filter(
      (candidate) => !hasStoppedWaiting(candidate, next.downTime),
    );
    waiting.push(next);
    if (guard) judge(guard, next);
  };

  const handlePointerUp = (event: PointerEvent): void => {
    const released = waiting.find(
      (candidate) =>
        candidate.pointerId === event.pointerId && candidate.upTime === null,
    );
    if (released) released.upTime = event.timeStamp;
  };

  /** 引いて送りになった押しは、mousedown も click も受けない。 */
  const handlePointerCancel = (event: PointerEvent): void => {
    waiting = waiting.filter(
      (candidate) =>
        candidate.pointerId !== event.pointerId || candidate.upTime !== null,
    );
  };

  const handleMouseDown = (event: MouseEvent): void => {
    // 右や中のボタンの mousedown は、覚えた押し（主のボタンの押しだけ）とも、語の選択の連続とも結ばない。
    if (event.button !== 0) return;
    // 連続の押しの1打目は、受けない押しでも連続の始まりとして覚える。止めた1打目は何も切り替えないので、その
    // 連続の2打目からの語の選択は止めない。
    if (event.detail === 1) sequenceStart = transitionShown;
    const paired = waiting.find(
      (candidate) => candidate.mouseDownDetail === null,
    );
    if (paired) {
      paired.mouseDownDetail = event.detail;
      if (paired.mouseCandidateOf === guard && guard && event.detail >= 2) {
        paired.blockedBy = guard;
      }
      if (paired.blockedBy) {
        // フォーカスが押したものへ移らず、置いたフォーカスと語の選択を保つ。
        event.preventDefault();
        noteStopped(paired, paired.blockedBy, event.target);
        return;
      }
    }
    // 2打目で語を選ばない。受けた連続の押しの1打目が画面を切り替えたら（番号が増えていたら）、2打目からの既定の
    // 動き（語の選択）を止める。入れ替わった先の字に黒い地の選択が残らない。字の上で始めたダブルクリックと引いて
    // 選ぶことは、1打目が何も切り替えないので止めない。2打目の click はそのまま届く。
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
    const index = clickPairIndex(waiting, event);
    const paired = index >= 0 ? waiting[index] : null;
    if (paired) {
      paired.clicked = true;
      lastClickedPress = paired;
      // 互換の事象は押しの順に出るので、対の押しより前の押しも、もう click を受けない。
      waiting = waiting.slice(index + 1);
    }
    if (paired?.blockedBy) {
      event.preventDefault();
      event.stopPropagation();
      noteStopped(paired, paired.blockedBy, event.target);
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
      window.addEventListener("pointercancel", handlePointerCancel, true);
      window.addEventListener("mousedown", handleMouseDown, true);
      window.addEventListener("click", handleClick, true);
      return () => {
        window.removeEventListener("pointerdown", handlePointerDown, true);
        window.removeEventListener("pointerup", handlePointerUp, true);
        window.removeEventListener("pointercancel", handlePointerCancel, true);
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
      guard = { transition, origin, chainPress: origin, reported: false };
      // 起点のあとの押しも、押し下げの順に、押し下げの時刻と座標で、いま掛ける守りに当てる。当てるのは、起点のあとに
      // click を受けた押し（いちばん新しく受けたもの）と、まだ click を受けていない押しである。
      // click の処理の中で切り替わる操作（「はじめる」「次へ」）では、指の速い二度押しの2打目が、1打目の click より
      // 先に押し下げて、まだ click を受けていない押しとして並びに残っている。
      // 診断の答えと最後の答えは、見せる間（ANSWER_SHOWN_MS）のあとのタイマーで切り替わる。見せる間に触れた指は、
      // 切り替わったあとに離すと、click が新しい画面のものに届き、離したあとに mousedown を出す機器では mousedown も
      // 届く（落ちる要素は離した時の組みで決まる）。マウスは mousedown が押し下げと続けて見せる間に届くので、その
      // detail で当てる。マウスの押しの的が切り替わりで DOM から外れると Chromium は click を出さないが、click を
      // 出すブラウザでも同じ決まりで止まる。
      if (lastClickedPress && lastClickedPress !== origin) {
        judge(guard, lastClickedPress);
      }
      for (const pending of waiting) judge(guard, pending);
    },
    close() {
      guard = null;
    },
  };
}
