import { NextResponse } from "next/server";
import { buildFeed } from "@/lib/feed";

export const dynamic = "force-static";

export async function GET() {
  const feed = buildFeed();

  return new NextResponse(feed.atom1(), {
    headers: {
      "Content-Type": "application/atom+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
