import { describe, expect, test } from "vitest";
import nextConfig from "../../next.config";

describe("next.config redirects", () => {
  test("/page/1 canonical redirects are defined", async () => {
    const redirects = await nextConfig.redirects?.();
    expect(redirects).toBeDefined();

    expect(redirects).toEqual(
      expect.arrayContaining([
        {
          source: "/tools/page/1",
          destination: "/tools",
          permanent: true,
        },
        {
          source: "/blog/page/1",
          destination: "/blog",
          permanent: true,
        },
        {
          source: "/blog/category/:category/page/1",
          destination: "/blog/category/:category",
          permanent: true,
        },
      ]),
    );
  });
});
