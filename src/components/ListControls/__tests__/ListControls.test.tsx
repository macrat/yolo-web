import { describe, expect, test, vi } from "vitest";
import { useState } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import ListControls from "@/components/ListControls";
import styles from "@/components/ListControls/ListControls.module.css";
import { followsPhraseRules } from "@/lib/phrase-breaks";

const KINDS = [
  { value: "text", name: "文章" },
  { value: "data", name: "データ" },
];
const SORTS = [
  { value: "kind", name: "種別順" },
  { value: "new", name: "新しい順" },
];

function Harness({
  onQueryChange = () => {},
}: {
  onQueryChange?: (q: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState("");
  const [sort, setSort] = useState("kind");
  return (
    <>
      <ListControls
        searchLabel="名前・説明で探す"
        query={query}
        onQueryChange={(value) => {
          setQuery(value);
          onQueryChange(value);
        }}
        kindGroup={{
          legend: "種別",
          options: KINDS,
          value: kind,
          onChange: setKind,
        }}
        sortGroup={{
          legend: "並び順",
          options: SORTS,
          value: sort,
          onChange: setSort,
        }}
      />
      <button type="button" onClick={() => setQuery("")}>
        外から消す
      </button>
    </>
  );
}

describe("ListControls", () => {
  test("名前の欄は検索の欄で、ラベルが何で探せるかを言う", () => {
    render(<Harness />);
    const input = screen.getByRole("searchbox", { name: "名前・説明で探す" });
    expect(input).toHaveAttribute("autocomplete", "off");
    expect(input).toHaveAttribute("enterkeyhint", "search");
  });

  test("開閉のボタンは閉じた状態で始まり、ラベルが畳んだ組のいまの選択を言う", () => {
    render(<Harness />);
    const toggle = screen.getByRole("button", {
      name: "絞り込みと並び順（すべて、種別順）",
    });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");

    fireEvent.click(screen.getByRole("radio", { name: "データ" }));
    fireEvent.click(screen.getByRole("radio", { name: "新しい順" }));
    expect(toggle).toHaveAccessibleName("絞り込みと並び順（データ、新しい順）");
  });

  test("種別の組は「すべて」を先頭に持ち、並び順の組は持たない", () => {
    render(<Harness />);
    const kindGroup = screen.getByRole("radiogroup", { name: "種別" });
    const kindRadios = kindGroup.querySelectorAll("input[type=radio]");
    expect(kindRadios[0]).toHaveAccessibleName("すべて");
    const sortGroup = screen.getByRole("radiogroup", { name: "並び順" });
    expect(
      Array.from(sortGroup.querySelectorAll("input[type=radio]")).map((radio) =>
        radio.getAttribute("value"),
      ),
    ).toEqual(["kind", "new"]);
  });

  test("並び順の組だけなら、ラベルは「並び順（…）」", () => {
    render(
      <ListControls
        searchLabel="語で探す"
        query=""
        onQueryChange={() => {}}
        sortGroup={{
          legend: "並び順",
          options: SORTS,
          value: "new",
          onChange: () => {},
        }}
      />,
    );
    expect(
      screen.getByRole("button", { name: "並び順（新しい順）" }),
    ).toBeInTheDocument();
  });

  test("畳む組が無ければ開閉のボタンを出さない", () => {
    render(
      <ListControls searchLabel="語で探す" query="" onQueryChange={() => {}} />,
    );
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  test("IME の変換中は条件を渡さず、確定で渡す", () => {
    const onQueryChange = vi.fn();
    render(<Harness onQueryChange={onQueryChange} />);
    const input = screen.getByRole("searchbox");
    fireEvent.compositionStart(input);
    fireEvent.change(input, { target: { value: "すい" } });
    expect(input).toHaveValue("すい");
    expect(onQueryChange).not.toHaveBeenCalled();
    fireEvent.change(input, { target: { value: "水" } });
    fireEvent.compositionEnd(input);
    expect(onQueryChange).toHaveBeenLastCalledWith("水");
    expect(onQueryChange).toHaveBeenCalledTimes(1);
  });

  test("欄の外から条件が変わると、欄の字もそれに合わせる", () => {
    render(<Harness />);
    const input = screen.getByRole("searchbox");
    fireEvent.change(input, { target: { value: "json" } });
    expect(input).toHaveValue("json");
    fireEvent.click(screen.getByRole("button", { name: "外から消す" }));
    expect(input).toHaveValue("");
  });

  test("区切りの並びの欄の名前と組の名前は文節で折り、読み上げの名前は元の文", () => {
    const searchLabel = ["名前・", "説明で", "探す"];
    const legend = ["難易度で", "絞る"];
    render(
      <ListControls
        searchLabel={searchLabel}
        query=""
        onQueryChange={() => {}}
        filterGroups={[
          {
            legend,
            options: [{ value: "easy", name: "やさしい" }],
            value: "all",
            onChange: () => {},
          },
        ]}
      />,
    );
    const search = screen.getByRole("searchbox", { name: "名前・説明で探す" });
    expect(search.closest("div")!.querySelector("label")!.innerHTML).toContain(
      "名前・<wbr>説明で<wbr>探す",
    );
    const group = screen.getByRole("radiogroup", { name: "難易度で絞る" });
    expect(group.querySelector("legend")!.innerHTML).toContain(
      "難易度で<wbr>絞る",
    );
    expect(followsPhraseRules(searchLabel)).toBe(true);
    expect(followsPhraseRules(legend)).toBe(true);
  });

  test("選択肢の名前の区切りの並びは、ラジオボタンの横と開閉のボタンのラベルで文節で折り、ラベルの丸括弧の一続きは1つの箱にし、読み上げの名前は1続きの字で言う", () => {
    const kindName = ["データの", "変換"];
    const sortName = ["読みの", "五十音順"];
    render(
      <ListControls
        searchLabel="名前で探す"
        query=""
        onQueryChange={() => {}}
        kindGroup={{
          legend: "種別",
          options: [
            { value: "text", name: "文章" },
            { value: "data", name: kindName },
          ],
          value: "data",
          onChange: () => {},
        }}
        sortGroup={{
          legend: "並び順",
          options: [{ value: "reading", name: sortName }],
          value: "reading",
          onChange: () => {},
        }}
      />,
    );
    const kind = screen.getByRole("radio", { name: "データの変換" });
    expect(kind.closest("label")!.innerHTML).toContain("データの<wbr>変換");
    expect(screen.getByRole("radio", { name: "読みの五十音順" })).toBeChecked();
    const toggle = screen.getByRole("button", {
      name: "絞り込みと並び順（データの変換、読みの五十音順）",
    });
    const selection = toggle.querySelector(`.${styles.selection}`)!;
    expect(selection.innerHTML).toBe(
      "（データの<wbr>変換、<wbr>読みの<wbr>五十音順）",
    );
    expect(selection.parentElement!.innerHTML).toContain(
      "絞り込みと<wbr>並び順</span><wbr>",
    );
    expect(followsPhraseRules(kindName)).toBe(true);
    expect(followsPhraseRules(sortName)).toBe(true);
  });
});
