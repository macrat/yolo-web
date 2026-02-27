import type { ToolMeta } from "@/tools/types";

export const meta: ToolMeta = {
  slug: "hash-generator",
  name: "ハッシュ生成",
  nameEn: "Hash Generator",
  description:
    "テキストからSHA-1、SHA-256、SHA-384、SHA-512のハッシュ値を生成するツール。Web Crypto APIを使用した安全なハッシュ計算。登録不要・無料。",
  shortDescription: "SHA-1/SHA-256/SHA-512のハッシュ値を生成",
  keywords: ["ハッシュ生成", "SHA-256", "SHA-512", "SHA-1", "ハッシュ値計算"],
  category: "security",
  relatedSlugs: ["base64", "password-generator", "image-base64"],
  publishedAt: "2026-02-13",
  structuredDataType: "WebApplication",
  trustLevel: "verified",
};
