import { beforeEach, describe, expect, test, vi } from "vitest";
import type { PublicMemo } from "@/memos/_lib/memos-shared";

vi.mock("@/memos/_lib/memos", () => ({
  getAllPublicMemos: vi.fn(),
}));

import { getAllPublicMemos } from "@/memos/_lib/memos";
import { buildMemoFeed } from "@/lib/feed-memos";

function createMemo(overrides: Partial<PublicMemo> = {}): PublicMemo {
  return {
    id: "memo-1",
    subject: "memo",
    from: "project-manager",
    to: "builder",
    created_at: "2026-01-01T00:00:00.000Z",
    tags: ["tag-a", "tag-b"],
    reply_to: null,
    contentHtml: "<p>default</p>",
    threadRootId: "memo-1",
    replyCount: 1,
    ...overrides,
  };
}

const mockedGetAllPublicMemos = vi.mocked(getAllPublicMemos);

beforeEach(() => {
  mockedGetAllPublicMemos.mockReset();
});

describe("buildMemoFeed description handling", () => {
  test("converts normal HTML to expected plain text", () => {
    mockedGetAllPublicMemos.mockReturnValue([
      createMemo({
        contentHtml:
          "<p>Hello&nbsp;&nbsp;<strong>world</strong> &amp; everyone</p>",
      }),
    ]);

    const rss = buildMemoFeed().rss2();

    expect(rss).toContain("Hello world &amp; everyone");
  });

  test("removes script/style content", () => {
    mockedGetAllPublicMemos.mockReturnValue([
      createMemo({
        contentHtml:
          '<style>.x{display:none}</style><p>Visible</p><script>window.__bad = "x"</script>',
      }),
    ]);

    const rss = buildMemoFeed().rss2();

    const description =
      rss.match(
        /<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>/,
      )?.[1] ?? "";

    expect(description).toContain("Visible");
    expect(description).not.toContain("display:none");
    expect(description).not.toContain("window.__bad");
  });

  test("truncates over 200 characters without breaking surrogate pairs", () => {
    const head = "a".repeat(199);
    const emoji = "😀";
    const tail = "z";

    mockedGetAllPublicMemos.mockReturnValue([
      createMemo({
        contentHtml: `<p>${head}${emoji}${tail}</p>`,
      }),
    ]);

    const rss = buildMemoFeed().rss2();

    expect(rss).toContain(`${head}${emoji}...`);
    expect(rss).not.toContain(`${head}\ud83d...`);
    expect(rss).not.toContain("�");
  });

  test("keeps tag/category output intact", () => {
    mockedGetAllPublicMemos.mockReturnValue([
      createMemo({
        tags: ["alpha", "beta"],
      }),
    ]);

    const rss = buildMemoFeed().rss2();

    expect(rss).toContain("<category>alpha</category>");
    expect(rss).toContain("<category>beta</category>");
  });
});
