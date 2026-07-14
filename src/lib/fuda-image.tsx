import { ImageResponse } from "next/og";
import {
  getFontData,
  getMinchoFontData,
  ogpSize,
  ogpContentType,
} from "@/lib/ogp-image";
import { PAPER, INK, INK_2, RULE, RULE_STRONG, ACCENT } from "@/lib/utsuwaHex";
import { WAIRO_HEX } from "@/lib/wairoHex";
import {
  pickResultWairoColor,
  pickResultSymbol,
} from "@/play/quiz/_components/resultVisual";

/**
 * 札（Tsutsumi）画像レンダラ — 「見せたくなる結果」を単独で持ち帰れる 1 枚の PNG にする
 * （DESIGN.md §4「包み」/「札」/「印」・§7・§8）。
 *
 * 構図は画面の {@link import("@/components/Tsutsumi").default Tsutsumi} と同じ視覚言語で組む
 * （並べて「別物に見えない」こと）——紙の地に、和色の記号面を一つ、店号・品名・タイプ名を
 * 墨で、印を一つだけ。器（紙・罫・墨）は静かに、成果物（和色の記号面と結果の言葉）が主役。
 *
 * Satori 制約への対応:
 * - Satori は oklch を解釈できない → 和色は {@link WAIRO_HEX}（light 固定 hex）で渡す。
 * - 印の円環は SVG `<circle>` 一本ストロークで描く（画面の {@link import("@/components/In").default In}
 *   と同じ流儀・朱一色・回転 ±8° 内・幅は包み幅の 1/5 以下）。
 * - 明朝（結果の言葉の顔・DESIGN §3）は Noto Serif JP を CDN から取得。取得失敗時は
 *   ゴシックへ素直にフォールバック（描画は成立させ、書体だけ譲る）。
 */

/** OG は横長 1200×630 を流用（PM 確定・リンクプレビューと保存カードを単一の真実で兼用）。 */
const FUDA_SIZE = ogpSize;

/**
 * 器の色は中立モジュール {@link import("@/lib/utsuwaHex")} を単一の真実とする（PAPER/INK/… は
 * そこから import）。乖離ガードテスト（`__tests__/wairoHex.test.ts`）は utsuwaHex を検査対象に、
 * globals.css の light トークン（PAPER↔--paper 等）との一致を担保する。
 */

/** 店号（札単体で出所が読めるように・DESIGN §4「札」）。 */
const SHOP_NAME = "yolos.net";
/** 印の一字（診断の「診」・§4「印」）。 */
const SEAL_CHAR = "診";
/** 印の回転（§4「±8° 以内」）。手捺しのわずかな気配。 */
const SEAL_ROTATE_DEG = -6;

/**
 * タイプ名の書記素数から見出しサイズを決める（長いタイプ名でも 2〜3 行に収める）。
 * character-personality のタイプ名は 8〜30 書記素程度。
 */
function typeNameFontSize(graphemeCount: number): number {
  if (graphemeCount <= 12) return 60;
  if (graphemeCount <= 20) return 48;
  if (graphemeCount <= 30) return 38;
  return 32;
}

/** 札画像に必要な結果情報（依存を最小限に閉じる）。 */
export interface FudaImageResult {
  /** 結果タイプ ID。和色（{@link pickResultWairoColor}）の決定に使う。 */
  id: string;
  /** タイプ名（下部の結果の言葉＋記号面の先頭書記素）。 */
  title: string;
  /**
   * 品名（何の結果か・"あなたに似たキャラ診断" 等・DESIGN §4「札」）。
   * 省略時は品名行を出さない。
   */
  productName?: string;
}

/**
 * 結果を札画像（{@link ImageResponse}）にレンダリングする共有レンダラ。
 *
 * メタ用 `opengraph-image.tsx`（Next 自動配線の og:image）と、クライアントが決定的 URL で
 * 取得する Route Handler `fuda-image/route.ts` の**両方が同じこの関数を呼ぶ**——
 * リンクプレビューと保存画像は単一の真実。
 */
export async function renderFudaImage(
  result: FudaImageResult,
): Promise<ImageResponse> {
  const wairo = WAIRO_HEX[pickResultWairoColor(result.id)];
  const symbol = pickResultSymbol(result.title);
  const graphemeCount = [...result.title].length;

  const [gothicData, minchoData] = await Promise.all([
    getFontData(),
    getMinchoFontData(),
  ]);

  const fonts = [
    ...(gothicData
      ? [
          {
            name: "NotoSansJP",
            data: gothicData,
            style: "normal" as const,
            weight: 400 as const,
          },
        ]
      : []),
    ...(minchoData
      ? [
          {
            name: "NotoSerifJP",
            data: minchoData,
            style: "normal" as const,
            weight: 600 as const,
          },
        ]
      : []),
  ];

  // 明朝優先・ゴシックへフォールバックの family スタック（DESIGN §3「明朝の顔」）。
  const minchoFamily = "NotoSerifJP, NotoSansJP, sans-serif";
  const gothicFamily = "NotoSansJP, sans-serif";

  return new ImageResponse(
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: PAPER,
        color: INK,
        // 器は罫で包む（構造の主役は罫・角丸 0）。§4/§8。
        border: `2px solid ${RULE_STRONG}`,
        padding: "56px 64px",
        fontFamily: gothicFamily,
      }}
    >
      {/* のれん帯: 店号（出所）＋品名（何の結果か）。一本罫で下から仕切る。 */}
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: "20px",
          paddingBottom: "20px",
          borderBottom: `1px solid ${RULE}`,
        }}
      >
        <div
          style={{
            fontFamily: gothicFamily,
            fontSize: 30,
            letterSpacing: "0.04em",
            color: INK_2,
          }}
        >
          {SHOP_NAME}
        </div>
        {result.productName && result.productName.trim() !== "" ? (
          <div
            style={{
              fontFamily: minchoFamily,
              fontSize: 32,
              color: INK,
            }}
          >
            {result.productName}
          </div>
        ) : null}
      </div>

      {/* 主部: 記号面（和色の地・成果物の主役）＋ 結果の言葉（紙の上・墨）。 */}
      <div
        style={{
          display: "flex",
          flex: 1,
          flexDirection: "row",
          alignItems: "center",
          gap: "56px",
          paddingTop: "40px",
        }}
      >
        {/* 記号面: 和色の地に、タイプ名の先頭書記素を明朝で大きく立てる。 */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 300,
            height: 300,
            flex: "0 0 auto",
            backgroundColor: wairo.bg,
            color: wairo.on,
          }}
        >
          <div
            style={{
              display: "flex",
              fontFamily: minchoFamily,
              fontSize: 190,
              lineHeight: 1,
              color: wairo.on,
            }}
          >
            {symbol}
          </div>
        </div>

        {/* 結果の言葉: タイプ名を明朝で大きく組む（器は静か・墨）。 */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
          }}
        >
          <div
            style={{
              display: "flex",
              fontFamily: minchoFamily,
              fontSize: typeNameFontSize(graphemeCount),
              lineHeight: 1.45,
              color: INK,
            }}
          >
            {result.title}
          </div>
        </div>
      </div>

      {/* 印: 成果物に一つだけ・右上に捺す。朱一色の円環＋一字・回転 ±8° 内・幅は包み幅の 1/5 以下
            （100/1200 ≒ 8%）。SVG 一本ストロークで円環を描く（画面の In と同じ流儀）。 */}
      <div
        style={{
          position: "absolute",
          top: 44,
          right: 44,
          width: 100,
          height: 100,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: `rotate(${SEAL_ROTATE_DEG}deg)`,
        }}
      >
        <svg
          width="100"
          height="100"
          viewBox="0 0 100 100"
          style={{ position: "absolute", top: 0, left: 0 }}
        >
          <circle
            cx="50"
            cy="50"
            r="47"
            fill="none"
            stroke={ACCENT}
            strokeWidth="2"
          />
        </svg>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            height: "100%",
            fontFamily: minchoFamily,
            fontSize: 52,
            color: ACCENT,
          }}
        >
          {SEAL_CHAR}
        </div>
      </div>
    </div>,
    {
      ...FUDA_SIZE,
      fonts,
    },
  );
}

/** 札画像のサイズ（メタ `size` / Route Handler の参考用）。 */
export const fudaImageSize = FUDA_SIZE;
/** 札画像の content-type。 */
export const fudaImageContentType = ogpContentType;
