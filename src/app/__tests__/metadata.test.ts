import { expect, test } from "vitest";
import { metadata } from "../layout";

test("metadata includes twitter card configuration", () => {
  expect(metadata.twitter).toEqual(
    expect.objectContaining({ card: "summary_large_image" }),
  );
});

test("metadata includes openGraph configuration", () => {
  expect(metadata.openGraph).toEqual(
    expect.objectContaining({ siteName: "Yolo-Web" }),
  );
});

test("metadata includes metadataBase", () => {
  expect(metadata.metadataBase).toBeInstanceOf(URL);
});
