/**
 * 【一時ファイル・cycle-309 P3 立証用・完了時に削除】
 * B-583 立証: OGP 看板の「店の意匠を残した版/外した版」を実 Next dev で PNG 化して PM が見比べる。
 * showSeal=朱の hanko 印 / showShopFrame=のれん帯(店号+一本罫)+2px 罫枠 をトグル。
 * V0 相当(全部あり)は createOgpImageResponse を直接使う（本ファイルは V1/V2 用）。
 */
import { ImageResponse } from "next/og";
import { getFontData, getMinchoFontData, ogpSize } from "@/lib/ogp-image";
import { PAPER, INK, INK_2, RULE, RULE_STRONG, ACCENT } from "@/lib/utsuwaHex";

const TITLE = "yolos.net";
const SUBTITLE = "AIエージェントによる実験的Webサイト";

export async function renderVariantOgp(
  showSeal: boolean,
  showShopFrame: boolean,
) {
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
  const mincho = "NotoSerifJP, NotoSansJP, sans-serif";
  const gothic = "NotoSansJP, sans-serif";

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
        border: showShopFrame ? `2px solid ${RULE_STRONG}` : "none",
        padding: "56px 64px",
        fontFamily: gothic,
      }}
    >
      {showShopFrame ? (
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
              display: "flex",
              fontFamily: gothic,
              fontSize: 30,
              letterSpacing: "0.04em",
              color: INK_2,
            }}
          >
            {TITLE}
          </div>
        </div>
      ) : null}
      <div
        style={{
          display: "flex",
          flex: 1,
          flexDirection: "column",
          justifyContent: "center",
          paddingTop: showShopFrame ? "40px" : "0px",
        }}
      >
        <div
          style={{
            display: "flex",
            fontFamily: mincho,
            fontSize: 80,
            lineHeight: 1.35,
            color: INK,
            maxWidth: "100%",
          }}
        >
          {TITLE}
        </div>
        <div
          style={{
            display: "flex",
            fontFamily: gothic,
            fontSize: 30,
            lineHeight: 1.55,
            color: INK_2,
            marginTop: "28px",
            maxWidth: "900px",
          }}
        >
          {SUBTITLE}
        </div>
      </div>
      {showSeal ? (
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
            backgroundColor: ACCENT,
            borderRadius: 22,
            transform: "rotate(-6deg)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: mincho,
              fontSize: 62,
              lineHeight: 1,
              color: PAPER,
              paddingTop: 5,
            }}
          >
            y
          </div>
        </div>
      ) : null}
    </div>,
    { ...ogpSize, fonts },
  );
}
