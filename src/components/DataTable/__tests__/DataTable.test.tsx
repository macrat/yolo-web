import { act } from "react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { hydrateRoot, type Root } from "react-dom/client";
import { renderToString } from "react-dom/server";
import DataTable, {
  DataTableGroup,
  type DataTableRow,
} from "@/components/DataTable";
import { layoutGroup, layoutTable } from "@/lib/scroll-frame";

/*
 * jsdom は字を組まないので、組みを次の決まりで返す。字の大きさは 10px で、4字の下限は 40px。セルは余白を持たない。
 * - セルの最小の幅（min-content）は、いちばん長い文節の字数 × 10px。1行に組んだ幅（max-content）は、文節の
 *   字数の和 × 10px。
 * - コピーのボタンは 60px。値の横に置くあいだは値もボタンも折らないので、値のセルは値を1行にした幅
 *   （字数 × 10px）・あき（16px）・ボタンの幅を取る。値の次の行に送ると、値のセルの最小の幅はいちばん長い
 *   文節とボタンの広いほうの幅、1行に組んだ幅は値を1行にした幅とボタンの広いほうの幅。
 * - 列の最小の幅と1行に組んだ幅は、その列のセル（表の幅いっぱいのセルを除く）のいちばん広いもの。ただし、
 *   見えている開いた行の中身は、max-content の組みで1行に組んだ幅を最初の列に足す（表の幅いっぱいのセルの長い
 *   文が列に混ざる）。隠した行（display: none）のセルは数えない。
 * - 表の幅を0にした組みは各列の最小の幅、max-content の組みは各列の1行に組んだ幅を取る。幅を指定した列は、
 *   その指定（と最小の幅の広いほう）を取る。table-layout: fixed の表は、最初の行のセルの指定の幅を取る。
 * - 自動の組み（表の幅は置かれた幅）では、幅を指定した列が先に幅を取り、残りを指定の無い列に配る。残りが
 *   1行に組んだ幅の和を超えれば、各列は1行に組んだ幅に、余りをその幅に比例して足して取る。超えなければ、
 *   最小の幅と1行に組んだ幅のあいだを同じ割合で取る。最小の幅の和に足りなければ、最小の幅を取る。
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

function sum(values: readonly number[]): number {
  return values.reduce((total, value) => total + value, 0);
}

function copyBelow(cell: HTMLTableCellElement): boolean {
  return cell.closest("[data-copy-column]")!.hasAttribute("data-copy-below");
}

function minWidth(cell: HTMLTableCellElement): number {
  const line = cell.querySelector("div");
  if (!line) return Math.max(...phraseLengths(cell)) * CHAR;
  const phrases = phraseLengths(line.firstElementChild!);
  if (copyBelow(cell)) return Math.max(Math.max(...phrases) * CHAR, BUTTON);
  return sum(phrases) * CHAR + GAP + BUTTON;
}

function maxWidth(cell: HTMLTableCellElement): number {
  const line = cell.querySelector("div");
  if (!line) return sum(phraseLengths(cell)) * CHAR;
  const oneLine = sum(phraseLengths(line.firstElementChild!)) * CHAR;
  if (copyBelow(cell)) return Math.max(oneLine, BUTTON);
  return oneLine + GAP + BUTTON;
}

/** 各列の幅。 */
function columnWidths(table: HTMLTableElement): number[] {
  const head = table.rows[0];
  const indexes = [...head.cells].map((_, index) => index);
  const rows = [...table.rows].filter((row) => row.style.display !== "none");
  const columnCells = (index: number) =>
    rows
      .map((row) => row.cells[index])
      .filter((cell) => cell && cell.colSpan === 1);
  const mins = indexes.map((index) =>
    Math.max(...columnCells(index).map(minWidth)),
  );
  const maxes = indexes.map((index) =>
    Math.max(mins[index], ...columnCells(index).map(maxWidth)),
  );
  const specified = [...head.cells].map((cell) =>
    cell.style.width === "" ? null : parseFloat(cell.style.width),
  );
  if (table.style.tableLayout === "fixed") {
    return specified.map((width) => width ?? 0);
  }
  const taken = (index: number, free: number) => {
    const width = specified[index];
    return width === null ? free : Math.max(width, mins[index]);
  };
  if (parseFloat(table.style.width) === 0) {
    return mins.map((min, index) => taken(index, min));
  }
  if (table.style.width === "max-content") {
    const details = rows
      .flatMap((row) => [...row.cells])
      .filter((cell) => cell.colSpan > 1)
      .map((cell) => (cell.textContent ?? "").length * CHAR);
    maxes[0] = Math.max(maxes[0], ...details);
    return maxes.map((max, index) => taken(index, max));
  }
  const frame = table.closest<HTMLElement>(".table-phrased")!;
  const total = frame.hasAttribute("data-in-box") ? placed.box : placed.frame;
  const free = indexes.filter((index) => specified[index] === null);
  const rest =
    total -
    sum(
      indexes
        .filter((index) => specified[index] !== null)
        .map((index) => taken(index, 0)),
    );
  const freeMin = sum(free.map((index) => mins[index]));
  const freeMax = sum(free.map((index) => maxes[index]));
  return indexes.map((index) => {
    if (specified[index] !== null) return taken(index, 0);
    if (rest >= freeMax) return maxes[index] * (rest / freeMax);
    if (rest > freeMin) {
      const share = (rest - freeMin) / (freeMax - freeMin);
      return mins[index] + (maxes[index] - mins[index]) * share;
    }
    return mins[index];
  });
}

function fakeRect(this: HTMLElement): DOMRect {
  let width = 0;
  if (this.classList.contains("table-phrased")) {
    width = placed.frame;
  } else if (this.dataset.box !== undefined) {
    width = placed.box;
  } else if (this instanceof HTMLTableCellElement) {
    width = columnWidths(this.closest("table")!)[this.cellIndex];
  } else if (this instanceof HTMLTableElement) {
    width = sum(columnWidths(this));
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

/** 最初の行のセルに指定した幅。 */
function headWidths(table: HTMLTableElement): string[] {
  return [...table.rows[0].cells].map((cell) => cell.style.width);
}

describe("DataTable の行の見出しの列", () => {
  test("収まる表に余りがあれば、行の見出しの列を見出しを1行に組める幅に留め、値の列には幅を指定しない", () => {
    // 見出しの列の max-content は「失敗エピソードの在庫数」の 110px。
    placed.frame = 1000;
    const { container } = render(<DataTable label="指標" rows={METRICS} />);
    const table = frameOf(container).querySelector("table")!;
    expect(headWidths(table)).toEqual(["110px", ""]);
    expect(table.style.width).toBe("");
    expect(table.style.tableLayout).toBe("");
  });

  test("余りが無ければ、どのセルにも幅を指定しない", () => {
    // 列の最小の幅の和 140px にちょうど置かれ、見出しの列は 80px のまま max-content の 110px に届かない。
    placed.frame = 140;
    const { container } = render(<DataTable label="指標" rows={METRICS} />);
    const table = frameOf(container).querySelector("table")!;
    for (const row of table.rows) {
      for (const cell of row.cells) expect(cell.style.width).toBe("");
    }
  });

  test("行の見出しを持たない表（列の見出しだけの表）には、どのセルにも幅を指定しない", () => {
    placed.frame = 1000;
    const { container } = render(
      <DataTable
        label="指標"
        columns={[["指標"], ["値"]]}
        rows={METRICS.map(({ key, header, cells }) => ({
          key,
          cells: [header!, ...cells],
        }))}
      />,
    );
    const table = frameOf(container).querySelector("table")!;
    for (const row of table.rows) {
      for (const cell of row.cells) expect(cell.style.width).toBe("");
    }
  });

  test("見出しの列の幅は開いた行を隠して測り、測ったあとに開いた行を元に戻す", () => {
    placed.frame = 1000;
    const { container } = render(
      <DataTable
        label="指標"
        rows={METRICS.map((row, index) => ({
          ...row,
          detail: index === 0 ? <p>{"例".repeat(50)}</p> : undefined,
        }))}
      />,
    );
    const table = frameOf(container).querySelector("table")!;
    expect(headWidths(table)).toEqual(["110px", ""]);
    const detailRow = screen.getByText("例".repeat(50)).closest("tr")!;
    expect(detailRow.style.display).toBe("");
  });

  test("コピーのボタンを持つ表も、余りがあれば行の見出しの列を留める", () => {
    // 見出しの列 30px と、1行の値とボタンの 236px。
    placed.frame = 1000;
    const { container } = render(
      <DataTable label="カラーコード" rows={CODES} />,
    );
    const frame = frameOf(container);
    expect(frame.hasAttribute("data-copy-below")).toBe(false);
    expect(headWidths(frame.querySelector("table")!)).toEqual(["30px", ""]);
  });
});

describe("DataTableGroup", () => {
  /** 見出しの列（2字）と値の列（3字）の短い表。 */
  const SHORT: DataTableRow[] = [
    { key: "speed", header: ["速度"], cells: [["約3秒"]] },
  ];

  function groupTables(container: HTMLElement): HTMLTableElement[] {
    return [...container.querySelectorAll<HTMLTableElement>("table")];
  }

  test("組の中の表の行の見出しの列を、いちばん広いものにそろえる", () => {
    placed.frame = 1000;
    const { container } = render(
      <DataTableGroup>
        <DataTable label="指標" rows={METRICS} />
        <h2>あいだの小見出し</h2>
        <DataTable label="速度" rows={SHORT} />
      </DataTableGroup>,
    );
    const [metrics, short] = groupTables(container);
    expect(headWidths(metrics)).toEqual(["110px", ""]);
    expect(headWidths(short)).toEqual(["110px", ""]);
    const group = container.querySelector("[data-table-group]")!;
    expect(group.hasAttribute("data-layout-key")).toBe(true);
    for (const frame of group.querySelectorAll(".table-phrased")) {
      expect(frame.hasAttribute("data-layout-key")).toBe(true);
    }
  });

  test("そろえる幅と値の列の最小の幅の和が表の幅を超える表は、そろえずに自分の組みのまま残す", () => {
    // 指標の表の見出しの列は 110px。値の列の最小の幅が 90px の表は 110 + 90 > 190 なので、自分の 20px に留める。
    placed.frame = 190;
    const long: DataTableRow[] = [
      { key: "value", header: ["速度"], cells: [["とても長い値の文節"]] },
    ];
    const { container } = render(
      <DataTableGroup>
        <DataTable label="指標" rows={METRICS} />
        <DataTable label="長い値" rows={long} />
      </DataTableGroup>,
    );
    const [metrics, own] = groupTables(container);
    expect(headWidths(metrics)).toEqual(["110px", ""]);
    expect(headWidths(own)).toEqual(["20px", ""]);
  });

  test("細くした表は、そろえる幅を決めるのにも数えず、そろえる幅も受けない", () => {
    // 130px では指標の表を細くする（70px と 60px）。短い表だけが自分の見出しの列 20px に留まる。
    placed.frame = 130;
    const { container } = render(
      <DataTableGroup>
        <DataTable label="指標" rows={METRICS} />
        <DataTable label="速度" rows={SHORT} />
      </DataTableGroup>,
    );
    const [metrics, short] = groupTables(container);
    expect(metrics.style.tableLayout).toBe("fixed");
    expect(headWidths(metrics)).toEqual(["70px", "60px"]);
    expect(headWidths(short)).toEqual(["20px", ""]);
  });

  test("送る表は、そろえる幅を決めるのにも数えず、そろえる幅も受けない", () => {
    // 79px では指標の表を4字まで細くしても収まらず、送る。
    placed.frame = 79;
    const { container } = render(
      <DataTableGroup>
        <DataTable label="指標" rows={METRICS} />
        <DataTable label="速度" rows={SHORT} />
      </DataTableGroup>,
    );
    const [metrics, short] = groupTables(container);
    expect(
      metrics.closest(".table-phrased")!.hasAttribute("data-scrolls"),
    ).toBe(true);
    expect(headWidths(metrics)).toEqual(["", ""]);
    expect(headWidths(short)).toEqual(["20px", ""]);
  });

  test("組の1つの枠を組むと組の全部を組む。同じなら組み直さず、中身を描き替えたときと枠の数が変わったときは組み直す", () => {
    placed.frame = 1000;
    const container = document.createElement("div");
    container.innerHTML = renderToString(
      <DataTableGroup>
        <DataTable label="指標" rows={METRICS} />
        <DataTable label="速度" rows={SHORT} />
      </DataTableGroup>,
    );
    document.body.appendChild(container);
    try {
      const group = container.querySelector<HTMLElement>("[data-table-group]")!;
      const frames = [...group.querySelectorAll<HTMLElement>(".table-phrased")];
      layoutTable(frames[1]);
      expect(group.hasAttribute("data-layout-key")).toBe(true);
      for (const frame of frames) {
        expect(frame.hasAttribute("data-layout-key")).toBe(true);
      }
      const [metrics, short] = groupTables(container);
      expect(headWidths(short)).toEqual(["110px", ""]);

      const layout = vi.spyOn(HTMLTableElement.prototype, "rows", "get");
      layoutTable(frames[0]);
      expect(layout).not.toHaveBeenCalled();

      short.rows[0].cells[0].style.width = "";
      layoutTable(frames[0], true);
      expect(headWidths(short)).toEqual(["110px", ""]);

      frames[0].remove();
      layout.mockClear();
      layoutGroup(group);
      expect(layout).toHaveBeenCalled();
      expect(headWidths(short)).toEqual(["20px", ""]);
      expect(metrics.isConnected).toBe(false);
    } finally {
      container.remove();
    }
  });

  test("組の中の DataTable に inBox を渡すと、描くときに Error を投げる。組は入れ子にしない", () => {
    const errors = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() =>
      render(
        <DataTableGroup>
          <DataTable label="指標" rows={METRICS} inBox />
        </DataTableGroup>,
      ),
    ).toThrow("inBox");
    expect(() =>
      render(
        <DataTableGroup>
          <DataTableGroup>
            <DataTable label="指標" rows={METRICS} />
          </DataTableGroup>
        </DataTableGroup>,
      ),
    ).toThrow("入れ子");
    errors.mockRestore();
  });

  test("サーバーで描くと、組み方を定める文・組・組の全部を組む文の順に並び、水和で警告を出さない", async () => {
    placed.frame = 1000;
    const element = (
      <DataTableGroup>
        <DataTable label="指標" rows={METRICS} />
        <h2>あいだの小見出し</h2>
        <DataTable label="速度" rows={SHORT} />
      </DataTableGroup>
    );
    const html = renderToString(element);
    expect(html).toMatch(
      /^<script>window\.yolosFrameLayout\|\|[\s\S]*?<\/script><div [^>]*data-table-group=""[\s\S]*<\/div><script>\(function\(g\)\{try\{window\.yolosFrameLayout\.layoutGroup\(g\)[\s\S]*<\/script>$/,
    );
    const container = document.createElement("div");
    container.innerHTML = html;
    document.body.appendChild(container);
    layoutGroup(container.querySelector<HTMLElement>("[data-table-group]")!);

    const actEnvironment = globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean };
    const previousActEnvironment = actEnvironment.IS_REACT_ACT_ENVIRONMENT;
    actEnvironment.IS_REACT_ACT_ENVIRONMENT = true;
    const errors = vi.spyOn(console, "error").mockImplementation(() => {});
    let root: Root | undefined;
    try {
      root = await act(async () => hydrateRoot(container, element));
      expect(errors).not.toHaveBeenCalled();
      expect(headWidths(groupTables(container)[1])).toEqual(["110px", ""]);
    } finally {
      errors.mockRestore();
      if (root) act(() => root!.unmount());
      container.remove();
      actEnvironment.IS_REACT_ACT_ENVIRONMENT = previousActEnvironment;
    }
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
      /<\/table><\/div><script>\(function\(f\)\{if\(f\.closest\("\[data-table-group\]"\)\)return;try\{window\.yolosFrameLayout\.layoutTable\(f\)/,
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
