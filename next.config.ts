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

    return [...oldCategoryRedirects, ...paginationRedirects];
  },
};

export default nextConfig;
