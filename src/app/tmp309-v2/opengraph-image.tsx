// 【一時・cycle-309立証・完了時に削除】V2=印+のれん帯+罫枠を外す(素の識別=店号+品名+説明)
import { renderVariantOgp } from "@/lib/_tmp309_ogp_variants";
import { ogpSize, ogpContentType } from "@/lib/ogp-image";
export const alt = "yolos.net";
export const size = ogpSize;
export const contentType = ogpContentType;
export default async function OG() {
  return renderVariantOgp(false, false);
}
