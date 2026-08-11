// 【一時・cycle-309立証・完了時に削除】V1=印だけ外す(のれん帯+明朝+罫枠は残す)
import { renderVariantOgp } from "@/lib/_tmp309_ogp_variants";
import { ogpSize, ogpContentType } from "@/lib/ogp-image";
export const alt = "yolos.net";
export const size = ogpSize;
export const contentType = ogpContentType;
export default async function OG() {
  return renderVariantOgp(false, true);
}
