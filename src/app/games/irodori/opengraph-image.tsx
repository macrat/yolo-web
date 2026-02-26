import {
  createOgpImageResponse,
  ogpSize,
  ogpContentType,
} from "@/lib/ogp-image";
import { gameBySlug } from "@/games/registry";

const meta = gameBySlug.get("irodori")!;

export const alt = "yolos.net irodori";
export const size = ogpSize;
export const contentType = ogpContentType;

export default async function OpenGraphImage() {
  return createOgpImageResponse({
    title: meta.title,
    subtitle: meta.ogpSubtitle,
    accentColor: meta.accentColor,
    icon: meta.icon,
  });
}
