import { describe, it, expect, vi, afterEach } from "vitest";
import { copyToClipboard, generateTwitterShareUrl } from "../share";

describe("copyToClipboard", () => {
  const originalNavigator = globalThis.navigator;

  afterEach(() => {
    Object.defineProperty(globalThis, "navigator", {
      value: originalNavigator,
      writable: true,
      configurable: true,
    });
  });

  it("should use Clipboard API when available", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(globalThis, "navigator", {
      value: { clipboard: { writeText } },
      writable: true,
      configurable: true,
    });

    const result = await copyToClipboard("test text");
    expect(result).toBe(true);
    expect(writeText).toHaveBeenCalledWith("test text");
  });

  it("should return false when Clipboard API throws", async () => {
    const writeText = vi.fn().mockRejectedValue(new Error("denied"));
    Object.defineProperty(globalThis, "navigator", {
      value: { clipboard: { writeText } },
      writable: true,
      configurable: true,
    });

    // fallbackCopy will also fail in test env (no real DOM execCommand)
    const result = await copyToClipboard("test text");
    expect(result).toBe(false);
  });
});

describe("generateTwitterShareUrl", () => {
  it("should generate a basic share URL with only text", () => {
    const url = generateTwitterShareUrl("Hello world");
    expect(url).toBe("https://twitter.com/intent/tweet?text=Hello%20world");
  });

  it("should separate text and URL when pageUrl is provided", () => {
    const text = "Score: 100\nhttps://example.com/game";
    const pageUrl = "https://example.com/game";
    const url = generateTwitterShareUrl(text, pageUrl);

    expect(url).toContain("text=Score%3A%20100");
    expect(url).toContain("url=https%3A%2F%2Fexample.com%2Fgame");
    // The page URL should not appear in the text parameter
    expect(url).not.toContain("text=Score%3A%20100%0Ahttps");
  });

  it("should handle text without the pageUrl at the end", () => {
    const text = "Just a message";
    const pageUrl = "https://example.com";
    const url = generateTwitterShareUrl(text, pageUrl);

    expect(url).toContain("text=Just%20a%20message");
    expect(url).toContain("url=https%3A%2F%2Fexample.com");
  });

  it("should handle special regex characters in pageUrl", () => {
    const pageUrl = "https://example.com/game?q=1&r=2";
    const text = `Result\n${pageUrl}`;
    const url = generateTwitterShareUrl(text, pageUrl);

    expect(url).toContain("text=Result");
    expect(url).toContain(`url=${encodeURIComponent(pageUrl)}`);
  });
});
