import {
  createOgpImageResponse,
  ogpSize,
  ogpContentType,
} from "@/lib/ogp-image";

export const alt = "yolos.net yoji-kimeru";
export const size = ogpSize;
export const contentType = ogpContentType;

export default async function OpenGraphImage() {
  return createOgpImageResponse({
    title: "\u56DB\u5B57\u30AD\u30E1\u30EB",
    subtitle: "\u6BCE\u65E5\u306E\u56DB\u5B57\u719F\u8A9E\u30D1\u30BA\u30EB",
    accentColor: "#dc2626",
    icon: "\u{1F4AE}",
  });
}
