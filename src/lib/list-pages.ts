/**
 * 一覧のページの経路（`{元のパス}/page/{n}`）で使う関数。1ページ目はいつも元のパスで、`/page/1` は
 * next.config.ts が元のパスへ 308 で送る。2ページ目からを静的に生成し、それ以外の番号は 404 にする。
 *
 * 経路のファイルは `export const dynamicParams = false` を持ち、generateStaticParams に
 * listPageStaticParams を返す。範囲の外の番号は、ビルドでもここでも 404 になる。
 */

import { notFound } from "next/navigation";
import { SITE_NAME } from "@/lib/constants";

/** ページの数。項目が無くても1ページ。 */
export function listPageCount(total: number, perPage: number): number {
  return Math.max(1, Math.ceil(total / perPage));
}

/** ページ n の URL。1ページ目は元のパス。 */
export function listPageHref(basePath: string, page: number): string {
  return page === 1 ? basePath : `${basePath}/page/${page}`;
}

/** 2ページ目から最後のページまでの `page` の値。 */
export function listPageStaticParams(
  total: number,
  perPage: number,
): Array<{ page: string }> {
  const count = listPageCount(total, perPage);
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

/** 経路の `page` の値をページの番号にする。範囲の外なら 404。 */
export function listPageFromParam(
  param: string,
  total: number,
  perPage: number,
): number {
  const page = parseListPage(param, total, perPage);
  if (page === null) notFound();
  return page;
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
