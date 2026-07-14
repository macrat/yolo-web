import { ImageResponse } from "next/og";
import { PAPER, INK, INK_2, RULE, RULE_STRONG, ACCENT } from "@/lib/utsuwaHex";

/**
 * 共通OGP生成器の設定（「店構え（看板）」版・cycle-282）。
 *
 * 旧版（全面ベタ塗り＋絵文字アイコン＋ゴシック太字・既定色 青#2563eb）を廃し、札レンダラ
 * {@link import("./fuda-image").renderFudaImage} と同じ視覚言語で組む——紙地・墨・一本罫・のれん帯・
 * 明朝（Noto Serif JP）・朱の印。看板は札と器を共有する**共有面（看板・DESIGN §4）**であり、
 * 和色の記号面は持たない（地は常に紙・文字は墨）が、店の印は持つ（単独で共有される1枚として
 * 出所が読めるため・§4 の印規定「器＝ページ UI には捺さない」とは別カテゴリ）。和色はいっさい使わない
 * （DESIGN §2/§4「和色は結果の包みに限る・器へ漏らさない」）。
 *
 * 廃止した引数（DESIGN §8 違反のため型から**削除**）:
 * - `icon`（絵文字）→ §8-6 違反。看板の顔は明朝の品名。図像は店の印 1 つだけ。
 * - `accentColor`（任意色ベタ背景）→ §2 違反。地は常に紙・文字は常に墨。朱は印専用。
 */
export interface OgpImageConfig {
  /** 品名/ページ名（看板の顔・明朝で大きく組む）。 */
  title: string;
  /** 副題/説明/カテゴリ（省略可・ゴシック INK_2）。 */
  subtitle?: string;
}

const OGP_SIZE = { width: 1200, height: 630 };

/** 店号（看板単体で出所が読めるように・DESIGN §4「のれん」）。 */
const SHOP_NAME = "yolos.net";

/**
 * 店の印の一字（§4「印」・chop）。カテゴリ別に変えず一つ固定＝単一の店構え。
 * 「試」（ためす＝「やってみる」）は site-concept「AI が営む『やってみる』のよろず屋」の動詞。
 */
const SHOP_SEAL_CHAR = "試";
/** 印の回転（§4「±8° 以内」）。手捺しのわずかな気配。 */
const SEAL_ROTATE_DEG = -6;

/**
 * Noto Serif JP（明朝・品名と印の顔・DESIGN §3）。weight 600 の見出し用。
 * 札（fuda-image）と同一経路。fuda-image はこの getter を import して一本化する（単一の真実）。
 */
const NOTO_SERIF_JP_CSS_URL =
  "https://fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@600&display=swap";

/**
 * Google Fonts URL for Noto Sans JP (Regular 400 weight).
 * The CSS response contains a url() pointing to the actual font binary.
 */
const GOOGLE_FONTS_CSS_URL =
  "https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400&display=swap";

/**
 * User-Agent strings to try when fetching from Google Fonts.
 * Different UAs cause Google to serve different font formats:
 * - IE10 UA → WOFF (~3MB), compatible with Satori
 * - Old Android UA → TTF (~5MB), compatible with Satori
 * We try these in order and fall back to the next if the response is invalid.
 */
const FONT_FETCH_USER_AGENTS = [
  // IE10: Google returns WOFF format
  "Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.1; Trident/6.0)",
  // Old Android: Google returns TTF format
  "Mozilla/5.0 (Linux; U; Android 4.4.2; en-us; Nexus 5 Build/KOT49H) AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30",
];

/**
 * Magic number prefixes for font formats that Satori supports.
 * WOFF2 is explicitly excluded because Satori does not support it.
 */
const VALID_FONT_MAGIC_NUMBERS: ReadonlyArray<readonly number[]> = [
  [0x77, 0x4f, 0x46, 0x46], // WOFF: "wOFF"
  [0x00, 0x01, 0x00, 0x00], // TTF
  [0x4f, 0x54, 0x54, 0x4f], // OpenType: "OTTO"
];

/**
 * Check whether an ArrayBuffer contains a Satori-compatible font binary.
 * Returns false for WOFF2 ("wOF2") and any other unrecognised format.
 */
function isSatoriCompatibleFont(buffer: ArrayBuffer): boolean {
  if (buffer.byteLength < 4) return false;
  const header = new Uint8Array(buffer, 0, 4);
  return VALID_FONT_MAGIC_NUMBERS.some(
    (magic) =>
      magic[0] === header[0] &&
      magic[1] === header[1] &&
      magic[2] === header[2] &&
      magic[3] === header[3],
  );
}

/**
 * Attempt to fetch a Google font using a single User-Agent string.
 * Returns an ArrayBuffer if a Satori-compatible font is obtained, otherwise null.
 */
async function tryFetchWithUserAgent(
  userAgent: string,
  cssUrl: string,
): Promise<ArrayBuffer | null> {
  const cssResponse = await fetch(cssUrl, {
    headers: { "User-Agent": userAgent },
  });
  if (!cssResponse.ok) return null;

  const css = await cssResponse.text();

  // Extract font file URLs from the CSS @font-face rules.
  const fontUrls = css.match(
    /src:\s*url\((https:\/\/fonts\.gstatic\.com\/[^)]+)\)/g,
  );
  if (!fontUrls || fontUrls.length === 0) return null;

  const allUrls: string[] = [];
  for (const match of fontUrls) {
    const urlMatch = match.match(/url\((https:\/\/[^)]+)\)/);
    if (urlMatch) {
      allUrls.push(urlMatch[1]);
    }
  }

  if (allUrls.length === 0) return null;

  // Fetch the first font binary (covers the main character range)
  const fontResponse = await fetch(allUrls[0]);
  if (!fontResponse.ok) return null;

  const buffer = await fontResponse.arrayBuffer();

  // Reject WOFF2 and other formats Satori cannot handle
  if (!isSatoriCompatibleFont(buffer)) return null;

  return buffer;
}

/**
 * Fetch a Google font binary (Satori-compatible WOFF/TTF) for the given
 * Google Fonts CSS URL. Tries multiple User-Agent strings in order so that
 * Google serves a legacy single-file format (not the unicode-range split that
 * WOFF2 uses). Returns null if all attempts fail.
 *
 * Exported so other Satori surfaces (e.g. the mincho font for the 札 image)
 * can reuse the exact same UA fallback + magic-number validation logic.
 */
export async function fetchGoogleFontData(
  cssUrl: string,
): Promise<ArrayBuffer | null> {
  for (const userAgent of FONT_FETCH_USER_AGENTS) {
    try {
      const result = await tryFetchWithUserAgent(userAgent, cssUrl);
      if (result !== null) return result;
    } catch {
      // Try next UA on any error
    }
  }
  return null;
}

/**
 * Fetch Noto Sans JP (gothic body font) from Google Fonts CDN.
 */
async function fetchNotoSansJP(): Promise<ArrayBuffer | null> {
  return fetchGoogleFontData(GOOGLE_FONTS_CSS_URL);
}

/** Cached font data promise (fetched once per build). */
let fontDataPromise: Promise<ArrayBuffer | null> | null = null;

export function getFontData(): Promise<ArrayBuffer | null> {
  if (!fontDataPromise) {
    fontDataPromise = fetchNotoSansJP();
  }
  return fontDataPromise;
}

/** 明朝フォントデータ（ビルド/リクエストごとに一度だけ取得しキャッシュ）。 */
let minchoFontPromise: Promise<ArrayBuffer | null> | null = null;

/**
 * Noto Serif JP（明朝・見出しの顔）を取得する。看板（本ファイル）と札（fuda-image）が
 * 同じ経路を共有するための単一 getter。fuda-image はこれを import して私有コピーを持たない。
 */
export function getMinchoFontData(): Promise<ArrayBuffer | null> {
  if (!minchoFontPromise) {
    minchoFontPromise = fetchGoogleFontData(NOTO_SERIF_JP_CSS_URL);
  }
  return minchoFontPromise;
}

/** Shared OGP image size. */
export const ogpSize = OGP_SIZE;

/** Shared content type for OGP images. */
export const ogpContentType = "image/png";

/**
 * 品名の書記素数から見出しサイズを決める（札の `typeNameFontSize` に倣う）。
 * 見出しの書体・階層の考え方は DESIGN §3 タイポグラフィだが、看板は大判 1200×630 のため
 * §3 の 16–39px スケールではなく、札に合わせた看板専用の大きめ段階値を用いる。
 * サロゲートペア対応のため呼び出し側で `[...title].length` を渡す。
 */
function titleFontSize(graphemeCount: number): number {
  if (graphemeCount <= 10) return 80;
  if (graphemeCount <= 16) return 62;
  if (graphemeCount <= 24) return 50;
  if (graphemeCount <= 34) return 40;
  return 33;
}

/**
 * 看板 OGP を {@link ImageResponse} にレンダリングする共通レンダラ。
 *
 * 紙地・墨・罫・のれん帯・明朝の品名・朱の印で組む（札と同じ店の顔）。器面なので和色は使わず、
 * 主役は品名（title）を明朝で大きく立てた墨字。階層は墨の濃淡（INK/INK_2）と罫で付け、朱
 * （ACCENT）は右上の印だけに使う。
 *
 * 明朝（Noto Serif JP 600）とゴシック（Noto Sans JP 400）を Google Fonts CDN から並行取得し、
 * 取得失敗時はゴシック→sans-serif へ素直にフォールバックする（描画は成立・書体だけ譲る）。
 */
export async function createOgpImageResponse(
  config: OgpImageConfig,
): Promise<ImageResponse> {
  const { title, subtitle } = config;
  const graphemeCount = [...title].length;

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

  // 明朝優先・ゴシックへフォールバックの family スタック（札と同一・DESIGN §3）。
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
        // 器は罫で包む（角丸 0・§4/§8）。札と同一の枠。
        border: `2px solid ${RULE_STRONG}`,
        padding: "56px 64px",
        fontFamily: gothicFamily,
      }}
    >
      {/* のれん帯: 店号（出所）＋一本罫で下から仕切る（札と同一）。 */}
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
            fontFamily: gothicFamily,
            fontSize: 30,
            letterSpacing: "0.04em",
            color: INK_2,
          }}
        >
          {SHOP_NAME}
        </div>
      </div>

      {/* 主部: 品名（明朝・墨）を上下中央・左揃えで大きく立てる。副題はその下（ゴシック・INK_2）。
          alignItems は既定 stretch のまま＝子は全幅なので長い品名は自然に折り返す。 */}
      <div
        style={{
          display: "flex",
          flex: 1,
          flexDirection: "column",
          justifyContent: "center",
          paddingTop: "40px",
        }}
      >
        <div
          style={{
            display: "flex",
            fontFamily: minchoFamily,
            fontSize: titleFontSize(graphemeCount),
            lineHeight: 1.35,
            color: INK,
            maxWidth: "100%",
          }}
        >
          {title}
        </div>
        {subtitle && subtitle.trim() !== "" ? (
          <div
            style={{
              display: "flex",
              fontFamily: gothicFamily,
              fontSize: 30,
              lineHeight: 1.55,
              color: INK_2,
              marginTop: "28px",
              maxWidth: "900px",
            }}
          >
            {subtitle}
          </div>
        ) : null}
      </div>

      {/* 印: 器面に一つだけ・右上に捺す。朱一色の円環＋一字・回転 ±8° 内・幅 100px（§4）。
            SVG 一本ストロークで円環を描く（札の印ブロックと同一）。 */}
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
          {SHOP_SEAL_CHAR}
        </div>
      </div>
    </div>,
    {
      ...OGP_SIZE,
      fonts,
    },
  );
}
