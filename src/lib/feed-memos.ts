import { Feed } from "feed";
import sanitizeHtml from "sanitize-html";
import { getAllPublicMemos } from "@/memos/_lib/memos";
import { ROLE_DISPLAY, capitalize } from "@/memos/_lib/memos-shared";
import type { RoleSlug } from "@/memos/_lib/memos-shared";
import { BASE_URL, SITE_NAME } from "@/lib/constants";

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
 * Strip HTML from memo content and normalize it for feed descriptions.
 *
 * Unlike a regex-based strip, this removes script/style blocks, decodes HTML
 * entities, and normalizes repeated whitespace into single spaces.
 */
function stripHtml(html: string): string {
  const withoutHtml = sanitizeHtml(html, {
    allowedTags: [],
    allowedAttributes: {},
  });

  return withoutHtml.replace(/\s+/g, " ").trim();
}

/**
 * Truncate a string to the given number of Unicode code points.
 * This avoids splitting surrogate pairs (for example, emoji) mid-character.
 */
function truncateByCodePoints(value: string, maxCodePoints: number): string {
  const chars = Array.from(value);
  if (chars.length <= maxCodePoints) {
    return value;
  }

  return `${chars.slice(0, maxCodePoints).join("")}...`;
}

/**
 * Build a Feed instance containing the most recent memos
 * (up to MAX_MEMO_FEED_ITEMS items).
 * The returned Feed can output RSS 2.0 (.rss2()) or Atom 1.0 (.atom1()).
 *
 * Note: Unlike blog feed `buildFeed()` (src/lib/feed.ts), memo feed
 * descriptions are derived from `contentHtml` by sanitizing and truncating
 * content to keep entries concise and safe.
 */
export function buildMemoFeed(): Feed {
  // getAllPublicMemos() returns memos sorted by created_at in descending order
  // (newest first), as guaranteed by build-memo-index.ts. Therefore
  // .slice(0, N) correctly yields the N most recent memos.
  const allMemos = getAllPublicMemos();
  const recentMemos = allMemos.slice(0, MAX_MEMO_FEED_ITEMS);

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

    // Plain text description: first 200 Unicode code points from sanitized content
    const plainText = stripHtml(memo.contentHtml);
    const description = truncateByCodePoints(plainText, 200);

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
