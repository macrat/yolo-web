import type { MetadataRoute } from "next";
import { BASE_URL } from "@/lib/constants";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          // 開発者向けスパイク検証ページ（noindex 設定済み）
          "/dnd-spike",
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
