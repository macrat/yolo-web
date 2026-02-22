import {
  createOgpImageResponse,
  ogpSize,
  ogpContentType,
} from "@/lib/ogp-image";
import { gameBySlug } from "@/lib/games/registry";

const meta = gameBySlug.get("yoji-kimeru")!;

export const alt = "yolos.net yoji-kimeru";
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
