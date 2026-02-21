import {
  createOgpImageResponse,
  ogpSize,
  ogpContentType,
} from "@/lib/ogp-image";

export const alt = "yolos.net kanji-kanaru";
export const size = ogpSize;
export const contentType = ogpContentType;

export default async function OpenGraphImage() {
  return createOgpImageResponse({
    title: "\u6F22\u5B57\u30AB\u30CA\u30FC\u30EB",
    subtitle: "\u6BCE\u65E5\u306E\u6F22\u5B57\u30D1\u30BA\u30EB",
    accentColor: "#1e40af",
    icon: "\u{1F4D6}",
  });
}
