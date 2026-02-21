import {
  createOgpImageResponse,
  ogpSize,
  ogpContentType,
} from "@/lib/ogp-image";

export const alt = "yolos.net irodori";
export const size = ogpSize;
export const contentType = ogpContentType;

export default async function OpenGraphImage() {
  return createOgpImageResponse({
    title: "\u30A4\u30ED\u30C9\u30EA",
    subtitle: "\u6BCE\u65E5\u306E\u8272\u5F69\u30C1\u30E3\u30EC\u30F3\u30B8",
    accentColor: "#e11d48",
    icon: "\u{1F3A8}",
  });
}
