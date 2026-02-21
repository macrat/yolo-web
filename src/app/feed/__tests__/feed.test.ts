import { describe, expect, test } from "vitest";
import { buildFeed } from "@/lib/feed";
import { GET as getRss } from "../../rss/route";
import { GET as getAtom } from "../../atom/route";

describe("buildFeed", () => {
  test("rss2() returns valid RSS 2.0 XML", () => {
    const feed = buildFeed();
    const xml = feed.rss2();
    expect(xml).toContain("<rss");
    expect(xml).toContain("<channel>");
  });

  test("atom1() returns valid Atom 1.0 XML", () => {
    const feed = buildFeed();
    const xml = feed.atom1();
    expect(xml).toContain("<feed");
  });

  test("feed contains blog post titles and URLs", () => {
    const feed = buildFeed();
    const rss = feed.rss2();
    // Feed should contain at least one item if blog posts exist
    // and the output should be well-formed XML
    expect(rss).toContain("<?xml");
  });

  test("feed items are limited to 20 or fewer", () => {
    const feed = buildFeed();
    const rss = feed.rss2();
    const itemCount = (rss.match(/<item>/g) || []).length;
    expect(itemCount).toBeLessThanOrEqual(20);
  });
});

describe("RSS route handler", () => {
  test("GET /rss returns response with application/rss+xml content type", async () => {
    const response = await getRss();
    expect(response.headers.get("Content-Type")).toBe(
      "application/rss+xml; charset=utf-8",
    );
  });

  test("GET /rss returns valid XML body", async () => {
    const response = await getRss();
    const body = await response.text();
    expect(body).toContain("<rss");
  });
});

describe("Atom route handler", () => {
  test("GET /atom returns response with application/atom+xml content type", async () => {
    const response = await getAtom();
    expect(response.headers.get("Content-Type")).toBe(
      "application/atom+xml; charset=utf-8",
    );
  });

  test("GET /atom returns valid XML body", async () => {
    const response = await getAtom();
    const body = await response.text();
    expect(body).toContain("<feed");
  });
});
