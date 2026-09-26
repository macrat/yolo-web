"use client";

import {
  useEffect,
  useEffectEvent,
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type CompositionEvent,
  type Ref,
} from "react";
import DisclosureTriangle from "@/components/DisclosureTriangle";
import Field from "@/components/Field";
import Input from "@/components/Input";
import RadioGroup from "@/components/RadioGroup";
import { ALL, controlsLabel, type BrowseChoice } from "@/lib/list-browse";
import styles from "./ListControls.module.css";

/** ラジオボタンの組1つ。絞り込みの組の選択肢には「すべて」を含めない（部品が先頭に足す）。 */
export interface ListControlsGroup {
  legend: string;
  options: BrowseChoice[];
  value: string;
  onChange: (value: string) => void;
}

interface ListControlsProps {
  /** 名前の欄のラベル。何で探せるかを言う（§7）。 */
  searchLabel: string;
  /** 名前の欄の要素。一覧の操作のあとに、親がここへフォーカスを移す。 */
  searchRef?: Ref<HTMLInputElement>;
  /** 名前の条件。欄の外から変わったとき（戻る・「絞り込みを外す」）は、欄の字もこの値にする。 */
  query: string;
  /** 名前の条件が変わったときに呼ぶ。IME の変換中は呼ばず、確定で呼ぶ。 */
  onQueryChange: (query: string) => void;
  /** 種別の組。種別が2つ以上あり、同じ軸の索引を一覧の上に置かないときだけ渡す。 */
  kindGroup?: ListControlsGroup;
  /** 道具ごとの組（難易度・出典など）。 */
  filterGroups?: ListControlsGroup[];
  /** 並び順の組。既定のほかに選ぶ理由のある並び順があるときだけ渡す。選択肢の先頭が既定。 */
  sortGroup?: ListControlsGroup;
}

function withAll(options: BrowseChoice[]): BrowseChoice[] {
  return [{ value: ALL, label: "すべて" }, ...options];
}

function selectedLabel(group: ListControlsGroup): string | undefined {
  return group.options.find((option) => option.value === group.value)?.label;
}

/**
 * 一覧の操作（DESIGN.md §7「件数と備え」）。名前の欄と、種別・道具ごとの組・並び順の組を入れる畳める枠。
 * 状態は親が持つ。
 *
 * 名前の欄は畳まず、どの幅でもいつも見せる。畳める枠は `45rem` 未満の画面でだけ閉じ、閉じた状態を
 * CSS のメディアクエリだけで隠す。サーバーの HTML と最初の描画が同じになり、読み込みのあとに一覧が動かない。
 * 広い画面でいつも開いた形を JS なしで作れないので、`details` ではなく開閉のボタンで組む。
 *
 * 名前の欄の字は、IME の変換中の仮名で一覧が揺れないよう、確定するまで親へ渡さない。そのため欄の字は
 * 部品の中に持ち、親の条件とは確定の時点で揃える。
 */
export default function ListControls({
  searchLabel,
  searchRef,
  query,
  onQueryChange,
  kindGroup,
  filterGroups = [],
  sortGroup,
}: ListControlsProps) {
  const regionId = useId();
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState(query);
  const [shownQuery, setShownQuery] = useState(query);
  const composingRef = useRef(false);
  const rootRef = useRef<HTMLDivElement>(null);

  // 欄の外から条件が変わったら、欄の字をそれに合わせる。欄で打った字が条件になったときは同じ値なので動かない。
  if (query !== shownQuery) {
    setShownQuery(query);
    setInputValue(query);
  }

  const commit = (value: string) => {
    setShownQuery(value);
    onQueryChange(value);
  };

  // 名前の欄はどの幅でもいつも見えていて、読み込みの前にも打てる。ハイドレーションは欄の字を書き換えず、
  // 変わったことも知らせないので、そのとき欄に入っている字を条件として受け取り、打った字を消さない。
  const adoptTypedBeforeHydration = useEffectEvent(() => {
    const typed =
      rootRef.current?.querySelector<HTMLInputElement>('input[type="search"]')
        ?.value ?? "";
    if (typed !== "" && typed !== inputValue) {
      setInputValue(typed);
      commit(typed);
    }
  });
  useEffect(() => {
    adoptTypedBeforeHydration();
  }, []);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setInputValue(value);
    const composing =
      composingRef.current ||
      (event.nativeEvent as InputEvent | undefined)?.isComposing === true;
    if (!composing) commit(value);
  };

  const handleCompositionStart = () => {
    composingRef.current = true;
  };

  const handleCompositionEnd = (event: CompositionEvent<HTMLInputElement>) => {
    composingRef.current = false;
    commit(event.currentTarget.value);
  };

  const filterGroupsInOrder = [
    ...(kindGroup ? [kindGroup] : []),
    ...filterGroups,
  ];
  const hasCollapsible = filterGroupsInOrder.length > 0 || sortGroup;
  const label = controlsLabel({
    hasFilterGroups: filterGroupsInOrder.length > 0,
    selectedFilters: filterGroupsInOrder
      .filter((group) => group.value !== ALL)
      .map((group) => selectedLabel(group))
      .filter((text): text is string => text !== undefined),
    sortLabel: sortGroup ? selectedLabel(sortGroup) : undefined,
  });

  return (
    <div ref={rootRef} className={styles.controls}>
      <Field label={searchLabel} className={styles.search}>
        {(control) => (
          <Input
            {...control}
            ref={searchRef}
            type="search"
            value={inputValue}
            onChange={handleChange}
            onCompositionStart={handleCompositionStart}
            onCompositionEnd={handleCompositionEnd}
            autoComplete="off"
            enterKeyHint="search"
          />
        )}
      </Field>
      {hasCollapsible ? (
        <div className={styles.disclosure}>
          <button
            type="button"
            className={styles.toggle}
            data-text-box="inline"
            aria-expanded={open}
            aria-controls={regionId}
            onClick={() => setOpen((value) => !value)}
          >
            <DisclosureTriangle />
            <span className={styles.toggleLabel}>{label}</span>
          </button>
          <div
            id={regionId}
            className={styles.region}
            data-open={open ? "" : undefined}
          >
            {filterGroupsInOrder.map((group) => (
              <RadioGroup
                key={group.legend}
                legend={group.legend}
                options={withAll(group.options)}
                value={group.value}
                onChange={group.onChange}
              />
            ))}
            {sortGroup ? (
              <RadioGroup
                legend={sortGroup.legend}
                options={sortGroup.options}
                value={sortGroup.value}
                onChange={sortGroup.onChange}
              />
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
