/**
 * 一覧のページの経路（`{元のパス}/page/{n}`）で使う関数。1ページ目はいつも元のパスで、`/page/1` は
 * next.config.ts が元のパスへ 308 で送る。2ページ目から最後のページまでを静的に生成し、それ以外の番号は 404 にする。
 *
 * 検索結果やブックマークに、いまより少ない件数で区切ったページ番号が残っている一覧は、その区切り
 * （ListPageForwarding）を渡す。最後のページより後ろで、その区切りにはあった番号を、その番号の項目が
 * 載っているいまのページへ 308 で送る。送る番号は項目の数で決まる限られた数なので、送るページも静的に生成し、
 * それより大きい番号は 404 のままにして、検索エンジンに際限のない URL を見せない。
 *
 * 経路のファイルは `export const dynamicParams = false` を持ち、generateStaticParams に
 * listPageStaticParams を返す。そこに無い番号は、ビルドでもここでも 404 になる。
 */

import { notFound, permanentRedirect } from "next/navigation";
import { SITE_NAME } from "@/lib/constants";

/** 最後のページより後ろの番号を、いまのページへ送る一覧の設定。 */
export interface ListPageForwarding {
  /** 一覧の元のパス。送り先の URL を組む。 */
  basePath: string;
  /** 送る番号を数える区切り（1ページの件数）。一覧の1ページの件数より少ない。 */
  perPage: number;
}

/** ページの数。項目が無くても1ページ。 */
export function listPageCount(total: number, perPage: number): number {
  return Math.max(1, Math.ceil(total / perPage));
}

/** ページ n の URL。1ページ目は元のパス。 */
export function listPageHref(basePath: string, page: number): string {
  return page === 1 ? basePath : `${basePath}/page/${page}`;
}

/** 2ページ目から最後のページまでの `page` の値。送る番号を持つ一覧は、その番号も続けて返す。 */
export function listPageStaticParams(
  total: number,
  perPage: number,
  forwarding?: ListPageForwarding,
): Array<{ page: string }> {
  const count = Math.max(
    listPageCount(total, perPage),
    forwarding ? listPageCount(total, forwarding.perPage) : 1,
  );
  return Array.from({ length: count - 1 }, (_, index) => ({
    page: String(index + 2),
  }));
}

/** `page` の値が2ページ目から最後のページまでの番号なら、その番号。先頭の 0 や符号の付いた書き方は認めない。 */
export function parseListPage(
  param: string,
  total: number,
  perPage: number,
): number | null {
  if (!/^[1-9][0-9]*$/.test(param)) return null;
  const page = Number(param);
  return page >= 2 && page <= listPageCount(total, perPage) ? page : null;
}

/**
 * 送る番号の送り先。`forwarding` の区切りでページ n に載る項目のうち、まんなかの項目が、1ページ `perPage` 件の
 * 区切りで載っているページの URL。n の項目がいまの2つのページにまたがるときは、多くが載っているほうになる。
 */
export function forwardedListPageHref(
  page: number,
  total: number,
  perPage: number,
  forwarding: ListPageForwarding,
): string {
  const firstItemIndex = (page - 1) * forwarding.perPage;
  const lastItemIndex = Math.min(page * forwarding.perPage, total) - 1;
  const middleItemIndex = Math.floor((firstItemIndex + lastItemIndex) / 2);
  return listPageHref(
    forwarding.basePath,
    Math.floor(middleItemIndex / perPage) + 1,
  );
}

/** 経路の `page` の値をページの番号にする。送る番号なら送り先へ 308 で送り、どちらでもなければ 404。 */
export function listPageFromParam(
  param: string,
  total: number,
  perPage: number,
  forwarding?: ListPageForwarding,
): number {
  const page = parseListPage(param, total, perPage);
  if (page !== null) return page;
  const forwardedPage = forwarding
    ? parseListPage(param, total, forwarding.perPage)
    : null;
  if (forwarding && forwardedPage !== null) {
    permanentRedirect(
      forwardedListPageHref(forwardedPage, total, perPage, forwarding),
    );
  }
  notFound();
}

function decodePath(path: string): string {
  try {
    return decodeURI(path);
  } catch {
    return path;
  }
}

/**
 * パスが一覧のどのページを指すか。元のパスなら1、`{元のパス}/page/{n}` なら n、ほかは null。
 * パスは百分率符号化されていてもよい（タグのような和文のパス）。
 */
export function listPageFromPath(
  pathname: string,
  basePath: string,
): number | null {
  const path = decodePath(pathname).replace(/\/$/, "");
  const base = decodePath(basePath).replace(/\/$/, "");
  if (path === base) return 1;
  const prefix = `${base}/page/`;
  if (!path.startsWith(prefix)) return null;
  const rest = path.slice(prefix.length);
  return /^[1-9][0-9]*$/.test(rest) && Number(rest) >= 2 ? Number(rest) : null;
}

/** ページの題。2ページ目からは「（n ページ目）」を添え、タブと履歴でページを見分けられるようにする。 */
export function listPageTitle(title: string, page: number): string {
  return page === 1
    ? `${title} | ${SITE_NAME}`
    : `${title}（${page}ページ目） | ${SITE_NAME}`;
}
