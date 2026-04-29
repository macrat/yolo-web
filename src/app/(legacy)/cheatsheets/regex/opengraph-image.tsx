import { cheatsheetsBySlug } from "@/cheatsheets/registry";
import {
  createOgpImageResponse,
  ogpSize,
  ogpContentType,
} from "@/lib/ogp-image";

export const alt = "yolos.net cheatsheet";
export const size = ogpSize;
export const contentType = ogpContentType;

export default async function OpenGraphImage() {
  const cheatsheet = cheatsheetsBySlug.get("regex");
  const title = cheatsheet?.meta.name ?? "Cheatsheet";
  const subtitle = cheatsheet?.meta.shortDescription ?? "";
  return createOgpImageResponse({
    title,
    subtitle,
    accentColor: "#7c3aed",
    icon: "\u{1F4CB}",
  });
}
