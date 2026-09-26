"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { usePathname } from "next/navigation";
import ItemList, { type ItemListItem } from "@/components/ItemList";
import ListControls from "@/components/ListControls";
import ListStatus from "@/components/ListStatus";
import Pagination from "@/components/Pagination";
import {
  ALL,
  browseItems,
  browseSearch,
  isDefaultBrowseState,
  isFiltered,
  readBrowseState,
  slicePage,
  statusText,
  type BrowseChoice,
  type BrowseItem,
  type BrowseSort,
  type BrowseSpec,
  type BrowseState,
  type BrowseUnit,
} from "@/lib/list-browse";
import {
  listPageFromPath,
  listPageHref,
  listPageTitle,
} from "@/lib/list-pages";
import styles from "./BrowsableList.module.css";

/** 一覧のページが操作を持つのは、範囲がこの件数を超えるとき（§7）。 */
const CONTROLS_THRESHOLD = 10;

/** 名前の条件を URL へ書くまでの待ち。打鍵のたびに履歴を書き換えないため。 */
const QUERY_WRITE_DELAY_MS = 300;

/**
 * 読み上げに渡した件数の文を空に戻すまでの待ち。読み上げソフトは、打った字や変換の読み上げを終えてから
 * 丁寧なライブリージョンの文を読むので、読むまでのあいだに消えない長さにする。空に戻すのは、ページを
 * 読み進めた来訪者に、見えている件数の行と同じ文を2度聞かせないため。空に戻したことは読み上げられない。
 */
const ANNOUNCEMENT_CLEAR_DELAY_MS = 5000;

// URL のクエリを React の外の値として読む。useSearchParams を使うと、静的な HTML からこの部品が抜けて
// クライアントでしか描かれなくなるため。サーバーとハイドレーションでは既定の状態（空のクエリ）として描き、
// 静的な HTML とハイドレーションの最初の描画を同じにする。
const searchListeners = new Set<() => void>();

function subscribeSearch(listener: () => void): () => void {
  searchListeners.add(listener);
  window.addEventListener("popstate", listener);
  return () => {
    searchListeners.delete(listener);
    window.removeEventListener("popstate", listener);
  };
}

function readSearch(): string {
  return window.location.search;
}

function readServerSearch(): string {
  return "";
}

/**
 * URL を書き換え、クエリの購読者に知らせる。Next.js はネイティブの pushState・replaceState をルーターと
 * 同期させるので、パスを替えてもページの再取得は起きない。
 */
function writeUrl(url: string, method: "push" | "replace"): void {
  if (method === "push") {
    window.history.pushState(null, "", url);
  } else {
    window.history.replaceState(null, "", url);
  }
  for (const listener of searchListeners) listener();
}

// link モードのページ送りで押したリンクの行き先。ページ送りでは押したリンクが遷移で消えるので、行き先で
// 描かれた一覧が、このパスに着いたときだけ件数の行へフォーカスを移す。ほかのページから一覧を開いたときは
// 記録が無いので、フォーカスを動かさない。
let pendingFocusPath: string | null = null;

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
 * 一覧のページの一覧（DESIGN.md §7「件数と備え」）。件数の行・名前の欄・畳める枠・行の一覧・ページ送りを組み、
 * 状態を URL に持つ。
 *
 * 既定の状態（名前の条件が空・種別が「すべて」・並び順が既定）では、ページは URL のパスで、どのページも
 * 静的な HTML に入る。既定でない状態は、範囲の全件からクライアントで組み、元のパスのクエリに持つ。
 * 既定でない状態に入ると、パスを元のパスに替える。Next.js はそのとき再取得せず、いまの木をそのまま残すので、
 * 表示するページは props でなく、そのときの URL のパスとクエリから決める。
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
  const search = useSyncExternalStore(
    subscribeSearch,
    readSearch,
    readServerSearch,
  );
  // Next.js の遷移は pushState を自分で呼ぶので、購読しているクエリの変化としては届かない。パスが替わった
  // ことはルーターの値から受け取る。
  const pathname = usePathname();
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
  const urlState = useMemo(() => readBrowseState(search, spec), [search, spec]);

  // 名前の欄の条件は URL へ遅れて書くので、書くまでは部品の中の値を使う。null のあいだは URL の値に従う。
  const [typedQuery, setTypedQuery] = useState<string | null>(null);
  const query = typedQuery ?? urlState.query;
  const queryPending = typedQuery !== null && typedQuery !== urlState.query;
  const state: BrowseState = {
    ...urlState,
    query,
    page: queryPending ? 1 : urlState.page,
  };
  const isDefault = isDefaultBrowseState(state, spec);
  const filtering = isFiltered(state);

  const shown = useMemo(
    () => browseItems(items, { ...urlState, query }, spec),
    [items, spec, urlState, query],
  );
  const shownPage = isDefault
    ? (listPageFromPath(pathname, basePath) ?? page)
    : state.page;
  const slice = slicePage(shown, shownPage, perPage);

  // 読み上げに伝える件数は、URL に書いた落ち着いた条件から数える。名前の欄に打っている途中の件数を
  // 読み上げの予約に積まないため。表示している範囲は入れず、ページを送っても文が替わらないようにする。
  const settledShown = useMemo(
    () => (queryPending ? browseItems(items, urlState, spec) : shown),
    [queryPending, items, urlState, spec, shown],
  );
  const settledText = statusText({
    total: items.length,
    matched: settledShown.length,
    filtering: isFiltered(urlState),
    unit,
  });
  // 来訪者が条件を変えるまでは読み上げない。クエリのある URL に着いたときのハイドレーションの組み替えで
  // 読ませないため。
  const [conditionsTouched, setConditionsTouched] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const [lastSettledText, setLastSettledText] = useState(settledText);
  if (settledText !== lastSettledText) {
    setLastSettledText(settledText);
    if (conditionsTouched) setAnnouncement(settledText);
  }
  // 読み上げに渡した文は、読まれる間を置いてから空に戻す。
  useEffect(() => {
    if (announcement === "") return;
    const timer = setTimeout(
      () => setAnnouncement(""),
      ANNOUNCEMENT_CLEAR_DELAY_MS,
    );
    return () => clearTimeout(timer);
  }, [announcement]);

  const statusRef = useRef<HTMLParagraphElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const focusStatusAfterPageChange = useRef(false);
  const queryTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelQueryWrite = () => {
    if (queryTimer.current !== null) {
      clearTimeout(queryTimer.current);
      queryTimer.current = null;
    }
  };

  // いまの URL の状態に変更を重ねて書く。既定の状態に戻ったら元のパス（1ページ目）にする。
  const writeState = (
    change: Partial<BrowseState>,
    method: "push" | "replace",
  ) => {
    cancelQueryWrite();
    setConditionsTouched(true);
    const next: BrowseState = {
      ...readBrowseState(window.location.search, spec),
      query,
      page: 1,
      ...change,
    };
    const url = isDefaultBrowseState(next, spec)
      ? basePath
      : `${basePath}${browseSearch(next, spec)}`;
    writeUrl(url, method);
  };

  const handleQueryChange = (value: string) => {
    setTypedQuery(value);
    cancelQueryWrite();
    queryTimer.current = setTimeout(() => {
      queryTimer.current = null;
      writeState({ query: value }, "replace");
    }, QUERY_WRITE_DELAY_MS);
  };

  // 押したボタンは該当が0件でなくなると消えるので、フォーカスを名前の欄へ移す。外したあとの次の操作は
  // 探し直しで、欄に打てばそのまま一覧が絞られる。欄を持たない10件以下の一覧では件数の行へ移す。
  const handleClear = () => {
    setTypedQuery("");
    writeState({ query: "", kind: ALL }, "replace");
    (searchRef.current ?? statusRef.current)?.focus();
  };

  const handlePageButton = (next: number) => {
    focusStatusAfterPageChange.current = true;
    writeState({ page: next }, "push");
  };

  const handlePageLink = (next: number) => {
    pendingFocusPath = listPageHref(basePath, next);
  };

  // 戻る・進むで URL が替わったら、名前の欄を URL の値に戻す。
  useEffect(() => {
    const followUrl = () => {
      setConditionsTouched(true);
      setTypedQuery(null);
    };
    window.addEventListener("popstate", followUrl);
    return () => {
      window.removeEventListener("popstate", followUrl);
      cancelQueryWrite();
    };
  }, []);

  // replaceState では <title> が替わらないので、URL のパスが示すページの題にタブと履歴の名前を合わせる。
  useEffect(() => {
    const pathPage = listPageFromPath(window.location.pathname, basePath);
    if (pathPage === null) return;
    const title = listPageTitle(pageTitle, pathPage);
    if (document.title !== title) document.title = title;
  }, [pathname, search, basePath, pageTitle]);

  // ページを送ったあとは、件数の行にフォーカスを移し、行を画面の上に出す。キーボードと読み上げの来訪者が、
  // 送った先で一覧の頭を探し直さずに済むようにする。Next.js の遷移は描画の確定の段で新しいセグメントの先頭へ
  // スクロールしてフォーカスを移すので、この処理は useEffect に置いてそのあとに走らせる。ページ送りの
  // ボタンが端で押した項目の代わりにフォーカスを移す処理も子の useEffect で先に走るので、件数の行が最後に効く。
  useEffect(() => {
    const status = statusRef.current;
    const linkArrived =
      pendingFocusPath !== null &&
      listPageFromPath(pendingFocusPath, basePath) ===
        listPageFromPath(pathname, basePath);
    if (pendingFocusPath !== null && !linkArrived) {
      pendingFocusPath = null;
    }
    if (!linkArrived && !focusStatusAfterPageChange.current) return;
    pendingFocusPath = null;
    focusStatusAfterPageChange.current = false;
    if (!status) return;
    status.scrollIntoView({ block: "start" });
    status.focus({ preventScroll: true });
  }, [pathname, slice.page, basePath]);

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
    <div className={styles.browsable}>
      <div className={styles.head}>
        <ListStatus
          ref={statusRef}
          total={items.length}
          matched={shown.length}
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
          onClear={handleClear}
        />
        {hasControls ? (
          <ListControls
            searchLabel={searchLabel}
            searchRef={searchRef}
            query={query}
            onQueryChange={handleQueryChange}
            kindGroup={
              showKindGroup && kindGroup
                ? {
                    legend: kindGroup.legend,
                    options: kindOptions,
                    value: state.kind,
                    onChange: (kind) => writeState({ kind }, "replace"),
                  }
                : undefined
            }
            sortGroup={
              showSortGroup
                ? {
                    legend: "並び順",
                    options: sorts,
                    value: state.sort,
                    onChange: (sort) => writeState({ sort }, "replace"),
                  }
                : undefined
            }
          />
        ) : null}
      </div>
      {pageItems.length > 0 ? (
        <div>
          <ItemList label={label} items={pageItems} showKind={showKind} />
          {isDefault ? (
            <Pagination
              currentPage={slice.page}
              totalPages={slice.pageCount}
              basePath={basePath}
              onNavigate={handlePageLink}
            />
          ) : (
            <Pagination
              mode="button"
              currentPage={slice.page}
              totalPages={slice.pageCount}
              onPageChange={handlePageButton}
            />
          )}
        </div>
      ) : null}
    </div>
  );
}
