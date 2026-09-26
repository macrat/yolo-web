"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type RefObject,
} from "react";
import {
  ALL,
  browseItems,
  browseSearch,
  isFiltered,
  readBrowseState,
  slicePage,
  statusText,
  type BrowseItem,
  type BrowsePageSlice,
  type BrowseSpec,
  type BrowseState,
  type BrowseUnit,
} from "@/lib/list-browse";

/** 名前の条件を URL へ書くまでの待ち。打鍵のたびに履歴を書き換えないため。 */
const QUERY_WRITE_DELAY_MS = 300;

/**
 * 読み上げに渡した件数の文を空に戻すまでの待ち。読み上げソフトは、打った字や変換の読み上げを終えてから
 * 丁寧なライブリージョンの文を読むので、読むまでのあいだに消えない長さにする。空に戻すのは、ページを
 * 読み進めた来訪者に、見えている件数の行と同じ文を2度聞かせないため。空に戻したことは読み上げられない。
 */
const ANNOUNCEMENT_CLEAR_DELAY_MS = 5000;

// URL のクエリを React の外の値として読む。useSearchParams を使うと、静的な HTML から道具が抜けて
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
 * いまのパスのクエリを書き換え、クエリの購読者に知らせる。Next.js はネイティブの pushState・replaceState を
 * ルーターと同期させるので、ページの再取得は起きない。
 */
function writeSearch(search: string, method: "push" | "replace"): void {
  const url = `${window.location.pathname}${search}`;
  if (method === "push") {
    window.history.pushState(null, "", url);
  } else {
    window.history.replaceState(null, "", url);
  }
  for (const listener of searchListeners) listener();
}

interface ListBrowseOptions<T extends BrowseItem> {
  /** 範囲の全件。既定の並び順で渡す。 */
  items: readonly T[];
  /** 種別・道具ごとの組・並び順の選択肢。組を出さないものは空にする。 */
  spec: BrowseSpec;
  unit: BrowseUnit;
  /** 1ページの件数。渡さなければ全件を1ページに並べる。 */
  perPage?: number;
}

export interface ListBrowseState<T extends BrowseItem> {
  /** いまの状態。名前の条件は、URL へ書く前の欄の値。 */
  state: BrowseState;
  /** 表示しているページ。 */
  slice: BrowsePageSlice<T>;
  /** 条件に合う件数。 */
  matched: number;
  /** 名前・種別・道具ごとの組のどれかで絞っているか。 */
  filtering: boolean;
  /** 読み上げに伝える件数の文。ListStatus へ渡す。 */
  announcement: string;
  /** 件数の行。ページを送ったあとに、ここへフォーカスを移す。 */
  statusRef: RefObject<HTMLParagraphElement | null>;
  /** 名前の欄。「絞り込みを外す」のあとに、ここへフォーカスを移す。 */
  searchRef: RefObject<HTMLInputElement | null>;
  setQuery: (query: string) => void;
  setKind: (kind: string) => void;
  setFilter: (param: string, value: string) => void;
  setSort: (sort: string) => void;
  setPage: (page: number) => void;
  /** 名前の条件と、種別・道具ごとの組の絞り込みを外す。並び順は残す。 */
  clear: () => void;
}

/**
 * 道具の中の一覧の状態（DESIGN.md §7「件数と備え」）。名前の条件・種別・道具ごとの組・並び順・ページを、
 * 道具のパスのクエリ（q・kind・sort・page と組ごとの名前）に持つ。詳細を開いて戻っても、同じ状態で出る。
 *
 * 名前の条件は URL へ 300ms 遅れて書き、書くまでは欄の値で絞る。絞り込みと並び順は replaceState で書き、
 * 戻るのボタンが打鍵のたびに道具の中で止まらないようにする。ページは pushState で書き、送ったあとは件数の行へ
 * フォーカスを移す。条件を変えて件数が変わったときだけ、その件数を読み上げに渡す。
 */
export function useListBrowseState<T extends BrowseItem>({
  items,
  spec,
  unit,
  perPage = Math.max(items.length, 1),
}: ListBrowseOptions<T>): ListBrowseState<T> {
  const search = useSyncExternalStore(
    subscribeSearch,
    readSearch,
    readServerSearch,
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

  const shown = useMemo(
    () => browseItems(items, { ...urlState, query }, spec),
    [items, spec, urlState, query],
  );
  const slice = slicePage(shown, state.page, perPage);

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

  // いまの URL の状態に変更を重ねて書く。条件を変えたら1ページ目に戻す。
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
    writeSearch(browseSearch(next, spec), method);
  };

  const setQuery = (value: string) => {
    setTypedQuery(value);
    cancelQueryWrite();
    queryTimer.current = setTimeout(() => {
      queryTimer.current = null;
      writeState({ query: value }, "replace");
    }, QUERY_WRITE_DELAY_MS);
  };

  // 押したボタンは該当が0件でなくなると消えるので、フォーカスを名前の欄へ移す。外したあとの次の操作は
  // 探し直しで、欄に打てばそのまま一覧が絞られる。
  const clear = () => {
    setTypedQuery("");
    writeState(
      {
        query: "",
        kind: ALL,
        filters: Object.fromEntries(
          spec.filterGroups.map((group) => [group.param, ALL]),
        ),
      },
      "replace",
    );
    (searchRef.current ?? statusRef.current)?.focus();
  };

  const setPage = (next: number) => {
    focusStatusAfterPageChange.current = true;
    writeState({ page: next }, "push");
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

  // ページを送ったあとは、件数の行にフォーカスを移し、行を画面の上に出す。キーボードと読み上げの来訪者が、
  // 送った先で一覧の頭を探し直さずに済むようにする。ページ送りのボタンが端で押した項目の代わりにフォーカスを
  // 移す処理は子の useEffect で先に走るので、件数の行が最後に効く。
  useEffect(() => {
    if (!focusStatusAfterPageChange.current) return;
    focusStatusAfterPageChange.current = false;
    const status = statusRef.current;
    if (!status) return;
    status.scrollIntoView({ block: "start" });
    status.focus({ preventScroll: true });
  }, [slice.page]);

  return {
    state,
    slice,
    matched: shown.length,
    filtering: isFiltered(state),
    announcement,
    statusRef,
    searchRef,
    setQuery,
    setKind: (kind) => writeState({ kind }, "replace"),
    setFilter: (param, value) =>
      writeState(
        { filters: { ...urlState.filters, [param]: value } },
        "replace",
      ),
    setSort: (sort) => writeState({ sort }, "replace"),
    setPage,
    clear,
  };
}
