/**
 * /dictionary/colors/[slug] 専用 OGP 画像（＝店の看板／札）。
 *
 * 伝統色の個別ページは「色そのものが中身」——その伝統色 hex こそが見せたい対象なので、
 * 共有レンダラ {@link renderFudaImage} に `colorOverride`（その色の hex）を渡し、
 * 記号面の 300×300 パネルの地をその色で塗る（全面ベタではなく囲まれた色面・DESIGN §2
 * 「色そのものが中身の面」）。記号は色名の先頭字（pickResultSymbol が title 先頭を拾う）、
 * のれん帯の品名に hex コード、下部に色名（よみ）を出す。
 *
 * 印は診断結果ではなく店の看板クラスなので "屋"（＝共通店構え ogp-image の SHOP_SEAL_CHAR
 * と同じ店の家印・よろず屋の身元）を渡す。cycle-283（B-580）で印の要否・字を実 OGP で見比べ、
 * 参照面（辞典）に「試（＝試作／暫定）」を捺すのは中身の信頼と座りが悪いと判断して "屋" に定めた。
 * cycle-282 まで colors 個別ページは OGP 画像を持っていなかったため、これは純増（B-579）。
 */

import {
  renderFudaImage,
  fudaImageSize,
  fudaImageContentType,
} from "@/lib/fuda-image";
import { getAllColorSlugs, getColorBySlug } from "@/dictionary/_lib/colors";

export const alt = "日本の伝統色";
export const size = fudaImageSize;
export const contentType = fudaImageContentType;

/** 店の看板クラスの印（共通店構え ogp-image と同じ "屋"＝よろず屋の身元）。 */
const SHOP_SEAL_CHAR = "屋";

/** 色が見つからないときのタイトルフォールバック（描画を落とさない）。 */
const FALLBACK_TITLE = "色";

export function generateStaticParams(): Array<{ slug: string }> {
  return getAllColorSlugs().map((slug) => ({ slug }));
}

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function OpenGraphImage({ params }: Props) {
  const { slug } = await params;
  const color = getColorBySlug(slug);

  const title = color ? `${color.name}（${color.romaji}）` : FALLBACK_TITLE;

  return renderFudaImage({
    id: color?.slug ?? slug,
    title,
    // 品名にその色の hex コードを出す。色が無ければ品名行は省く（undefined）。
    productName: color?.hex,
    // 地色はその伝統色 hex。色が無ければ colorOverride 未指定＝従来の和色経路へフォールバック。
    colorOverride: color?.hex,
    sealChar: SHOP_SEAL_CHAR,
  });
}
