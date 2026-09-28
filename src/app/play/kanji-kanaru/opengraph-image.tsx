import { playContentBySlug } from "@/play/registry";
import { playShareImageContent } from "@/play/share-image-content";
import { createShareImageResponse, shareImageAlt } from "@/lib/share-image";
import { SHARE_IMAGE_HEIGHT, SHARE_IMAGE_WIDTH } from "@/lib/share-image-frame";

const content = playShareImageContent(playContentBySlug.get("kanji-kanaru")!);

export const alt = shareImageAlt(content);
export const size = { width: SHARE_IMAGE_WIDTH, height: SHARE_IMAGE_HEIGHT };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return createShareImageResponse(content);
}
