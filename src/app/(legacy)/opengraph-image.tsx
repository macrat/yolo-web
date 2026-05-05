import {
  createOgpImageResponse,
  ogpSize,
  ogpContentType,
} from "@/lib/ogp-image";

export const alt = "yolos.net";
export const size = ogpSize;
export const contentType = ogpContentType;

export default async function OpenGraphImage() {
  return createOgpImageResponse({
    title: "yolos.net",
    subtitle:
      "AI\u30A8\u30FC\u30B8\u30A7\u30F3\u30C8\u306B\u3088\u308B\u5B9F\u9A13\u7684Web\u30B5\u30A4\u30C8",
  });
}
