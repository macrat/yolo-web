import { describe, test, expect } from "vitest";
import {
  createFrameLayout,
  FRAME_LAYOUT_DEFINE,
  LAYOUT_PREVIOUS_TABLE,
  markScrollFrame,
  TABLE_LAYOUT_DEFINE,
  SCROLL_FRAME_LABELS,
} from "@/lib/scroll-frame";

const { planColumns } = createFrameLayout();

describe("planColumns（列の幅の決め方）", () => {
  test("下限の合計が収まれば、どの列も下限のまま細くしない", () => {
    expect(planColumns([100, 50, 30], 200, 68)).toEqual({
      scrolls: false,
      widths: [100, 50, 30],
      narrowed: [false, false, false],
    });
  });

  test("収まらなければ、長い列から同じ幅まで細くして収める", () => {
    const plan = planColumns([200, 150, 30], 250, 68);
    expect(plan.scrolls).toBe(false);
    expect(plan.widths).toEqual([110, 110, 30]);
    expect(plan.narrowed).toEqual([true, true, false]);
    expect(plan.widths.reduce((a, b) => a + b)).toBe(250);
  });

  test("4字まで細くしても収まらなければ、下限のまま横に送る", () => {
    expect(planColumns([200, 150, 100], 190, 68)).toEqual({
      scrolls: true,
      widths: [200, 150, 100],
      narrowed: [false, false, false],
    });
  });

  test("幅がちょうど境のとき", () => {
    // 下限の合計がちょうど置く幅に等しければ、そのまま収まる。
    expect(planColumns([120, 80], 200, 68).narrowed).toEqual([false, false]);
    // 4字の幅まで細くしてちょうど収まれば、4字の幅で細くする（横に送らない）。
    const plan = planColumns([200, 150, 64], 200, 68);
    expect(plan.scrolls).toBe(false);
    expect(plan.widths).toEqual([68, 68, 64]);
    expect(plan.narrowed).toEqual([true, true, false]);
  });
});

function frameWith(frameWidth: number, childWidth: number): HTMLElement {
  const frame = document.createElement("div");
  const child = document.createElement("div");
  frame.appendChild(child);
  frame.getBoundingClientRect = () => ({ width: frameWidth }) as DOMRect;
  child.getBoundingClientRect = () => ({ width: childWidth }) as DOMRect;
  return frame;
}

describe("markScrollFrame（いつも枠を持つもの）", () => {
  test("中身が枠の内側からはみ出すものに、止まりどころ・名前・印を付ける", () => {
    const frame = frameWith(300, 300.5);
    markScrollFrame(frame, SCROLL_FRAME_LABELS.code);
    expect(frame.tabIndex).toBe(0);
    expect(frame.getAttribute("role")).toBe("region");
    expect(frame.getAttribute("aria-label")).toBe(
      "コード（横にスクロールできます）",
    );
    expect(frame.hasAttribute("data-scrolls")).toBe(true);
  });

  test("はみ出さないものからは外す", () => {
    const frame = frameWith(300, 300);
    frame.setAttribute("tabindex", "0");
    frame.setAttribute("role", "region");
    frame.setAttribute("aria-label", SCROLL_FRAME_LABELS.table);
    frame.setAttribute("data-scrolls", "");
    markScrollFrame(frame, SCROLL_FRAME_LABELS.table);
    for (const name of ["tabindex", "role", "aria-label", "data-scrolls"]) {
      expect(frame.hasAttribute(name)).toBe(false);
    }
  });
});

describe("layoutTable（組み直しを飛ばす）", () => {
  const { layoutTable } = createFrameLayout();

  function tableFrame(width: { value: number }): HTMLElement {
    const frame = document.createElement("div");
    frame.className = "table-scroll";
    frame.innerHTML = "<table><tbody><tr><td>x</td></tr></tbody></table>";
    frame.getBoundingClientRect = () => ({ width: width.value }) as DOMRect;
    frame.querySelector("table")!.getBoundingClientRect = () =>
      ({ width: 500 }) as DOMRect;
    document.body.appendChild(frame);
    return frame;
  }

  test("組んだときと幅も字の大きさも同じなら、組み直さない。幅が変わったら組み直す", () => {
    const width = { value: 300 };
    const frame = tableFrame(width);
    layoutTable(frame);
    expect(frame.hasAttribute("data-scrolls")).toBe(true);
    // 組んだあとに印を外しても、同じ幅なら組み直さない。
    frame.removeAttribute("data-scrolls");
    layoutTable(frame);
    expect(frame.hasAttribute("data-scrolls")).toBe(false);
    width.value = 320;
    layoutTable(frame);
    expect(frame.hasAttribute("data-scrolls")).toBe(true);
    frame.remove();
  });

  test("中身を描き替えたと渡したら、幅も字の大きさも同じでも組み直す", () => {
    const frame = tableFrame({ value: 300 });
    layoutTable(frame);
    frame.removeAttribute("data-scrolls");
    layoutTable(frame, true);
    expect(frame.hasAttribute("data-scrolls")).toBe(true);
    frame.remove();
  });

  test("置かれた幅を持たない枠（隠れた区画の中）は組まず、組んだ印も残さない", () => {
    const frame = tableFrame({ value: 0 });
    layoutTable(frame);
    expect(frame.hasAttribute("data-scrolls")).toBe(false);
    expect(frame.hasAttribute("data-layout-key")).toBe(false);
    frame.remove();
  });
});

describe("TABLE_LAYOUT_DEFINE", () => {
  test("組み方を文字列にしたスクリプトが、外の名前を使わずに動き、表を組む関数を定める", () => {
    const win = window as unknown as { yolosLayoutTable?: unknown };
    delete win.yolosLayoutTable;
    const body = TABLE_LAYOUT_DEFINE.replace(/^<script>|<\/script>$/g, "");
    expect(body).not.toContain("</script");
    new Function(body)();
    expect(typeof win.yolosLayoutTable).toBe("function");
  });
});

describe("FRAME_LAYOUT_DEFINE・LAYOUT_PREVIOUS_TABLE", () => {
  test("枠の前の文が組み方を外の名前を使わずに定め、枠の直後の文が直前の枠の表を組む。組み方はページで1つだけ作る", () => {
    const win = window as unknown as { yolosFrameLayout?: unknown };
    delete win.yolosFrameLayout;
    expect(FRAME_LAYOUT_DEFINE).not.toContain("</script");
    expect(LAYOUT_PREVIOUS_TABLE).not.toContain("</script");
    const run = () => {
      const frame = document.createElement("div");
      frame.innerHTML = "<table><tbody><tr><td>x</td></tr></tbody></table>";
      frame.getBoundingClientRect = () => ({ width: 300 }) as DOMRect;
      frame.querySelector("table")!.getBoundingClientRect = () =>
        ({ width: 500 }) as DOMRect;
      const script = document.createElement("script");
      document.body.append(frame, script);
      Object.defineProperty(document, "currentScript", {
        value: script,
        configurable: true,
      });
      try {
        new Function(FRAME_LAYOUT_DEFINE)();
        new Function(LAYOUT_PREVIOUS_TABLE)();
      } finally {
        delete (document as { currentScript?: unknown }).currentScript;
        frame.remove();
        script.remove();
      }
      return frame;
    };
    expect(run().hasAttribute("data-scrolls")).toBe(true);
    const layout = win.yolosFrameLayout;
    expect(layout).toBeDefined();
    expect(run().hasAttribute("data-scrolls")).toBe(true);
    expect(win.yolosFrameLayout).toBe(layout);
  });

  test("組み方が無いか組む途中で失敗したら、組めなかった印を付けて表を見せ、失敗は投げる", () => {
    const win = window as unknown as { yolosFrameLayout?: unknown };
    delete win.yolosFrameLayout;
    const frame = document.createElement("div");
    const script = document.createElement("script");
    document.body.append(frame, script);
    Object.defineProperty(document, "currentScript", {
      value: script,
      configurable: true,
    });
    try {
      expect(() => new Function(LAYOUT_PREVIOUS_TABLE)()).toThrow(TypeError);
      expect(frame.hasAttribute("data-layout-failed")).toBe(true);
      expect(frame.hasAttribute("data-layout-key")).toBe(false);
    } finally {
      delete (document as { currentScript?: unknown }).currentScript;
      frame.remove();
      script.remove();
    }
  });
});
