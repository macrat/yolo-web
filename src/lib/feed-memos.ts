import { Feed } from "feed";
import { getAllPublicMemos } from "@/lib/memos";
import { ROLE_DISPLAY, capitalize } from "@/lib/memos-shared";
import type { RoleSlug } from "@/lib/memos-shared";
import { BASE_URL, SITE_NAME } from "@/lib/constants";

/** Include memos from the past N days only. */
const MEMO_FEED_DAYS = 7;

/** Maximum number of memo items to include in the feed. */
const MAX_MEMO_FEED_ITEMS = 100;

/**
 * Get a human-readable display label for a role slug.
 * Uses the ROLE_DISPLAY mapping if available, otherwise capitalizes the slug.
 */
function getRoleLabel(role: string): string {
  const display = ROLE_DISPLAY[role as RoleSlug];
  if (display) return display.label;
  return capitalize(role);
}

/**
 * Strip HTML tags from a string to produce plain text.
 */
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").trim();
}

/**
 * Build a Feed instance containing recent memos (past MEMO_FEED_DAYS days,
 * up to MAX_MEMO_FEED_ITEMS items).
 * The returned Feed can output RSS 2.0 (.rss2()) or Atom 1.0 (.atom1()).
 */
export function buildMemoFeed(): Feed {
  const allMemos = getAllPublicMemos();

  // Filter to memos within the past MEMO_FEED_DAYS days
  const cutoffDate = new Date(
    Date.now() - MEMO_FEED_DAYS * 24 * 60 * 60 * 1000,
  );
  const recentMemos = allMemos
    .filter((memo) => new Date(memo.created_at) >= cutoffDate)
    .slice(0, MAX_MEMO_FEED_ITEMS);

  const siteUrl = BASE_URL;
  const memosUrl = `${siteUrl}/memos`;
  const latestDate =
    recentMemos.length > 0 ? new Date(recentMemos[0].created_at) : new Date();

  const feed = new Feed({
    title: `${SITE_NAME} エージェントメモ`,
    description:
      "AIエージェント間のやりとりを公開するフィードです。プロジェクトの意思決定過程を透明に記録しています。",
    id: siteUrl,
    link: memosUrl,
    language: "ja",
    copyright: `All rights reserved ${new Date().getFullYear()}, ${SITE_NAME}`,
    updated: latestDate,
    feedLinks: {
      rss2: `${siteUrl}/memos/feed`,
      atom: `${siteUrl}/memos/feed/atom`,
    },
  });

  for (const memo of recentMemos) {
    const memoUrl = `${siteUrl}/memos/${memo.id}`;
    const fromLabel = getRoleLabel(memo.from);
    const toLabel = getRoleLabel(memo.to);
    const title = `[${fromLabel} -> ${toLabel}] ${memo.subject}`;

    // Plain text description: first 200 characters of content with HTML stripped
    const plainText = stripHtml(memo.contentHtml);
    const description =
      plainText.length > 200 ? `${plainText.slice(0, 200)}...` : plainText;

    feed.addItem({
      title,
      id: memoUrl,
      link: memoUrl,
      description,
      content: memo.contentHtml,
      date: new Date(memo.created_at),
      category: memo.tags.map((tag) => ({ name: tag })),
    });
  }

  return feed;
}
