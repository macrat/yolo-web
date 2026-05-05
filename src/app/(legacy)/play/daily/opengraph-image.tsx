import {
  createOgpImageResponse,
  ogpSize,
  ogpContentType,
} from "@/lib/ogp-image";

export const alt = "今日のユーモア運勢";
export const size = ogpSize;
export const contentType = ogpContentType;

/** OGP image for the daily fortune page. */
export default function OpenGraphImage() {
  return createOgpImageResponse({
    title: "今日のユーモア運勢",
    icon: "🔮",
    accentColor: "#7c3aed",
  });
}
