import { permanentRedirect } from "next/navigation";
import { allToolMetas } from "@/tools/registry";
import { TOOLS_PER_PAGE } from "@/lib/pagination";

/**
 * /tools/page/[page] → /tools への 301 リダイレクト。
 *
 * cycle-181 B-334-4: ページネーション廃止に伴い、
 * 全ツールを /tools の 1 ページに統合した。
 * 既存の /tools/page/2 等の URL からアクセスされた場合、
 * /tools に永続リダイレクトする。
 */

export const dynamicParams = false;

export function generateStaticParams(): Array<{ page: string }> {
  const totalPages = Math.ceil(allToolMetas.length / TOOLS_PER_PAGE);
  const params: Array<{ page: string }> = [];

  for (let i = 2; i <= totalPages; i++) {
    params.push({ page: String(i) });
  }

  return params;
}

export function GET() {
  permanentRedirect("/tools");
}
