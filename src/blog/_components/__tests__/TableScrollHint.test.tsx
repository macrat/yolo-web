import { describe, test, expect, beforeEach, afterEach, vi } from "vitest";
import { render } from "@testing-library/react";
import TableScrollHint from "../TableScrollHint";

/**
 * jsdom はレイアウトを行わないので scrollWidth / clientWidth は常に 0 になる。
 * 「溢れている / いない」を判定する分岐そのものを試すために、要素ごとに
 * この2つを差し替えられるようにしておく。
 */
function buildTable(scrollWidth: number, clientWidth: number): HTMLElement {
  const wrap = document.createElement("div");
  wrap.className = "table-wrap";
  const hint = document.createElement("p");
  hint.className = "table-scroll-hint";
  const scroller = document.createElement("div");
  scroller.className = "table-scroll";
  scroller.innerHTML =
    "<table><thead><tr><th>記号</th><th>地</th><th>色</th><th>想定する面</th></tr></thead>" +
    "<tbody><tr><td>G1</td><td>ライトのタブ地</td><td>#DEE1E6</td><td>タブ</td></tr></tbody></table>";
  wrap.append(hint, scroller);
  setWidths(wrap, scrollWidth, clientWidth);
  document.body.append(wrap);
  return wrap;
}

/** 溢れ幅を差し替える。幅の変化（画面回転・ウィンドウ操作）を模す。 */
function setWidths(
  wrap: HTMLElement,
  scrollWidth: number,
  clientWidth: number,
): void {
  const scroller = wrap.querySelector<HTMLElement>(".table-scroll")!;
  Object.defineProperty(scroller, "scrollWidth", {
    value: scrollWidth,
    configurable: true,
  });
  Object.defineProperty(scroller, "clientWidth", {
    value: clientWidth,
    configurable: true,
  });
}

describe("TableScrollHint", () => {
  let observed: Element[];
  let disconnected: number;
  /** 直近に生成された ResizeObserver のコールバック。幅の変化を発火させる。 */
  let notifyResize: (() => void) | null;

  beforeEach(() => {
    observed = [];
    disconnected = 0;
    notifyResize = null;
    vi.stubGlobal(
      "ResizeObserver",
      class {
        constructor(callback: () => void) {
          notifyResize = callback;
        }
        observe(target: Element) {
          observed.push(target);
        }
        unobserve() {}
        disconnect() {
          disconnected += 1;
        }
      },
    );
  });

  afterEach(() => {
    document.body.innerHTML = "";
    vi.unstubAllGlobals();
  });

  test("marks an overflowing table as scrollable and focusable", () => {
    const wrap = buildTable(500, 312);
    render(<TableScrollHint />);
    const scroller = wrap.querySelector(".table-scroll");
    expect(wrap.dataset.scrollable).toBe("true");
    expect(scroller?.getAttribute("tabindex")).toBe("0");
    expect(scroller?.getAttribute("role")).toBe("region");
    // フォーカスできる領域に名前が無いと、読み上げでただの「領域」になる
    expect(scroller?.getAttribute("aria-label")).toBe("表: 記号, 地, 色");
  });

  /*
   * 早見表のように同じ見出しの表を並べる記事があり、見出し行だけを名前にすると
   * 同一ページ内で名前が重複する（実測: 360px で67領域中14領域が重複、最悪6個同名）。
   * 直前の見出しを前置きして、どのくだりの表かで区別できるようにする。
   */
  test("prefixes the accessible name with the preceding section heading", () => {
    const heading = document.createElement("h2");
    heading.textContent = "判定用の地を4種そろえる";
    document.body.append(heading);
    /*
     * 実記事では見出しと表のあいだに本文の段落が入る。ここを挟まずに書くと、
     * 兄弟を1つだけ見る実装でもテストが通ってしまい、遡る処理を守れない。
     */
    const lead = document.createElement("p");
    lead.textContent = "ファビコンは地の色を選べない。";
    document.body.append(lead);
    const wrap = buildTable(500, 312);
    render(<TableScrollHint />);
    expect(
      wrap.querySelector(".table-scroll")?.getAttribute("aria-label"),
    ).toBe("判定用の地を4種そろえるの表: 記号, 地, 色");
  });

  /*
   * 見出しも見出し行も同じ表が並ぶと名前が重複しうる。重複すると読み上げで
   * 区別が付かず、名前を付けた意味が消えるので連番を添える。いまの記事群では
   * 重複0件だが、それは中身が偶然そうなだけなので、実装側で潰しておく。
   */
  test("disambiguates duplicate accessible names", () => {
    const first = buildTable(500, 312);
    const second = buildTable(500, 312);
    render(<TableScrollHint />);
    expect(
      first.querySelector(".table-scroll")?.getAttribute("aria-label"),
    ).toBe("表: 記号, 地, 色");
    expect(
      second.querySelector(".table-scroll")?.getAttribute("aria-label"),
    ).toBe("表: 記号, 地, 色（2つ目）");
  });

  /*
   * 名前を作れない表には role も tabindex も付けない。名前のないフォーカス停止を
   * 作るくらいなら、キーボードでのスクロールを諦めたほうが害が小さい。
   */
  test("leaves a table with no header cells unmarked", () => {
    const wrap = buildTable(500, 312);
    wrap.querySelector(".table-scroll")!.innerHTML = "<table></table>";
    render(<TableScrollHint />);
    const scroller = wrap.querySelector(".table-scroll");
    expect(wrap.dataset.scrollable).toBeUndefined();
    expect(scroller?.getAttribute("tabindex")).toBe("-1");
    expect(scroller?.hasAttribute("role")).toBe(false);
  });

  /*
   * 幅が戻ったときに印が外れることを、ResizeObserver のコールバックを実際に
   * 呼んで確かめる。ここを見ていないと、印を外す分岐を丸ごと消しても緑のまま
   * 通ってしまい、画面を広げたあとも案内と無効なタブ停止が残る。
   */
  test("removes the marks when the table stops overflowing", () => {
    const wrap = buildTable(500, 312);
    render(<TableScrollHint />);
    expect(wrap.dataset.scrollable).toBe("true");

    setWidths(wrap, 660, 660);
    notifyResize?.();

    const scroller = wrap.querySelector(".table-scroll");
    expect(wrap.dataset.scrollable).toBeUndefined();
    expect(scroller?.getAttribute("tabindex")).toBe("-1");
    expect(scroller?.hasAttribute("role")).toBe(false);
    expect(scroller?.hasAttribute("aria-label")).toBe(false);
  });

  test("adds the marks when a table starts overflowing", () => {
    const wrap = buildTable(660, 660);
    render(<TableScrollHint />);
    expect(wrap.dataset.scrollable).toBeUndefined();

    setWidths(wrap, 500, 312);
    notifyResize?.();

    expect(wrap.dataset.scrollable).toBe("true");
    expect(wrap.querySelector(".table-scroll")?.getAttribute("tabindex")).toBe(
      "0",
    );
  });

  /*
   * 溢れていない表に印を付けると、案内が嘘になり、矢印キーで何も起きない
   * タブ停止が増える。1280px では既存203個の表のうち溢れるのは2個だけなので、
   * こちらが多数派になる。
   */
  test("leaves a table that fits untouched", () => {
    const wrap = buildTable(312, 312);
    render(<TableScrollHint />);
    expect(wrap.dataset.scrollable).toBeUndefined();
    /*
     * Chromium は 1px でも動くスクロール面を自前でタブ順に入れるので、
     * 属性を消すのではなく -1 を置いて切る。ここを removeAttribute に戻すと、
     * 役割も名前も無いフォーカス停止が実機で復活する。
     */
    expect(wrap.querySelector(".table-scroll")?.getAttribute("tabindex")).toBe(
      "-1",
    );
  });

  /*
   * セルの右パディング（8px）と表の右罫（1px）までしか切れていないなら、
   * 文字は隠れていないので案内を出さない。実記事では分割できないコード片が
   * 列を押し広げて3pxだけ溢れる表が4個あり、そこで案内が嘘になっていた。
   */
  test.each([1, 3, 9])("treats a %ipx overflow as fitting", (over) => {
    const wrap = buildTable(312 + over, 312);
    render(<TableScrollHint />);
    expect(wrap.dataset.scrollable).toBeUndefined();
    expect(wrap.querySelector(".table-scroll")?.getAttribute("tabindex")).toBe(
      "-1",
    );
  });

  /* 10px 切れると最後のセルの文字に届くので、そこからは案内を出す。 */
  test("treats a ten pixel overflow as scrollable", () => {
    const wrap = buildTable(322, 312);
    render(<TableScrollHint />);
    expect(wrap.dataset.scrollable).toBe("true");
  });

  /*
   * 観測対象はスクロール面と表の両方。面の幅（clientWidth）と表の幅（scrollWidth）は
   * 別々に変わるので、外側の .table-wrap だけを見ていると溢れの変化を取り逃がす。
   * ここを wrap に戻すと、この期待値が落ちる。
   */
  test("observes the scroller and the table, and disconnects on unmount", () => {
    const a = buildTable(500, 312);
    const b = buildTable(312, 312);
    const { unmount } = render(<TableScrollHint />);
    expect(observed).toHaveLength(4);
    for (const wrap of [a, b]) {
      expect(observed).toContain(wrap.querySelector(".table-scroll"));
      expect(observed).toContain(wrap.querySelector("table"));
    }
    expect(observed).not.toContain(a);
    unmount();
    expect(disconnected).toBe(1);
  });

  test("does nothing when the article has no tables", () => {
    const { unmount } = render(<TableScrollHint />);
    expect(observed).toHaveLength(0);
    unmount();
    // 表が無ければ ResizeObserver も作らないので disconnect も呼ばれない
    expect(disconnected).toBe(0);
  });
});
