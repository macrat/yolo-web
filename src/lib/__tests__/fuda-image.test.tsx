import { beforeEach, describe, expect, test, vi } from "vitest";

// next/og の ImageResponse を new 可能なクラスとしてモックし、渡された element/options を捕捉する。
let imageResponseCalls: Array<{ element: unknown; options: unknown }> = [];
vi.mock("next/og", () => ({
  ImageResponse: class MockImageResponse {
    constructor(element: unknown, options: unknown) {
      imageResponseCalls.push({ element, options });
    }
  },
}));

// フォント取得は常に失敗させる（ネットワーク不要・fonts 空でも描画ツリーは同じ構造）。
const mockFetch = vi.fn().mockRejectedValue(new Error("no network"));
vi.stubGlobal("fetch", mockFetch);

/** JSX 風ツリーから文字列の子（テキストノード）をすべて集める。 */
function collectText(node: unknown, out: string[] = []): string[] {
  if (typeof node === "string") {
    out.push(node);
    return out;
  }
  if (Array.isArray(node)) {
    for (const child of node) collectText(child, out);
    return out;
  }
  if (node && typeof node === "object" && "props" in node) {
    const props = (node as { props: { children?: unknown } }).props;
    collectText(props.children, out);
  }
  return out;
}

/** ツリー中の style.backgroundColor をすべて集める。 */
function collectBackgroundColors(node: unknown, out: string[] = []): string[] {
  if (Array.isArray(node)) {
    for (const child of node) collectBackgroundColors(child, out);
    return out;
  }
  if (node && typeof node === "object" && "props" in node) {
    const props = (
      node as {
        props: { children?: unknown; style?: { backgroundColor?: string } };
      }
    ).props;
    if (props.style?.backgroundColor) out.push(props.style.backgroundColor);
    collectBackgroundColors(props.children, out);
  }
  return out;
}

/** ツリー中の style.color（前景色）をすべて集める。 */
function collectForegroundColors(node: unknown, out: string[] = []): string[] {
  if (Array.isArray(node)) {
    for (const child of node) collectForegroundColors(child, out);
    return out;
  }
  if (node && typeof node === "object" && "props" in node) {
    const props = (
      node as { props: { children?: unknown; style?: { color?: string } } }
    ).props;
    if (props.style?.color) out.push(props.style.color);
    collectForegroundColors(props.children, out);
  }
  return out;
}

describe("renderFudaImage", () => {
  beforeEach(() => {
    imageResponseCalls = [];
    vi.clearAllMocks();
    vi.resetModules();
    mockFetch.mockRejectedValue(new Error("no network"));
  });

  async function render(result: {
    id: string;
    title: string;
    productName?: string;
    colorOverride?: string;
    sealChar?: string;
  }) {
    const { renderFudaImage } = await import("../fuda-image");
    await renderFudaImage(result);
    return imageResponseCalls[0];
  }

  test("1200×630 の ImageResponse を返す", async () => {
    const { options } = await render({
      id: "blazing-strategist",
      title: "策士",
    });
    expect(imageResponseCalls).toHaveLength(1);
    expect(options).toMatchObject({ width: 1200, height: 630 });
  });

  test("店号・品名・タイプ名・記号面の先頭書記素・印を描く", async () => {
    const title = "締切3分前に5手先を読む炎の策士";
    const { element } = await render({
      id: "blazing-strategist",
      title,
      productName: "あなたに似たキャラ診断",
    });
    const texts = collectText(element);
    expect(texts).toContain("yolos.net"); // 店号
    expect(texts).toContain("あなたに似たキャラ診断"); // 品名
    expect(texts).toContain(title); // タイプ名
    expect(texts).toContain("締"); // 記号面＝タイプ名の先頭書記素
    expect(texts).toContain("診"); // 印の一字
  });

  test("記号面の地に和色 hex（成果物パレット）を使う", async () => {
    const { WAIRO_HEX } = await import("../wairoHex");
    const { pickResultWairoColor } =
      await import("@/play/quiz/_components/resultVisual");
    const { element } = await render({
      id: "blazing-strategist",
      title: "炎の策士",
    });
    const expectedBg = WAIRO_HEX[pickResultWairoColor("blazing-strategist")].bg;
    expect(collectBackgroundColors(element)).toContain(expectedBg);
  });

  test("絵文字（§8-6 禁止）を画像に持ち込まない", async () => {
    // クイズデータの result.icon は絵文字。札にはタイプ名の先頭書記素だけを立てる。
    const { element } = await render({
      id: "blazing-strategist",
      title: "締切3分前に5手先を読む炎の策士",
    });
    const joined = collectText(element).join("");
    // 代表的な絵文字レンジ（記号・絵記号・補助記号）を含まない。
    expect(joined).not.toMatch(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}]/u);
  });

  test("productName 省略時は品名を出さない", async () => {
    const { element } = await render({ id: "blazing-poet", title: "炎の詩人" });
    const texts = collectText(element);
    expect(texts).toContain("yolos.net");
    expect(texts).not.toContain("あなたに似たキャラ診断");
  });

  test("size/contentType を export する", async () => {
    const mod = await import("../fuda-image");
    expect(mod.fudaImageSize).toEqual({ width: 1200, height: 630 });
    expect(mod.fudaImageContentType).toBe("image/png");
  });

  test("colorOverride 指定時: 記号面の地に固有 hex を使い、和色8色へ丸めない", async () => {
    const { WAIRO_HEX } = await import("../wairoHex");
    const { pickResultWairoColor } =
      await import("@/play/quiz/_components/resultVisual");
    // 藍色（伝統色診断・色＝中身）の固有 hex。
    const hex = "#0d5661";
    const { element } = await render({
      id: "ai",
      title: "藍色(あいいろ)",
      colorOverride: hex,
    });
    const backgrounds = collectBackgroundColors(element);
    // 記号面の地はその固有 hex。
    expect(backgrounds).toContain(hex);
    // id のハッシュ由来の和色 bg（従来経路）は使わない。
    const wairoBg = WAIRO_HEX[pickResultWairoColor("ai")].bg;
    expect(backgrounds).not.toContain(wairoBg);
  });

  test("colorOverride 指定時: 前景色は getContrastTextColor 由来（AA を満たす墨/白）", async () => {
    const { getContrastTextColor } = await import("@/play/color-utils");
    const hex = "#0d5661"; // 暗い藍 → 白文字
    const { element } = await render({
      id: "ai",
      title: "藍色(あいいろ)",
      colorOverride: hex,
    });
    expect(collectForegroundColors(element)).toContain(
      getContrastTextColor(hex),
    );
  });

  test("sealChar 指定時: 印の一字に反映する（既定 '診' を上書き）", async () => {
    const { element } = await render({
      id: "ai",
      title: "藍色(あいいろ)",
      sealChar: "試",
    });
    const texts = collectText(element);
    expect(texts).toContain("試");
    expect(texts).not.toContain("診");
  });

  test("colorOverride 未指定時: 従来の和色経路と既定の印 '診' を保つ", async () => {
    const { WAIRO_HEX } = await import("../wairoHex");
    const { pickResultWairoColor } =
      await import("@/play/quiz/_components/resultVisual");
    const { element } = await render({
      id: "blazing-strategist",
      title: "炎の策士",
    });
    const expectedBg = WAIRO_HEX[pickResultWairoColor("blazing-strategist")].bg;
    expect(collectBackgroundColors(element)).toContain(expectedBg);
    expect(collectText(element)).toContain("診");
  });
});
