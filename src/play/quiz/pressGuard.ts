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
 * 互換の `mousedown`・`click` の点と押しの点を同じ点とみなす隔たりの上限（px。縦と横の隔たりの大きいほう、
 * max(dx, dy) で測り、この長さ以下を同じ点とみなす）。互換の事象の点はタッチの調整で押せるものへ寄せた点で、
 * Chromium の寄せは縦と横のそれぞれで触れた面の半辺（10〜16px）の中に収まる。WebKit の寄せの幅は確かめていない
 * ので、Blink の触れた面の一辺の上限（32 dip）まで見る。
 */
export const COMPAT_POINT_REACH_PX = 32;

/**
 * ポインタの1つの押し。時刻と座標は押し下げ（`pointerdown`）で取る。覚えるのは、主のポインタ（`isPrimary` が真）の
 * 主のボタン（`button === 0`。指とペンでは触れること）の押しだけである。右や中のボタンの押しと、2本目からの指の
 * 押しは、二度押しの2打目にならず、`click` も出さない（Chromium は2本の指の押しに互換の事象を出さない）。覚えると、
 * その点の近くの次の押しの `mousedown` と `click` をそれに結んでしまう。
 */
export interface PointerPress {
  /** 押し下げの順の番号（覚えた押しごとに 1 ずつ増える）。 */
  readonly order: number;
  /** 押し下げの `event.timeStamp`。 */
  readonly downTime: number;
  /** 押し下げの画面の座標。 */
  readonly x: number;
  readonly y: number;
  readonly pointerType: string;
  readonly pointerId: number;
  /** 離し（`pointerup`）の `event.timeStamp`。離すまでは null。 */
  upTime: number | null;
  /** 離しの画面の座標。離すまでは null。 */
  upPoint: ScreenPoint | null;
  /** この押しを受けないと決めた守り。受けるなら null。 */
  blockedBy: Guard | null;
  /** マウスの押しが連続の押しの守りの範囲にあったときの、その守り（連続かは `mousedown` の `detail` で決める）。 */
  mouseCandidateOf: Guard | null;
  /** 対の `mousedown` の `detail`（マウスの連続の数）。`mousedown` を受けるまでは null。 */
  mouseDownDetail: number | null;
  /** 対の `mousedown` を離しより前に受けたか（マウスと hover を持つペンの順）。 */
  mouseDownBeforeUp: boolean;
  /** 対の `click` を受けたか。 */
  clicked: boolean;
}

/** 受けた click。click の点は着地の選び方に、起点の押しは守りに使う。 */
export interface AcceptedClick {
  /**
   * click を出した押し。守りの起点にする（選び方は `clickOriginOf`）。キーボードと読み上げの起動（`detail === 0`）と、
   * 対の押し下げを持たない click では null。
   */
  readonly origin: PointerPress | null;
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

/** 互換の事象の点から押しまでの隔たり（押し下げの点と離しの点の近いほう。max(dx, dy)）。 */
function compatPointGap(press: PointerPress, event: MouseEvent): number {
  const gapTo = (x: number, y: number): number =>
    Math.max(Math.abs(event.clientX - x), Math.abs(event.clientY - y));
  const downGap = gapTo(press.x, press.y);
  return press.upPoint
    ? Math.min(downGap, gapTo(press.upPoint.x, press.upPoint.y))
    : downGap;
}

/** candidates のうち、互換の事象の点から `COMPAT_POINT_REACH_PX` の中にある押し。 */
function nearCompatPoint(
  candidates: readonly PointerPress[],
  event: MouseEvent,
): PointerPress[] {
  return candidates.filter(
    (candidate) => compatPointGap(candidate, event) <= COMPAT_POINT_REACH_PX,
  );
}

/**
 * `click` が番号で結べる押し（無ければ null）。Chromium の `click` は押しの番号を持つ `PointerEvent` なので、押しと
 * 同じ `pointerType` でその押しの `pointerId` を持つ `click` は、その押しに結ぶ。WebKit はタッチの `click` を
 * `pointerType` が `"mouse"` の `PointerEvent` で出すことがあり（WebKit Bug 282988）、その番号は押しと合うとは限らない
 * ので、型の合わない番号は使わない。キーボードと `element.click()` の番号（-1）も使わない。
 */
function numberedPairOf(
  candidates: readonly PointerPress[],
  event: MouseEvent,
): PointerPress | null {
  if (!("pointerId" in event)) return null;
  const { pointerId, pointerType } = event as PointerEvent;
  if (pointerId < 0) return null;
  return (
    candidates.find(
      (candidate) =>
        candidate.pointerId === pointerId &&
        candidate.pointerType === pointerType,
    ) ?? null
  );
}

/**
 * 互換の事象（`mousedown` か `click`）と対の押し（無ければ null）。candidates は、その事象をまだ受けていない押しの、
 * 押し下げの順の並びである。
 *
 * 1. `click` が番号で結べれば、その押しに結ぶ（`numberedPairOf`）。
 * 2. そうでなければ、事象の点から `COMPAT_POINT_REACH_PX` の中にある押しから選ぶ。中に無ければ、すべての押しから選ぶ。
 * 3. 選ぶのは、受ける押し（`blockedBy` が null）のうちいちばん古いものである。受ける押しが無ければ、いちばん古い押し。
 *
 * 互換の事象は押しの順に出るので、待っている押しのいちばん古いものに結ぶ。タッチの速い連打では、1打目の互換の事象が
 * 届く前に、2打目の押し下げが届き、2打目の離しまで届くこともある（knowledge の input-events-and-guards.md §9）ので、
 * 「いちばん新しく押し下げた押し」や「いちばん新しく離した押し」には結べない。ただ、離しても互換の事象を出さない押し
 * （2本の指で触れた押し・iOS の Safari の押せない字へのタップ）が並びに残ると、順だけでは次の押しの事象をそれに
 * 結んでしまう。その押しが別の点にあれば点で外れる。同じ点に残れば点でも見分けられないので、受ける押しを先に選び、
 * 来訪者の押しを誤って止めない側に倒す。そのとき守りの起点がその押しへ前にずれないよう、起点は `clickOriginOf` で
 * 別に選ぶ。
 */
function compatPairOf(
  candidates: readonly PointerPress[],
  event: MouseEvent,
): PointerPress | null {
  const numbered = numberedPairOf(candidates, event);
  if (numbered) return numbered;
  const near = nearCompatPoint(candidates, event);
  const pool = near.length > 0 ? near : candidates;
  return (
    pool.find((candidate) => candidate.blockedBy === null) ?? pool[0] ?? null
  );
}

/**
 * `click` を出した押し（守りの起点にする押し）。paired は `compatPairOf` で結んだ押しである。番号で結べた `click` では
 * その押し。番号で結べない `click` では、click の点から `COMPAT_POINT_REACH_PX` の中で、いちばん新しく離した押し
 * （中に離した押しが無ければ paired）。
 *
 * 番号で結べない `click` を順で結ぶと、同じ点に残った互換の事象を出さない押しに結ぶことがある。それを起点にすると、
 * 起点が来訪者の押しより前にずれ、守りの窓が早く閉じて、そのあとの二度押しの2打目を受けてしまう。いちばん新しく離した
 * 押しを起点にすれば、起点は前にずれない。速い連打の事象が遅れて届き、`click` の時に2打目まで離し終えているときは、
 * 起点が1打目より後の押しになり、窓が少し後ろへ延びる側にだけずれる。
 */
function clickOriginOf(
  candidates: readonly PointerPress[],
  event: MouseEvent,
  paired: PointerPress | null,
): PointerPress | null {
  if (numberedPairOf(candidates, event)) return paired;
  let latest: PointerPress | null = null;
  for (const candidate of nearCompatPoint(candidates, event)) {
    if (
      candidate.upTime !== null &&
      (latest === null || candidate.upTime >= (latest.upTime ?? -Infinity))
    ) {
      latest = candidate;
    }
  }
  return latest ?? paired;
}

/**
 * 互換の事象をもう受けない押しか（nextDownTime は次の押し下げの時刻）。互換の `mousedown` を離しより前に受けた押し
 * （マウスと hover を持つペンの順）は、離しに続けて `click` まで出し終えるので、次の押し下げまでに `click` を受けて
 * いなければ（押し下げた的が離すまでに DOM から外れた押し）もう受けない。Chromium のペンは押しを分けても
 * `pointerId` が変わらないので、残すと次の押しの `click` が番号でそれに結ばれる。離したあとに `mousedown` を出す
 * 押し（タッチと hover を持たないペン）は、速い二度押しで2打目の押し下げが1打目の互換の事象より先に届くので、離して
 * から `COMPAT_EVENTS_WAIT_MS` を過ぎるまで待つ。
 */
function hasStoppedWaiting(
  waiting: PointerPress,
  nextDownTime: number,
): boolean {
  if (waiting.upTime === null) return false;
  return (
    waiting.mouseDownBeforeUp ||
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
   * 事象を押しの順に出すが、タッチでは離したあとにまとめて出すので、速い連打では2打目の pointerdown（と pointerup）
   * が1打目の mousedown と click より先に届く。そこで mousedown は mousedown をまだ受けていない押しから、click は
   * 並びの押しから、compatPairOf で順と点で選んで結ぶ。並びに残るのは、押し下げているか、離して互換の事象を待つ押し
   * だけである（click を結んだ押しと、それより前の押し・引いて送りになった押し・hasStoppedWaiting の押しは外す）。
   */
  let waiting: PointerPress[] = [];
  /** 覚えた押しの数（押しの `order`）。 */
  let pressCount = 0;
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

  /**
   * 受けた click が、受けなかった押しの押し直しなら数える。押せるものは、止めた側と同じく click の的から取る（タッチの
   * 調整で、押し下げの的と click の的は違うことがある）。経過は、click を出した押しの押し下げの時刻から数える。
   */
  const noteAccepted = (
    accepted: PointerPress,
    clickTarget: EventTarget | null,
  ): void => {
    const retry = pendingRetry;
    if (!retry) return;
    const elapsed = accepted.downTime - retry.downTime;
    if (elapsed > RETRY_WINDOW_MS) {
      pendingRetry = null;
      return;
    }
    if (closestPressable(clickTarget) !== retry.pressable) return;
    pendingRetry = null;
    options.onRetry(retry.transition, Math.round(elapsed));
  };

  const handlePointerDown = (event: PointerEvent): void => {
    if (!event.isPrimary || event.button !== 0) return;
    pressCount += 1;
    const next: PointerPress = {
      order: pressCount,
      downTime: event.timeStamp,
      x: event.clientX,
      y: event.clientY,
      pointerType: event.pointerType,
      pointerId: event.pointerId,
      upTime: null,
      upPoint: null,
      blockedBy: null,
      mouseCandidateOf: null,
      mouseDownDetail: null,
      mouseDownBeforeUp: false,
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
    if (released) {
      released.upTime = event.timeStamp;
      released.upPoint = { x: event.clientX, y: event.clientY };
    }
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
    const paired = compatPairOf(
      waiting.filter((candidate) => candidate.mouseDownDetail === null),
      event,
    );
    if (paired) {
      paired.mouseDownDetail = event.detail;
      paired.mouseDownBeforeUp = paired.upTime === null;
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
        origin: null,
        point: null,
        transitionAtClick: transitionShown,
      };
      return;
    }
    const paired = compatPairOf(waiting, event);
    const origin = clickOriginOf(waiting, event, paired);
    if (paired) {
      paired.clicked = true;
      lastClickedPress = paired;
      // 互換の事象は押しの順に出るので、対の押しより前の押しも、もう click を受けない。
      waiting = waiting.slice(waiting.indexOf(paired) + 1);
    }
    if (paired?.blockedBy) {
      event.preventDefault();
      event.stopPropagation();
      noteStopped(paired, paired.blockedBy, event.target);
      return;
    }
    if (origin) noteAccepted(origin, event.target);
    lastClick = {
      origin,
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
      // 起点のあとに押し下げた押しも、押し下げの順に、押し下げの時刻と座標で、いま掛ける守りに当てる。当てるのは、
      // 起点のあとに click を受けた押し（いちばん新しく受けたもの）と、まだ click を受けていない押しである。
      // click の処理の中で切り替わる操作（「はじめる」「次へ」）では、指の速い二度押しの2打目が、1打目の click より
      // 先に押し下げて、まだ click を受けていない押しとして並びに残っている。
      // 診断の答えと最後の答えは、見せる間（ANSWER_SHOWN_MS）のあとのタイマーで切り替わる。見せる間に触れ、切り替わった
      // あとに離す押しは、機器で事象の順が違う。タッチと hover を持たないペンは、離したあとに mousedown と click を
      // 出し、どちらも新しい画面のものに届く（落ちる要素は離した時の組みで決まる）。マウスと hover を持つペンは、
      // mousedown が押し下げと続けて見せる間に届き（マウスはその detail で当てる）、押し下げた的が切り替わりで DOM から
      // 外れるので、Chromium は click を出さない。click を出すブラウザでも同じ決まりで止まる。
      // 起点より前に押し下げた押しは、範囲にも連続にも当てない（当てると、連続の元が起点より前へ戻る）。ただ、並びに
      // 残る起点とそれより前の押しは、切り替えた click を順で結んだ押しより後の、まだ click を受けていない押しで、
      // 互換の事象を出さないまま残った押しか、事象が遅れて届く速い連打の2打目からである。そこで受けない押しにする。
      if (lastClickedPress && lastClickedPress.order > origin.order) {
        judge(guard, lastClickedPress);
      }
      for (const pending of waiting) {
        if (pending.order > origin.order) judge(guard, pending);
        else pending.blockedBy = guard;
      }
    },
    close() {
      guard = null;
    },
  };
}
