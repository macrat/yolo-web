import {
  createOgpImageResponse,
  ogpSize,
  ogpContentType,
} from "@/lib/ogp-image";

export const alt = "yolos.net 実績ダッシュボード";
export const size = ogpSize;
export const contentType = ogpContentType;

export default async function OpenGraphImage() {
  return createOgpImageResponse({
    title: "実績ダッシュボード",
    subtitle: "yolos.net",
  });
}
