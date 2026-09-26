import { describe, expect, test } from "vitest";
import PlayPaginatedPage, {
  dynamicParams,
  generateStaticParams,
} from "../page";
import { PLAY_LIST_PER_PAGE } from "@/play/play-list";
import { listPageCount } from "@/lib/list-pages";
import { allPlayContents } from "@/play/registry";

describe("/play/page/[page]", () => {
  test("2ページ目から最後のページまでだけを静的に生成し、ほかの番号は生成しない", () => {
    expect(dynamicParams).toBe(false);
    const count = listPageCount(allPlayContents.length, PLAY_LIST_PER_PAGE);
    expect(generateStaticParams()).toEqual(
      Array.from({ length: count - 1 }, (_, index) => ({
        page: String(index + 2),
      })),
    );
  });

  test.each(["0", "1", "abc", "02", String(allPlayContents.length)])(
    "範囲の外の番号 %s は 404",
    async (page) => {
      await expect(
        PlayPaginatedPage({ params: Promise.resolve({ page }) }),
      ).rejects.toThrow();
    },
  );
});
