import { expect, test, describe, vi, beforeEach } from "vitest";

// Track calls to ImageResponse for assertions
let imageResponseCalls: Array<{ element: unknown; options: unknown }> = [];

// Mock next/og ImageResponse as a class since it's invoked with `new`
vi.mock("next/og", () => ({
  ImageResponse: class MockImageResponse {
    _element: unknown;
    _options: unknown;
    constructor(element: unknown, options: unknown) {
      this._element = element;
      this._options = options;
      imageResponseCalls.push({ element, options });
    }
  },
}));

// Mock global fetch for font loading
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

/** Build an ArrayBuffer with the TTF magic number (0x00 0x01 0x00 0x00). */
function makeTtfBuffer(extraBytes = 4): ArrayBuffer {
  const buf = new ArrayBuffer(4 + extraBytes);
  const view = new Uint8Array(buf);
  view[0] = 0x00;
  view[1] = 0x01;
  view[2] = 0x00;
  view[3] = 0x00;
  return buf;
}

/** 器の色（utsuwaHex の SSoT と一致させる）。新デザインの契約検証に使う。 */
const PAPER = "#f8f7f2";
const ACCENT = "#af3622";

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

/** ツリー中の任意の style プロパティ値をすべて集める。 */
function collectStyleValues(
  node: unknown,
  key: string,
  out: Array<string | number> = [],
): Array<string | number> {
  if (Array.isArray(node)) {
    for (const child of node) collectStyleValues(child, key, out);
    return out;
  }
  if (node && typeof node === "object" && "props" in node) {
    const props = (
      node as {
        props: {
          children?: unknown;
          style?: Record<string, string | number>;
        };
      }
    ).props;
    const value = props.style?.[key];
    if (value !== undefined) out.push(value);
    collectStyleValues(props.children, key, out);
  }
  return out;
}

describe("createOgpImageResponse — 店構え（看板）契約", () => {
  beforeEach(() => {
    imageResponseCalls = [];
    vi.clearAllMocks();
    // Reset the cached font promise by re-importing
    vi.resetModules();
    // Default: font fetch fails, so we test the fallback path
    mockFetch.mockRejectedValue(new Error("network error"));
  });

  async function getModule() {
    return await import("../ogp-image");
  }

  test("returns an ImageResponse instance with title only", async () => {
    const { createOgpImageResponse } = await getModule();

    const result = await createOgpImageResponse({
      title: "Test Title",
    });

    expect(imageResponseCalls).toHaveLength(1);
    expect(result).toBeDefined();
  });

  test("passes correct size to ImageResponse", async () => {
    const { createOgpImageResponse } = await getModule();

    await createOgpImageResponse({ title: "Test" });

    const { options } = imageResponseCalls[0];
    expect(options).toMatchObject({
      width: 1200,
      height: 630,
    });
  });

  test("地は常に紙（PAPER）で全面ベタ塗りの accentColor は無い", async () => {
    const { createOgpImageResponse } = await getModule();

    await createOgpImageResponse({ title: "Test" });

    const { element } = imageResponseCalls[0];
    const jsx = element as { props: { style: { backgroundColor: string } } };
    // ルートの地は常に紙。旧デザインの青ベタ（#2563eb）等は生成されない。
    expect(jsx.props.style.backgroundColor).toBe(PAPER);
  });

  test("朱（ACCENT）は印だけに現れ、地ベタには使わない", async () => {
    const { createOgpImageResponse } = await getModule();

    await createOgpImageResponse({ title: "Test" });

    const { element } = imageResponseCalls[0];
    // 印の一字・円環に朱が使われる（color として）。地の backgroundColor には朱は無い。
    const bgColors = collectStyleValues(element, "backgroundColor");
    expect(bgColors).not.toContain(ACCENT);
    const textColors = collectStyleValues(element, "color");
    expect(textColors).toContain(ACCENT);
  });

  test("店号 yolos.net と店の印「試」を描く", async () => {
    const { createOgpImageResponse } = await getModule();

    await createOgpImageResponse({ title: "Test" });

    const { element } = imageResponseCalls[0];
    const texts = collectText(element);
    expect(texts).toContain("yolos.net"); // のれん帯の店号
    expect(texts).toContain("試"); // 店の印の一字
  });

  test("絵文字（§8-6 禁止）を看板に持ち込まない", async () => {
    const { createOgpImageResponse } = await getModule();

    // 呼び出し側が誤って絵文字を title に混ぜても、看板は絵文字用の面を持たない。
    // ここでは通常タイトルで、生成ツリーに絵文字面が無いことを確認する。
    await createOgpImageResponse({ title: "診断メーカー" });

    const { element } = imageResponseCalls[0];
    const joined = collectText(element).join("");
    expect(joined).not.toMatch(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}]/u);
  });

  test("includes subtitle when provided", async () => {
    const { createOgpImageResponse } = await getModule();

    await createOgpImageResponse({
      title: "Main Title",
      subtitle: "Sub Title",
    });

    const { element } = imageResponseCalls[0];
    const texts = collectText(element);
    expect(texts).toContain("Sub Title");
  });

  test("subtitle 省略時は副題テキストを描かない", async () => {
    const { createOgpImageResponse } = await getModule();

    await createOgpImageResponse({ title: "Only Title" });

    const { element } = imageResponseCalls[0];
    const texts = collectText(element);
    expect(texts).toContain("Only Title");
    // 副題ノードは条件付きレンダリングで null になる。
    expect(texts).not.toContain("Sub Title");
  });

  test("短い品名は大きく、長い品名は小さく組む（書記素数で段階選択）", async () => {
    const { createOgpImageResponse } = await getModule();

    await createOgpImageResponse({ title: "QRコード" }); // 5 書記素 → 80
    const shortSizes = collectStyleValues(
      imageResponseCalls[0].element,
      "fontSize",
    );
    expect(shortSizes).toContain(80);

    imageResponseCalls = [];
    // 40 書記素超の長い品名 → 最小 33。
    await createOgpImageResponse({
      title: "あ".repeat(40),
    });
    const longSizes = collectStyleValues(
      imageResponseCalls[0].element,
      "fontSize",
    );
    expect(longSizes).toContain(33);
  });

  test("exports correct ogpSize", async () => {
    const { ogpSize } = await getModule();
    expect(ogpSize).toEqual({ width: 1200, height: 630 });
  });

  test("exports correct ogpContentType", async () => {
    const { ogpContentType } = await getModule();
    expect(ogpContentType).toBe("image/png");
  });

  test("provides empty fonts array when font fetch fails", async () => {
    const { createOgpImageResponse } = await getModule();

    await createOgpImageResponse({ title: "Test" });

    const { options } = imageResponseCalls[0];
    // ゴシック・明朝ともに取得失敗 → fonts は空（sans-serif フォールバック）。
    expect((options as { fonts: unknown[] }).fonts).toEqual([]);
  });

  test("provides gothic + mincho font data when fetch succeeds", async () => {
    // getFontData（ゴシック）と getMinchoFontData（明朝）が同経路で 2 面取得する。
    // ゴシックと明朝は Promise.all で並行取得されるため fetch 呼び出し順は非決定的。
    // 順序に依存する mockResolvedValueOnce ではなく、URL を見て応答を返す実装で両経路を満たす。
    const fakeCss =
      'src: url(https://fonts.gstatic.com/s/notojp/v1/font.ttf) format("truetype");';
    mockFetch.mockImplementation((url: string) => {
      // Google Fonts の CSS（@font-face）→ gstatic のバイナリ URL を 1 つ含む CSS を返す。
      if (url.includes("fonts.googleapis.com")) {
        return Promise.resolve({
          ok: true,
          text: () => Promise.resolve(fakeCss),
        });
      }
      // gstatic のフォントバイナリ → Satori 互換の TTF を返す。
      return Promise.resolve({
        ok: true,
        arrayBuffer: () => Promise.resolve(makeTtfBuffer()),
      });
    });

    const { createOgpImageResponse } = await getModule();

    await createOgpImageResponse({ title: "Test" });

    const { options } = imageResponseCalls[0];
    const fonts = (options as { fonts: Array<Record<string, unknown>> }).fonts;
    expect(fonts).toHaveLength(2);
    expect(fonts).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "NotoSansJP", weight: 400 }),
        expect.objectContaining({ name: "NotoSerifJP", weight: 600 }),
      ]),
    );
  });

  test("getFontData / getMinchoFontData / createOgpImageResponse を export する", async () => {
    const ogpImageModule = await getModule();
    expect(typeof ogpImageModule.getFontData).toBe("function");
    expect(typeof ogpImageModule.getMinchoFontData).toBe("function");
    expect(typeof ogpImageModule.createOgpImageResponse).toBe("function");
  });

  test("OgpImageConfig は title/subtitle のみ（accentColor/icon は型から削除済み）", async () => {
    const { createOgpImageResponse } = await getModule();
    // 型レベルの契約: 余剰プロパティは TypeScript が弾く。ここでは実行時に title だけ・
    // subtitle 付きの両ケースが成立することを確認する（旧 accentColor/icon は不要）。
    await expect(
      createOgpImageResponse({ title: "T", subtitle: "S" }),
    ).resolves.toBeDefined();
  });

  test("旧 API の余剰プロパティ（icon/accentColor）はコンパイル時に弾かれる（@ts-expect-error で固定）", async () => {
    const { createOgpImageResponse } = await getModule();
    // コンパイル時契約: OgpImageConfig の余剰プロパティ検査が効くことを @ts-expect-error で
    // 恒久固定する。将来 icon/accentColor を型に復活させると @ts-expect-error が未使用となり
    // tsc（noUnusedLocals 相当の未使用ディレクティブ検査）が fail する——旧 API の静かな復活を
    // 型レベルで検知する。実行時にはモックが余剰プロパティを無視して解決するだけなので await する。
    await expect(
      // @ts-expect-error icon は型から削除済み（§8-6・図像は店の印のみ）
      createOgpImageResponse({ title: "T", icon: "🧪" }),
    ).resolves.toBeDefined();
    await expect(
      // @ts-expect-error accentColor は型から削除済み（§2・地は常に紙）
      createOgpImageResponse({ title: "T", accentColor: "#e74c3c" }),
    ).resolves.toBeDefined();
  });
});
