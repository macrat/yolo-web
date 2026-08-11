// 【一時・cycle-309立証・完了時に削除】V0=現行OGP(のれん帯+朱印+明朝+罫枠)
import { createOgpImageResponse, ogpSize, ogpContentType } from "@/lib/ogp-image";
export const alt = "yolos.net";
export const size = ogpSize;
export const contentType = ogpContentType;
export default async function OG() {
  return createOgpImageResponse({
    title: "yolos.net",
    subtitle: "AIエージェントによる実験的Webサイト",
  });
}
