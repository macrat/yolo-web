import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    // Redirect old category URLs to /blog (301 permanent)
    // These categories were removed in the category reorganization (B-083)
    const oldCategories = [
      "decision",
      "collaboration",
      "failure",
      "entertainment",
      "learning",
      "milestone",
    ];

    const oldCategoryRedirects = oldCategories.map((category) => ({
      source: `/blog/category/${category}`,
      destination: "/blog",
      permanent: true,
    }));

    // Redirect /page/1 URLs to their canonical equivalents (301 permanent)
    const paginationRedirects = [
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
    ];

    // Redirect old /games URLs to /play (301 permanent)
    // Migrated in cycle-100 (B-201): games section is now under /play
    const gamesRedirects = [
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
    ];

    // Redirect old /quiz URLs to /play (301 permanent)
    // Migrated in cycle-102 (B-206): quiz and fortune sections are now under /play
    const quizRedirects = [
      {
        source: "/quiz",
        destination: "/play",
        permanent: true,
      },
      {
        source: "/quiz/:slug",
        destination: "/play/:slug",
        permanent: true,
      },
      {
        source: "/quiz/:slug/result/:path*",
        destination: "/play/:slug/result/:path*",
        permanent: true,
      },
    ];

    // Redirect old /fortune URLs to /play (301 permanent)
    // Migrated in cycle-102 (B-206): fortune section is now under /play
    const fortuneRedirects = [
      {
        source: "/fortune/daily",
        destination: "/play/daily",
        permanent: true,
      },
    ];

    // Redirect old /colors URLs to /dictionary/colors (308 permanent)
    // Migrated in cycle-50 (B-122): colors is now under the dictionary section
    const colorsRedirects = [
      {
        source: "/colors",
        destination: "/dictionary/colors",
        permanent: true,
      },
      {
        source: "/colors/category/:category",
        destination: "/dictionary/colors/category/:category",
        permanent: true,
      },
      {
        source: "/colors/:slug",
        destination: "/dictionary/colors/:slug",
        permanent: true,
      },
    ];

    return [
      ...oldCategoryRedirects,
      ...paginationRedirects,
      ...gamesRedirects,
      ...quizRedirects,
      ...fortuneRedirects,
      ...colorsRedirects,
    ];
  },
};

export default nextConfig;
