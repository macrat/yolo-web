import type { ReactElement } from "react";
import In from "@/components/In";
import styles from "./Tsutsumi.module.css";

/**
 * 成果物パレット「和色」のキー（DESIGN.md §2）。globals.css の `--wairo-<key>` と
 * `--wairo-<key>-on` に対応する。ここに無い色は使えない（型で 8 色に閉じる）。
 */
export type WairoColor =
  | "kurenai" // 紅
  | "kaki" // 柿
  | "yamabuki" // 山吹
  | "moegi" // 萌黄
  | "tokiwa" // 常磐
  | "ai" // 藍
  | "fuji" // 藤
  | "suou"; // 蘇芳

export interface TsutsumiProps {
  /**
   * タイプ名（結果の主役の言葉・明朝で大きく組む）。診断・占いの類型名など。必須。
   */
  typeName: string;
  /**
   * 一言（タイプ名に添える短い説明・任意）。無ければ説明行を出さない。
   */
  word?: string;
  /**
   * 大きな記号（絵文字ではなく漢字/かな 1〜数字の「顔」になる字）。任意。
   * {@link number} が与えられた場合は数字を優先し、記号は出さない
   *（記号面は一度に一つの主役だけを立てる）。
   */
  symbol?: string;
  /**
   * 大きな数字（スコア・計測値など・tabular で桁を揃える）。任意。
   * 文字列/数値どちらも受ける（"98"・98・"A+" 等）。
   */
  number?: string | number;
  /**
   * 数字に添える単位（"点"・"%"・"位" 等・任意）。{@link number} がある時のみ意味を持つ。
   */
  unit?: string;
  /** 成果物の地に使う和色（8 色から選ぶ）。 */
  color: WairoColor;
  /**
   * 店号（札として単独で持ち帰った画像からも出所が分かるように・DESIGN.md §4「札」）。
   * 既定は "yolos.net"。
   */
  shopName?: string;
  /**
   * 品名（何の結果か・"キャラ診断" 等）。札単体で「店号・品名・結果」が読めるための品名（§4）。任意。
   */
  productName?: string;
  /** 印の一文字（任意）。与えると成果物に印を一つだけ捺す（{@link In}）。 */
  seal?: string;
  /**
   * 補足（成果物の外・紙の上に置く小さな注記・任意）。結果の但し書きなど。
   */
  caption?: string;
  /**
   * タイプ名（{@link typeName}）を描画する要素。既定は "p"。
   * 診断結果カードのようにタイプ名がその領域の主見出しになる文脈では "h2" を指定し、
   * スクリーンリーダの見出しナビで結果（クライマックス）へ到達できるようにする
   *（cycle-287 / WCAG 1.3.1）。見本・装飾用途では "p" のまま（見出し階層を汚さない）。
   * 見た目は {@link typeName} のスタイルで固定され、要素を変えても変化しない。
   */
  typeNameAs?: "p" | "h2";
}

/**
 * 包み（Tsutsumi）— 「見せたくなる結果」の結果カード（DESIGN.md §4「包み」/§7）。
 *
 * 仕様（§4/§7/§8 対応）:
 * - 結果成果物を **罫で明確に包んだ独立ビジュアル**。器（ページ地）は紙のまま・成果物が主役。
 * - 大きな記号/数字を **和色の地**（記号面）に置き、その上に AA を満たす文字色（`--wairo-*-on`）を乗せる。
 *   タイプ名・一言は紙の上に墨で組む。和色は「中身」だけに使い、器（ページ UI）へ漏らさない（§2）。
 * - 影・グラデ・ピル・一律角丸は使わない（§8）。角丸 0 基調。印は一つだけ・§4 の厳密仕様に従う。
 * - 単独で持ち帰れる画像（札）として成立する構図——店号・品名・結果が画像単体で読める（§4「札」）。
 *   ※ 実際の画像生成（client capture / server OG）は C4 で決める。ここは視覚設計のみ。
 */
export default function Tsutsumi({
  typeName,
  word,
  symbol,
  number,
  unit,
  color,
  shopName = "yolos.net",
  productName,
  seal,
  caption,
  typeNameAs = "p",
}: TsutsumiProps): ReactElement {
  // 数字があれば数字を主役に、無ければ記号を主役にする（記号面は主役を一つに絞る）
  const hasNumber =
    number !== undefined && number !== null && `${number}` !== "";
  const hasSymbol = symbol !== undefined && symbol.trim() !== "";

  return (
    <figure className={styles.tsutsumi} data-color={color}>
      <header className={styles.head}>
        <span className={styles.shop}>{shopName}</span>
        {productName && productName.trim() !== "" ? (
          <span className={styles.product}>{productName}</span>
        ) : null}
      </header>

      {/* 印は成果物に一つだけ捺す。§4「大きさは包み幅の 1/5 以下」を .seal 側の幅で担保する。 */}
      {seal && seal.trim() !== "" ? (
        <span className={styles.seal}>
          <In char={seal} size="100%" label={`印 ${[...seal][0]}`} />
        </span>
      ) : null}

      {/* 記号面（和色の地）: 数字 or 記号のどちらか一つを大きく立てる。 */}
      <div className={styles.figure}>
        {hasNumber ? (
          <p className={styles.number}>
            <span className={styles.numberValue}>{number}</span>
            {unit && unit.trim() !== "" ? (
              <span className={styles.unit}>{unit}</span>
            ) : null}
          </p>
        ) : hasSymbol ? (
          <p className={styles.symbol}>{symbol}</p>
        ) : null}
      </div>

      {/* 品名・結果の言葉は紙の上に墨で組む（器は静か）。 */}
      <figcaption className={styles.body}>
        {typeNameAs === "h2" ? (
          <h2 className={styles.typeName}>{typeName}</h2>
        ) : (
          <p className={styles.typeName}>{typeName}</p>
        )}
        {word && word.trim() !== "" ? (
          <p className={styles.word}>{word}</p>
        ) : null}
        {caption && caption.trim() !== "" ? (
          <span className={styles.caption}>{caption}</span>
        ) : null}
      </figcaption>
    </figure>
  );
}
