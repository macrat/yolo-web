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

    return oldCategories.map((category) => ({
      source: `/blog/category/${category}`,
      destination: "/blog",
      permanent: true,
    }));
  },
};

export default nextConfig;
