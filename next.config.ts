import type { NextConfig } from "next";

const isCFPages = process.env.CF_PAGES === "1";

const nextConfig: NextConfig = {
  // For Cloudflare Pages static export: CF_PAGES=1 npm run build
  ...(isCFPages && {
    output: "export",
    trailingSlash: true,
  }),
  // Redirect old feed URLs to new canonical paths (non-CF builds only)
  ...(!isCFPages && {
    async redirects() {
      return [
        { source: "/feed", destination: "/rss", permanent: true },
        { source: "/feed/atom", destination: "/atom", permanent: true },
      ];
    },
  }),
};

export default nextConfig;
