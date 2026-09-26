"use client";

import { useMemo } from "react";
import ItemList, { type ItemListItem } from "@/components/ItemList";
import ListControls from "@/components/ListControls";
import ListStack from "@/components/ListStack";
import ListStatus from "@/components/ListStatus";
import Pagination from "@/components/Pagination";
import type {
  BrowseChoice,
  BrowseItem,
  BrowseSort,
  BrowseSpec,
  BrowseUnit,
} from "@/lib/list-browse";
import { useListBrowseState } from "@/components/hooks/useListBrowseState";
import styles from "./BrowsableList.module.css";

/** 一覧のページが操作を持つのは、範囲がこの件数を超えるとき（§7）。 */
const CONTROLS_THRESHOLD = 10;

export interface BrowsableListProps {
  /**
   * 範囲の全件。既定の並び順で渡す。全件がページの HTML に入るので、項目は行に見せる値と、それだけでは作れない値
   * だけを持つ（BrowseItem）。
   */
  items: BrowseItem[];
  /** 名前のリンク先の接頭辞。項目の slug（無ければ名前）を百分率符号化して続けたものがリンク先になる。 */
  hrefPrefix: string;
  /** 一覧の名前（例「ツールの一覧」）。読み上げで一覧の名前になる。 */
  label: string;
  unit: BrowseUnit;
  /** 名前の欄のラベル。何で探せるかを言う（例「名前・説明で探す」）。 */
  searchLabel: string;
  /**
   * 種別の組。同じ軸の索引を一覧の上に置かないときだけ渡す。選択肢は、範囲の中に項目を持つものだけを出し、
   * それが2つ以上あるときだけ組を出す（§7）。
   */
  kindGroup?: { legend: string; options: BrowseChoice[] };
  /** 並び順の選択肢。先頭が既定。比べる値は、行の値から keys のとおりに組む。 */
  sorts: BrowseSort[];
  /** 1ページの件数。説明を持つ行は 50、持たない行は 100（§7）。 */
  perPage: number;
  /** 一覧の元のパス。ページ n の URL は n=1 で元のパス、ほかは `{元のパス}/page/{n}`。 */
  basePath: string;
  /** パスが示すページ。 */
  page: number;
  /**
   * ページの題（サイト名と「（n ページ目）」を除いたもの）。URL を書き換えたときに、タブの名前を listPageTitle で
   * 組んだそのパスの題に合わせる。経路の metadata の題も listPageTitle で組む。
   */
  pageTitle: string;
}

/**
 * 一覧のページの一覧（DESIGN.md §7「件数と備え」）。件数の行・名前の欄・畳める枠・行の一覧・ページ送りを組む。
 *
 * 状態は useListBrowseState が URL に持つ。既定の状態（名前の条件が空・種別が「すべて」・並び順が既定）では、
 * ページは URL のパスで、どのページも静的な HTML に入り、ページ送りはリンクで送る。既定でない状態は、範囲の
 * 全件からクライアントで組み、元のパスのクエリに持ち、ページ送りはボタンで送る。
 */
export default function BrowsableList({
  items,
  hrefPrefix,
  label,
  unit,
  searchLabel,
  kindGroup,
  sorts,
  perPage,
  basePath,
  page,
  pageTitle,
}: BrowsableListProps) {
  // 押すと必ず0件になる選択肢を出さないよう、種別の選択肢を範囲の項目が持つ種別に絞る。
  const kindOptions = useMemo(
    () =>
      (kindGroup?.options ?? []).filter((option) =>
        items.some((item) => item.kind === option.label),
      ),
    [kindGroup, items],
  );
  const spec = useMemo<BrowseSpec>(
    () => ({ kinds: kindOptions, sorts, filterGroups: [] }),
    [kindOptions, sorts],
  );
  const {
    state,
    slice,
    matched,
    filtering,
    announcement,
    statusRef,
    searchRef,
    setQuery,
    setKind,
    setSort,
    setPage,
    pageLinks,
    onPageLink,
    clear,
  } = useListBrowseState({
    items,
    spec,
    unit,
    perPage,
    pagePath: { basePath, page, pageTitle },
  });

  const pageItems: ItemListItem[] = slice.items.map((item) => ({
    name: item.name,
    href: `${hrefPrefix}${encodeURIComponent(item.slug ?? item.name)}`,
    reading: item.readings?.join("・") || undefined,
    description: item.description,
    kind: item.kind,
    facts: item.facts,
    swatch: item.swatch,
  }));

  // 行に出す種別は、表示中のページでなく範囲の全件で決める。ページや絞り込みによって種別の列が出たり
  // 消えたりしないようにするため（§7）。
  const showKind = useMemo(
    () => new Set(items.map((item) => item.kind)).size > 1,
    [items],
  );

  const hasControls = items.length > CONTROLS_THRESHOLD;
  const showKindGroup = hasControls && kindOptions.length >= 2;
  const showSortGroup = hasControls && sorts.length >= 2;
  const sortChoice = sorts.find((sort) => sort.value === state.sort);

  return (
    <ListStack>
      <div className={styles.head}>
        <ListStatus
          ref={statusRef}
          total={items.length}
          matched={matched}
          filtering={filtering}
          unit={unit}
          range={
            slice.pageCount > 1
              ? { start: slice.start, end: slice.end }
              : undefined
          }
          sortLabel={
            showSortGroup || items.length === 0 ? undefined : sortChoice?.label
          }
          announcement={announcement}
          onClear={clear}
        />
        {hasControls ? (
          <ListControls
            searchLabel={searchLabel}
            searchRef={searchRef}
            query={state.query}
            onQueryChange={setQuery}
            kindGroup={
              showKindGroup && kindGroup
                ? {
                    legend: kindGroup.legend,
                    options: kindOptions,
                    value: state.kind,
                    onChange: setKind,
                  }
                : undefined
            }
            sortGroup={
              showSortGroup
                ? {
                    legend: "並び順",
                    options: sorts,
                    value: state.sort,
                    onChange: setSort,
                  }
                : undefined
            }
          />
        ) : null}
      </div>
      {pageItems.length > 0 ? (
        <div>
          <ItemList label={label} items={pageItems} showKind={showKind} />
          {pageLinks ? (
            <Pagination
              currentPage={slice.page}
              totalPages={slice.pageCount}
              basePath={basePath}
              onNavigate={onPageLink}
            />
          ) : (
            <Pagination
              mode="button"
              currentPage={slice.page}
              totalPages={slice.pageCount}
              onPageChange={setPage}
            />
          )}
        </div>
      ) : null}
    </ListStack>
  );
}
