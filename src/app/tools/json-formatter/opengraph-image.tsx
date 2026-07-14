import { toolsBySlug } from "@/tools/registry";
import {
  createOgpImageResponse,
  ogpSize,
  ogpContentType,
} from "@/lib/ogp-image";

export const alt = "yolos.net tool";
export const size = ogpSize;
export const contentType = ogpContentType;

export default async function OpenGraphImage() {
  const tool = toolsBySlug.get("json-formatter");
  const title = tool?.meta.name ?? "Tool";
  const subtitle = tool?.meta.shortDescription ?? "";
  return createOgpImageResponse({
    title,
    subtitle,
  });
}
