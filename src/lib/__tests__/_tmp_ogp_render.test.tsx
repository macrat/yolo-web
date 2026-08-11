/**
 * 【一時ハーネス・cycle-309 P3 立証用・完了時に削除】
 * B-583 立証: OGP 看板の「店の意匠を残した版/外した版」を実 PNG として吐き、PM が見比べる。
 * V0=現行(のれん帯+朱印+明朝+罫枠) / V1=印だけ外す / V2=印+のれん枠を外し素の識別(店号+品名)。
 */
import { describe, it } from "vitest";
import { writeFileSync, mkdirSync } from "node:fs";
import { ImageResponse } from "next/og";
import {
  createOgpImageResponse,
  getFontData,
  getMinchoFontData,
} from "@/lib/ogp-image";
import { PAPER, INK, INK_2, RULE, RULE_STRONG, ACCENT } from "@/lib/utsuwaHex";

const OUT = "/mnt/data/yolo-web/tmp/cycle-309";
const SIZE = { width: 1200, height: 630 };
const TITLE = "yolos.net";
const SUBTITLE = "AIエージェントによる実験的Webサイト";

async function fonts() {
  const [g, m] = await Promise.all([getFontData(), getMinchoFontData()]);
  return [
    ...(g
      ? [
          {
            name: "NotoSansJP",
            data: g,
            style: "normal" as const,
            weight: 400 as const,
          },
        ]
      : []),
    ...(m
      ? [
          {
            name: "NotoSerifJP",
            data: m,
            style: "normal" as const,
            weight: 600 as const,
          },
        ]
      : []),
  ];
}
const mincho = "NotoSerifJP, NotoSansJP, sans-serif";
const gothic = "NotoSansJP, sans-serif";

/** V1/V2 共通レンダラ: showSeal(朱印) と showShopFrame(のれん帯+罫枠) をトグル。 */
async function renderVariant(showSeal: boolean, showShopFrame: boolean) {
  const f = await fonts();
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
    { ...SIZE, fonts: f },
  );
}

async function dump(name: string, res: Response) {
  const buf = Buffer.from(await res.arrayBuffer());
  writeFileSync(`${OUT}/${name}`, buf);
  // eslint-disable-next-line no-console
  console.log(`WROTE ${name} ${buf.length} bytes`);
}

describe("_tmp ogp render (cycle-309 立証)", () => {
  it("V0 現行(store dressing all)", async () => {
    mkdirSync(OUT, { recursive: true });
    await dump(
      "ogp-V0-current.png",
      await createOgpImageResponse({ title: TITLE, subtitle: SUBTITLE }),
    );
  }, 60000);
  it("V1 印だけ外す", async () => {
    await dump("ogp-V1-noseal.png", await renderVariant(false, true));
  }, 60000);
  it("V2 印+のれん枠を外す(素の識別)", async () => {
    await dump("ogp-V2-plain.png", await renderVariant(false, false));
  }, 60000);
});
