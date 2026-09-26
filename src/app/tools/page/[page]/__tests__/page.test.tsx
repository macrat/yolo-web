import { describe, expect, test } from "vitest";
import ToolsPaginatedPage, {
  dynamicParams,
  generateStaticParams,
} from "../page";
import { TOOL_LIST_PER_PAGE } from "@/tools/_lib/tool-list";
import { listPageCount } from "@/lib/list-pages";
import { allToolMetas } from "@/tools/registry";

describe("/tools/page/[page]", () => {
  test("2ページ目から最後のページまでだけを静的に生成し、ほかの番号は生成しない", () => {
    expect(dynamicParams).toBe(false);
    const count = listPageCount(allToolMetas.length, TOOL_LIST_PER_PAGE);
    expect(generateStaticParams()).toEqual(
      Array.from({ length: count - 1 }, (_, index) => ({
        page: String(index + 2),
      })),
    );
  });

  test.each(["0", "1", "abc", "02", String(allToolMetas.length)])(
    "範囲の外の番号 %s は 404",
    async (page) => {
      await expect(
        ToolsPaginatedPage({ params: Promise.resolve({ page }) }),
      ).rejects.toThrow();
    },
  );
});
