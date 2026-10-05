import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import {
  chooseLanding,
  groupRevealDistance,
  planFromPageTop,
  planGroup,
  planHeadedBox,
  revealControl,
  revealFocusedFrame,
  revealGroup,
  revealLanding,
  revealResult,
  trackScrollBeforeTab,
  visibleRange,
  type LandingChoice,
  type TargetRect,
} from "../reveal";

function box(top: number, bottom: number): Element {
  return {
    getBoundingClientRect: () => ({ top, bottom }) as DOMRect,
  } as Element;
}

/** 小さいビューポート（100svh）の高さを読む見えない箱の高さを決める。jsdom では組まれず 0 になる。 */
function stubSmallViewportHeight(height: number): void {
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({
    height,
  } as DOMRect);
}

beforeEach(() => {
  vi.stubGlobal("visualViewport", undefined);
  vi.stubGlobal("innerHeight", 600);
  vi.stubGlobal("scrollBy", vi.fn());
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("visibleRange", () => {
  test("小さいビューポートが visualViewport より低ければ、下端を小さいビューポートの高さで切る", () => {
    vi.stubGlobal("visualViewport", { offsetTop: 0, height: 620 });
    stubSmallViewportHeight(560);
    expect(visibleRange()).toEqual({ top: 0, bottom: 560 });
  });

  test("小さいビューポートが visualViewport より高ければ、visualViewport の高さで測る（文字盤が開いたとき）", () => {
    vi.stubGlobal("visualViewport", { offsetTop: 0, height: 300 });
    stubSmallViewportHeight(560);
    expect(visibleRange()).toEqual({ top: 0, bottom: 300 });
  });

  test("2つの高さが等しければ、その高さで測る", () => {
    vi.stubGlobal("visualViewport", { offsetTop: 0, height: 560 });
    stubSmallViewportHeight(560);
    expect(visibleRange()).toEqual({ top: 0, bottom: 560 });
  });

  test("小さいビューポートの高さが 0 と読めたら、visualViewport の上端の位置と高さで測る", () => {
    vi.stubGlobal("visualViewport", { offsetTop: 120, height: 280 });
    stubSmallViewportHeight(0);
    expect(visibleRange()).toEqual({ top: 120, bottom: 400 });
  });

  test("visualViewport が無ければ、innerHeight と小さいビューポートの低いほうで測り、0 と読めたら innerHeight で測る", () => {
    stubSmallViewportHeight(560);
    expect(visibleRange()).toEqual({ top: 0, bottom: 560 });

    vi.restoreAllMocks();
    stubSmallViewportHeight(0);
    expect(visibleRange()).toEqual({ top: 0, bottom: 600 });
  });

  test("つまんで拡大して上端が大きいときは、高さを比べてから上端に足し、小さいビューポートの高さで下端を切らない", () => {
    vi.stubGlobal("visualViewport", { offsetTop: 400, height: 250 });
    stubSmallViewportHeight(560);
    expect(visibleRange()).toEqual({ top: 400, bottom: 650 });
  });

  test("高さを読む箱を文書に残さない", () => {
    const before = document.documentElement.childElementCount;
    visibleRange();
    expect(document.documentElement.childElementCount).toBe(before);
  });
});

describe("revealControl", () => {
  beforeEach(() => {
    vi.stubGlobal("innerHeight", 667);
  });

  test("コントロールが画面の中にあれば送らない", () => {
    revealControl(box(512, 560));
    expect(window.scrollBy).not.toHaveBeenCalled();
  });

  test("下端がちょうど画面の下端でも、画面の中として送らない", () => {
    revealControl(box(619, 667));
    expect(window.scrollBy).not.toHaveBeenCalled();
  });

  test("画面の下へ出ていれば、下端が画面の下端から 8px 上に来るまで送る", () => {
    revealControl(box(640, 688));
    expect(window.scrollBy).toHaveBeenCalledWith({
      top: 29,
      behavior: "instant",
    });
  });

  test("画面の上へ出ていれば、下端が画面の下端から 8px 上に来るまで戻す", () => {
    revealControl(box(-60, -12));
    expect(window.scrollBy).toHaveBeenCalledWith({
      top: -671,
      behavior: "instant",
    });
  });

  test("visibleRange() の画面の下端（visualViewport の offsetTop + height）で測る", () => {
    vi.stubGlobal("visualViewport", { offsetTop: 0, height: 400 });
    revealControl(box(420, 468));
    expect(window.scrollBy).toHaveBeenCalledWith({
      top: 76,
      behavior: "instant",
    });
  });

  test("visualViewport が送られているときは offsetTop を足した位置を下端にする", () => {
    vi.stubGlobal("visualViewport", { offsetTop: 100, height: 400 });
    revealControl(box(420, 468));
    expect(window.scrollBy).not.toHaveBeenCalled();

    revealControl(box(460, 520));
    expect(window.scrollBy).toHaveBeenCalledWith({
      top: 28,
      behavior: "instant",
    });
  });

  test("visualViewport の中でも、ツールバーを出した高さ（小さいビューポート）の外なら送る", () => {
    vi.stubGlobal("visualViewport", { offsetTop: 0, height: 667 });
    stubSmallViewportHeight(600);
    revealControl(box(600, 640));
    expect(window.scrollBy).toHaveBeenCalledWith({
      top: 48,
      behavior: "instant",
    });
  });

  test("innerHeight の中でも visualViewport の外なら送る", () => {
    vi.stubGlobal("visualViewport", { offsetTop: 0, height: 400 });
    revealControl(box(500, 548));
    expect(window.scrollBy).toHaveBeenCalledWith({
      top: 156,
      behavior: "instant",
    });
  });

  test("端数の距離を丸めずに送る", () => {
    revealControl(box(640.4, 688.6));
    expect(window.scrollBy).toHaveBeenCalledWith({
      top: 688.6 - 659,
      behavior: "instant",
    });
  });

  test("コントロールと context がどちらも画面の中なら送らない", () => {
    revealControl(box(600, 644), box(200, 300));
    expect(window.scrollBy).not.toHaveBeenCalled();
  });

  test("コントロールが画面の中でも context が上に出ていれば、コントロールの下端を画面の下端から 8px 上に置く", () => {
    revealControl(box(400, 444), box(-40, 50));
    expect(window.scrollBy).toHaveBeenCalledWith({
      top: -215,
      behavior: "instant",
    });
  });

  test("両方が入らないときも、コントロールの下端で位置を決め、コントロールを画面に入れる", () => {
    revealControl(box(769, 813), box(-100, 200));
    expect(window.scrollBy).toHaveBeenCalledWith({
      top: 154,
      behavior: "instant",
    });
  });
});

describe("revealResult", () => {
  test("結果が丸ごと画面にあれば送らない", () => {
    revealResult(box(100, 150), box(160, 590));
    expect(window.scrollBy).not.toHaveBeenCalled();
  });

  test("長い結果は、操作の並びを上端から 8px 下に置く", () => {
    revealResult(box(400, 450), box(460, 5000));
    expect(window.scrollBy).toHaveBeenCalledWith({
      top: 392,
      behavior: "instant",
    });
  });

  test("短い結果は、下端が下端から 8px 上に入るまでで止める", () => {
    revealResult(box(400, 450), box(460, 700));
    expect(window.scrollBy).toHaveBeenCalledWith({
      top: 108,
      behavior: "instant",
    });
  });

  test("visibleRange() の画面の範囲（visualViewport の上端と高さ）で測る", () => {
    vi.stubGlobal("visualViewport", { offsetTop: 200, height: 300 });
    revealResult(box(450, 500), box(510, 3000));
    expect(window.scrollBy).toHaveBeenCalledWith({
      top: 242,
      behavior: "instant",
    });
  });
});

describe("revealGroup", () => {
  test("まとまりが丸ごと画面にあれば送らない", () => {
    revealGroup(box(100, 140), box(460, 500));
    expect(window.scrollBy).not.toHaveBeenCalled();
  });

  test("下に外れていれば、最後の要素の下端が画面の下端から 8px 上に来るまで送る", () => {
    revealGroup(box(300, 340), box(660, 700));
    expect(window.scrollBy).toHaveBeenCalledWith({
      top: 108,
      behavior: "instant",
    });
  });

  test("上に外れていれば、最初の要素の上端が画面の上端から 8px 下に来るまで上へ送る", () => {
    // 上端 −60・高さ 400 のまとまり。下端を合わせる量（−202）でなく、上端を合わせる量を選ぶ。
    revealGroup(box(-60, -20), box(300, 340));
    expect(window.scrollBy).toHaveBeenCalledWith({
      top: -68,
      behavior: "instant",
    });
  });

  test("画面より高ければ、どちら向きでも最初の要素の上端を画面の上端から 8px 下に置く", () => {
    revealGroup(box(100, 140), box(760, 800));
    expect(window.scrollBy).toHaveBeenLastCalledWith({
      top: 92,
      behavior: "instant",
    });

    revealGroup(box(-300, -260), box(360, 400));
    expect(window.scrollBy).toHaveBeenLastCalledWith({
      top: -308,
      behavior: "instant",
    });
  });
});

describe("groupRevealDistance", () => {
  test("端数は 8px の空きが欠けない向きに丸める", () => {
    const range = { top: 0, bottom: 600 };
    expect(groupRevealDistance({ top: 300.4, bottom: 700.2 }, range)).toBe(109);
    expect(groupRevealDistance({ top: -60.5, bottom: 339.5 }, range)).toBe(-69);
  });
});

describe("着地の組", () => {
  const range = { top: 0, bottom: 600 };

  test("まとまりは、上下に 8px をあけて丸ごと入る送りの範囲を持つ", () => {
    expect(planGroup({ top: 300, bottom: 700 }, range)).toEqual({
      base: 108,
      span: { min: 108, max: 292 },
    });
  });

  test("画面より高いまとまりは、上端を画面の上端から 8px 下に置く送りだけを範囲にする", () => {
    expect(planGroup({ top: 100, bottom: 800 }, range)).toEqual({
      base: 92,
      span: { min: 92, max: 92 },
    });
  });

  test("ページの頭から見せる画面は、頭へ戻す送りを基準にする", () => {
    expect(planFromPageTop({ top: -900, bottom: -700 }, 1200, range)).toEqual({
      base: -1200,
      span: { min: -1292, max: -908 },
    });
  });

  test("ページの頭で下端が画面に入らなければ、下端が画面の下端から 8px 上に来る送りを基準にする", () => {
    expect(planFromPageTop({ top: -900, bottom: -500 }, 1200, range)).toEqual({
      base: -1092,
      span: { min: -1092, max: -908 },
    });
  });

  test("頭を持つボックスは、上端を画面の上端から 8px 以上・画面の高さの 1/3 以下に置く送りの範囲を持つ", () => {
    expect(planHeadedBox({ top: 400, bottom: 2000 }, 470, range)).toEqual({
      base: 392,
      span: { min: 200, max: 392 },
    });
  });

  test("頭を持つボックスは、頭の下端が画面の下端から 8px 上より上にある送りに限る", () => {
    expect(planHeadedBox({ top: 400, bottom: 2000 }, 950, range)).toEqual({
      base: 392,
      span: { min: 358, max: 392 },
    });
  });

  test("画面に入る高さのボックスは、丸ごと入る送りに限る", () => {
    expect(planHeadedBox({ top: 400, bottom: 900 }, 470, range)).toEqual({
      base: 392,
      span: { min: 308, max: 392 },
    });
  });

  test("頭が画面に入らない高さなら範囲は空で、着地は基準のまま", () => {
    const plan = planHeadedBox({ top: 400, bottom: 2000 }, 1000, range);
    expect(plan.span.min).toBeGreaterThan(plan.span.max);
    expect(
      chooseLanding({
        plan,
        point: { x: 100, y: 500 },
        avoidFirst: [rect(0, 2000)],
        avoidNext: [],
        scrollable: { min: -5000, max: 5000 },
      }),
    ).toBe(392);
  });
});

function rect(top: number, bottom: number): TargetRect {
  return { top, bottom, left: 0, right: 300 };
}

describe("chooseLanding", () => {
  const point = { x: 100, y: 500 };
  const wide = { min: -5000, max: 5000 };

  function choose(
    choice: Partial<LandingChoice> & Pick<LandingChoice, "plan">,
  ): number {
    return chooseLanding({
      point,
      avoidFirst: [],
      avoidNext: [],
      scrollable: wide,
      ...choice,
    });
  }

  describe("基準が送らないとき", () => {
    const plan = { base: 0, span: { min: -200, max: 200 } };

    test("点の真下に何も来なければ、押せるものが近くても送らない", () => {
      expect(choose({ plan, avoidFirst: [rect(505, 600)] })).toBe(0);
    });

    test("点の真下に押せるものが来れば、真下から外れるいちばん近い送りにする", () => {
      // 上へ 11 送れば矩形の下端が点の下に、下へ 21 送れば上端が点の上に出る。
      expect(choose({ plan, avoidFirst: [rect(490, 520)] })).toBe(-11);
    });

    test("次の問の選択肢を真下から外す送りのうち、ほかの押せるものを真下に置く送りは選ばない", () => {
      expect(
        choose({
          plan,
          avoidFirst: [rect(460, 499)],
          avoidNext: [rect(500, 530)],
        }),
      ).toBe(31);
    });

    test("次の問の選択肢を外せなければ、ほかの押せるものだけを外すいちばん近い送りにする", () => {
      expect(
        choose({
          plan,
          avoidFirst: [rect(480, 505)],
          avoidNext: [rect(0, 1000)],
        }),
      ).toBe(6);
    });

    test("範囲の中にほかの押せるものを外す送りが無ければ、送らない", () => {
      expect(choose({ plan, avoidFirst: [rect(0, 1000)] })).toBe(0);
    });
  });

  describe("基準が送るとき", () => {
    test("1. 点の真下にほかの押せるものが来ないことを、次の問の選択肢が来ないことより先にする", () => {
      expect(
        choose({
          plan: { base: 100, span: { min: 0, max: 200 } },
          avoidFirst: [rect(600, 700)],
          avoidNext: [rect(500, 599)],
        }),
      ).toBe(0);
    });

    test("2. 点の真下に次の問の選択肢が来ないことを、ほかの押せるものから遠いことより先にする", () => {
      // 送るほどほかの押せるものから遠ざかるが、60 から先は次の問の選択肢が真下に来る。
      expect(
        choose({
          plan: { base: 20, span: { min: 0, max: 150 } },
          avoidFirst: [rect(380, 470)],
          avoidNext: [rect(560, 700)],
        }),
      ).toBe(59);
    });

    test("3. ほかの押せるものから遠いことを、次の問の選択肢から遠いことより先にする", () => {
      expect(
        choose({
          plan: { base: 50, span: { min: 0, max: 100 } },
          avoidFirst: [rect(380, 470)],
          avoidNext: [rect(620, 700)],
        }),
      ).toBe(70);
    });

    test("4. 次の問の選択肢から遠いことを、基準に近いことより先にし、距離は 100 で頭打ちにする", () => {
      expect(
        choose({
          plan: { base: 50, span: { min: 0, max: 100 } },
          avoidNext: [rect(620, 700)],
        }),
      ).toBe(20);
    });

    test("5. どれも同じなら基準のまま", () => {
      expect(
        choose({
          plan: { base: 50, span: { min: 0, max: 100 } },
          avoidFirst: [rect(2000, 2100)],
        }),
      ).toBe(50);
    });
  });

  test("見せる範囲を、ページが送れる範囲で打ち切る", () => {
    const plan = { base: 100, span: { min: 50, max: 300 } };
    const avoidFirst = [rect(560, 640)];
    expect(choose({ plan, avoidFirst })).toBe(240);
    expect(
      choose({ plan, avoidFirst, scrollable: { min: -1000, max: 120 } }),
    ).toBe(50);
  });

  test("打ち切って範囲が空になれば、基準のまま", () => {
    expect(
      choose({
        plan: { base: 100, span: { min: 50, max: 300 } },
        avoidFirst: [rect(560, 640)],
        scrollable: { min: -1000, max: 30 },
      }),
    ).toBe(100);
  });

  test("キーボードで押して点が無ければ、真下に押せるものが来ても基準のまま", () => {
    expect(
      choose({
        plan: { base: 100, span: { min: 0, max: 300 } },
        point: null,
        avoidFirst: [rect(560, 640)],
      }),
    ).toBe(100);
    expect(
      choose({
        plan: { base: 0, span: { min: -200, max: 200 } },
        point: null,
        avoidFirst: [rect(490, 520)],
      }),
    ).toBe(0);
  });
});

describe("revealLanding", () => {
  const plan = { base: 0, span: { min: -200, max: 200 } };
  const point = { x: 100, y: 500 };

  function place<T extends HTMLElement>(
    element: T,
    top: number,
    bottom: number,
    parent: HTMLElement = document.body,
  ): T {
    element.getBoundingClientRect = () =>
      ({
        top,
        bottom,
        left: 0,
        right: 300,
        width: 300,
        height: bottom - top,
      }) as DOMRect;
    parent.appendChild(element);
    return element;
  }

  beforeEach(() => {
    vi.stubGlobal("scrollY", 1000);
    Object.defineProperty(document.documentElement, "scrollHeight", {
      configurable: true,
      value: 3000,
    });
  });

  afterEach(() => {
    document.body.replaceChildren();
    delete (document.documentElement as { scrollHeight?: number }).scrollHeight;
  });

  test("避けないものに入った押せるものは、真下にあっても避けない", () => {
    const start = place(document.createElement("button"), 490, 520);
    revealLanding(plan, point, { exclude: start });
    expect(window.scrollBy).not.toHaveBeenCalled();
  });

  test("切り替わった画面の押せるものを集め、真下から外れる所へ送る", () => {
    const stage = place(document.createElement("div"), 300, 600);
    place(document.createElement("button"), 490, 520, stage);
    const link = document.createElement("a");
    link.href = "/faq";
    place(link, 2000, 2040);
    revealLanding(plan, point, { avoidNext: stage });
    expect(window.scrollBy).toHaveBeenCalledWith({
      top: -11,
      behavior: "instant",
    });
  });

  test("大きさの無いものは押せないので避けない", () => {
    const hidden = document.createElement("input");
    hidden.type = "hidden";
    place(hidden, 500, 500);
    revealLanding(plan, point);
    expect(window.scrollBy).not.toHaveBeenCalled();
  });

  test("ページの頭より上へは送らない", () => {
    vi.stubGlobal("scrollY", 0);
    place(document.createElement("button"), 490, 520);
    revealLanding(plan, point);
    expect(window.scrollBy).toHaveBeenCalledWith({
      top: 21,
      behavior: "instant",
    });
  });
});

describe("revealFocusedFrame", () => {
  let frames: (() => void)[];
  let stopTracking: () => void;

  // 着く前の画面の位置で Tab を押し、ブラウザがフォーカスの送りを済ませてから知らせが来る。
  function pressTabThenBrowserScrolls(from: number, to: number): number {
    vi.stubGlobal("scrollY", from);
    const tab = new KeyboardEvent("keydown", { key: "Tab" });
    window.dispatchEvent(tab);
    vi.stubGlobal("scrollY", to);
    return tab.timeStamp + 5;
  }

  function paint(): void {
    for (const frame of frames.splice(0)) frame();
  }

  beforeEach(() => {
    frames = [];
    vi.stubGlobal("requestAnimationFrame", (callback: () => void) => {
      frames.push(callback);
      return frames.length;
    });
    vi.stubGlobal("getComputedStyle", () => ({
      outlineOffset: "3px",
      outlineWidth: "3px",
    }));
    vi.stubGlobal("scrollX", 0);
    vi.stubGlobal("scrollTo", vi.fn());
    stopTracking = trackScrollBeforeTab();
  });

  afterEach(() => {
    stopTracking();
  });

  test("前から着き、着く前にリングの上の辺が画面にあれば、着く前の位置に戻して動かさない", () => {
    // 着く前はボックスの上端が 300px（リングは 294px）。ブラウザが 296px 送って上端が 4px に来た。
    const focusTime = pressTabThenBrowserScrolls(500, 796);
    revealFocusedFrame(box(4, 3000), false, focusTime);
    paint();
    expect(window.scrollTo).toHaveBeenCalledWith({
      left: 0,
      top: 500,
      behavior: "instant",
    });
    expect(window.scrollBy).not.toHaveBeenCalled();
  });

  test("前から着き、リングの上の辺が着く前も画面の外なら、上端から 8px 下に来るまで送る", () => {
    const focusTime = pressTabThenBrowserScrolls(500, 500);
    revealFocusedFrame(box(-7000, 3000), false, focusTime);
    paint();
    expect(window.scrollBy).toHaveBeenCalledWith({
      top: -7014,
      behavior: "instant",
    });
  });

  test("後ろから戻り、着く前にリングの下の辺が画面にあれば、動かさない", () => {
    const focusTime = pressTabThenBrowserScrolls(900, 900);
    revealFocusedFrame(box(-3000, 400), true, focusTime);
    paint();
    expect(window.scrollTo).not.toHaveBeenCalled();
    expect(window.scrollBy).not.toHaveBeenCalled();
  });

  test("後ろから戻り、リングの下の辺が画面の外なら、下端から 8px 上に来るまで送る", () => {
    // ブラウザが区画を真ん中に寄せたあと、リングの下の辺は 3006px にある。
    const focusTime = pressTabThenBrowserScrolls(9000, 5000);
    revealFocusedFrame(box(-3000, 3000), true, focusTime);
    paint();
    expect(window.scrollBy).toHaveBeenCalledWith({
      top: 2414,
      behavior: "instant",
    });
  });

  test("Tab を押してから 1,000ms を超えて着いたときは、その Tab の位置を使わず、いまの位置を着く前の位置とする", () => {
    const tabTime = pressTabThenBrowserScrolls(200, 500) - 5;
    // リングの上の辺はいま 100px。古い Tab の位置（200）から数えると 400px で、どちらでも見えているが、
    // 戻す先はいまの位置なので送らない。
    revealFocusedFrame(box(100, 3000), false, tabTime + 1001);
    paint();
    expect(window.scrollTo).not.toHaveBeenCalled();
    expect(window.scrollBy).not.toHaveBeenCalled();
  });

  test("1,000ms 以内の Tab の位置には戻す", () => {
    const tabTime = pressTabThenBrowserScrolls(200, 500) - 5;
    revealFocusedFrame(box(100, 3000), false, tabTime + 999);
    paint();
    expect(window.scrollTo).toHaveBeenCalledWith({
      left: 0,
      top: 200,
      behavior: "instant",
    });
  });

  test("Tab を押さずに着いたときは、いまの位置を着く前の位置とする", () => {
    vi.stubGlobal("scrollY", 500);
    revealFocusedFrame(box(100, 3000), false, 1e9);
    paint();
    expect(window.scrollTo).not.toHaveBeenCalled();
    expect(window.scrollBy).not.toHaveBeenCalled();
  });
});
