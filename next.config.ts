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
      ...colorsRedirects,
    ];
  },
};

export default nextConfig;
