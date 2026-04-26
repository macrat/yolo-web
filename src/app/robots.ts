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
          "/dev-preview/", // design-system 動作確認ページ（noindex/nofollow 設定済み、本番公開対象外）
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
