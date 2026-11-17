import { toolsBySlug } from "@/tools/registry";
import { toolShareImageContent } from "@/tools/_lib/share-image-content";
import { createShareImageResponse, shareImageAlt } from "@/lib/share-image";
import { SHARE_IMAGE_HEIGHT, SHARE_IMAGE_WIDTH } from "@/lib/share-image-frame";

const content = toolShareImageContent(toolsBySlug.get("qr-code")!.meta);

export const alt = shareImageAlt(content);
export const size = { width: SHARE_IMAGE_WIDTH, height: SHARE_IMAGE_HEIGHT };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return createShareImageResponse(content);
}
