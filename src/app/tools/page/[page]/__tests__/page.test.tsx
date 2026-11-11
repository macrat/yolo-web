import { describe, expect, test } from "vitest";
import ToolsPaginatedPage, {
  dynamicParams,
  generateStaticParams,
} from "../page";
import {
  TOOL_LIST_BASE_PATH,
  TOOL_LIST_PER_PAGE,
} from "@/tools/_lib/tool-list";
import { listPageCount, listPageHref } from "@/lib/list-pages";
import { allToolMetas } from "@/tools/registry";

describe("/tools/page/[page]", () => {
  const count = listPageCount(allToolMetas.length, TOOL_LIST_PER_PAGE);
  const pages = generateStaticParams().map(({ page }) => Number(page));
  const forwardedPages = pages.filter((page) => page > count);

  test("2ページ目から最後のページまでと、その後ろの送る番号だけを静的に生成する", () => {
    expect(dynamicParams).toBe(false);
    expect(pages).toEqual(pages.map((_, index) => index + 2));
    expect(pages.length).toBeGreaterThanOrEqual(count - 1);
  });

  test("最後のページより後ろの生成する番号は、一覧のいまあるページへ 308 で送る", async () => {
    const destinations = Array.from({ length: count }, (_, index) =>
      listPageHref(TOOL_LIST_BASE_PATH, index + 1),
    );
    for (const page of forwardedPages) {
      const error = await ToolsPaginatedPage({
        params: Promise.resolve({ page: String(page) }),
      }).catch((thrown: { digest?: string }) => thrown);
      const [kind, , destination, status] = (
        (error as { digest?: string }).digest ?? ""
      ).split(";");
      expect(kind).toBe("NEXT_REDIRECT");
      expect(status).toBe("308");
      expect(destinations).toContain(destination);
    }
  });

  test.each([
    "0",
    "1",
    "abc",
    "02",
    String((pages.at(-1) ?? 1) + 1),
    String(allToolMetas.length),
    "99999",
  ])("生成しない番号 %s は 404", async (page) => {
    await expect(
      ToolsPaginatedPage({ params: Promise.resolve({ page }) }),
    ).rejects.toMatchObject({
      digest: expect.stringContaining("NEXT_HTTP_ERROR_FALLBACK;404"),
    });
  });
});
