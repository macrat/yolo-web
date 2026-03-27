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

describe("createOgpImageResponse", () => {
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

  test("uses default accent color when not specified", async () => {
    const { createOgpImageResponse } = await getModule();

    await createOgpImageResponse({ title: "Test" });

    const { element } = imageResponseCalls[0];
    const jsx = element as { props: { style: { backgroundColor: string } } };
    expect(jsx.props.style.backgroundColor).toBe("#2563eb");
  });

  test("uses custom accent color when specified", async () => {
    const { createOgpImageResponse } = await getModule();

    await createOgpImageResponse({
      title: "Test",
      accentColor: "#dc2626",
    });

    const { element } = imageResponseCalls[0];
    const jsx = element as { props: { style: { backgroundColor: string } } };
    expect(jsx.props.style.backgroundColor).toBe("#dc2626");
  });

  test("includes subtitle when provided", async () => {
    const { createOgpImageResponse } = await getModule();

    await createOgpImageResponse({
      title: "Main Title",
      subtitle: "Sub Title",
    });

    const { element } = imageResponseCalls[0];
    const jsx = element as { props: { children: unknown[] } };
    const children = jsx.props.children;
    const flatChildren = Array.isArray(children) ? children : [children];
    const hasSubtitle = flatChildren.some(
      (child: unknown) =>
        child != null &&
        typeof child === "object" &&
        "props" in child &&
        (child as { props: { children?: string } }).props.children ===
          "Sub Title",
    );
    expect(hasSubtitle).toBe(true);
  });

  test("includes icon when provided", async () => {
    const { createOgpImageResponse } = await getModule();

    await createOgpImageResponse({
      title: "Test",
      icon: "\u{1F3A8}",
    });

    const { element } = imageResponseCalls[0];
    const jsx = element as { props: { children: unknown[] } };
    const children = jsx.props.children;
    const flatChildren = Array.isArray(children) ? children : [children];
    const hasIcon = flatChildren.some(
      (child: unknown) =>
        child != null &&
        typeof child === "object" &&
        "props" in child &&
        (child as { props: { children?: string } }).props.children ===
          "\u{1F3A8}",
    );
    expect(hasIcon).toBe(true);
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
    expect((options as { fonts: unknown[] }).fonts).toEqual([]);
  });

  test("provides font data when fetch succeeds", async () => {
    // Use a TTF magic number so the binary passes the Satori-compatibility check.
    const fakeArrayBuffer = makeTtfBuffer();
    const fakeCss =
      'src: url(https://fonts.gstatic.com/s/notosansjp/v1/font.ttf) format("truetype");';
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(fakeCss),
      })
      .mockResolvedValueOnce({
        ok: true,
        arrayBuffer: () => Promise.resolve(fakeArrayBuffer),
      });

    const { createOgpImageResponse } = await getModule();

    await createOgpImageResponse({ title: "Test" });

    const { options } = imageResponseCalls[0];
    const fonts = (options as { fonts: Array<Record<string, unknown>> }).fonts;
    expect(fonts).toHaveLength(1);
    expect(fonts[0]).toMatchObject({
      name: "NotoSansJP",
      style: "normal",
      weight: 400,
    });
  });

  test("getFontData is exported", async () => {
    const ogpImageModule = await getModule();
    expect(typeof ogpImageModule.getFontData).toBe("function");
  });

  test("falls back to next UA when WOFF2 magic number is detected", async () => {
    // Build an ArrayBuffer with WOFF2 magic number: "wOF2" = 0x77 0x4F 0x46 0x32
    const woff2Buffer = new ArrayBuffer(4);
    const view = new Uint8Array(woff2Buffer);
    view[0] = 0x77; // w
    view[1] = 0x4f; // O
    view[2] = 0x46; // F
    view[3] = 0x32; // 2

    // Build a valid TTF ArrayBuffer for the fallback UA: "\x00\x01\x00\x00"
    const ttfBuffer = makeTtfBuffer();

    const fakeCss =
      'src: url(https://fonts.gstatic.com/s/notosansjp/v1/font.ttf) format("truetype");';

    // First UA (IE10): CSS ok, font binary is WOFF2 → should be rejected
    // Second UA (Android): CSS ok, font binary is TTF → should be accepted
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(fakeCss),
      })
      .mockResolvedValueOnce({
        ok: true,
        arrayBuffer: () => Promise.resolve(woff2Buffer),
      })
      .mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(fakeCss),
      })
      .mockResolvedValueOnce({
        ok: true,
        arrayBuffer: () => Promise.resolve(ttfBuffer),
      });

    const { getFontData } = await getModule();
    const result = await getFontData();

    // Should have used the fallback UA and returned the TTF buffer
    expect(result).toBe(ttfBuffer);
    // fetch should have been called 4 times (2 CSS + 2 font binary)
    expect(mockFetch).toHaveBeenCalledTimes(4);
  });

  test("returns null when all UAs fail", async () => {
    // All fetch calls reject
    mockFetch.mockRejectedValue(new Error("network error"));

    const { getFontData } = await getModule();
    const result = await getFontData();

    expect(result).toBeNull();
  });
});
