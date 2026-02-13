import { describe, test, expect } from "vitest";
import {
  encodeHtmlEntities,
  decodeHtmlEntities,
  convertEntity,
} from "../logic";

describe("encodeHtmlEntities", () => {
  test("encodes & < > \" '", () => {
    const r = encodeHtmlEntities('<script>alert("xss")</script>');
    expect(r.success).toBe(true);
    expect(r.output).toBe(
      "&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;",
    );
  });

  test("encodes ampersand", () => {
    const r = encodeHtmlEntities("foo & bar");
    expect(r.success).toBe(true);
    expect(r.output).toBe("foo &amp; bar");
  });

  test("encodes single quotes", () => {
    const r = encodeHtmlEntities("it's");
    expect(r.success).toBe(true);
    expect(r.output).toBe("it&#39;s");
  });

  test("leaves normal text unchanged", () => {
    const r = encodeHtmlEntities("Hello World");
    expect(r.success).toBe(true);
    expect(r.output).toBe("Hello World");
  });

  test("handles empty string", () => {
    const r = encodeHtmlEntities("");
    expect(r.success).toBe(true);
    expect(r.output).toBe("");
  });
});

describe("decodeHtmlEntities", () => {
  test("decodes named entities", () => {
    const r = decodeHtmlEntities("&lt;div&gt;&amp;&quot;");
    expect(r.success).toBe(true);
    expect(r.output).toBe('<div>&"');
  });

  test("decodes decimal numeric entities", () => {
    const r = decodeHtmlEntities("&#65;&#66;&#67;");
    expect(r.success).toBe(true);
    expect(r.output).toBe("ABC");
  });

  test("decodes hex numeric entities", () => {
    const r = decodeHtmlEntities("&#x41;&#x42;&#x43;");
    expect(r.success).toBe(true);
    expect(r.output).toBe("ABC");
  });

  test("decodes &nbsp;", () => {
    const r = decodeHtmlEntities("foo&nbsp;bar");
    expect(r.success).toBe(true);
    expect(r.output).toBe("foo\u00A0bar");
  });

  test("leaves unknown entities as-is", () => {
    const r = decodeHtmlEntities("&unknown;");
    expect(r.success).toBe(true);
    expect(r.output).toBe("&unknown;");
  });

  test("handles empty string", () => {
    const r = decodeHtmlEntities("");
    expect(r.success).toBe(true);
    expect(r.output).toBe("");
  });
});

describe("convertEntity", () => {
  test("encode mode", () => {
    expect(convertEntity("<b>", "encode").output).toBe("&lt;b&gt;");
  });

  test("decode mode", () => {
    expect(convertEntity("&lt;b&gt;", "decode").output).toBe("<b>");
  });
});
