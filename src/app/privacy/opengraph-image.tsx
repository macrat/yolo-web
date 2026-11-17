import { createShareImageResponse, shareImageAlt } from "@/lib/share-image";
import { SHARE_IMAGE_HEIGHT, SHARE_IMAGE_WIDTH } from "@/lib/share-image-frame";

/** 名前はページの h1 と同じ題。 */
const content = { name: "プライバシーポリシー" };

export const alt = shareImageAlt(content);
export const size = { width: SHARE_IMAGE_WIDTH, height: SHARE_IMAGE_HEIGHT };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return createShareImageResponse(content);
}
