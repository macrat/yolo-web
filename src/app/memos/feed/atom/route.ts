import { NextResponse } from "next/server";
import { buildMemoFeed } from "@/lib/feed-memos";

export async function GET() {
  const feed = buildMemoFeed();

  return new NextResponse(feed.atom1(), {
    headers: {
      "Content-Type": "application/atom+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
