import { act } from "react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { hydrateRoot, type Root } from "react-dom/client";
import { renderToString } from "react-dom/server";
import DataTable, { type DataTableRow } from "@/components/DataTable";
import { layoutTable } from "@/lib/scroll-frame";

/*
 * jsdom は字を組まないので、組みを次の決まりで返す。字の大きさは 10px で、4字の下限は 40px。
 * - 表の幅を0にした組み（列を最小の幅にした組み）のセルの幅は、その列のセルのいちばん長い文節の字数 × 10px。
 * - コピーのボタンは 60px。値の横に置くあいだは値もボタンも折らないので、値のセルは値を1行にした幅
 *   （字数 × 10px）・あき（16px）・ボタンの幅を取る。値の次の行に送ると、値のセルはいちばん長い文節と
 *   ボタンの広いほうの幅を取る。
 * - 枠（と、結果のボックスの中の表では、その親）の幅は、試験ごとに決める。
 */
const CHAR = 10;
const BUTTON = 60;
const GAP = 16;

const placed = { frame: 0, box: 0 };

function phraseLengths(element: Element): number[] {
  return element.innerHTML
    .split("<wbr>")
    .map((phrase) => phrase.replace(/<[^>]*>/g, "").replace(/\u2060/g, ""))
    .map((phrase) => phrase.length);
}

function minWidth(cell: HTMLTableCellElement): number {
  const line = cell.querySelector("div");
  if (!line) return Math.max(...phraseLengths(cell)) * CHAR;
  const phrases = phraseLengths(line.firstElementChild!);
  const below = cell
    .closest("[data-copy-column]")!
    .hasAttribute("data-copy-below");
  if (below) return Math.max(Math.max(...phrases) * CHAR, BUTTON);
  const oneLine = phrases.reduce((sum, length) => sum + length, 0) * CHAR;
  return oneLine + GAP + BUTTON;
}

/** 列の幅。表の列はどの行でも同じ幅なので、その列のどのセルの最小の幅も入る幅を取る。 */
function columnWidth(cell: HTMLTableCellElement): number {
  const table = cell.closest("table")!;
  return Math.max(
    ...[...table.rows]
      .map((row) => row.cells[cell.cellIndex])
      .filter((other) => other && other.colSpan === 1)
      .map(minWidth),
  );
}

function fakeRect(this: HTMLElement): DOMRect {
  let width = 0;
  if (this.classList.contains("table-phrased")) {
    width = placed.frame;
  } else if (this.dataset.box !== undefined) {
    width = placed.box;
  } else if (this instanceof HTMLTableCellElement) {
    width = columnWidth(this);
  } else if (this instanceof HTMLTableElement) {
    width = [...this.rows[0].cells].reduce(
      (sum, cell) => sum + columnWidth(cell),
      0,
    );
  }
  return { width } as DOMRect;
}

const realComputedStyle = window.getComputedStyle.bind(window);
const LAYOUT_STYLE: Record<string, string> = {
  fontSize: `${CHAR}px`,
  paddingLeft: "0px",
  paddingRight: "0px",
  borderLeftWidth: "0px",
  borderRightWidth: "0px",
};

beforeEach(() => {
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(
    fakeRect,
  );
  vi.spyOn(window, "getComputedStyle").mockImplementation((element) => {
    const style = realComputedStyle(element);
    return new Proxy(style, {
      get(target, property: string) {
        if (property in LAYOUT_STYLE) return LAYOUT_STYLE[property];
        const value = Reflect.get(target, property, target);
        return typeof value === "function" ? value.bind(target) : value;
      },
    });
  });
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

/** 見出しの列（いちばん長い文節は8字）と値の列（6字）の表。 */
const METRICS: DataTableRow[] = [
  {
    key: "stock",
    header: ["失敗エピソードの", "在庫数"],
    cells: [["常時5本以上"]],
  },
  { key: "speed", header: ["ネタ化", "までの", "速度"], cells: [["約3秒"]] },
];

/** 見出しの列（3字）と、コピーのボタンを持つ値の列（いちばん長い文節は8字、1行にすると16字）の表。 */
const CODES: DataTableRow[] = [
  {
    key: "hex",
    header: ["HEX"],
    cells: [["#EE827C"]],
    copy: { text: "#EE827C", target: "HEX" },
  },
  {
    key: "rgb",
    header: ["RGB"],
    cells: [["rgb(238,", "130,", "124)"]],
    copy: { text: "rgb(238, 130, 124)", target: "RGB" },
  },
];

function frameOf(container: HTMLElement): HTMLElement {
  return container.querySelector<HTMLElement>(".table-phrased")!;
}

function narrowedColumns(table: HTMLTableElement): boolean[][] {
  return [...table.rows].map((row) =>
    [...row.cells].map((cell) => cell.hasAttribute("data-narrowed")),
  );
}

describe("DataTable の組み", () => {
  test("セルは渡された区切りの並びの切れ目にだけ折り所を置き、行と列の見出しを持つ", () => {
    placed.frame = 1000;
    render(
      <DataTable label="指標" columns={[["指標"], ["値"]]} rows={METRICS} />,
    );
    const table = screen.getByRole("table", { name: "指標" });
    expect(
      screen.getAllByRole("columnheader").map((cell) => cell.textContent),
    ).toEqual(["指標", "値"]);
    const header = screen.getByRole("rowheader", {
      name: "失敗エピソードの在庫数",
    });
    expect(header.innerHTML).toBe("失敗エピソードの<wbr>在庫数");
    expect(table.querySelector("td")!.innerHTML).toBe("常時5本以上");
  });

  test("列がいちばん長い文節の幅で収まれば、細くせず、送らない", () => {
    placed.frame = 140;
    const { container } = render(<DataTable label="指標" rows={METRICS} />);
    const frame = frameOf(container);
    const table = frame.querySelector("table")!;
    expect(frame.hasAttribute("data-scrolls")).toBe(false);
    expect(table.style.width).toBe("");
    expect(narrowedColumns(table).flat()).not.toContain(true);
  });

  test("収まらなければ、長い列から細くし、細くした列のセルだけに印を付ける", () => {
    // 見出しの列 80px・値の列 60px を 130px に収める: 長い列だけを 70px に細くする。
    placed.frame = 130;
    const { container } = render(<DataTable label="指標" rows={METRICS} />);
    const table = frameOf(container).querySelector("table")!;
    expect(table.style.tableLayout).toBe("fixed");
    expect(table.style.width).toBe("130px");
    expect([...table.rows[0].cells].map((cell) => cell.style.width)).toEqual([
      "70px",
      "60px",
    ]);
    expect(narrowedColumns(table)).toEqual([
      [true, false],
      [true, false],
    ]);
  });

  test("細くするのは4字の幅まで。4字まで細くしても収まらなければ、どの列も文節の幅のまま枠の中で横に送る", () => {
    placed.frame = 80;
    const { container, unmount } = render(
      <DataTable label="指標" rows={METRICS} />,
    );
    const narrowed = frameOf(container).querySelector("table")!;
    expect([...narrowed.rows[0].cells].map((cell) => cell.style.width)).toEqual(
      ["40px", "40px"],
    );
    unmount();

    placed.frame = 79;
    const { container: scrolled } = render(
      <DataTable label="指標" rows={METRICS} />,
    );
    const frame = frameOf(scrolled);
    const table = frame.querySelector("table")!;
    expect(frame.hasAttribute("data-scrolls")).toBe(true);
    expect(frame.tabIndex).toBe(0);
    expect(frame.getAttribute("role")).toBe("region");
    expect(frame.getAttribute("aria-label")).toBe(
      "表（横にスクロールできます）",
    );
    expect(table.style.width).toBe("");
    expect(narrowedColumns(table).flat()).not.toContain(true);
  });

  test("使う側が描き直しても、中身が同じなら組み直さない", () => {
    placed.frame = 130;
    const { rerender } = render(
      <DataTable label="指標" rows={METRICS.map((row) => ({ ...row }))} />,
    );
    const layout = vi.spyOn(HTMLTableElement.prototype, "rows", "get");
    rerender(
      <DataTable label="指標" rows={METRICS.map((row) => ({ ...row }))} />,
    );
    expect(layout).not.toHaveBeenCalled();
  });

  test("開いた行の中身は、表の幅いっぱいの1つのセルに置き、細くした列の印を付けない", () => {
    placed.frame = 130;
    render(
      <DataTable
        label="指標"
        rows={METRICS.map((row, index) => ({
          ...row,
          detail: index === 0 ? <p>例文</p> : undefined,
        }))}
      />,
    );
    const detail = screen.getByText("例文").closest("td")!;
    expect(detail.colSpan).toBe(2);
    expect(detail.hasAttribute("data-narrowed")).toBe(false);
  });

  test("横に送る表の開いた行の中身は、枠の見える幅を超えない", () => {
    // 4字まで細くしても 80px の表は 79px に収まらず、枠の中で横に送る。
    placed.frame = 79;
    render(
      <DataTable
        label="指標"
        rows={METRICS.map((row, index) => ({
          ...row,
          detail: index === 0 ? <p>例文</p> : undefined,
        }))}
      />,
    );
    const frame = document.querySelector<HTMLElement>(".table-phrased")!;
    expect(frame.hasAttribute("data-scrolls")).toBe(true);
    expect(frame.style.getPropertyValue("--frame-visible-width")).toBe("79px");
    const content = screen.getByText("例文").parentElement!;
    expect(content.parentElement!.hasAttribute("data-detail")).toBe(true);
  });

  test("開いた行を持たない表には、見える幅を持たせない", () => {
    placed.frame = 79;
    render(<DataTable label="指標" rows={METRICS} />);
    const frame = document.querySelector<HTMLElement>(".table-phrased")!;
    expect(frame.style.getPropertyValue("--frame-visible-width")).toBe("");
  });

  test("開いてから閉じた表は、見える幅を持たない", () => {
    placed.frame = 79;
    const withDetail = (open: boolean) =>
      METRICS.map((row, index) => ({
        ...row,
        detail: open && index === 0 ? <p>例文</p> : undefined,
      }));
    const { rerender } = render(
      <DataTable label="指標" rows={withDetail(true)} />,
    );
    const frame = document.querySelector<HTMLElement>(".table-phrased")!;
    expect(frame.style.getPropertyValue("--frame-visible-width")).toBe("79px");
    rerender(<DataTable label="指標" rows={withDetail(false)} />);
    expect(frame.style.getPropertyValue("--frame-visible-width")).toBe("");
  });

  test("中身を描き替えたら、置かれた幅が同じでも組み直す", () => {
    placed.frame = 130;
    const short: DataTableRow[] = [
      { key: "a", header: ["速度"], cells: [["約3秒"]] },
    ];
    const { container, rerender } = render(
      <DataTable label="指標" rows={short} />,
    );
    const table = frameOf(container).querySelector("table")!;
    expect(table.style.width).toBe("");
    rerender(<DataTable label="指標" rows={METRICS} />);
    expect(table.style.width).toBe("130px");
  });
});

describe("DataTable のコピーのボタン", () => {
  test("値のセルの中で、値の後ろにボタンを置く。ボタンは何を写すかを名前で言う", () => {
    placed.frame = 1000;
    render(<DataTable label="カラーコード" rows={CODES} />);
    const cells = screen.getAllByRole("cell");
    expect(cells).toHaveLength(2);
    for (const [index, name] of ["HEXをコピー", "RGBをコピー"].entries()) {
      const line = cells[index].firstElementChild!;
      expect(line.children).toHaveLength(2);
      expect(line.lastElementChild!.querySelector("button")).toBe(
        screen.getByRole("button", { name }),
      );
    }
  });

  test("どの列も細くせずにボタンを値の横に置けるなら、横に置く", () => {
    // 見出しの列 30px と、1行の値とボタンの 160 + 16 + 60 = 236px。
    placed.frame = 266;
    const { container } = render(
      <DataTable label="カラーコード" rows={CODES} />,
    );
    const frame = frameOf(container);
    expect(frame.hasAttribute("data-copy-below")).toBe(false);
    expect(frame.querySelector("table")!.style.width).toBe("");
  });

  test("横に置くと収まらなければ、どの行もボタンを値の次の行に送り、値に行の幅を渡した組みで決める", () => {
    // 横に置くと 266px で収まらない。送れば見出しの列 30px と値の列 80px で、細くせずに収まる。
    placed.frame = 265;
    const { container } = render(
      <DataTable label="カラーコード" rows={CODES} />,
    );
    const frame = frameOf(container);
    const table = frame.querySelector("table")!;
    // 送るかは枠の1つの印で決まり、どの行のボタンも同じ位置（値の次の行の右端）に送られる。
    expect(frame.hasAttribute("data-copy-below")).toBe(true);
    for (const row of table.rows) {
      expect(row.hasAttribute("data-copy-below")).toBe(false);
    }
    expect(table.style.width).toBe("");
    expect(frame.hasAttribute("data-scrolls")).toBe(false);
  });

  test("値が文節の幅でボタンの横に入っても、1行のまま並ばなければ、どの行もボタンを送る", () => {
    // 文節の幅なら 30 + 80 + 16 + 60 = 186px で横に並ぶが、値が折れる。値を1行にすると 266px が要る。
    placed.frame = 200;
    const { container } = render(
      <DataTable label="カラーコード" rows={CODES} />,
    );
    const frame = frameOf(container);
    expect(frame.hasAttribute("data-copy-below")).toBe(true);
    expect(frame.querySelector("table")!.style.width).toBe("");
  });

  test("送っても収まらなければ、送ったまま細くするか横に送る", () => {
    // 送ったあとの列は 30px と 80px。長い列を細くして 80px に収める。
    placed.frame = 80;
    const { container } = render(
      <DataTable label="カラーコード" rows={CODES} />,
    );
    const frame = frameOf(container);
    const table = frame.querySelector("table")!;
    expect(frame.hasAttribute("data-copy-below")).toBe(true);
    expect([...table.rows[0].cells].map((cell) => cell.style.width)).toEqual([
      "30px",
      "50px",
    ]);
  });

  test("ボタンを持たない表は、送る組みを試さない", () => {
    placed.frame = 130;
    const { container } = render(<DataTable label="指標" rows={METRICS} />);
    expect(frameOf(container).hasAttribute("data-copy-column")).toBe(false);
    expect(frameOf(container).hasAttribute("data-copy-below")).toBe(false);
  });
});

describe("DataTable を結果のボックスの中に置く", () => {
  function inBox(boxWidth: number) {
    placed.frame = 1000;
    placed.box = boxWidth;
    const box = document.createElement("div");
    box.dataset.box = "";
    document.body.appendChild(box);
    const view = render(<DataTable label="指標" rows={METRICS} inBox />, {
      container: box,
    });
    return { frame: frameOf(view.container), unmount: view.unmount, box };
  }

  test("置かれた幅は、枠でなくボックスの中身の幅で測る", () => {
    const { frame, unmount, box } = inBox(130);
    expect(frame.querySelector("table")!.style.width).toBe("130px");
    unmount();
    box.remove();
  });

  test("開いた行の中身の見える幅は、ボックスの中身の幅", () => {
    placed.frame = 1000;
    placed.box = 79;
    const box = document.createElement("div");
    box.dataset.box = "";
    document.body.appendChild(box);
    const { unmount } = render(
      <DataTable
        label="指標"
        rows={METRICS.map((row, index) => ({
          ...row,
          detail: index === 0 ? <p>例文</p> : undefined,
        }))}
        inBox
      />,
      { container: box },
    );
    expect(frameOf(box).style.getPropertyValue("--frame-visible-width")).toBe(
      "79px",
    );
    unmount();
    box.remove();
  });

  test("収まらない表を横に送るのはボックスで、枠に送る印も止まりどころも付けない", () => {
    const { frame, unmount, box } = inBox(79);
    expect(frame.hasAttribute("data-scrolls")).toBe(false);
    expect(frame.hasAttribute("tabindex")).toBe(false);
    expect(frame.hasAttribute("role")).toBe(false);
    unmount();
    box.remove();
  });
});

describe("DataTable をサーバーで描く", () => {
  test("サーバーで描くときだけ、組み方を定めるスクリプトを枠の前に、表を組むスクリプトを枠の直後に置く", () => {
    const html = renderToString(<DataTable label="指標" rows={METRICS} />);
    expect(html).toMatch(
      /^<script>window\.yolosFrameLayout\|\|[\s\S]*?<\/script><div /,
    );
    expect(html).toMatch(
      /<\/table><\/div><script>\(function\(f\)\{try\{window\.yolosFrameLayout\.layoutTable\(f\)/,
    );
    const { container } = render(<DataTable label="指標" rows={METRICS} />);
    expect(container.querySelector("script")).toBeNull();
  });

  test("スクリプトが組んだ表（細くした列・ボタンの送り）を、エラーを出さずに引き継ぎ、組み直さない", async () => {
    placed.frame = 80;
    const element = <DataTable label="カラーコード" rows={CODES} />;
    const container = document.createElement("div");
    container.innerHTML = renderToString(element);
    document.body.appendChild(container);
    const frame = frameOf(container);
    // jsdom は innerHTML で入れたスクリプトを動かさないので、スクリプトと同じ関数で組む。
    layoutTable(frame);
    const table = frame.querySelector("table")!;
    expect(frame.hasAttribute("data-copy-below")).toBe(true);
    expect(table.style.width).toBe("80px");
    const layout = vi.spyOn(HTMLTableElement.prototype, "rows", "get");

    const actEnvironment = globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean };
    const previousActEnvironment = actEnvironment.IS_REACT_ACT_ENVIRONMENT;
    actEnvironment.IS_REACT_ACT_ENVIRONMENT = true;
    const errors = vi.spyOn(console, "error").mockImplementation(() => {});
    let root: Root | undefined;
    try {
      root = await act(async () => hydrateRoot(container, element));
      expect(errors).not.toHaveBeenCalled();
      expect(layout).not.toHaveBeenCalled();
      expect(frame.hasAttribute("data-copy-below")).toBe(true);
      expect(table.style.width).toBe("80px");
      expect(container.querySelector("script")).toBeNull();
    } finally {
      errors.mockRestore();
      if (root) act(() => root!.unmount());
      container.remove();
      actEnvironment.IS_REACT_ACT_ENVIRONMENT = previousActEnvironment;
    }
  });
});
