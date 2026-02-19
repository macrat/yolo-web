import { expect, test } from "vitest";
import { metadata } from "../layout";

test("metadata includes twitter card configuration", () => {
  expect(metadata.twitter).toEqual(
    expect.objectContaining({ card: "summary_large_image" }),
  );
});

test("metadata includes openGraph configuration", () => {
  expect(metadata.openGraph).toEqual(
    expect.objectContaining({ siteName: "yolos.net" }),
  );
});

test("metadata includes metadataBase", () => {
  expect(metadata.metadataBase).toBeInstanceOf(URL);
});

test("metadata includes RSS feed in alternates", () => {
  const types = (metadata.alternates as { types?: Record<string, string> })
    ?.types;
  expect(types).toBeDefined();
  expect(types?.["application/rss+xml"]).toBe("/feed");
});

test("metadata includes Atom feed in alternates", () => {
  const types = (metadata.alternates as { types?: Record<string, string> })
    ?.types;
  expect(types).toBeDefined();
  expect(types?.["application/atom+xml"]).toBe("/feed/atom");
});
