import { describe, expect, test, vi } from "vitest";
import { useState } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import ListControls from "@/components/ListControls";

const KINDS = [
  { value: "text", label: "文章" },
  { value: "data", label: "データ" },
];
const SORTS = [
  { value: "kind", label: "種別順" },
  { value: "new", label: "新しい順" },
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
});
