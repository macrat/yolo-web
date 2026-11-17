import { afterEach, describe, it, expect } from "vitest";
import { render, screen, fireEvent, act, within } from "@testing-library/react";
import KeigoReferenceTile from "../KeigoReferenceTile";

// 絞り込みは URL のクエリに持つので、テストごとにクエリの無い URL へ戻す。
afterEach(() => {
  window.history.replaceState(null, "", "/tools/keigo-reference");
});

// 見えている件数の行。読み上げに伝える文は、これとは別の見えない role="status" が持つ。
function countLine(): HTMLElement {
  const line = document.querySelector<HTMLElement>('p[tabindex="-1"]');
  if (!line) throw new Error("件数の行がありません");
  return line;
}

function searchBox(): HTMLElement {
  return screen.getByRole("searchbox", { name: "普通語・敬語で探す" });
}

function table(): HTMLElement {
  return screen.getByRole("table");
}

/** 狭い画面の開閉する行。 */
function mobileRows(): HTMLElement[] {
  return Array.from(
    document.querySelectorAll<HTMLElement>("li > button[aria-expanded]"),
  );
}

async function showMistakes() {
  await act(async () => {
    fireEvent.click(screen.getByRole("radio", { name: "よくある間違い" }));
  });
}

describe("ルートと表示する内容", () => {
  it("ルートは Panel の section で、as で要素を替えられる", () => {
    const { container, unmount } = render(<KeigoReferenceTile />);
    expect(container.firstElementChild?.tagName).toBe("SECTION");
    unmount();
    const { container: asDiv } = render(<KeigoReferenceTile as="div" />);
    expect(asDiv.firstElementChild?.tagName).toBe("DIV");
  });

  it("表示する内容を、敬語早見表とよくある間違いのラジオボタンで切り替える", async () => {
    render(<KeigoReferenceTile />);
    expect(
      screen.getByRole("radiogroup", { name: "表示する内容" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "敬語早見表" })).toBeChecked();
    await showMistakes();
    expect(
      screen.getByRole("heading", { level: 2, name: "二重敬語" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 2, name: "尊敬語・謙譲語の混同" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 2, name: "バイト敬語" }),
    ).toBeInTheDocument();
    expect(screen.getByText("〜になります")).toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });
});

describe("件数の行と絞り込み", () => {
  it("件数の行が全件の数と分類順を言い、並び順の組を持たない", () => {
    render(<KeigoReferenceTile />);
    expect(countLine()).toHaveTextContent(/^全\d+語・分類順$/);
    expect(
      screen.queryByRole("radiogroup", { name: "並び順" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "絞り込み（すべて）" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "すべて" })).toBeChecked();
  });

  it("名前の欄で絞り込み、件数の行が該当件数を言う", () => {
    render(<KeigoReferenceTile />);
    fireEvent.change(searchBox(), { target: { value: "確認" } });
    expect(within(table()).getByText("確認する")).toBeInTheDocument();
    expect(countLine()).toHaveTextContent(/^\d+語（全\d+語）・分類順$/);
  });

  it("当たらないときは件数の行が言い、「絞り込みを外す」で名前の欄へ戻る", () => {
    render(<KeigoReferenceTile />);
    fireEvent.change(searchBox(), { target: { value: "xxxxxxxxxx" } });
    expect(countLine()).toHaveTextContent(/^条件に合う語はありません/);
    fireEvent.click(screen.getByRole("button", { name: "絞り込みを外す" }));
    expect(countLine()).toHaveTextContent(/^全\d+語・分類順$/);
    expect(searchBox()).toHaveFocus();
  });

  it("分類で絞り込む", async () => {
    render(<KeigoReferenceTile />);
    await act(async () => {
      fireEvent.click(screen.getByRole("radio", { name: "ビジネス" }));
    });
    expect(within(table()).queryByText("行く")).not.toBeInTheDocument();
    expect(within(table()).getByText("確認する")).toBeInTheDocument();
  });

  it("URL のクエリの状態で出す", () => {
    window.history.replaceState(
      null,
      "",
      "/tools/keigo-reference?kind=service",
    );
    render(<KeigoReferenceTile />);
    expect(screen.getByRole("radio", { name: "接客・サービス" })).toBeChecked();
    expect(within(table()).getByText("買う")).toBeInTheDocument();
    expect(screen.queryAllByText("行く")).toHaveLength(0);
  });

  it("絞り込んだ件数を、条件が落ち着いてから読み上げに渡す", async () => {
    render(<KeigoReferenceTile />);
    const status = screen.getByRole("status");
    expect(status).toHaveTextContent("");
    fireEvent.change(searchBox(), { target: { value: "行く" } });
    await act(() => new Promise((resolve) => setTimeout(resolve, 350)));
    expect(status).toHaveTextContent(/^\d+語（全\d+語）$/);
  });
});

describe("広い画面の表", () => {
  it("見出し行が、普通語・分類・尊敬語・謙譲語・丁寧語の列を持つ", () => {
    render(<KeigoReferenceTile />);
    expect(
      screen.getAllByRole("columnheader").map((cell) => cell.textContent),
    ).toEqual(["普通語", "分類", "尊敬語", "謙譲語", "丁寧語"]);
  });

  it("行を開く、行見出しの中のボタンの名前は普通語だけで、押すと例文が開く", async () => {
    render(<KeigoReferenceTile />);
    const button = within(table()).getByRole("button", { name: "行く" });
    expect(button.closest("th")).toHaveAttribute("scope", "row");
    expect(button).toHaveAttribute("aria-expanded", "false");
    await act(async () => {
      fireEvent.click(button);
    });
    expect(button).toHaveAttribute("aria-expanded", "true");
    expect(within(table()).getByText("移動先を伝えるとき")).toBeInTheDocument();
  });

  it("開いた例文は、場面ごとに普通・尊敬語・謙譲語の言い方を並べる", async () => {
    render(<KeigoReferenceTile />);
    await act(async () => {
      fireEvent.click(within(table()).getByRole("button", { name: "行く" }));
    });
    const labels = Array.from(
      table().querySelectorAll("dt"),
      (dt) => dt.textContent,
    );
    expect(labels.slice(0, 3)).toEqual(["普通", "尊敬語", "謙譲語"]);
  });

  it("行そのものは表の行のままで、ボタンの役割を持たない", () => {
    render(<KeigoReferenceTile />);
    expect(document.querySelectorAll('tr[role="button"]')).toHaveLength(0);
  });

  it("「言う」の尊敬語と「行く」の謙譲語を出す", () => {
    render(<KeigoReferenceTile />);
    expect(within(table()).getByText("おっしゃる")).toBeInTheDocument();
    expect(within(table()).getByText("参る・うかがう")).toBeInTheDocument();
  });
});

describe("狭い画面の開閉する行", () => {
  it("読み上げの名前が普通語だけで、分類と敬語の形を説明に持つ", () => {
    render(<KeigoReferenceTile />);
    const [row] = mobileRows();
    expect(row).toHaveAccessibleName("行く");
    expect(row).toHaveAccessibleDescription(
      "基本動詞 尊敬語 いらっしゃる・おいでになる 謙譲語 参る・うかがう 丁寧語 行きます",
    );
    fireEvent.click(row);
    expect(row).toHaveAttribute("aria-expanded", "true");
    expect(
      within(row.closest("li")!).getByText("移動先を伝えるとき"),
    ).toBeInTheDocument();
  });
});

describe("複数のタイル", () => {
  it("同じページに2つ置いても、入力欄の id が重ならない", () => {
    const { container } = render(
      <>
        <KeigoReferenceTile />
        <KeigoReferenceTile />
      </>,
    );
    const ids = Array.from(container.querySelectorAll("input"))
      .map((el) => el.getAttribute("id"))
      .filter(Boolean);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
