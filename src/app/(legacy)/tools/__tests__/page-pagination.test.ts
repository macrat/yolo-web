import { describe, expect, test } from "vitest";
import { allToolMetas } from "@/tools/registry";
import { TOOLS_PER_PAGE } from "@/lib/pagination";
import {
  dynamicParams,
  generateStaticParams,
} from "@/app/(new)/tools/page/[page]/route";

const totalPages = Math.ceil(allToolMetas.length / TOOLS_PER_PAGE);

describe("/tools/page/[page] static params", () => {
  test("dynamicParams=false と generateStaticParams が整合している", () => {
    expect(dynamicParams).toBe(false);

    const staticParams = generateStaticParams();
    const pages = staticParams.map(({ page }) => Number(page));
    const expectedPages = Array.from(
      { length: Math.max(totalPages - 1, 0) },
      (_, i) => i + 2,
    );

    expect(pages).toEqual(expectedPages);
    expect(pages).not.toContain(0);
    expect(pages).not.toContain(1);

    if (totalPages >= 2) {
      expect(pages[pages.length - 1]).toBe(totalPages);
    } else {
      expect(pages).toEqual([]);
    }
  });
});
