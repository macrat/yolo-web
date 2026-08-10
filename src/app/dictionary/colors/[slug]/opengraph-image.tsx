/**
 * /dictionary/colors/[slug] 専用 OGP 画像（＝店の看板／札）。
 *
 * 伝統色の個別ページは「色そのものが中身」——その伝統色 hex こそが見せたい対象なので、
 * 共有レンダラ {@link renderFudaImage} に `colorOverride`（その色の hex）を渡し、
 * 記号面の 300×300 パネルの地をその色で塗る（全面ベタではなく囲まれた色面・DESIGN §2
 * 「色そのものが中身の面」）。記号は色名の先頭字（pickResultSymbol が title 先頭を拾う）、
 * のれん帯の品名に hex コード、下部に色名（よみ）を出す。
 *
 * 印は共通店構え ogp-image と同じ SHOP_SEAL_CHAR を渡す。**その字も「印を持つこと／店を
 * 主張すること」自体も来訪者価値の観点で未決**で、cycle-283 の「屋」への変更は運営者目線の
 * 誤りとして撤回し着手前の "試" へ戻してある（cycle-283 事故報告・再検討は B-583）。ここでの
 * 来訪者価値は印ではなく「色そのものを届ける」ことにある。cycle-282 まで colors 個別ページは
 * OGP 画像を持っていなかったため、これは純増（B-579）。
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

/** 店の看板クラスの印（共通店構え ogp-image と同じ "試"・cycle-283 で「屋」を撤回。B-583 で再検討）。 */
const SHOP_SEAL_CHAR = "試";

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
