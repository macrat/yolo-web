"use client";

import { Fragment, useState } from "react";
import Panel from "@/components/Panel";
import ListStack from "@/components/ListStack";
import ListControls from "@/components/ListControls";
import ListStatus from "@/components/ListStatus";
import Pagination from "@/components/Pagination";
import DisclosureRow from "@/tools/_components/DisclosureRow";
import { useListBrowseState } from "@/components/hooks/useListBrowseState";
import type { YojiEntry } from "@/dictionary/_lib/types";
import {
  YOJI_SEARCH_ITEMS,
  YOJI_SEARCH_PER_PAGE,
  YOJI_SEARCH_SPEC,
} from "./logic";
import styles from "./YojiSearchTile.module.css";

export type YojiSearchTileVariant = "full";

export interface YojiSearchTileProps {
  variant?: YojiSearchTileVariant;
  as?: "section" | "div" | "article" | "aside";
  className?: string;
}

const [LEVEL_GROUP, ORIGIN_GROUP] = YOJI_SEARCH_SPEC.filterGroups;

/** 開いた行に見せる、四字熟語の詳細。閉じた行に見えている値（語・読み・カテゴリ・難易度・意味）は繰り返さない。 */
function YojiDetail({ entry }: { entry: YojiEntry }) {
  const rows: Array<[string, string]> = [
    ["例文", entry.example],
    ["出典", entry.origin],
    ["構造", entry.structure],
  ];
  return (
    <dl className={styles.detailList}>
      {rows.map(([label, value]) => (
        <div key={label} className={styles.detailRow}>
          <dt className={styles.detailLabel}>{label}</dt>
          <dd className={styles.detailValue}>{value}</dd>
        </div>
      ))}
    </dl>
  );
}

/**
 * 四字熟語を探す道具。件数の行・名前の欄・畳める絞り込みと並び順の組・結果の行・ページ送りを縦に並べる
 * （DESIGN.md §7「件数と備え」）。結果の行は開閉する行で、閉じた行は四字熟語辞典の一覧の行と同じ値を同じ位置に
 * 見せる。語と読み、種別のカテゴリと補助情報の難易度、意味の順で、開くと例文・出典・構造が出る（§7・§8）。
 * カテゴリで絞り込めることも、やさしい順が何の順かも、行で確かめられる。
 *
 * 絞り込み・並び順・ページは URL のクエリに持ち、詳細を開いて戻っても同じ状態で出る。
 */
export default function YojiSearchTile({ as, className }: YojiSearchTileProps) {
  const {
    state,
    slice,
    announcement,
    clear,
    filtering,
    matched,
    searchRef,
    setFilter,
    setKind,
    setPage,
    setQuery,
    setSort,
    statusRef,
  } = useListBrowseState({
    items: YOJI_SEARCH_ITEMS,
    spec: YOJI_SEARCH_SPEC,
    unit: "語",
    perPage: YOJI_SEARCH_PER_PAGE,
  });

  // 開いた行を1つに保つ。ほかの行を開くと、前に開いていた行は閉じる。
  const [openYoji, setOpenYoji] = useState<string | null>(null);

  return (
    <Panel as={as} className={className}>
      <ListStack>
        <div className={styles.head}>
          <ListStatus
            ref={statusRef}
            total={YOJI_SEARCH_ITEMS.length}
            matched={matched}
            filtering={filtering}
            unit="語"
            range={
              slice.pageCount > 1
                ? { start: slice.start, end: slice.end }
                : undefined
            }
            announcement={announcement}
            onClear={clear}
          />
          <ListControls
            searchLabel="語・読み・意味・例文で探す"
            searchRef={searchRef}
            query={state.query}
            onQueryChange={setQuery}
            kindGroup={{
              legend: "カテゴリ",
              options: YOJI_SEARCH_SPEC.kinds,
              value: state.kind,
              onChange: setKind,
            }}
            filterGroups={[LEVEL_GROUP, ORIGIN_GROUP].map((group) => ({
              legend: group.legend,
              options: group.options,
              value: state.filters[group.param],
              onChange: (value) => setFilter(group.param, value),
            }))}
            sortGroup={{
              legend: "並び順",
              options: YOJI_SEARCH_SPEC.sorts,
              value: state.sort,
              onChange: setSort,
            }}
          />
        </div>
        {slice.items.length > 0 ? (
          <div>
            <ul className={styles.resultList}>
              {slice.items.map(({ entry, kind, facts = [] }) => (
                <li key={entry.yoji} className={styles.resultItem}>
                  <DisclosureRow
                    open={openYoji === entry.yoji}
                    onToggle={() =>
                      setOpenYoji((current) =>
                        current === entry.yoji ? null : entry.yoji,
                      )
                    }
                    headClassName={styles.resultHead}
                    nameClassName={styles.yojiText}
                    descriptionClassName={styles.resultDescription}
                    name={entry.yoji}
                    description={
                      <>
                        <span className={styles.reading}>{entry.reading}</span>{" "}
                        <span className={styles.meta}>
                          <span>{kind}</span>
                          {facts.map((fact) => (
                            <Fragment key={fact.text}>
                              {" "}
                              <span>{fact.text}</span>
                            </Fragment>
                          ))}
                        </span>{" "}
                        <span className={styles.meaning}>{entry.meaning}</span>
                      </>
                    }
                  >
                    <YojiDetail entry={entry} />
                  </DisclosureRow>
                </li>
              ))}
            </ul>
            <Pagination
              mode="button"
              currentPage={slice.page}
              totalPages={slice.pageCount}
              onPageChange={setPage}
            />
          </div>
        ) : null}
      </ListStack>
    </Panel>
  );
}
