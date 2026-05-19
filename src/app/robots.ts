import type { MetadataRoute } from "next";
import { BASE_URL } from "@/lib/constants";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // hidden 検証ルート (/internal/, /storybook 等) は robots.txt に
        // 載せない。disallow に書くと URL が公開ファイルから漏れて逆効果に
        // なる（cycle-175 で同型事故 + 即日修正済、commit 44f32754 参照）。
        // noindex meta + サイトナビ動線なしで隠す方針に統一。
        disallow: "/api/",
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
