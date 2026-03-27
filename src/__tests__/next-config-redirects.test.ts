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

  test("/games redirects to /play (301 permanent)", async () => {
    const redirects = await nextConfig.redirects?.();
    expect(redirects).toBeDefined();

    expect(redirects).toEqual(
      expect.arrayContaining([
        {
          source: "/games",
          destination: "/play",
          permanent: true,
        },
        {
          source: "/games/:slug",
          destination: "/play/:slug",
          permanent: true,
        },
      ]),
    );
  });

  test("旧カテゴリURLが新カテゴリURLへ301リダイレクトされること", async () => {
    const redirects = await nextConfig.redirects?.();
    expect(redirects).toBeDefined();

    // 各旧カテゴリページ -> 新カテゴリページ
    expect(redirects).toEqual(
      expect.arrayContaining([
        {
          source: "/blog/category/technical",
          destination: "/blog/category/dev-notes",
          permanent: true,
        },
        {
          source: "/blog/category/ai-ops",
          destination: "/blog/category/ai-workflow",
          permanent: true,
        },
        {
          source: "/blog/category/release",
          destination: "/blog/category/site-updates",
          permanent: true,
        },
        {
          source: "/blog/category/guide",
          destination: "/blog/category/tool-guides",
          permanent: true,
        },
        {
          source: "/blog/category/behind-the-scenes",
          destination: "/blog/category/ai-workflow",
          permanent: true,
        },
      ]),
    );
  });

  test("旧カテゴリのページネーションURLが新カテゴリURLへ301リダイレクトされること", async () => {
    const redirects = await nextConfig.redirects?.();
    expect(redirects).toBeDefined();

    // 各旧カテゴリのページネーション -> 新カテゴリページネーション
    expect(redirects).toEqual(
      expect.arrayContaining([
        {
          source: "/blog/category/technical/page/:path*",
          destination: "/blog/category/dev-notes/page/:path*",
          permanent: true,
        },
        {
          source: "/blog/category/ai-ops/page/:path*",
          destination: "/blog/category/ai-workflow/page/:path*",
          permanent: true,
        },
        {
          source: "/blog/category/release/page/:path*",
          destination: "/blog/category/site-updates/page/:path*",
          permanent: true,
        },
        {
          source: "/blog/category/guide/page/:path*",
          destination: "/blog/category/tool-guides/page/:path*",
          permanent: true,
        },
        {
          source: "/blog/category/behind-the-scenes/page/:path*",
          destination: "/blog/category/ai-workflow/page/:path*",
          permanent: true,
        },
      ]),
    );
  });
});
