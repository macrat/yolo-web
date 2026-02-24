import { describe, expect, test, vi, beforeEach, afterEach } from "vitest";
import type { PublicMemo } from "@/lib/memos-shared";

/**
 * Create a mock memo for testing.
 * By default, the memo date is set to "now" so it falls within the 7-day window.
 */
function createMockMemo(overrides: Partial<PublicMemo> = {}): PublicMemo {
  return {
    id: "test-memo-001",
    subject: "Test subject",
    from: "project-manager",
    to: "builder",
    created_at: new Date().toISOString(),
    tags: ["test", "cycle-99"],
    reply_to: null,
    contentHtml: "<p>Hello <strong>world</strong></p>",
    threadRootId: "test-memo-001",
    replyCount: 1,
    ...overrides,
  };
}

// Mock the memos module so we can control which memos are returned
vi.mock("@/lib/memos", () => ({
  getAllPublicMemos: vi.fn(),
}));

// Import after mocking so the mock is in place
import { getAllPublicMemos } from "@/lib/memos";
import { buildMemoFeed } from "@/lib/feed-memos";
import { GET as getRss } from "../route";
import { GET as getAtom } from "../atom/route";

const mockedGetAllPublicMemos = vi.mocked(getAllPublicMemos);

beforeEach(() => {
  // Default: return a couple of recent memos
  mockedGetAllPublicMemos.mockReturnValue([
    createMockMemo({
      id: "memo-a",
      subject: "First memo",
      from: "project-manager",
      to: "builder",
    }),
    createMockMemo({
      id: "memo-b",
      subject: "Second memo",
      from: "reviewer",
      to: "project-manager",
    }),
  ]);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("buildMemoFeed", () => {
  test("rss2() returns valid RSS 2.0 XML", () => {
    const feed = buildMemoFeed();
    const xml = feed.rss2();
    expect(xml).toContain("<?xml");
    expect(xml).toContain("<rss");
    expect(xml).toContain("<channel>");
  });

  test("atom1() returns valid Atom 1.0 XML", () => {
    const feed = buildMemoFeed();
    const xml = feed.atom1();
    expect(xml).toContain("<?xml");
    expect(xml).toContain("<feed");
  });

  test("feed item title uses [From -> To] subject format", () => {
    const feed = buildMemoFeed();
    const rss = feed.rss2();
    // PM -> Builder with subject "First memo" (inside CDATA in RSS)
    expect(rss).toContain("[PM -> Builder] First memo");
    // Reviewer -> PM with subject "Second memo"
    expect(rss).toContain("[Reviewer -> PM] Second memo");
  });

  test("feed item title uses [From -> To] subject format in Atom", () => {
    const feed = buildMemoFeed();
    const atom = feed.atom1();
    expect(atom).toContain("[PM -> Builder] First memo");
    expect(atom).toContain("[Reviewer -> PM] Second memo");
  });

  test("old memos (older than 7 days) are excluded from feed", () => {
    const eightDaysAgo = new Date(
      Date.now() - 8 * 24 * 60 * 60 * 1000,
    ).toISOString();

    mockedGetAllPublicMemos.mockReturnValue([
      createMockMemo({
        id: "recent-memo",
        subject: "Recent",
        created_at: new Date().toISOString(),
      }),
      createMockMemo({
        id: "old-memo",
        subject: "Old memo from 8 days ago",
        created_at: eightDaysAgo,
      }),
    ]);

    const feed = buildMemoFeed();
    const rss = feed.rss2();

    expect(rss).toContain("Recent");
    expect(rss).not.toContain("Old memo from 8 days ago");
  });

  test("empty feed is returned when no memos exist", () => {
    mockedGetAllPublicMemos.mockReturnValue([]);

    const feed = buildMemoFeed();
    const rss = feed.rss2();

    expect(rss).toContain("<rss");
    expect(rss).toContain("<channel>");
    // No items
    expect(rss).not.toContain("<item>");
  });

  test("feed respects MAX_MEMO_FEED_ITEMS limit of 100", () => {
    // Create 120 recent memos
    const memos = Array.from({ length: 120 }, (_, i) =>
      createMockMemo({
        id: `memo-${i}`,
        subject: `Memo number ${i}`,
        created_at: new Date(Date.now() - i * 60 * 1000).toISOString(),
      }),
    );
    mockedGetAllPublicMemos.mockReturnValue(memos);

    const feed = buildMemoFeed();
    const rss = feed.rss2();
    const itemCount = (rss.match(/<item>/g) || []).length;

    expect(itemCount).toBeLessThanOrEqual(100);
  });

  test("feed contains correct links to memo pages", () => {
    const feed = buildMemoFeed();
    const rss = feed.rss2();

    expect(rss).toContain("/memos/memo-a");
    expect(rss).toContain("/memos/memo-b");
  });

  test("feed item description is plain text from contentHtml", () => {
    mockedGetAllPublicMemos.mockReturnValue([
      createMockMemo({
        id: "html-memo",
        subject: "HTML content test",
        contentHtml: "<p>Hello <strong>world</strong></p>",
      }),
    ]);

    const feed = buildMemoFeed();
    const rss = feed.rss2();

    // The description should contain "Hello world" without HTML tags
    // (the description element itself will be CDATA-escaped in the RSS)
    expect(rss).toContain("Hello world");
  });

  test("unknown role slug is capitalized as fallback", () => {
    mockedGetAllPublicMemos.mockReturnValue([
      createMockMemo({
        id: "unknown-role-memo",
        subject: "Unknown role test",
        from: "custom-role",
        to: "builder",
      }),
    ]);

    const feed = buildMemoFeed();
    const rss = feed.rss2();

    // "custom-role" should be capitalized to "Custom-role"
    expect(rss).toContain("Custom-role");
  });
});

describe("RSS route handler", () => {
  test("GET returns response with application/rss+xml content type", async () => {
    const response = await getRss();
    expect(response.headers.get("Content-Type")).toBe(
      "application/rss+xml; charset=utf-8",
    );
  });

  test("GET returns valid RSS XML body", async () => {
    const response = await getRss();
    const body = await response.text();
    expect(body).toContain("<rss");
    expect(body).toContain("<channel>");
  });

  test("GET returns correct Cache-Control header", async () => {
    const response = await getRss();
    expect(response.headers.get("Cache-Control")).toBe(
      "public, max-age=3600, s-maxage=3600",
    );
  });
});

describe("Atom route handler", () => {
  test("GET returns response with application/atom+xml content type", async () => {
    const response = await getAtom();
    expect(response.headers.get("Content-Type")).toBe(
      "application/atom+xml; charset=utf-8",
    );
  });

  test("GET returns valid Atom XML body", async () => {
    const response = await getAtom();
    const body = await response.text();
    expect(body).toContain("<feed");
  });

  test("GET returns correct Cache-Control header", async () => {
    const response = await getAtom();
    expect(response.headers.get("Cache-Control")).toBe(
      "public, max-age=3600, s-maxage=3600",
    );
  });
});
