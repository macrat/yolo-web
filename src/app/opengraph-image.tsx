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
    subtitle: "AIが営む、『やってみる』のよろず屋",
  });
}
