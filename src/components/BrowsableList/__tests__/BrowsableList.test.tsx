import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { act, fireEvent, render, screen, within } from "@testing-library/react";
import BrowsableList, {
  type BrowsableListProps,
} from "@/components/BrowsableList";
import type { BrowseItem } from "@/lib/list-browse";

const navigation = vi.hoisted(() => ({ pathname: "/list" }));

vi.mock("next/navigation", () => ({
  usePathname: () => navigation.pathname,
}));

const BASE = "/list";
const PER_PAGE = 50;

// 1ページの件数×2＋1件。読みの順に並べて渡す。
function makeItems(count: number): BrowseItem[] {
  return Array.from({ length: count }, (_, index) => {
    const number = String(index + 1).padStart(3, "0");
    return {
      name: `項目${number}`,
      slug: `item-${number}`,
      description: `説明${number}`,
      kind: index % 2 === 0 ? "文章" : "データ",
      sortKeys: { name: [number], reverse: [-index] },
    };
  });
}

function props(change: Partial<BrowsableListProps> = {}): BrowsableListProps {
  return {
    items: makeItems(PER_PAGE * 2 + 1),
    hrefPrefix: "/items/",
    label: "項目の一覧",
    unit: "件",
    searchLabel: "名前・説明で探す",
    kindGroup: {
      legend: "種別",
      options: [
        { value: "text", label: "文章" },
        { value: "data", label: "データ" },
      ],
    },
    sorts: [
      { value: "name", label: "名前順" },
      { value: "reverse", label: "逆順" },
    ],
    perPage: PER_PAGE,
    basePath: BASE,
    page: 1,
    pageTitle: "項目",
    ...change,
  };
}

function visit(path: string) {
  navigation.pathname = path.split("?")[0];
  window.history.replaceState(null, "", path);
}

function rowNames(): string[] {
  const list = screen.getByRole("list", { name: "項目の一覧" });
  return within(list)
    .getAllByRole("link")
    .map((link) => link.textContent ?? "");
}

beforeEach(() => {
  visit(BASE);
  document.title = "項目 | yolos.net";
  Element.prototype.scrollIntoView = vi.fn();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("BrowsableList", () => {
  test("既定の状態では、パスが示すページの行と link モードのページ送りを出す", () => {
    visit(`${BASE}/page/2`);
    render(<BrowsableList {...props({ page: 2 })} />);
    expect(screen.getByRole("status")).toHaveTextContent(
      "全101件のうち51〜100件目",
    );
    expect(rowNames()[0]).toBe("項目051");
    expect(screen.getByRole("link", { name: "ページ3" })).toHaveAttribute(
      "href",
      `${BASE}/page/3`,
    );
  });

  test("10件以下の一覧は件数の行だけを持ち、並び順を件数の行が言う", () => {
    render(<BrowsableList {...props({ items: makeItems(10) })} />);
    expect(screen.getByRole("status")).toHaveTextContent("全10件・名前順");
    expect(screen.queryByRole("searchbox")).not.toBeInTheDocument();
    expect(screen.queryByRole("radiogroup")).not.toBeInTheDocument();
  });

  test("項目の無い範囲は件数の行だけで、空の一覧も並び順も出さない", () => {
    render(<BrowsableList {...props({ items: [] })} />);
    expect(screen.getByRole("status")).toHaveTextContent(/^全0件$/);
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });

  test("打つとすぐ絞り、300ms 後にパスを元のパスに替えてクエリへ書き、題を元のパスのものにする", () => {
    vi.useFakeTimers();
    visit(`${BASE}/page/2`);
    document.title = "項目（2ページ目） | yolos.net";
    render(<BrowsableList {...props({ page: 2 })} />);

    fireEvent.change(screen.getByRole("searchbox"), {
      target: { value: "項目10" },
    });
    expect(screen.getByRole("status")).toHaveTextContent("2件（全101件）");
    expect(rowNames()).toEqual(["項目100", "項目101"]);
    expect(window.location.pathname).toBe(`${BASE}/page/2`);

    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(window.location.pathname).toBe(BASE);
    expect(window.location.search).toBe(`?q=${encodeURIComponent("項目10")}`);
    expect(document.title).toBe("項目 | yolos.net");
    // パスが替わっても props の page=2 は使わず、絞り込んだ結果の1ページ目を出す。
    expect(rowNames()).toEqual(["項目100", "項目101"]);
  });

  test("種別と並び順は replaceState ですぐ書き、既定に戻すと元のパスになる", () => {
    const replace = vi.spyOn(window.history, "replaceState");
    render(<BrowsableList {...props()} />);
    fireEvent.click(screen.getByRole("radio", { name: "データ" }));
    expect(window.location.search).toBe("?kind=data");
    expect(screen.getByRole("status")).toHaveTextContent("50件（全101件）");
    fireEvent.click(screen.getByRole("radio", { name: "逆順" }));
    expect(window.location.search).toBe("?kind=data&sort=reverse");
    expect(rowNames()[0]).toBe("項目100");
    fireEvent.click(screen.getByRole("radio", { name: "すべて" }));
    fireEvent.click(screen.getByRole("radio", { name: "名前順" }));
    expect(window.location.pathname + window.location.search).toBe(BASE);
    expect(replace).toHaveBeenCalled();
    replace.mockRestore();
  });

  test("行の種別は範囲の全件で決め、種別で絞ってページの行がそろっても出す", () => {
    render(<BrowsableList {...props()} />);
    fireEvent.click(screen.getByRole("radio", { name: "データ" }));
    const list = screen.getByRole("list", { name: "項目の一覧" });
    expect(within(list).getAllByText("データ")).toHaveLength(50);
  });

  test("範囲の全件で同じ種別は、行に出さない", () => {
    const items = makeItems(3).map((item) => ({ ...item, kind: "文章" }));
    render(<BrowsableList {...props({ items, kindGroup: undefined })} />);
    const list = screen.getByRole("list", { name: "項目の一覧" });
    expect(within(list).queryByText("文章")).not.toBeInTheDocument();
  });

  test("既定でない状態のページ送りは button モードで、pushState で送り、フォーカスを件数の行に移す", () => {
    const push = vi.spyOn(window.history, "pushState");
    render(<BrowsableList {...props()} />);
    fireEvent.click(screen.getByRole("radio", { name: "逆順" }));
    const next = screen.getByRole("button", { name: "次へ（ページ2）" });
    next.focus();
    fireEvent.click(next);
    expect(push).toHaveBeenCalledWith(null, "", `${BASE}?sort=reverse&page=2`);
    const status = screen.getByRole("status");
    expect(status).toHaveTextContent("全101件のうち51〜100件目");
    expect(status).toHaveFocus();
    expect(status.scrollIntoView).toHaveBeenCalledWith({ block: "start" });

    // 端で押した「次へ」が消えても、フォーカスは件数の行に残る。
    fireEvent.click(screen.getByRole("button", { name: "次へ（ページ3）" }));
    expect(screen.getByRole("status")).toHaveFocus();
    push.mockRestore();
  });

  test("戻るで URL が替わると、表示と名前の欄が URL の状態に戻る", () => {
    vi.useFakeTimers();
    render(<BrowsableList {...props()} />);
    const input = screen.getByRole("searchbox");
    fireEvent.change(input, { target: { value: "項目00" } });
    act(() => {
      vi.advanceTimersByTime(300);
    });
    act(() => {
      window.history.replaceState(null, "", BASE);
      window.dispatchEvent(new PopStateEvent("popstate"));
    });
    expect(input).toHaveValue("");
    expect(screen.getByRole("status")).toHaveTextContent(
      "全101件のうち1〜50件目",
    );
  });

  test("クエリのある URL に着くと、その状態で組む", () => {
    visit(`${BASE}?q=${encodeURIComponent("項目09")}&page=1`);
    render(<BrowsableList {...props()} />);
    expect(screen.getByRole("searchbox")).toHaveValue("項目09");
    expect(rowNames()[0]).toBe("項目090");
  });

  test("該当が0件なら「絞り込みを外す」で名前と種別の条件を外す", () => {
    render(<BrowsableList {...props()} />);
    fireEvent.click(screen.getByRole("radio", { name: "逆順" }));
    fireEvent.change(screen.getByRole("searchbox"), {
      target: { value: "存在しない" },
    });
    expect(screen.getByRole("status")).toHaveTextContent(
      "条件に合うものはありません（全101件）",
    );
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "絞り込みを外す" }));
    expect(screen.getByRole("searchbox")).toHaveValue("");
    expect(window.location.search).toBe("?sort=reverse");
  });

  test("ほかのページから一覧を開いたときは、フォーカスを件数の行へ移さない", () => {
    render(<BrowsableList {...props()} />);
    expect(screen.getByRole("status")).not.toHaveFocus();
  });
});
