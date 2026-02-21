import {
  createOgpImageResponse,
  ogpSize,
  ogpContentType,
} from "@/lib/ogp-image";

export const alt = "yolos.net nakamawake";
export const size = ogpSize;
export const contentType = ogpContentType;

export default async function OpenGraphImage() {
  return createOgpImageResponse({
    title: "\u30CA\u30AB\u30DE\u30EF\u30B1",
    subtitle: "\u6BCE\u65E5\u306E\u4EF2\u9593\u5206\u3051\u30D1\u30BA\u30EB",
    accentColor: "#059669",
    icon: "\u{1F9E9}",
  });
}
