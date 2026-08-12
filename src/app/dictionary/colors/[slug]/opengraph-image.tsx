/**
 * /dictionary/colors/[slug] 専用 OGP 画像（＝店の看板／札）。
 *
 * 伝統色の個別ページは「色そのものが中身」——その伝統色 hex こそが見せたい対象なので、
 * 共有レンダラ {@link renderFudaImage} に `colorOverride`（その色の hex）を渡し、
 * 記号面の 300×300 パネルの地をその色で塗る（全面ベタではなく囲まれた色面・DESIGN §2
 * 「色そのものが中身の面」）。記号は色名の先頭字（pickResultSymbol が title 先頭を拾う）、
 * のれん帯の品名に hex コード、下部に色名（よみ）を出す。
 *
 * この面の印は内容を表す一字「色」（結果札の既定「診」と平行）。cycle-282/283 の自己貶め
 * 「試」（店の看板印を内容 fuda に流用した誤り）は cycle-306 で撤去した（詳細
 * docs/cycles/cycle-306/decision.md）。サイトの identity 標章（頭字 y・形は面ごとに違う＝汎用看板
 * ogp-image は容器なしの素の朱 y／favicon は朱の塗りタイル・cycle-310/e1-decision.md）は
 * ogp-image・favicon にあり、内容 fuda の印はこれとは別（内容を表す字）。cycle-282
 * まで colors 個別ページは OGP 画像を持っていなかったため、これは純増（B-579）。
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

/**
 * 内容を表す印の一字。伝統色辞典の中身は「色そのもの」なので印は「色」（結果札の既定「診」と
 * 平行の内容印・§4 / cycle-306）。回帰検知のためテストから参照できるよう export する。
 */
export const CONTENT_SEAL_CHAR = "色";

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
    sealChar: CONTENT_SEAL_CHAR,
  });
}
