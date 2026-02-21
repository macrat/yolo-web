import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // For Cloudflare Pages static export: CF_PAGES=1 npm run build
  ...(process.env.CF_PAGES === "1" && { output: "export" }),
};

export default nextConfig;
