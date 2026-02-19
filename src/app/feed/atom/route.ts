import { NextResponse } from "next/server";
import { buildFeed } from "@/lib/feed";

export async function GET() {
  const feed = buildFeed();

  return new NextResponse(feed.atom1(), {
    headers: {
      "Content-Type": "application/atom+xml; charset=utf-8",
    },
  });
}
